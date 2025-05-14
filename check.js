const fs = require('fs');
const https = require('https');

const urls = [
  'https://sub.doon.eu.org/webhostmost-us',
  'https://sub.doon.eu.org/webhostmost-in'
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    });
    req.on('error', (err) => {
      resolve({ url, status: 'ERROR' });
    });
    req.end();
  });
}

(async () => {
  const results = await Promise.all(urls.map(checkUrl));
  const time = new Date().toISOString();
  const log = results.map(r => `- ${time} | ${r.url} => ${r.status}`).join('\n') + '\n';

  fs.appendFileSync('log.md', log);
})();
