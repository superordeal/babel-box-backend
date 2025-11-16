const express = require('express');
const app = express();
const { connectDB, isDBConnected } = require('./src/config/db');
const BibleItem = require('./src/models/BibleItemModel');

// 模拟getBibleItems的数据库查询逻辑
async function debugDatabaseQuery() {
  try {
    // 连接数据库
    await connectDB();
    console.log('数据库连接状态:', isDBConnected() ? '已连接' : '未连接');
    
    // 模拟API的分页查询
    const page = 1;
    const pageSize = 9;
    const offset = (page - 1) * pageSize;
    
    console.log(`\n执行分页查询 - 第${page}页，每页${pageSize}条`);
    
    // 执行findAndCountAll查询
    const startTime = Date.now();
    const { count, rows } = await BibleItem.findAndCountAll({
      offset: offset,
      limit: pageSize,
      order: [['created_at', 'DESC']]
    });
    const endTime = Date.now();
    
    // 计算总页数
    const totalPages = Math.ceil(count / pageSize);
    
    // 构建API响应结构
    const apiResponse = {
      items: rows,
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalItems: count,
        totalPages: totalPages
      }
    };
    
    // 输出查询结果摘要
    console.log(`查询耗时: ${endTime - startTime}ms`);
    console.log(`总记录数: ${count}`);
    console.log(`当前页记录数: ${rows.length}`);
    console.log(`总页数: ${totalPages}`);
    console.log('\nAPI响应结构:');
    console.log(JSON.stringify(apiResponse, null, 2));
    
    // 如果有超过10条记录，显示前几条的摘要
    if (rows.length > 0) {
      console.log('\n当前页数据摘要:');
      rows.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item.id}, 标题: ${item.title}, 分类: ${item.category}`);
      });
    }
    
  } catch (error) {
    console.error('调试过程中出错:', error);
  } finally {
    // 关闭数据库连接
    process.exit(0);
  }
}

// 运行调试
console.log('开始调试后端API响应...');
debugDatabaseQuery();