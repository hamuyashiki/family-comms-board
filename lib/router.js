'use strict';
const postsHandler = require('./posts-handler');
const util = require('./handler-util');
const postsHandlerBoard = require('./posts-handler-board');

function route(req, res) {
  console.info('routerの先頭：urlは　　' + req.url);
  if (process.env.DATABASE_URL
    && req.headers['x-forwarded-proto'] === 'http') {
    util.handleNotFound(req, res);
    }
  switch (req.url) {
    case '/posts': // 献立の投稿画面(get)または　献立登録処理(post)へのurl
      postsHandler.handle(req, res);
      break;
    case '/enquetes/arbitration':　　// 献立希望投稿処理へのurl
      postsHandler.tallyEnquetes(req, res);　// admin は消して　enquetes
      break;
    case '/enquetes/decision':　　// 献立決定投稿処理へのurl
      postsHandler.decisionEnquetes(req, res);
      break;
    case '/top': // 入れ口のurl
      postsHandler.accessTopPage(req, res);
      break;
    case '/enquetes/kondate': // 献立希望投稿画面へのurl
      postsHandler.accessEnquetesPage(req, res);
      break;
    case '/decision/kondate': // 献立決定投稿画面へのurl
      postsHandler.accessDecisionPage(req, res);
    break;
    case '/logout':  // ログアウト処理へのurl
      util.handleLogout(req, res);
      break;
    case '/favicon.ico':  // ファビコンとtop画面のイラスト（ハムスター）
      util.handleFavicon(req, res);
      break;
    case '/communication': // 連絡板へのurl
      postsHandlerBoard.handle(req, res);
      break;
    case '/posts?delete=1': // 投稿の削除処理
      postsHandlerBoard.handleDelete(req, res);
      break;
    case '/favicon_menu1.ico':  // 献立調整の自動投稿に対する目印（くま）
      util.handleFavicon1(req, res);
      break;
    case '/favicon_menu2.ico':  // 献立希望の自動投稿に対する目印（うさぎ）
      util.handleFavicon2(req, res);
      break;
    case '/favicon_menu3.ico':  // 献立結果の自動投稿に対する目印（女性）
      util.handleFavicon3(req, res);
      break;
    case '/favicon_send.ico':  // 宛先のイラスト(鳥)
      util.handleFaviconSend(req, res);
      break;
    case '/style.css':  // 献立情報更新の表示を点滅させるcss
      util.blinkingCss(req, res);
      break;
    case '/howtouse': // 使い方
      postsHandler.accessHowToUse(req, res);
      break;
    default:
      console.info(req.method);
      console.info(req.url);
      console.info('router処理が通りませんでした');
      break;
  }
}

module.exports = {
  route
};