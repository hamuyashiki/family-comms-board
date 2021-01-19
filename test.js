/* ブラウザの表示や保存用ファイル(*.json)の目視確認ではわからない動作について
　 入力値に対し期待する出力値となっているかを確認するテスト
*/

'use strict';
const pug = require('pug');
const assert = require('assert');

// pug のテンプレートにおける XSS 脆弱性のテスト
// 連絡板の投稿において　スクリプトタグがエスケープされていることをチェック
// 本テストは adminやguestによる自由記入textboxのスクリプトタグのエスケープも含んでいる
const html = pug.renderFile('./views/posts.pug', {
  posts: [{
    id: 1,
    content: '<script>alert(\'test\');</script>',
    postedBy: 'guest1',
    trackingCookie: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }],
  user: 'guest1'
});
assert(html.includes('&lt;script&gt;alert(\'test\');&lt;/script&gt;'));
console.log('テスト１が正常に完了しました');

// adminによる献立候補投稿textbox入力内容がadmin画面に反映される際に　スクリプトタグがエスケープされていることをチェック
const html2 = pug.renderFile('./views/admin.pug', {  // admin.pugは名前を変更する予定
  menu1: '<script>alert(\'test\');</script>',
  menu2: '<script>alert(\'test\');</script>',
  menu3: '<script>alert(\'test\');</script>',
  menu4: '<script>alert(\'test\');</script>',
  menu5: '<script>alert(\'test\');</script>',
  munu6: '<script>alert(\'test\');</script>'
});
assert(html2.includes('&lt;script&gt;alert(\'test\');&lt;/script&gt;'));
console.log('テスト２が正常に完了しました');

// adminによる献立候補連絡textbox入力内容がguestのアンケート画面に反映される際に　スクリプトタグがエスケープされていることをチェック
const html3 = pug.renderFile('./views/kondate-post.pug', {  // admin.pugは名前を変更する予定
  menu1: '<script>alert(\'test\');</script>',
  menu2: '<script>alert(\'test\');</script>',
  menu3: '<script>alert(\'test\');</script>',
  menu4: '<script>alert(\'test\');</script>',
  menu5: '<script>alert(\'test\');</script>',
  munu6: '<script>alert(\'test\');</script>'
});
assert(html3.includes('&lt;script&gt;alert(\'test\');&lt;/script&gt;'));
console.log('テスト３が正常に完了しました');

// アンケートの集計で最も票を集めたメニューのidが正しく求められていることをチェック
const judge = require('./lib/kondate-judge');
const a = [0,1,2,0,1,2]; // アンケートの集計に相当
const maxId = judge.findMaxValueId(a);
assert(maxId[0] === 2 && maxId[1] === 5);
console.log('テスト４が正常に完了しました');

// アンケートの集計で最も票をあつめたメニューが選ばれること
const postsHandler = require('./lib/posts-handler');
const readAdmin = {
  adminData1: '献立1',
  adminData2: '献立2',
  adminData3: '献立3',
  adminData4: '献立4',
  adminData5: '献立5',
  adminData6: '献立6'
};
const result = postsHandler.writeKondate(maxId, readAdmin)
assert(result.selectResult === '今日の献立アンケートは  献立3  献立6  に人気があります');
console.log('テスト５が正常に完了しました');