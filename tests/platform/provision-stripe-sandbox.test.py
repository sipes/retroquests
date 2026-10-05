"""Only synthetic credentials; temporary directories stay in worktree evidence."""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import stat
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('provision', ROOT / 'scripts/provision-stripe-sandbox.py')
assert spec is not None and spec.loader is not None
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)
KEY = 'sk_test_SYNTHETIC123'
WEBHOOK = 'whsec_SYNTHETIC456'


class ProvisionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='provision-test-', dir=ROOT / 'evidence')
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name) / 'secrets' / 'retroquests-payment-sandbox'

    def test_complete_atomic_file_permissions_and_no_overwrite(self):
        target = helper.provision(KEY, WEBHOOK, self.directory)
        self.assertEqual(json.loads(target.read_text()), {'STRIPE_SECRET_KEY': KEY, 'STRIPE_WEBHOOK_SECRET': WEBHOOK})
        self.assertEqual(stat.S_IMODE(target.stat().st_mode), 0o600)
        self.assertEqual(stat.S_IMODE(self.directory.stat().st_mode), 0o700)
        self.assertEqual(stat.S_IMODE(self.directory.parent.stat().st_mode), 0o700)
        original = target.read_bytes()
        with self.assertRaises(FileExistsError):
            helper.provision('sk_test_OTHER123', WEBHOOK, self.directory)
        self.assertEqual(target.read_bytes(), original)
        self.assertEqual(list(self.directory.iterdir()), [target])

    def test_invalid_and_live_inputs_create_nothing(self):
        for key, webhook in [('sk_live_REJECT', WEBHOOK), ('pk_test_REJECT', WEBHOOK), ('sk_test_', WEBHOOK),
                             (KEY, 'whsec_'), (KEY, 'not-signing'), (KEY+'\n', WEBHOOK), (KEY, WEBHOOK+' secret')]:
            with self.subTest(key=key, webhook=webhook):
                with self.assertRaises(ValueError):
                    helper.provision(key, webhook, self.directory)
                self.assertFalse(self.directory.parent.exists())

    def test_write_and_publish_failures_roll_back_new_directories(self):
        for operation in ['json.dump', 'os.link']:
            with self.subTest(operation=operation), patch.object(helper.json if operation=='json.dump' else helper.os,
                                                                  operation.split('.')[1], side_effect=OSError(KEY)):
                with self.assertRaises(OSError):
                    helper.provision(KEY, WEBHOOK, self.directory)
            self.assertFalse(self.directory.parent.exists())

    def test_directory_fsync_failure_rolls_back_published_file(self):
        original = os.fsync
        def fsync(fd):
            if stat.S_ISDIR(os.fstat(fd).st_mode):
                raise OSError(WEBHOOK)
            original(fd)
        with patch.object(helper.os, 'fsync', side_effect=fsync):
            with self.assertRaises(OSError):
                helper.provision(KEY, WEBHOOK, self.directory)
        self.assertFalse(self.directory.parent.exists())

    def test_symlink_and_permissive_directory_rejected(self):
        self.directory.parent.mkdir(mode=0o700)
        self.directory.symlink_to(Path(self.temp.name), target_is_directory=True)
        with self.assertRaises(ValueError):
            helper.provision(KEY, WEBHOOK, self.directory)
        self.directory.unlink()
        self.directory.mkdir(mode=0o755)
        with self.assertRaises(ValueError):
            helper.provision(KEY, WEBHOOK, self.directory)
        self.assertFalse((self.directory / helper.SECRET_FILENAME).exists())

    def test_masked_interactive_flow_and_generic_error_no_secret_leak(self):
        for failure in [False, True]:
            out, err = io.StringIO(), io.StringIO()
            with patch.object(sys, 'argv', ['helper']), patch.object(sys.stdin, 'isatty', return_value=True), \
                 patch.object(helper.getpass, 'getpass', side_effect=[KEY, WEBHOOK]) as prompt, \
                 patch.object(helper, 'provision', side_effect=OSError(KEY+WEBHOOK) if failure else None) as provision, \
                 contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
                self.assertEqual(helper.main(), 1 if failure else 0)
                self.assertEqual(prompt.call_count, 2)
                provision.assert_called_once_with(KEY, WEBHOOK)
            for secret in [KEY, WEBHOOK]:
                self.assertNotIn(secret, out.getvalue()+err.getvalue())

    def test_no_tty_arguments_and_getpass_echo_fallback_fail_closed(self):
        out, err = io.StringIO(), io.StringIO()
        with patch.object(sys, 'argv', ['helper']), patch.object(sys.stdin, 'isatty', return_value=False), \
             patch.object(helper.getpass, 'getpass') as prompt, contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            self.assertEqual(helper.main(), 1)
            prompt.assert_not_called()
        with patch.object(sys, 'argv', ['helper', KEY]), patch.object(helper.getpass, 'getpass') as prompt, \
             contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            self.assertEqual(helper.main(), 1)
            prompt.assert_not_called()
        with patch.object(sys, 'argv', ['helper']), patch.object(sys.stdin, 'isatty', return_value=True), \
             patch.object(helper.getpass, 'getpass', side_effect=helper.getpass.GetPassWarning(KEY)), \
             patch.object(helper, 'provision') as provision, contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            self.assertEqual(helper.main(), 1)
            provision.assert_not_called()
        self.assertNotIn(KEY, out.getvalue()+err.getvalue())


if __name__ == '__main__':
    unittest.main()
