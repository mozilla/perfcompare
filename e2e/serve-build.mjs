// A tiny static file server for the production build, with SPA fallback.
//
// It only uses node built-ins so that it can run without `node_modules`. This
// matters for the dependency-PR review workflow: the agent job serves a build
// artifact from a trusted checkout and must not execute JavaScript that comes
// from the pull request (server.js depends on express from node_modules).
//
// Usage: node e2e/serve-build.mjs [buildDir] [port]

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';

const rootDir = resolve(process.argv[2] ?? 'build');
const port = Number(process.argv[3] ?? process.env.PORT ?? 8080);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

function resolveFile(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0]);
  } catch {
    // Malformed percent-escapes: treat as unknown, don't crash the server.
    return null;
  }
  const candidate = normalize(join(rootDir, decoded));
  // Refuse anything that escapes the build directory.
  if (candidate !== rootDir && !candidate.startsWith(rootDir + sep)) {
    return null;
  }
  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }
  return null;
}

const server = createServer((req, res) => {
  const file = resolveFile(req.url ?? '/');
  // Unknown paths fall back to index.html, like server.js and Netlify do.
  const target = file ?? join(rootDir, 'index.html');
  if (!existsSync(target)) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Build directory is missing index.html');
    return;
  }
  res.writeHead(200, {
    'content-type': contentTypes[extname(target)] ?? 'application/octet-stream',
  });
  createReadStream(target).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving ${rootDir} on http://127.0.0.1:${port}`);
});
