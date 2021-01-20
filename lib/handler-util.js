'use strict';

const fs = require('fs');
const pug = require('pug');

function handleLogout(req, res) {
  res.writeHead(401, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(pug.renderFile('views/logout.pug'));
}

function handleNotFound(req, res) {
  res.writeHead(404, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('ページがみつかりません');
}

function handleBadRequest(req, res) {
  res.writeHead(400, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('未対応のメソッドです');
}
function handleFavicon(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/vnd.microsoft.icon'
  });
  const favicon = fs.readFileSync('./favicon.ico');
  res.end(favicon);
}
// 献立希望の自動投稿に対する目印
function handleFavicon1(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/vnd.microsoft.icon'
  });
  const favicon1 = fs.readFileSync('./favicon_menu1.ico');
  res.end(favicon1);
}
// 献立調整の自動投稿に対する目印
function handleFavicon2(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/vnd.microsoft.icon'
  });
  const favicon2 = fs.readFileSync('./favicon_menu2.ico');
  res.end(favicon2);
}
// 献立決定の自動投稿に対する目印
function handleFavicon3(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/vnd.microsoft.icon'
  });
  const favicon3 = fs.readFileSync('./favicon_menu3.ico');
  res.end(favicon3);
}
// 宛先のイラスト
function handleFaviconSend(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/vnd.microsoft.icon'
  });
  const faviconSend = fs.readFileSync('./favicon_send.ico');
  res.end(faviconSend);
}
// 献立情報更新の表示を点滅させるcss
function blinkingCss(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/css; charset=utf-8'
  });
  const blinkingCss = fs.readFileSync('views/style.css');
  res.end(blinkingCss);
}

module.exports = {
  handleLogout,
  handleNotFound,
  handleBadRequest,
  handleFavicon,
  handleFavicon1,
  handleFavicon2,
  handleFavicon3,
  handleFaviconSend,  
  blinkingCss
};