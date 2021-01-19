'use strict';

const util = require('./handler-util'); // この位置でよいか、require fsも外に出す？
const pug = require('pug'); // pugを使う場合

const contents = [];
const now = new Date();
const hour = now.getHours();
console.info(hour + '時です');

function handle(req, res) {
  switch (req.method) {
    case 'GET':
      console.log(req.user);

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      
      var readAdmin = this.readAdminData();　// pugに受け渡す献立情報を読み込む

      const fs = require('fs');

      res.end(pug.renderFile("views/admin.pug", {
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
      if (req.user === 'admin') {
        console.log('adminrルート');
        // ここを通ったら献立が変わったという変数をセットする
        // ファイルに書き出す
        // 献立投票ページを開いたらクリアする
        // ファイルに書き出す
        // guest-top.pug で参照して New 表示を出す　

        let changeInfo = ["submitPermit", "guest1", "guest2", "guest3"];   // 配列0要素に "submitPermit" 追加
        let fileNameNew = './newMenuInfo.json';  // メニュー更新連絡相手のデータを保存しておくファイル
        // メニュー更新連絡相手のデータを書き出す
        const fs = require('fs');
        fs.writeFileSync(fileNameNew, JSON.stringify(changeInfo), 'utf8');
        //     fs.writeFileSync(fileNameNew, JSON.stringify(menuChangeInfo), 'utf8');
        //    console.info(menuChangeInfo);

        // 各userの献立希望をクリアし ファイルに書き出す
        let answers1 = new Array();
        let answers2 = new Array();
        let answers3 = new Array();
        let answers4 = new Array();

        let fileName1 = './answers1.json';
        let fileName2 = './answers2.json';
        let fileName3 = './answers3.json';
        let fileName4 = './answers4.json';
      
          answers1 = [0, 0, 0, 0, 0, 0, 0, 0, ""];
          fs.writeFileSync(fileName1, JSON.stringify(answers1), 'utf8');
          answers2 = [0, 0, 0, 0, 0, 0, 0, 0, ""];
          fs.writeFileSync(fileName2, JSON.stringify(answers2), 'utf8');
          answers3 = [0, 0, 0, 0, 0, 0, 0, 0, ""];
          fs.writeFileSync(fileName3, JSON.stringify(answers3), 'utf8');
          answers4 = [0, 0, 0, 0, 0, 0, 0, 0, ""];
          fs.writeFileSync(fileName4, JSON.stringify(answers4), 'utf8');

        console.info(answers1);
        console.info(answers2);
        console.info(answers3);
        console.info(answers4);

        let rawData = '';
        let body = [];  // bodyはcheckobxの入力情報
        req
          .on('data', chunk => {
            rawData = rawData + chunk;
          })
          .on('end', () => {
            console.info(rawData);
            const decoded = decodeURIComponent(rawData);
            // 正規表現で　"menu="　の文字列を消す
            const replaced = decoded.replace(/menu=/g, '');
            console.info(replaced + 'replaced だよ');
            body = replaced.split("&");
            console.info(body);

            // 管理者設定のデータをjsonファイルに書き出す
            let fileName0 = './adminsetting.json';
            console.info('書き出し上手く行けよ' + body);
            const fs = require('fs');
            fs.writeFileSync(fileName0, JSON.stringify(body), 'utf8');
            
            // admin2の表示
            res.end(pug.renderFile('views/admin-result.pug', {
            }
            ));
          })

        // アンケート結果の表示
      } else {
        console.info('ゲストの処理');
        this.adminEnquetes(req, res);
      }
      break;

    default:
      util.handleBadRequest(req, res);
      break;

  }
}

function handleRedirectPosts(req, res) {
  res.writeHead(303, {
    Location: '/posts'
  });
  res.end();
}

function accessTopPage(req, res) {
  var topPage = '';
  if (req.user === 'admin') {
    topPage = 'views/admin-top.pug';
  } else { topPage = 'views/guest-top.pug' };

  // ここで New表示のための情報を読み込む
  const readInfo = this.readNewInfo();

  console.info(readInfo.changeInfo[0]);
  console.info(readInfo.changeInfo[1]);
  console.info(readInfo.changeInfo[2]);
  console.info(readInfo.changeInfo[3]);

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

// 献立投票画面へのアクセス
function accessEnquetesPage(req, res) {
  // html XSS対策の関数を使えるようにする（自由記入欄にscriptを書き込まれたときの対策）

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8'
  });

  // 以下　req.user によらない処理
  // 献立更新連絡先情報を読み込んでおく
  var readInfo = this.readNewInfo();
  console.info('155見た痕跡処理前の' + readInfo.changeInfo);
  // var menuChangeInfo = new Object;
  console.info(readInfo.changeInfo[0]);
  console.info(readInfo.changeInfo[1]);
  console.info(readInfo.changeInfo[2]);
  console.info(readInfo.changeInfo[3]);

  // このページ（最新の献立）を見たという痕跡を残す処理
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
      break;
  }
// 消す
  console.info('見た痕跡処理後の' + readInfo.changeInfo[0] + 'death');
  console.info('見た痕跡処理後の' + readInfo.changeInfo[1] + 'death');
  console.info('見た痕跡処理後の' + readInfo.changeInfo[2] + 'death');
  console.info('見た痕跡処理後の' + readInfo.changeInfo[3] + 'death');

  // ファイルに保存する処理
  let fileNameNew = './newMenuInfo.json';
  // メニュー更新連絡相手のデータを書き出す
  const fs = require('fs');
  fs.writeFileSync(fileNameNew, JSON.stringify(readInfo.changeInfo), 'utf8');
  //     console.info('writeFileSync後の' + menuChangeInfo);


  // 献立情報を読み込んでおく
  var readAdmin = this.readAdminData();
  console.info(readAdmin.adminData1);

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
function adminEnquetes(req, res) {
  console.info('アンケートの処理');
  const fs = require('fs');
  let judge = require('./kondate-judge');  // constかな？
  let rawData = '';
  let body = [];
  req
    .on('data', chunk => {
      rawData = rawData + chunk;
    })
    .on('end', () => {
      console.info(rawData);
      const decoded = decodeURIComponent(rawData);
      body = decoded.split("&");
      console.info('要チェックここの' + body[0]);

      console.info(hour);

      // body[1]に　sonota= が含まれるときは 文字列から削除する
      if (body[0].includes('otherwise')) {
        var textContent = body[1].replace(/sonota=/g, "");
        console.info('hoge' + textContent);

        // ここでファイルに書き出す
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
          answers1 = [0, 0, 0, 0, 0, 0, 0, 0, ""];  // textboxを保存しないなら修正
          console.log(fileName1 + 'から復元できませんでした');
        }
        try {
          const data2 = fs.readFileSync(fileName2, 'utf8');
          answers2 = JSON.parse(data2);
          
        }
        catch (ignore) {
          answers2 = [0, 0, 0, 0, 0, 0, 0, 0, ""];
          console.log(fileName2 + 'から復元できませんでした');
        }
        try {
          const data3 = fs.readFileSync(fileName3, 'utf8');
          answers3 = JSON.parse(data3);
          
        }
        catch (ignore) {
          answers3 = [0, 0, 0, 0, 0, 0, 0, 0, ""];
          console.log(fileName3 + 'から復元できませんでした');
        }
        try {
          const data4 = fs.readFileSync(fileName4, 'utf8');
          answers4 = JSON.parse(data4);
          
        }
        catch (ignore) {
          answers4 = [0, 0, 0, 0, 0, 0, 0, 0, ""];
          console.log(fileName4 + 'から復元できませんでした');
        }

        console.info(answers1);
        console.info(answers2);
        console.info(answers3);
        console.info(answers4);
// answers*[8] に textboxの値を保存       
// textboxの記入があるときは answers*[0] ～ [5] を 0 とする

        if (req.user === 'admin') {
          for (let i = 0; i < 6; i++) {
            answers1[i] = 0;}
          answers1[8] = textContent;
          fs.writeFileSync(fileName1, JSON.stringify(answers1), 'utf8');
        } else if (req.user === 'guest1') {
          for (let i = 0; i < 6; i++) {
            answers2[i] = 0;}
          answers2[8] = textContent;
          fs.writeFileSync(fileName2, JSON.stringify(answers2), 'utf8');
        }
        else if (req.user === 'guest2') {
          for (let i = 0; i < 6; i++) {
            answers3[i] = 0;}
          answers3[8] = textContent;
          fs.writeFileSync(fileName3, JSON.stringify(answers3), 'utf8');
        }
        else if (req.user === 'guest3') {
          for (let i = 0; i < 6; i++) {
            answers4[i] = 0;}
          answers4[8] = textContent;
          fs.writeFileSync(fileName4, JSON.stringify(answers4), 'utf8');
        }
        else { ; }

        console.info(answers1);
        console.info(answers2);
        console.info(answers3);
        console.info(answers4);

        textContent = textContent + 'を希望'
        let koc = "menu2";  // kind of content
        console.info(koc);
        this.writeBoard(req, res, textContent, koc);  // 引数増やす　k = "menu2"
      
      } else {

        // 登録された献立から選択した場合の処理
        // ここ超苦労しました　関数内の変数を外部に出すところ

        let toriaezu = judge.judgement(req.user, body, hour);

        // findMaxValueId は配列のindex 1～7のうち最大値が入っているindexを求める
        let kekka2 = judge.findMaxValueId(toriaezu.syukei); // 各メニューの選択数が引数
        console.info(kekka2);

        // 以下　req.user によらない処理
        // 献立情報を読み込んでおく
        var readAdmin = this.readAdminData();
        console.info(readAdmin.adminData1);

        // 献立調整結果を書き出す
        var kondate = this.writeKondate(kekka2, readAdmin);

        let koc = "menu1"; // kind of content
        console.info(koc);
        this.writeBoard(req, res, kondate.selectResult, koc);  // 引数増やす kof = "menu1"
      }
    });
}

function readAdminData() {
  const fileName0 = './adminsetting.json';
  const readFile0 = new Array; // この一行いるのか？
  // const adminData = new Array;
  const fs = require('fs');
  console.info('さっぱりわからん1');
  try {
    const readFile0 = fs.readFileSync(fileName0, 'utf8');
    console.info('readFile0 は　　' + readFile0);
    let adminData = JSON.parse(readFile0);

    console.info(adminData + 'をadminファイルから読み出し');
    console.info('adminData.length は　' + adminData.length + 'です');
    // 読み込んだ情報を変数に振り分ける(後々配列かオブジェクトかに変更する)
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
  console.info('さっぱりわからん5');
  try {
    const readFileNew = fs.readFileSync(fileNameNew, 'utf8');
    console.info('readFileNew は　　' + readFileNew);
    console.info('ここまでは上手くいってる');

    const changeInfo0 = readFileNew.replace(/\[/g, '');  // カギかっこを削除
    const changeInfo1 = changeInfo0.replace(/\]/g, '');  // カギかっこ閉じを削除
    const changeInfo2 = changeInfo1.replace(/\"/g, '');  // "を削除

    var changeInfo = changeInfo2.split(','); // 文字列を　',' で分割し配列化


    console.info(changeInfo.length);
    console.info('changeInfo は' + changeInfo[0] + 'と' + changeInfo[1] + 'と' + changeInfo[2] + 'と' + changeInfo[3]);
  }

  catch (ignore) {
    var changeInfo = ["submitPermit", "guest1", "guest2", "guest3"];　//　配列0要素に　"submitPermit" を追加
    console.log('献立更新連絡先を読み出せませんでした');
  }
  return { changeInfo };
}

// 献立調整結果を書き出す関数(kekka2に該当するidのreadAdminがselectedになる)
// textboxの内容もここで書き込めるようにすれば・・・
function writeKondate(kekka2, readAdmin) {
  const fs = require('fs'); // このrequire 不要かも
  
  const m = [readAdmin.adminData1, readAdmin.adminData2, readAdmin.adminData3, readAdmin.adminData4, readAdmin.adminData5, readAdmin.adminData6];
  console.info(m);
  const k = kekka2.toString(); // toString いるのかな？
  console.info('kakka2 tostringの' + k);
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
    result = result + selected[i] + "  "; // 全角スペース　連絡版に表示される献立の後に入る
    }    
  }
  // 献立アンケート結果（複数の場合あり）を変数に入れる
    var select = result;
  // アンケート結果を管理者が献立を決定する画面に表示するため外部ファイルに保存する
    fs.writeFileSync('./enquetesResult.json', JSON.stringify(select), 'utf8');
  console.info('あしか' + select);
  var selectResult = ('今日の献立アンケートは' + select + 'に人気があります');
  console.info(selectResult);
  return {selectResult};
};

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
    answers1 = [0, 0, 0, 0, 0, 0, 0, 0, ""];  // textboxを保存しないなら修正
    console.log(fileName1 + 'から復元できませんでした');
  }
  try {
    const data2 = fs.readFileSync(fileName2, 'utf8');
    answers2 = JSON.parse(data2);

  }
  catch (ignore) {
    answers2 = [0, 0, 0, 0, 0, 0, 0, 0, ""];
    console.log(fileName2 + 'から復元できませんでした');
  }
  try {
    const data3 = fs.readFileSync(fileName3, 'utf8');
    answers3 = JSON.parse(data3);

  }
  catch (ignore) {
    answers3 = [0, 0, 0, 0, 0, 0, 0, 0, ""];
    console.log(fileName3 + 'から復元できませんでした');
  }
  try {
    const data4 = fs.readFileSync(fileName4, 'utf8');
    answers4 = JSON.parse(data4);

  }
  catch (ignore) {
    answers4 = [0, 0, 0, 0, 0, 0, 0, 0, ""];
    console.log(fileName4 + 'から復元できませんでした');
  }

  console.info(answers1);
  console.info(answers2);
  console.info(answers3);
  console.info(answers4);

  // 献立希望を変数に入れる
  let requests = answers1[8] + '  ' + answers2[8] + '  ' + answers3[8] + '  ' + answers4[8];

