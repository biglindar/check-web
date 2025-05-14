const fs = require("fs");
const https = require("https");

// URL 列表，替换为你自己的网址
const urls = [
  "https://sub.doon.eu.org/webhostmost-us",
  "https://sub.doon.eu.org/webhostmost-in"
];

// 模拟正常浏览器的请求头
const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  }
};

// 随机延迟函数（模拟正常用户行为）
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 检查 URL 并返回结果
function checkURL(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    https.get(url, options, (res) => {
      const duration = Date.now() - start;
      resolve(`[${new Date().toISOString()}] ${url} - ${res.statusCode} - ${duration}ms`);
    }).on("error", (err) => {
      resolve(`[${new Date().toISOString()}] ${url} - ERROR - ${err.message}`);
    });
  });
}

// 主程序：按顺序检查 URL 并记录日志
(async () => {
  const results = await Promise.all(urls.map(async (url) => {
    await sleep(Math.random() * 2000); // 随机延迟 0~2秒
    return checkURL(url);
  }));

  const logEntry = results.join("\n") + "\n";

  console.log(logEntry); // 输出到控制台
  fs.appendFileSync("log.md", logEntry); // 写入日志文件
})();
