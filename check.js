const fs = require("fs");
const https = require("https");

// 需要监控的网址
const urls = [
  'https://sub.doon.eu.org/webhostmost-us',
  'https://sub.doon.eu.org/webhostmost-in'
];

// 随机延迟函数（模拟更自然的请求）
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 请求函数，带上伪装的浏览器请求头
function checkURL(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    
    // 根据 URL 设置 Referer 和 Origin
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'X-Requested-With': 'XMLHttpRequest',   // 有些站点可能需要此头部
        'Referer': url,                         // 设置 Referer 为目标 URL
        'Origin': url                           // 设置 Origin 为目标 URL
      }
    };

    https.get(url, options, (res) => {
      const duration = Date.now() - start;
      resolve(`[${new Date().toISOString()}] ${url} - ${res.statusCode} - ${duration}ms`);
    }).on("error", (err) => {
      resolve(`[${new Date().toISOString()}] ${url} - ERROR - ${err.message}`);
    });
  });
}

// 主执行函数
(async () => {
  // 等待所有网址的请求完成
  const results = await Promise.all(urls.map(checkURL));

  // 格式化日志
  const logEntry = results.join("\n") + "\n";

  // 输出到控制台（GitHub Actions 中的日志）
  console.log(logEntry);

  // 将日志写入本地文件 log.md
  fs.appendFileSync("log.md", logEntry);

  // 每次执行后等待 5 秒，模拟更自然的请求间隔
  await sleep(5000);
})();
