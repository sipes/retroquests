#!/usr/bin/env python3
"""User-operated local sandbox secret escrow; no network or deployment.

No secret arguments, environment inputs, stdout secret output, or overwrite support.
"""
import getpass
import json
import os
from pathlib import Path
import re
import stat
import sys
import tempfile
import warnings

SECRET_DIRECTORY = Path('/opt/hermes-data/hermes/profiles/nicolaas/secrets/retroquests-payment-sandbox')
SECRET_FILENAME = 'stripe-sandbox.json'


def _private_directory(path):
    info = path.lstat()
    if not stat.S_ISDIR(info.st_mode) or info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o700:
        raise ValueError('Unsafe directory')


def _validate(key, webhook):
    # Stripe signing-secret prefixes do not distinguish sandbox/live; the owner
    # must obtain whsec from the separately approved sandbox endpoint/CLI listener.
    if not re.fullmatch(r'sk_test_[A-Za-z0-9]+', key) or not re.fullmatch(r'whsec_[A-Za-z0-9]+', webhook):
        raise ValueError('Invalid sandbox credentials')


def provision(key, webhook, directory=SECRET_DIRECTORY):
    """Create one complete 0600 file atomically; existing escrow is never replaced.

    Parent directories must already exist, be owned by this user and have no
    group/other write access. New secrets directories are owner-only. Nothing
    is written until both values pass validation. Failure removes only our new
    files/directories, leaving any existing escrow byte-for-byte untouched.
    """
    _validate(key, webhook)
    directory = Path(directory).absolute()
    # Refuse symlinks anywhere in the path; do not silently redirect escrow.
    for ancestor in reversed([directory, *directory.parents]):
        if ancestor.exists() or ancestor.is_symlink():
            info = ancestor.lstat()
            if not stat.S_ISDIR(info.st_mode):
                raise ValueError('Unsafe path')
            # System ancestors may be root-owned; closest existing parent must
            # belong to this user, and no ancestor may allow non-owner writes.
            if stat.S_IMODE(info.st_mode) & 0o022:
                raise ValueError('Unsafe parent permissions')
    existing = directory
    while not existing.exists():
        existing = existing.parent
    if existing.stat().st_uid != os.getuid():
        raise ValueError('Unsafe parent owner')
    created = []
    temporary = None
    linked = False
    target = directory / SECRET_FILENAME
    try:
        missing = []
        current = directory
        while not current.exists():
            missing.append(current)
            current = current.parent
        for current in reversed(missing):
            current.mkdir(mode=0o700)
            created.append(current)
        _private_directory(directory)
        # Existing secret parents, when present, must also be owner-only.
        if directory.parent.name == 'secrets':
            _private_directory(directory.parent)
        fd, temporary = tempfile.mkstemp(prefix='.stripe-sandbox-', dir=directory)
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            os.fchmod(stream.fileno(), 0o600)
            json.dump({'STRIPE_SECRET_KEY': key, 'STRIPE_WEBHOOK_SECRET': webhook}, stream)
            stream.write('\n')
            stream.flush()
            os.fsync(stream.fileno())
        # Same-directory hard link publishes complete content atomically and
        # refuses replacement, including existing files or symbolic links.
        os.link(temporary, target)
        linked = True
        os.unlink(temporary)
        temporary = None
        directory_fd = os.open(directory, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
        try:
            os.fsync(directory_fd)
        finally:
            os.close(directory_fd)
        return target
    except BaseException:
        if linked:
            target.unlink()
        if temporary is not None:
            Path(temporary).unlink(missing_ok=True)
        for current in reversed(created):
            current.rmdir()
        raise


def main():
    try:
        if len(sys.argv) != 1 or not sys.stdin.isatty():
            raise ValueError('Interactive terminal required')
        # Never allow getpass to fall back to echoed stdin.
        with warnings.catch_warnings():
            warnings.simplefilter('error', getpass.GetPassWarning)
            key = getpass.getpass('Sandbox secret key (masked): ')
            webhook = getpass.getpass('Sandbox webhook signing secret (masked): ')
        provision(key, webhook)
    except BaseException:
        # Never print exception strings, tracebacks, credentials, or paths from
        # an error, even when an OS/provider message includes sensitive input.
        print('Provisioning failed or cancelled; no credentials were published.', file=sys.stderr)
        return 1
    print('Sandbox credentials saved owner-only. No provider or deployment changes made.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
