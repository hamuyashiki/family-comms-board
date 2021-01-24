'use strict';

const util = require('./handler-util'); // この位置でよいか、require fsも外に出す？
const pug = require('pug');
const fs = require('fs');

const contents = [];

// CASE:GET 管理者の献立登録画面を表示する
// CASE:POST 献立登録画面で登録する
function handle(req, res) {
  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      
      var readAdmin = this.readAdminData();　// pugに受け渡す献立情報を読み込む

 //     const fs = require('fs');

      res.end(pug.renderFile("views/kondate-reg.pug", {
          menu1: readAdmin.adminData1,
          menu2: readAdmin.adminData2,
          menu3: readAdmin.adminData3,
          menu4: readAdmin.adminData4,
          menu5: readAdmin.adminData5,
          menu6: readAdmin.adminData6
        }
      ));
      break;

    case 'POST':
        /** ここを通ったら献立が更新されたという履歴を残し外部ファイルに保存する
        *   この履歴は guest-top.pug で参照して New 表示を出す
        * 　 献立投票ページを開いたらこの履歴をクリアする
        */　
        
        // 献立が更新されたので guestのアンケート投票ページへのリンクを表示し guest全員に New表示を出す
        // (changeInfo[0]:submitPermit => リンク表示,submitInhibit => リンク非表示)
        let changeInfo = ["submitPermit", "guest1", "guest2", "guest3"];
        let fileNameNew = './newMenuInfo.json';  // メニュー更新New表示する相手を保存しておくファイル
        // メニュー更新New表示相手を書き出す
        fs.writeFileSync(fileNameNew, JSON.stringify(changeInfo), 'utf8');

        // 各userの献立希望をクリアし ファイルに書き出す
        let answers1 = new Array();
        let answers2 = new Array();
        let answers3 = new Array();
        let answers4 = new Array();

        let fileName1 = './answers1.json';
        let fileName2 = './answers2.json';
        let fileName3 = './answers3.json';
        let fileName4 = './answers4.json';
      
          answers1 = [0, 0, 0, 0, 0, 0, 0, ""];
          fs.writeFileSync(fileName1, JSON.stringify(answers1), 'utf8');
          answers2 = [0, 0, 0, 0, 0, 0, 0, ""];
          fs.writeFileSync(fileName2, JSON.stringify(answers2), 'utf8');
          answers3 = [0, 0, 0, 0, 0, 0, 0, ""];
          fs.writeFileSync(fileName3, JSON.stringify(answers3), 'utf8');
          answers4 = [0, 0, 0, 0, 0, 0, 0, ""];
          fs.writeFileSync(fileName4, JSON.stringify(answers4), 'utf8');

        let rawData = '';
        let body = [];  // 配列bodyには登録された献立が入る
        req
          .on('data', chunk => {
            rawData = rawData + chunk;
            // 例 rawData:　menu=%E7%84%BC%E3%81%8D%E8%82%89 が&でつながれている
          })
          .on('end', () => {
            const decoded = decodeURIComponent(rawData);  // 登録された献立の日本語表記 & でつながれている
            // 正規表現で　"menu="　の文字列を消す
            const replaced = decoded.replace(/menu=/g, '');
            body = replaced.split("&");  // 登録された献立がbody配列に入る

            // 管理者設定のデータをjsonファイルに書き出す
            let fileName0 = './adminsetting.json';
            fs.writeFileSync(fileName0, JSON.stringify(body), 'utf8');

            // 前回までのアンケートcheckboxの結果を外部ファイルから消去する
            fs.writeFileSync('./enquetesResult.json', JSON.stringify(""), 'utf8');

            // 献立の登録結果の表示
            res.end(pug.renderFile('views/reg-result.pug', {
            }
            ));
          })
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}
// topページの表示
function accessTopPage(req, res) {
  var topPage = '';
  if (req.user === 'admin') {
    topPage = 'views/admin-top.pug';
  } else { topPage = 'views/guest-top.pug' };

  // ここで New表示 と 投稿リンク表示 を切り替えるための情報を読み込む
  const readInfo = this.readNewInfo();

  // 配列の0をセットする処理を追加する
  var newInfo0 = readInfo.changeInfo[0];
  var newInfo1 = readInfo.changeInfo[1];
  var newInfo2 = readInfo.changeInfo[2];
  var newInfo3 = readInfo.changeInfo[3];

  res.end(pug.renderFile(topPage, {
    user: req.user, // ログイン中のユーザー名をpugに渡す
    submitButton: newInfo0, // pugに投稿許可情報も渡す追加
    newInfo1: newInfo1,
    newInfo2: newInfo2,
    newInfo3: newInfo3
  }));
}

