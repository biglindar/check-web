const fs = require("fs");
const https = require("https");

const urls = [
  "https://webhostmost-us.doon.eu.org/sub",   // 替换为你自己的网址
  "https://webhostmost-in.doon.eu.org/sub"
];

function checkURL(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    https.get(url, (res) => {
      const duration = Date.now() - start;
      resolve(`[${new Date().toISOString()}] ${url} - ${res.statusCode} - ${duration}ms`);
    }).on("error", (err) => {
      resolve(`[${new Date().toISOString()}] ${url} - ERROR - ${err.message}`);
    });
  });
}

(async () => {
  const results = await Promise.all(urls.map(checkURL));
  const logEntry = results.join("\n") + "\n";

  console.log(logEntry); // GitHub Actions 控制台日志
  fs.appendFileSync("log.md", logEntry); // 写入日志文件
})();
