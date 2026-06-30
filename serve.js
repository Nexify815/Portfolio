const http = require('http');
const fs = require('fs');
const path = require('path');

const mime = {
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  json: 'application/json',
};

http.createServer((req, res) => {
  let f = req.url === '/' ? '/index.html' : req.url;
  f = '.' + f.split('?')[0];
  try {
    let c = fs.readFileSync(f);
    let ext = path.extname(f).slice(1);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(c);
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(3000, () => console.log('→ http://localhost:3000'));