// 献立投票画面へのアクセス と 表示をする処理
function accessEnquetesPage(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8'
  });

  // 献立更新連絡先情報を読み込み　このページ（最新の献立）を見たという痕跡を残す処理
  var readInfo = this.readNewInfo();
  switch (req.user) {
    case 'guest1':
      readInfo.changeInfo[1] = '' // guest1は最新の献立表を見た
      break;
    case 'guest2':
      readInfo.changeInfo[2] = '' // guest2は最新の献立表を見た
      break;
    case 'guest3':
      readInfo.changeInfo[3] = '' // guest3は最新の献立表を見た
      break;
    default:
      console.info('最新の献立を見たという情報の処理に失敗しました');
      break;
  }
  // ファイルに保存する処理
  let fileNameNew = './newMenuInfo.json';
  const fs = require('fs');
  fs.writeFileSync(fileNameNew, JSON.stringify(readInfo.changeInfo), 'utf8');

  // 献立情報を読み込み kondate-post.pugに渡す
  var readAdmin = this.readAdminData();
  res.end(pug.renderFile("views/kondate-post.pug", {
    menu1: readAdmin.adminData1,
    menu2: readAdmin.adminData2,
    menu3: readAdmin.adminData3,
    menu4: readAdmin.adminData4,
    menu5: readAdmin.adminData5,
    menu6: readAdmin.adminData6
  }
  ));
}
// アンケートの集計処理
function tallyEnquetes(req, res) {
  const fs = require('fs');
  let judge = require('./kondate-judge');  // constかな？
  let rawData = '';
  let body = [];
  req
    .on('data', chunk => {
      rawData = rawData + chunk;
    })
      // 登録された献立から選ばれた例 rawData = orders=order1&orders=order3
      // この中にはない が選ばれた例 rawData = nothing=otherwise&sonota=%E3%81%8A%E8%8C%
    .on('end', () => {
      const decoded = decodeURIComponent(rawData);
      body = decoded.split("&");    // 例 body = [orders=order1, orders=order3]

    // 献立アンケートがtextboxで投稿された場合の処理
    　　// body[0]に otherwise が含まれるときは textboxで投稿されている 
      　// textboxの内容は body[1]に入っている　不要な文字列を取り除くきtextboxの内容を抽出
      if (body[0].includes('otherwise')) {
        var textContent = body[1].replace(/sonota=/g, "");  // 抽出したtextboxの内容

        let answers1 = new Array();
        let answers2 = new Array();
        let answers3 = new Array();
        let answers4 = new Array();

        let fileName1 = './answers1.json';
        let fileName2 = './answers2.json';
        let fileName3 = './answers3.json';
        let fileName4 = './answers4.json';

        // すべてのユーザーのデータを読み出す
        try {
          const data1 = fs.readFileSync(fileName1, 'utf8');
          answers1 = JSON.parse(data1);
        }
        catch (ignore) {
          answers1 = [0, 0, 0, 0, 0, 0, 0, ""];
          console.log(fileName1 + 'から復元できませんでした');
        }
        try {
          const data2 = fs.readFileSync(fileName2, 'utf8');
          answers2 = JSON.parse(data2);
        }
        catch (ignore) {
          answers2 = [0, 0, 0, 0, 0, 0, 0, ""];
          console.log(fileName2 + 'から復元できませんでした');
        }
        try {
          const data3 = fs.readFileSync(fileName3, 'utf8');
          answers3 = JSON.parse(data3);
        }
        catch (ignore) {
          answers3 = [0, 0, 0, 0, 0, 0, 0, ""];
          console.log(fileName3 + 'から復元できませんでした');
        }
        try {
          const data4 = fs.readFileSync(fileName4, 'utf8');
          answers4 = JSON.parse(data4);
        }
        catch (ignore) {
          answers4 = [0, 0, 0, 0, 0, 0, 0, ""];
          console.log(fileName4 + 'から復元できませんでした');
        }

        // 各人のアンケート結果が保存されている変数answers* の id=7 に textboxの値を保存
        // 合わせて checkboxの結果を表すanswers*[0] ～ [5] を 0 とする
        if (req.user === 'admin') {
          for (let i = 0; i < 6; i++) {
            answers1[i] = 0;
          }
          answers1[7] = textContent;
          fs.writeFileSync(fileName1, JSON.stringify(answers1), 'utf8');
        } else if (req.user === 'guest1') {
          for (let i = 0; i < 6; i++) {
            answers2[i] = 0;
          }
          answers2[7] = textContent;
          fs.writeFileSync(fileName2, JSON.stringify(answers2), 'utf8');
        }
        else if (req.user === 'guest2') {
          for (let i = 0; i < 6; i++) {
            answers3[i] = 0;
          }
          answers3[7] = textContent;
          fs.writeFileSync(fileName3, JSON.stringify(answers3), 'utf8');
        }
        else if (req.user === 'guest3') {
          for (let i = 0; i < 6; i++) {
            answers4[i] = 0;
          }
          answers4[7] = textContent;
          fs.writeFileSync(fileName4, JSON.stringify(answers4), 'utf8');
        }
        else { ; }

        // koc:投稿の種類 を "menu2"(= 献立アンケート textbox結果の自動投稿) とする
        textContent = textContent + 'を希望'   // 連絡板への表示内容
        let koc = "menu2";  // kind of content
        this.writeBoard(req, res, textContent, koc); // 掲示板に書き込む

      } else {
    // 登録された献立からcheckboxで選択した場合の処理
        let voting = judge.judgement(req.user, body);
        // findMaxValueId は配列のindex 1～7のうち最大値が入っているindexを求める
        // 各メニューの選択数が引数
        let selectedId = judge.findMaxValueId(voting.syukei); 

    // 登録された献立情報とアンケートで最大得票数を得た献立id から求めた献立調整結果を書き出す
        var readAdmin = this.readAdminData();
        var kondate = this.writeKondate(selectedId, readAdmin);
        // koc:投稿の種類 を "menu1"(= 献立アンケート checkbox調整結果の自動投稿) とする
        let koc = "menu1"; // kind of content
        this.writeBoard(req, res, kondate.selectResult, koc);  // 引数増やす kof = "menu1"
      }
    });
}
// 管理者が登録した献立データを読み出す処理
function readAdminData() {
  const fileName0 = './adminsetting.json';
//  const readFile0 = new Array; // この一行いるのか？
  const fs = require('fs');
  try {
    const readFile0 = fs.readFileSync(fileName0, 'utf8');
    let adminData = JSON.parse(readFile0); // 配列化

    var adminData1 = adminData[0];
    var adminData2 = adminData[1];
    var adminData3 = adminData[2];
    var adminData4 = adminData[3];
    var adminData5 = adminData[4];
    var adminData6 = adminData[5];
  }
  catch (ignore) {
    console.log('メニューテーブルを読み出せませんでした');
  }
  return { adminData1, adminData2, adminData3, adminData4, adminData5, adminData6 };
}