if(requests === '      ') {
  requests = 'なし'
}else {
  ;
}

  // アンケート結果を読み出す
  try {
    const eR = fs.readFileSync('./enquetesResult.json', 'utf8');
    var enquetesResult = JSON.parse(eR);
    console.log("enquetesResultは"+ enquetesResult);
  }
  catch (ignore) {
    enquetesResult = "";
    console.log('./enquetesResult.json から復元できませんでした');
  }
  if(enquetesResult === "") {
    enquetesResult = 'なし'
  }else {
    ;
  }
// 登録された献立、アンケート結果、ユーザーのリクエストを管理者が献立を決定する画面のpugに渡す
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

function decisionEnquetes(req, res) {
  console.info('アンケート決定の投稿');
  //  let judge = require('./kondate-decide');
  let rawData = '';
  let body = [];
  req
    .on('data', chunk => {
      rawData = rawData + chunk;
    })
    .on('end', () => {
      console.info(rawData);
      const decoded0 = decodeURIComponent(rawData);
      const decoded1 = decoded0.replace(/menulist=/g, '');
      const decoded2 = decoded1.replace(/request=/g, '');
      const decoded3 = decoded2.replace(/\+/g, ''); // 最後の献立を選ぶと入る + を削除
      body = decoded3.split("&");
      console.info(body);
      if (body[0] === 'この中にはない') {
        var decision = body[1]; // textboxの内容を表示する 　letではダメ　varである必要あり
      } else {
        var decision = body[0]; // 決められたメニューからの選択結果を表示する　letではダメ　varである必要あり
      }
      console.info(body);
      this.writeDecision(req, res, decision);
    });
}

