const fs = require("fs");
const https = require("https");

const urls = [
  { name: "#us", url: process.env.URL_US },
  { name: "#in", url: process.env.URL_IN }
];

function formatBeijingTime(date) {
  date.setHours(date.getHours() + 8); // 转为北京时间

  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const period =
    hour >= 18 ? "晚上" :
    hour >= 12 ? "下午" :
    hour >= 6  ? "上午" :
                 "凌晨";

  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${period}${hour12}点${minute}分${second}秒`;
}

function checkURL({ name, url }) {
  return new Promise((resolve) => {
    const start = Date.now();

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*',
        'Connection': 'keep-alive'
      }
    };

    https.get(url, options, (res) => {
      const duration = Date.now() - start;
      const now = new Date();
      const formattedTime = formatBeijingTime(now);
      resolve(`${formattedTime} ${name} - 状态码 ${res.statusCode} - 用时 ${duration} 毫秒`);
    }).on("error", (err) => {
      const now = new Date();
      const formattedTime = formatBeijingTime(now);
      resolve(`${formattedTime} ${name} - 错误 - ${err.message}`);
    });
  });
}

(async () => {
  const results = await Promise.all(urls.map(checkURL));
  const logEntry = results.join("\n") + "\n\n";

  console.log(logEntry);
  fs.appendFileSync("log.md", logEntry);
})();
