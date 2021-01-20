'use strict';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost/family_board',  
  {
    logging: false,
    dialectOptions: {           // herokuにデプロイ後postgresqlに接続できなかった対策
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

const Post = sequelize.define(
  'Post',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    content: {
      type: Sequelize.TEXT
    },
    postedBy: {
      type: Sequelize.STRING
    },
    trackingCookie: {
      type: Sequelize.STRING
    },
    receiver1: {               // adminが閲覧可能か
      type: Sequelize.STRING
    },
    receiver2: {               // guest1が閲覧可能か
      type: Sequelize.STRING
    },
    receiver3: {               // guest2が閲覧可能か
      type: Sequelize.STRING
    },
    receiver4: {               // guest3が閲覧可能か
      type: Sequelize.STRING
    },
    kindOfContent: {           // 自動投稿の内容
      type: Sequelize.STRING
    }
  },
  {
    freezeTableName: true,
    timestamps: true
  }
);

Post.sync();
module.exports = Post;