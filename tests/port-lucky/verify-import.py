"""Verify the received ZIP and all authoritative game bytes; never extract."""
import hashlib
import json
import pathlib
import stat
import sys
import zipfile

archive = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/opt/strategico/concert/shared/data/concert/project-69/chat-404/attachments/2026-10-05-07-44-02_retroquests-port-lucky-complete.zip')
sha = hashlib.sha256(archive.read_bytes()).hexdigest()
assert sha == 'e753c3ed757581b7dd34679523bbf9e1d601686c0f8a658ba4e864edab517f7e'
entries = []
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    for item in z.infolist():
        p = pathlib.PurePosixPath(item.filename)
        assert not p.is_absolute() and '..' not in p.parts
        assert not stat.S_ISLNK(item.external_attr >> 16)
        if item.is_dir():
            continue
        if item.filename.startswith('public/games/port-lucky/') or item.filename == 'src/games/port-lucky-hints.js':
            received = z.read(item)
            local = pathlib.Path(item.filename).read_bytes()
            assert received == local, item.filename
            entries.append({'path': item.filename, 'bytes': len(local), 'sha256': hashlib.sha256(local).hexdigest(), 'byte_equal': True})
assert len(entries) == 9
result = {'zip_sha256': sha, 'zip_integrity': 'PASS', 'safe_paths_symlinks': 'PASS', 'game_files_equal': 8, 'server_hint_files_equal': 1, 'files': entries}
pathlib.Path('evidence/port-lucky/game-source-verification.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
