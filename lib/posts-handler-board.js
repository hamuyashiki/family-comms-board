'use strict';
const util = require('./handler-util');
const Post = require('./post');
const pug = require('pug');
const postsHandler = require('./posts-handler');
const moment = require('moment-timezone'); //日本時間のタイムゾーン表示

const Sequelize = require('sequelize');

 const Op = Sequelize.Op;

function handle(req, res) {
  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      // データベースから読み出し
      Post.findAll({
        where: {  // 投稿者と宛先を 読み出し条件とする
          [Op.or]: {
          postedBy: req.user,
          receiver1: req.user,  // adminは全ての投稿を見ることができる
          receiver2: req.user,  // ログインユーザーがguest1の場合　guest1向けの投稿を見ることができる
          receiver3: req.user,  // ログインユーザーがguest2の場合　guest2向けの投稿を見ることができる
          receiver4: req.user   // ログインユーザーがguest3の場合　guest3向けの投稿を見ることができる
          }
        }
        , order: [['id', 'DESC']] }).then(posts => {  // 新しい投稿から読み出す
          posts.forEach((post) => {
            // 改行に対応する
            post.content = post.content.replace(/\+/g, ' ');
            // 日本時間表示に対応する
            post.formattedCreatedAt = moment(post.createdAt).tz('Asia/Tokyo').format('YYYY年MM月DD日 HH時mm分ss秒');
          });
        res.end(pug.renderFile('./views/posts.pug', {
          posts: posts,  // 読み出した投稿内容と投稿者名をpugに反映する
          user: req.user // ログイン中のユーザー名をpugに渡す
        }));
      })
      break;
    case 'POST':
      let body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        const decoded = decodeURIComponent(body);
        const content = decoded.split('content=')[1];
        const content0 = decoded.split('content=')[0]; // 誰宛ての投稿かを示す
        console.info('投稿調査1' + decoded); // test
        console.info('投稿調査0' + content0); // test

        const now = new Date();
        const hour = now.getHours();

        const member = ["guest1", "guest2", "guest3"]; // posts.pug の　宛先　name と同じにする
        const sendToObj = { ans: new Array, time: hour }

        let sendTo1 = '';
        let sendTo2 = '';
        let sendTo3 = '';
        if (content0.includes(member[0])) {
          sendTo1 = 'guest1';
        } else { }
        if (content0.includes(member[1])) {
          sendTo2 = 'guest2';
        } else { }
        if (content0.includes(member[2])) {
          sendTo3 = 'guest3';
        } else { }

        // 誰宛てでもなければ全員宛てにする　未実装

        console.info(sendTo1);
        console.info(sendTo2);
        console.info(sendTo3);

        // 投稿内容をデータベースに保存
        Post.create({
          content: content,
          trackingCookie: null,
          postedBy: req.user,
          receiver1: 'admin',
          receiver2: sendTo1,
          receiver3: sendTo2,
          receiver4: sendTo3,
          kindOfContent: ''
        }).then(() => {
          handleRedirectPostsBoard(req, res); // 掲示板に表示するためリダイレクトする
        });
      });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

function handleRedirectPostsBoard(req, res) {
  res.writeHead(303, {
    'Location': '/communication'
  });
  res.end();
}

function handleDelete(req, res) {
  switch (req.method) {
    case 'POST':
      let body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        const decoded = decodeURIComponent(body);
        const id = decoded.split('id=')[1];
        Post.findByPk(id).then((post) => {
          if(req.user === post.postedBy || req.user === 'admin') {
            post.destroy().then(() => {
              handleRedirectPostsBoard(req, res);
            });
          }
        });
      });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
    }
}

module.exports = {
  handle,
  handleRedirectPostsBoard,
  handleDelete
};