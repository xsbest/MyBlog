'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'HELLO DANIEL';
  }
  async getArticleList() {
    const { ctx } = this;
    const sql =
      `SELECT article.id,
      title,
      introduce,
      addTime,
      view_count,
      typeName
      FROM article LEFT JOIN type ON article.type_id = type.id
      `;
    const res = await this.app.mysql.query(sql);
    ctx.body = { data: res };
  }

  async getArticleById() {
    const { ctx } = this;
    const id = ctx.query.id;
    const sql = `
    SELECT article.id,
      title,
      introduce,
      article_content,
      addTime,
      view_count,
      type.typeName,
      type.id as typeId
      FROM article LEFT JOIN type ON article.type_id = type.id
      WHERE article.id=${id}
    `;
    const res = await this.app.mysql.query(sql);
    ctx.body = { data: res };
  }

  async getTypeInfo() {
    const { ctx } = this;
    const res = await this.app.mysql.select('type');
    ctx.body = { data: res };
  }


  // 根据类别ID获得文章列表
  async getArticleListById() {
    const id = this.ctx.query.id;
    const sql = `SELECT article.id as id, 
      article.title as title, 
      article.introduce as introduce, 
      article.addTime as addTime,
      article.view_count as view_count, 
      type.typeName as typeName  
      FROM article LEFT JOIN type ON article.type_id = type.id  
      WHERE type_id="${id}"
      `;
    const result = await this.app.mysql.query(sql);
    this.ctx.body = { data: result };
  }
}

module.exports = HomeController;