// 献立変更連絡先を読み出して　外部で使える変数に渡す処理
function readNewInfo() {
  const fileNameNew = './newMenuInfo.json';

  const fs = require('fs');
  try {
    const readFileNew = fs.readFileSync(fileNameNew, 'utf8');

    const changeInfo0 = readFileNew.replace(/\[/g, '');  // カギかっこを削除
    const changeInfo1 = changeInfo0.replace(/\]/g, '');  // カギかっこ閉じを削除
    const changeInfo2 = changeInfo1.replace(/\"/g, '');  // "を削除

    var changeInfo = changeInfo2.split(','); // 文字列を　',' で分割し配列化

  }

  catch (ignore) {
    var changeInfo = ["submitPermit", "guest1", "guest2", "guest3"];
    console.log('献立更新連絡先を読み出せませんでした');
  }
  return { changeInfo };
}

// 献立調整結果を書き出す関数(selectedIdに該当するidのreadAdminがselectedになる)
function writeKondate(selectedId, readAdmin) {
  const fs = require('fs');
  
  const m = [readAdmin.adminData1, readAdmin.adminData2, readAdmin.adminData3, readAdmin.adminData4, readAdmin.adminData5, readAdmin.adminData6];
  const k = selectedId.toString();
  let selected = ['', '', '', '', '', ''];
  for (let i = 0; i < m.length; i++) {
    if (k.includes(i)) {
      selected[i] = m[i];
    }
    else {
      selected[i] = '';
    }
  }

  // 献立調整結果のスペースが必要以上に多くならないようにするため 各献立の結果が入っている変数の前後にスペースを付加
  let result = "  "; // 全角スペース　連絡版に表示される献立の前に入る
  for (let i = 0; i < selected.length; i++) {
    if (selected[i] === "") {
      ;
    } else {
    result = result + selected[i] + "  "; // 全角スペース　連絡板に表示される献立の後に入る
    }    
  }
  // 献立アンケート結果（複数の場合あり）を変数に入れる
    var select = result;
  // アンケート結果を管理者が献立を決定する画面に表示するため外部ファイルに保存する
    fs.writeFileSync('./enquetesResult.json', JSON.stringify(select), 'utf8');
  var selectResult = ('今日の献立アンケートは' + select + 'に人気があります');  // 掲示板の表示内容
  return {selectResult};
};

// 管理者の献立決定結果投稿ページを表示する処理
function accessDecisionPage(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  const fs = require('fs');
  // 献立情報を読み込んでおく
  var readAdmin = this.readAdminData();
  console.info(readAdmin.adminData1);

  let answers1 = new Array();
  let answers2 = new Array();
  let answers3 = new Array();
  let answers4 = new Array();

  let fileName1 = './answers1.json';
  let fileName2 = './answers2.json';
  let fileName3 = './answers3.json';
  let fileName4 = './answers4.json';

  // すべてのユーザーのデータを読み出す
  try {
    const data1 = fs.readFileSync(fileName1, 'utf8');
    answers1 = JSON.parse(data1);
  }
  catch (ignore) {
    answers1 = [0, 0, 0, 0, 0, 0, 0, ""];
    console.log(fileName1 + 'から復元できませんでした');
  }
  try {
    const data2 = fs.readFileSync(fileName2, 'utf8');
    answers2 = JSON.parse(data2);
  }
  catch (ignore) {
    answers2 = [0, 0, 0, 0, 0, 0, 0, ""];
    console.log(fileName2 + 'から復元できませんでした');
  }
  try {
    const data3 = fs.readFileSync(fileName3, 'utf8');
    answers3 = JSON.parse(data3);
  }
  catch (ignore) {
    answers3 = [0, 0, 0, 0, 0, 0, 0, ""];
    console.log(fileName3 + 'から復元できませんでした');
  }
  try {
    const data4 = fs.readFileSync(fileName4, 'utf8');
    answers4 = JSON.parse(data4);
  }
  catch (ignore) {
    answers4 = [0, 0, 0, 0, 0, 0, 0, ""];
    console.log(fileName4 + 'から復元できませんでした');
  }
  // 全員分のtextboxに記載された献立希望を一つの変数に入れる
  let requests = answers1[7] + '  ' + answers2[7] + '  ' + answers3[7] + '  ' + answers4[7];

if(requests === '      ') {
  requests = 'なし'
}else {
  ;
}

  // アンケート結果を読み出す
  try {
    const eR = fs.readFileSync('./enquetesResult.json', 'utf8');
    var enquetesResult = JSON.parse(eR);  // アンケート結果(献立名)
  }
  catch (ignore) {
    enquetesResult = "";
    console.info('./enquetesResult.json から復元できませんでした');
  }
  if(enquetesResult === "") {
    enquetesResult = 'なし'
  }else {
    ;
  }
// 登録された献立、アンケート結果、ユーザーのリクエストを管理者が決定した献立を投稿する画面のpugに渡す
  res.end(pug.renderFile("views/kondate-fix.pug", {
    menu1: readAdmin.adminData1,
    menu2: readAdmin.adminData2,
    menu3: readAdmin.adminData3,
    menu4: readAdmin.adminData4,
    menu5: readAdmin.adminData5,
    menu6: readAdmin.adminData6,
    enquetesResult: enquetesResult,
    requests: requests
  }
));
}
//  管理者によるアンケート決定の投稿処理
function decisionEnquetes(req, res) {
  let rawData = '';
  let body = [];
  req
    .on('data', chunk => {
      rawData = rawData + chunk;
      // 決定をcheckboxで行った場合 rawDataの例 menulist=%E3%82%B9%E3%83%91%E3%82
      // 決定をtextboxで行った場合 rawDataの例 menulist=%E3%81%93%E3%81&request=%E3%81%8A%E8%8
    })
    .on('end', () => {
      const decoded0 = decodeURIComponent(rawData);
      const decoded1 = decoded0.replace(/menulist=/g, '');
      const decoded2 = decoded1.replace(/request=/g, '');
//      const decoded3 = decoded2.replace(/\+/g, ''); // 最後の献立を選ぶと入る + を削除
      body = decoded2.split("&");
      // 決定をcheckboxで行った場合 body[0] = '選択した献立'
      // 決定をtextboxで行った場合 body[0] = 'この中にはない' body[1] = 'textboxの記載内容'
      if (body[0] === 'この中にはない') {
        var decision = body[1]; // textboxの内容を表示する
      } else {
        var decision = body[0]; // 決められたメニューからの選択結果を表示する
      }
      this.writeDecision(req, res, decision);
    });
}

// 献立決定結果を書き出す
function writeDecision(req, res, decision) {
  const fs = require('fs');

  // 決定した献立を表示する文字列を 変数に入れる
  var selectResult = ('今日の献立は' + decision + 'に決まりました');
  // changeInfo[0]には 献立決定後は献立希望の投稿を出来なくすることを表す文字列を入れる
  // 献立決定投稿があった時点で献立はNewではないので　changeInfo[1] ～[3] は"" にする
  // changeInfoは投稿に紐づいていないので　DBに入れる必要もない　外部ファイルに保存する
  var readInfo = this.readNewInfo();
  readInfo.changeInfo[0] = 'submitInhibit';
  readInfo.changeInfo[1] = '';
  readInfo.changeInfo[2] = '';
  readInfo.changeInfo[3] = '';

  let fileNameNew = './newMenuInfo.json';  // メニュー更新連絡相手のデータを保存しておくファイル
  // メニュー希望の投稿禁止状態を保存する
  fs.writeFileSync(fileNameNew, JSON.stringify(readInfo.changeInfo), 'utf8');
  // koc:投稿の種類 を "menu3"(= 献立決定の自動投稿) とする
  let koc = "menu3"; // kind of content
  // 連絡板に書き出す
  this.writeBoard(req, res, selectResult, koc);
};

function writeBoard(req, res, p, koc) {  // 'menu'を変数にして引数kに追加
  const Post = require('./post');
  const postsHandlerBoard = require('./posts-handler-board');

  Post.create({
    content: p,  // 献立アンケートの自由記入内容
    trackingCookie: null,  // 不使用
    postedBy: req.user,    // 献立希望を出したユーザー
    receiver1: 'admin',   // 献立希望(textbox)はadminが閲覧可能とする
    receiver2: 'guest1',  // 献立希望(textbox)は全てのguestが閲覧可能とする
    receiver3: 'guest2',  // 献立希望(textbox)は全てのguestが閲覧可能とする
    receiver4: 'guest3',  // 献立希望(textbox)は全てのguestが閲覧可能とする
    kindOfContent: koc
  }).then(() => {

    // 献立の結果をpugに反映する
    const pug = require('pug');
    const Sequelize = require('sequelize');

    const Op = Sequelize.Op;
    Post.findAll({
      where: {
        [Op.or]: {
          postedBy: req.user, // 自分の投稿を見ることができる
          receiver1: req.user,  // adminは全ての投稿を見ることができる
          receiver2: req.user,  // ログインユーザーがguest1の場合　guest1向けの投稿を見ることができる
          receiver3: req.user,  // ログインユーザーがguest2の場合　guest2向けの投稿を見ることができる
          receiver4: req.user   // ログインユーザーがguest3の場合　guest3向けの投稿を見ることができる
        }
      }
      , order: [['id', 'DESC']]  // 新しい投稿を上に表示する
    }).then((selectResult, kindOfContent) => {
      res.end(pug.renderFile('./views/posts.pug', {
        posts: selectResult,
        kindofContent: kindOfContent
      }));
    })

    // 掲示板にリダイレクトする（献立結果を表示する）
    postsHandlerBoard.handleRedirectPostsBoard(req, res);
  });
};

function accessHowToUse(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(pug.renderFile('views/howToUse.pug'));
}

module.exports = {
  handle,
  accessTopPage,
  accessEnquetesPage,
  tallyEnquetes,
  readAdminData,
  readNewInfo,
  writeKondate,
  accessDecisionPage,
  decisionEnquetes,
  writeDecision,
  writeBoard,
  accessHowToUse,
};