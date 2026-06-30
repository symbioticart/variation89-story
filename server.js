// variations87-core — minimal static server for the vertical CORE prototype.
const http = require('http'), fs = require('fs'), path = require('path');
const dir = __dirname, port = process.env.PORT || 3470;
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };

http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/data/daily-metrics.json') {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, 'data', 'daily-metrics.json'), 'utf8'));
      const days = raw.days || [];
      const last = days.length ? days[days.length - 1].day : null;
      const serverDate = new Date().toISOString().slice(0, 10);
      const gapDays = last ? Math.max(0, Math.round((Date.parse(serverDate) - Date.parse(last)) / 864e5)) : 0;
      const payload = { stats: raw.stats || {}, days, meta: { lastDataDay: last, serverDate, gapDays, status: gapDays <= 7 ? 'stable' : 'dormant', live: false } };
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(payload));
    } catch (e) { res.writeHead(500); res.end('data error'); }
    return;
  }
  if (url === '/') url = '/index.html';
  const fp = path.join(dir, decodeURIComponent(url));
  fs.readFile(fp, (e, d) => {
    if (e) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(fp)] || 'text/plain' });
    res.end(d);
  });
}).listen(port, () => console.log('variations87-core — http://localhost:' + port));
