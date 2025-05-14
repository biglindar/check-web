const fs = require("fs");
const https = require("https");

// 从环境变量读取 URL
const urls = [
  { name: "#us", url: process.env.URL_US },
  { name: "#in", url: process.env.URL_IN }
];

function checkURL({ name, url }) {
  return new Promise((resolve) => {
    const start = Date.now();

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*'
      }
    };

    https.get(url, options, (res) => {
      const duration = Date.now() - start;
      // 北京时间格式输出
      const date = new Date(Date.now() + 8 * 3600 * 1000).toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
      resolve(`[${date}] ${name} - ${res.statusCode} - ${duration}ms`);
    }).on("error", (err) => {
      const date = new Date(Date.now() + 8 * 3600 * 1000).toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
      resolve(`[${date}] ${name} - ERROR - ${err.message}`);
    });
  });
}

(async () => {
  const results = await Promise.all(urls.map(checkURL));
  const logEntry = results.join("\n") + "\n";

  console.log(logEntry);
  fs.appendFileSync("log.md", logEntry);
})();
