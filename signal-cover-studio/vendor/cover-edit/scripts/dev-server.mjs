import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml']
]);

const server = http.createServer(async (req, res) => {
  try {
    const requestPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const filePath = path.join(root, requestPath);
    const data = await readFile(filePath);
    res.writeHead(200, { 'content-type': mime.get(path.extname(filePath)) || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(4173, () => {
  console.log('cover-edit dev server on http://127.0.0.1:4173');
});
