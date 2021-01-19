'use strict';
const postsHandler = require('./posts-handler');
const util = require('./handler-util');
const postsHandlerBoard = require('./posts-handler-board');

function route(req, res) {
  console.info('routerの先頭だよ urlは　　' + req.url);

  switch (req.url) {
    case '/posts':
      postsHandler.handle(req, res);
      break;
    case '/enquetes/arbitration':　　// 献立希望投稿処理へのurl　/enquetes/arbitration にしよう
      postsHandler.adminEnquetes(req, res); // 関数名からadminをはずすこと
      break;
    case '/enquetes/decision':　　// 献立決定投稿処理へのurl
      postsHandler.decisionEnquetes(req, res);
      break;
    case '/admin': // 献立の登録画面へのurl　ここredirectpostsではなく.handleでは？
      postsHandler.handleRedirectPosts(req, res);
      break;
    case '/admin-result': // 献立の登録済み画面へのurl /admin2 は　/adminと統合できるはず上の処理をhandleにした場合のこと
      postsHandler.handle(req, res);
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
    case '/logout':  // TODO ログアウト処理へのurl
      util.handleLogout(req, res);
      break;
    case '/favicon.ico':
      util.handleFavicon(req, res);
      console.info('faviconよくわからない');
      break;
    case '/communication': // 掲示板へのurl
      postsHandlerBoard.handle(req, res);
      break;
    case '/posts/board': // 掲示板への投稿時のurl　上と同じでよいかも
      postsHandlerBoard.handle(req, res);
      break;
    case '/posts?delete=1':
      postsHandlerBoard.handleDelete(req, res);
      break;
    case '/favicon_menu1.ico':  // 献立調整の自動投稿に対する目印
      util.handleFavicon1(req, res);
      console.info('favicon1よくわからない');
      break;
    case '/favicon_menu2.ico':  // 献立希望の自動投稿に対する目印
      util.handleFavicon2(req, res);
      console.info('favicon2よくわからない');
      break;
    case '/favicon_menu3.ico':  // 献立結果の自動投稿に対する目印
      util.handleFavicon3(req, res);
      console.info('favicon3よくわからない');
      break;
    case '/favicon_send.ico':  // 宛先のイラスト
      util.handleFaviconSend(req, res);
      console.info('faviconSendよくわからない');
      break;
    case '/favicon_home.ico':  // Homeのイラスト いらないので消す
      util.handleFaviconHome(req, res);
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
      console.info('routerだめ？');
      break;
  }
}

module.exports = {
  route
};