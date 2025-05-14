const fs = require("fs");
const https = require("https");

const urls = [
  { name: "#us", url: "https://webhostmost-us.doon.eu.org/sub" },
  { name: "#in", url: "https://webhostmost-in.doon.eu.org/sub" }
];

function checkURL({ name, url }) {
  return new Promise((resolve) => {
    const start = Date.now();

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': url,
        'Origin': url
      }
    };

    https.get(url, options, (res) => {
      const duration = Date.now() - start;
      resolve(`[${new Date().toISOString()}] ${name} - ${res.statusCode} - ${duration}ms`);
    }).on("error", (err) => {
      resolve(`[${new Date().toISOString()}] ${name} - ERROR - ${err.message}`);
    });
  });
}

(async () => {
  const results = await Promise.all(urls.map(checkURL));
  const logEntry = results.join("\n") + "\n";

  console.log(logEntry);
  fs.appendFileSync("log.md", logEntry);
})();
