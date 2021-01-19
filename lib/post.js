'use strict';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost/family_board',  
  {
    logging: false
  }
);

// 多分ここに誰宛てかのプロパティを追加する必要がある
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
    receiver1: {
      type: Sequelize.STRING
    },
    receiver2: {
      type: Sequelize.STRING
    },
    receiver3: {
      type: Sequelize.STRING
    },
    receiver4: {
      type: Sequelize.STRING
    },
    kindOfContent: {
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