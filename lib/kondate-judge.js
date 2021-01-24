'use strict';

/**
 * アンケートの処理（登録されたメニューが checkboxで選択された場合）
 * 投稿内容 body の読み込みと整理
 * 　　
 * 　引数　u:req.user / b:body
 *      bodyの例　["order=order1, order=order5"]
 *      bodyの配列のサイズは不定
 *      orderNumの配列のサイズは一定　=> for文はorderNumで回す
 *      body の配列サイズは 最大で6 ("sonota" は含まれない)
 */
function judgement(u, b) {
  
  let answer = [];
  let tempAns = [];
  const orderNum = ["order1", "order2", "order3", "order4", "order5", "order6", "sonota"];
  const ansObj1 = {ans: new Array}
  const ansObj2 = {ans: new Array}
  const ansObj3 = {ans: new Array}
  const ansObj4 = {ans: new Array}

  for (let i = 0; i < b.length; i++) {
  // bodyの各要素から"orders=" を取り除きorder*を抽出(inputタブのvalueが入る)
    tempAns[i] = b[i].substring(7, 13);
  }
　// 配列b の文字列要素を　0,1に置き換える　"sonota"分を入れて　配列answerのサイズは7
  for (let i = 0; i < orderNum.length; i++) {
    if (tempAns.includes(orderNum[i])) {　　// tempAns 配列の中に　orderNUm[i]が含まれていればアンケートで選ばれている
      answer[i] = 1;  // checkboxで選ばれている
    }
    else {
      answer[i] = 0;  // checkboxで選ばれていない
    }
  }

  switch (u) {
    case 'admin':
      ansObj1.ans = answer;
      break;
    case 'guest1':
      ansObj2.ans = answer;
      break;
    case 'guest2':
      ansObj3.ans = answer;
      break;
    case 'guest3':
      ansObj4.ans = answer;
      break;
    default:
      console.info('あなたは登録されていません');
      break;
  }
 // この位置で ansObj*.ans の配列サイズは7 
  let answers1 = new Array();
  let answers2 = new Array();
  let answers3 = new Array();
  let answers4 = new Array();
  const fs = require('fs');

  let fileName1 = './answers1.json';
  let fileName2 = './answers2.json';
  let fileName3 = './answers3.json';
  let fileName4 = './answers4.json';

  // すべてのユーザーのデータを読み出す
  try {
    var data1 = fs.readFileSync(fileName1, 'utf8');
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

  /** 
   * 各userのアンケート結果を上書き保存する
   * 登録された献立から選択されているので answers*[7] (=textboxの内容) を空欄にする
   * 以下のif文処理が終了すると　配列answer,配列ansObj.ans のサイズは8となるので注意　要素[7]は空欄
   */
    if (u === 'admin') {
      answers1 = answer;
      answers1[7] = "";
      fs.writeFileSync(fileName1, JSON.stringify(answers1), 'utf8');
    } else if (u === 'guest1') {
      answers2 = answer;
      answers2[7] = "";
      fs.writeFileSync(fileName2, JSON.stringify(answers2), 'utf8');
    }
    else if (u === 'guest2') {
      answers3 = answer;
      answers3[7] = "";
      fs.writeFileSync(fileName3, JSON.stringify(answers3), 'utf8');
    }
    else if (u === 'guest3') {
      answers4 = answer;
      answers4[7] = "";
      fs.writeFileSync(fileName4, JSON.stringify(answers4), 'utf8');
    }
    else { ; }

  // checkboxを各献立ごとに4ユーザー分積算する
let sumOrder = new Array();
for(let i = 0; i < 6; i++) {
  sumOrder[i] = answers1[i] + answers2[i] + answers3[i] + answers4[i];
  // answers*が空だとNaNとなりsumOrderが出ないが チェックなしのアンケート投票にはalertを出すことで対応済み
}

// ans1～4は　test.js で参照　　syukei は function tallyEnquetes で参照
return  {ans1: ansObj1.ans, ans2: ansObj2.ans, ans3: ansObj3.ans, ans4: ansObj4.ans, syukei: sumOrder};
}

// 配列のindex 0～5のうち最大値が入っているindexを求める　引数aは得票数を表す
function findMaxValueId(a) {
  let popular = Math.max(a[0], a[1], a[2], a[3],a[4], a[5]); // 最高得票数
  let maxValueId = new Array();
  for (let i = 0; i<a.length; i++) {
    if(a[i] === popular) {
      maxValueId.push(i); // 人気度最大の 配列インデックス群
    }
    else{;}
  }
  return maxValueId;
}

module.exports = {
  judgement,
  findMaxValueId
};
