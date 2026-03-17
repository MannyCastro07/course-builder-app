import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const PORT = 4310;
const HOST = '0.0.0.0';
const baseDir = path.resolve('./local-uploads');

await fs.mkdir(baseDir, { recursive: true });

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-public-base-url',
  });
  res.end(JSON.stringify(payload));
}

function sanitizeRelativePath(input) {
  return (input || '')
    .replace(/^\/+/, '')
    .replace(/\.\./g, '')
    .replace(/\\/g, '/');
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-public-base-url',
      });
      res.end();
      return;
    }

    if (req.method === 'GET' && req.url === '/health') {
      sendJson(res, 200, { ok: true, port: PORT });
      return;
    }

    if (req.method === 'POST' && req.url === '/upload') {
      const body = await readJson(req);
      const relativePath = sanitizeRelativePath(body.desiredPath || `${Date.now()}-${body.name}`);
      const targetPath = path.join(baseDir, relativePath);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      const buffer = Buffer.from(body.data || '', 'base64');
      await fs.writeFile(targetPath, buffer);
      const publicBase = req.headers['x-public-base-url'] || `http://127.0.0.1:${PORT}`;
      sendJson(res, 200, {
        ok: true,
        path: relativePath,
        url: `${publicBase}/files/${relativePath}`,
      });
      return;
    }

    if (req.method === 'POST' && req.url === '/delete') {
      const body = await readJson(req);
      const relativePath = sanitizeRelativePath(body.path || '');
      const targetPath = path.join(baseDir, relativePath);
      await fs.rm(targetPath, { force: true });
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === 'GET' && req.url?.startsWith('/files/')) {
      const relativePath = sanitizeRelativePath(req.url.replace('/files/', ''));
      const targetPath = path.join(baseDir, relativePath);
      const data = await fs.readFile(targetPath);
      const ext = path.extname(targetPath).toLowerCase();
      const contentType = ext === '.pdf'
        ? 'application/pdf'
        : ext === '.docx'
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : ext === '.doc'
            ? 'application/msword'
            : ext === '.txt'
              ? 'text/plain; charset=utf-8'
              : ext === '.mp4'
                ? 'video/mp4'
                : ext === '.png'
                  ? 'image/png'
                  : ext === '.jpg' || ext === '.jpeg'
                    ? 'image/jpeg'
                    : 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
      });
      res.end(data);
      return;
    }

    sendJson(res, 404, { ok: false, error: 'Not found' });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Local upload server running at http://${HOST}:${PORT}`);
});
