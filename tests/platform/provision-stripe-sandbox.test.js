import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

test('stdlib provisioning security suite (synthetic inputs only)',()=>{
 const result=spawnSync('python3',['-B','tests/platform/provision-stripe-sandbox.test.py','-v'],{encoding:'utf8',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stderr,/Ran 7 tests/);
});