// 献立決定結果を書き出す
function writeDecision(req, res, decision) {
  const fs = require('fs');

  // 決定した献立を表示する文字列を 変数に入れる
  var selectResult = ('今日の献立は' + decision + 'に決まりました');
  console.info(selectResult);
  // ここで献立が決定したフラグを立てておき　献立決定後は献立希望の投稿を出来なくする処理で利用する
  // 献立決定投稿があった時点で献立はNewではないので　changeInfo[1] ～[3] は"" にする
  // この処理は　req.userによらないので　フラグ一つで良い
  // 投稿に紐づいていないので　DBに入れる必要もない　外部ファイルに保存する
  var readInfo = this.readNewInfo();
  readInfo.changeInfo[0] = 'submitInhibit';
  readInfo.changeInfo[1] = '';
  readInfo.changeInfo[2] = '';
  readInfo.changeInfo[3] = '';

  console.info(readInfo.changeInfo[0]);

  let fileNameNew = './newMenuInfo.json';  // メニュー更新連絡相手のデータを保存しておくファイル
  // メニュー希望投稿禁止状態を保存する
  fs.writeFileSync(fileNameNew, JSON.stringify(readInfo.changeInfo), 'utf8');

  let koc = "menu3"; // kind of content  献立に関する自動投稿であることの目印
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
 //   kindOfContent: 'menu' // ここを　menu　とは違うものにすればadminに知らせられる
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
  handleRedirectPosts,
  accessTopPage,
  accessEnquetesPage,
  adminEnquetes,
  readAdminData,
  readNewInfo,
  writeKondate,
  accessDecisionPage,
  decisionEnquetes,
  writeDecision,
  writeBoard,
  accessHowToUse,
};