import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif']
]);

function decodeFileToken(token) {
  return Buffer.from(token, 'base64url').toString('utf8');
}

async function readStatic(rootDir, requestPath) {
  const safePath = requestPath === '/' ? '/index.html' : requestPath.split('?')[0];
  const filePath = path.join(rootDir, safePath);
  const data = await readFile(filePath);
  return { data, filePath };
}

export async function createStaticServer(rootDir) {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (url.pathname.startsWith('/__file/')) {
        const absolutePath = decodeFileToken(url.pathname.slice('/__file/'.length));
        const data = await readFile(absolutePath);
        res.writeHead(200, { 'content-type': MIME.get(path.extname(absolutePath)) || 'application/octet-stream' });
        res.end(data);
        return;
      }

      const { data, filePath } = await readStatic(rootDir, url.pathname);
      res.writeHead(200, { 'content-type': MIME.get(path.extname(filePath)) || 'application/octet-stream' });
      res.end(data);
    } catch (error) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(`Not found: ${error.message}`);
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
  };
}

export function encodeFileUrl(absolutePath) {
  return `/__file/${Buffer.from(absolutePath, 'utf8').toString('base64url')}`;
}
