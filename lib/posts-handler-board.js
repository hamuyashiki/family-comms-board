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
        const content = decoded.split('content=')[1];  // 投稿内容
        const content0 = decoded.split('content=')[0]; // 誰宛ての投稿かを示す情報が入っている 例 guest1=on&

        const member = ["guest1", "guest2", "guest3"]; // posts.pug の　宛先　name と同じにする

        let sendTo1 = '';
        let sendTo2 = '';
        let sendTo3 = '';
        if (content0.includes(member[0])) {  // 宛先情報に"guest1"が含まれている
          sendTo1 = 'guest1';
        } else { }
        if (content0.includes(member[1])) {  // 宛先情報に"guest2"が含まれている
          sendTo2 = 'guest2';
        } else { }
        if (content0.includes(member[2])) {  // 宛先情報に"guest3"が含まれている
          sendTo3 = 'guest3';
        } else { }

        // 投稿内容をデータベースに保存
        Post.create({
          content: content,
          trackingCookie: null,
          postedBy: req.user,
          receiver1: 'admin',  // admin は全ての投稿を見れる
          receiver2: sendTo1,  // guest1 は sendTo1="guest1"の投稿を見れる
          receiver3: sendTo2,  // guest2 は sendTo2="guest2"の投稿を見れる
          receiver4: sendTo3,  // guest3 は sendTo3="guest3"の投稿を見れる
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