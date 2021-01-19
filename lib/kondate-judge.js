'use strict';

// アンケートで登録された献立から選択された場合の処理
function judgement(u, b, h) {

  // 配列body の読み込みと整理
  // u:req.user / b:body / h:now
  // bの配列のサイズは不定
  // orderNumの配列のサイズは一定　=> for文はorderNumで回す
  // var answerUser1 =[];
  
  let answer = [];
  let tempAns = [];
  const orderNum = ["order1", "order2", "order3", "order4", "order5", "order6", "sonota"];
  const ansObj1 = {ans: new Array, time: h}
  const ansObj2 = {ans: new Array, time: h}
  const ansObj3 = {ans: new Array, time: h}
  const ansObj4 = {ans: new Array, time: h}

  console.log(b);

  console.log(b.length);

  for (let i = 0; i < b.length; i++) {
    console.log(b[i]);
    tempAns[i] = b[i].substring(7, 13);  // bodyの各値からorder*を抽出(inputタブのvalueが入る)
    console.log(tempAns[i] + '通った');
  }

  for (let i = 0; i < orderNum.length; i++) {
    if (tempAns.includes(orderNum[i])) {　　// tempAns 配列の中に　order*が含まれていればアンケートで選ばれている
      answer[i] = 1;
      console.info(orderNum[i] + "は選ばれています answerの配列インデックスは" + i + "です");
    }
    else {
      answer[i] = 0;
      console.info(orderNum[i] + "は選ばれていません answerの配列インデックスは" + i + "です");
    }

    console.log((orderNum[i]));
    console.log(`番号${i}の注文は ${answer[i]}`);
  }

  // ここの処理は通らない
  // ここいらでsonotaがあったらanswersをクリアする
  // textboxだけは inputタブのnameで選ばれたかを判断する必要があるため 別途判断する
  if(b[b.length-1].includes('sonota')) {
    tempAns[b.length-1] = b[b.length-1].substring(0,6);
    console.log(tempAns[b.length-1] + '通った');
    const reqMenu0 = b[b.length-1].split("="); 
    var reqMenu = reqMenu0[1]; // textboxの内容を取得する
    answer = [0, 0, 0, 0, 0, 0, 1];
    console.log('end１' + reqMenu);
  }
  console.log('end２' + reqMenu);


  switch (u) {
    case 'admin':
      ansObj1.ans = answer;
      console.info('judgement関数' + ansObj1);
      break;
    case 'guest1':
      ansObj2.ans = answer;
      console.info('judgement関数' + ansObj2);
      break;
    case 'guest2':
      ansObj3.ans = answer;
      console.info('judgement関数' + ansObj3);
      break;
    case 'guest3':
      ansObj4.ans = answer;
      console.info('judgement関数' + ansObj4);
      break;
    default:
      console.info('あなたは登録されていません');
      break;
  }

  // hour を 配列answer の最後の要素にpush
  answer.push(h);

  // textboxの内容を配列の最後にpush
  if(answer[6] === 1) {
  answer.push(reqMenu); // answer[8] に　リクエストを入れる　なくてもよいかも
  }else{
    answer.push("");
  }


  // ここ超苦労しました　関数内の変数を外部に出すところ

  let answers1 = new Array();
  let answers2 = new Array();
  let answers3 = new Array();
  let answers4 = new Array();
  const fs = require('fs');
  // const fileName = './answers.json';
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
    answers1 = [0, 0, 0, 0, 0, 0, 0, h, ""];  // textboxを保存しないなら修正
    console.log(fileName1 + 'から復元できませんでした');
  }
  try {
    const data2 = fs.readFileSync(fileName2, 'utf8');
    answers2 = JSON.parse(data2);
  }
  catch (ignore) {
    answers2 = [0, 0, 0, 0, 0, 0, 0, h, ""];
    console.log(fileName2 + 'から復元できませんでした');
  }
  try {
    const data3 = fs.readFileSync(fileName3, 'utf8');
    answers3 = JSON.parse(data3);
  }
  catch (ignore) {
    answers3 = [0, 0, 0, 0, 0, 0, 0, h, ""];
    console.log(fileName3 + 'から復元できませんでした');
  }
  try {
    const data4 = fs.readFileSync(fileName4, 'utf8');
    answers4 = JSON.parse(data4);
  }
  catch (ignore) {
    answers4 = [0, 0, 0, 0, 0, 0, 0, h, ""];
    console.log(fileName4 + 'から復元できませんでした');
  }

  console.info('save前' + answers1);
  console.info('save前' + answers2);
  console.info('save前' + answers3);
  console.info('save前' + answers4);

  // 各userの希望を保存する　ファイルを上書きする
//  function saveAnswers() {
    
    if (u === 'admin') {
      answers1 = answer;
      //answers1.push(answer);  // ここは追加のpushではなく上書きを使う
      fs.writeFileSync(fileName1, JSON.stringify(answers1), 'utf8');
    } else if (u === 'guest1') {
      answers2 = answer;
      //answers2.push(answer);  // ここは追加のpushではなく上書きを使う
      fs.writeFileSync(fileName2, JSON.stringify(answers2), 'utf8');
    }
    else if (u === 'guest2') {
      answers3 = answer;
      //answers2.push(answer);  // ここは追加のpushではなく上書きを使う
      fs.writeFileSync(fileName3, JSON.stringify(answers3), 'utf8');
    }
    else if (u === 'guest3') {
      answers4 = answer;
      //answers2.push(answer);  // ここは追加のpushではなく上書きを使う
      fs.writeFileSync(fileName4, JSON.stringify(answers4), 'utf8');
    }
    else { ; }
//  }

  console.info(answers1);
  console.info(answers2);
  console.info(answers3);
  console.info(answers4);

  console.info('どうなってるの')

  // saveAnswers()の前だと前回値のまま
// console.info('一人目' + answers1 + '二人目' + answers2 + '三人目' + answers3 + '四人目' + answers4);

//  saveAnswers();
 
// console.info('一人目' + answers1 + '二人目' + answers2 + '三人目' + answers3 + '四人目' + answers4);

// 同一ユーザーの配列は　最新データを更新する（配列に印をつけるか専用の配列に入れる）
  // 余力があれば集計機能を付ける
    // 人気のある献立　ユーザーごとの好み

// 献立の決定（メニューの多数決のみ）

// console.info('一人目' + answers1 + '二人目' + answers2 + '３人目' + answers3 + '４人目' + answers4);

let sumOrder = new Array();

for(let i = 0; i < answers1.length-1; i++) {  //answers1は　time分配列が長い
  sumOrder[i] = answers1[i] + answers2[i] + answers3[i] + answers4[i];
  // answers*が空だとNaNとなりsumOrderが出ないが チェックなしのアンケート投票にはalertを出すことで対応
  console.info('足し算' + sumOrder[i]);
}

// returnは関数の一番最後にもってくること　処理がそこでおわってしまうため
return  {ans1: ansObj1.ans, ans2: ansObj2.ans, ans3: ansObj3.ans, ans4: ansObj1.ans, syukei: sumOrder};
}

// 配列のindex 1～7のうち最大値が入っているindexを求める
function findMaxValueId(a) {
  let popular = Math.max(a[0], a[1], a[2], a[3],a[4], a[5]);
  console.info('人気度は'+ popular);
  let maxValueId = new Array();
  for (let i = 0; i<a.length; i++) {
    if(a[i] === popular) {
      maxValueId.push(i); // 人気度最大の 配列インデックス
      console.info(maxValueId);
    }
    else{;}
  }
  return maxValueId;
}

module.exports = {
  judgement,
  findMaxValueId
};
