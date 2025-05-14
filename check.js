const fs = require("fs");
const https = require("https");

// 需要监控的网址
const urls = [
  "https://sub.doon.eu.org/1", // 替换为你自己的网址
  "https://webhostmost-in.doon.eu.org/sub" // 替换为你自己的网址
];

// 随机延迟函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 生成随机整数（用于随机延迟）
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //含头含尾
}

// 请求函数，带上更完善的浏览器请求头和超时
function checkURL(url, timeout = 10000) { // 默认超时10秒
  return new Promise((resolve) => {
    const start = Date.now();

    const options = {
      headers: {
        // 模拟更常见的浏览器User-Agent，可以定期更新
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${getRandomInt(100, 120)}.0.${getRandomInt(0, 5000)}.0 Safari/537.36`,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9', // 更完整的Accept头
        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7', // 增加多种语言
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        // 移除 Referer, Origin, X-Requested-With 等头部，让它看起来像直接访问，
        // 或者你可以根据实际情况设置一个合理的 Referer (比如网站主页)
        // 'Referer': 'https://webhostmost-us.doon.eu.org/', // 示例：设置为可能的来源页
        // 'Origin': 'https://webhostmost-us.doon.eu.org/' // 示例
      },
      timeout: timeout // Node.js v13.1.0+ 支持 options.timeout
    };

    const req = https.get(url, options, (res) => {
      const duration = Date.now() - start;
      resolve(`[${new Date().toISOString()}] ${url} - ${res.statusCode} - ${duration}ms`);

      // 消耗响应数据，防止内存泄漏，对于 HEAD 或 GET 请求通常需要
      res.resume();
    });

    // 处理超时事件 (Node.js v13.1.0 之前的版本需要手动设置)
    req.on('timeout', () => {
      req.destroy(); // 终止请求
      resolve(`[${new Date().toISOString()}] ${url} - TIMEOUT - ${timeout}ms exceeded`);
    });

    req.on("error", (err) => {
      // 过滤掉 'ECONNRESET' 和 'ETIMEDOUT' 错误，这些在上面的timeout事件中已经处理
      if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') return;
      resolve(`[${new Date().toISOString()}] ${url} - ERROR - ${err.message}`);
    });
  });
}

// 主执行函数
(async () => {
  const results = [];
  const baseDelayBetweenRequests = 3000; // 基本间隔 3 秒
  const randomDelayRange = 2000; // 随机范围 +/- 1 秒 (总范围 2 秒)

  for (const url of urls) {
    const result = await checkURL(url);
    results.push(result);
    console.log(result); // 立即输出当前网址的结果

    // 在检查每个网址后增加随机延迟
    if (urls.indexOf(url) < urls.length - 1) { // 如果不是最后一个网址
        const delay = baseDelayBetweenRequests + getRandomInt(-randomDelayRange / 2, randomDelayRange / 2);
        console.log(`等待 ${delay}ms 后检查下一个网址...`);
        await sleep(delay);
    }
  }

  // 将所有结果写入本地文件 log.md
  const logEntry = results.join("\n") + "\n";
  fs.appendFileSync("log.md", logEntry);

  // 每次完整执行后等待更长时间，模拟批次间隔
  const longDelay = 10000; // 例如等待 10 秒
  console.log(`所有网址检查完毕。等待 ${longDelay}ms 后下一轮检查（如果脚本持续运行）...`);
  await sleep(longDelay);

  // 注意：这个 IIFE 结束后，脚本就会退出，长等待只影响到 if you wrap this in a loop
  // If you run this script repeatedly (e.g., via a cron job or GitHub Actions schedule),
  // the longDelay at the end effectively determines the minimum interval between script runs.

})();
