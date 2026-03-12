/**
 * AIO Research — Local HTTP Server
 * Run: node server.js
 */

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'text/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
};

const server = http.createServer(function (req, res) {
  var reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';

  var filePath = path.join(ROOT, reqPath);
  var ext = path.extname(filePath).toLowerCase();
  var contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, function (err, data) {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 — Not Found</h1><p><a href="/">← Home</a></p>');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

server.listen(PORT, function () {
  console.log('\n✅ AIO Research running on:\n');
  console.log('   🌐 http://localhost:' + PORT + '/');
  console.log('\n   Pages:');
  console.log('   → http://localhost:' + PORT + '/          (Home / Study)');
  console.log('\n   Stop with Ctrl+C\n');
});
