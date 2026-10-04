import {createServer} from 'node:http';import {readFileSync} from 'node:fs';
const files={'/':'dev/platform/index.html','/stub.js':'dev/platform/stub.js','/platform.js':'public/platform.js'};
createServer((req,res)=>{if(!['127.0.0.1:8790','localhost:8790'].includes(req.headers.host)||!files[req.url]){res.writeHead(404).end();return;}res.writeHead(200,{'content-type':req.url.endsWith('.js')?'text/javascript':'text/html','cache-control':'no-store'}).end(readFileSync(files[req.url]));}).listen(8790,'127.0.0.1',()=>console.log('Local inert harness 127.0.0.1:8790; never production'));
