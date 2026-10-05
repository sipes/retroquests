#!/usr/bin/env node
// Local static server for game development. Serves the repository root so the dev host can import
// public/games/* and (dev only) src/games/*-hints.js. NOT the production server; wrangler serves public/ in production.
//   node dev/serve.js [port]   ->  http://localhost:8788/dev/port-lucky/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] || process.env.PORT || 8788);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.map': 'application/json' };

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/dev/port-lucky/';
  if (url.endsWith('/')) url += 'index.html';
  const file = path.normalize(path.join(root, url));
  if (!file.startsWith(root) || url.includes('/node_modules/') || url.includes('/.git/') || url.includes('.dev.vars')) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('not found: ' + url); }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(data);
  });
}).listen(port, () => console.log(`Port Lucky dev host: http://localhost:${port}/dev/port-lucky/  (root: ${root})`));
