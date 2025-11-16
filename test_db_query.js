const { connectDB, isDBConnected } = require('./src/config/db');
const BibleItem = require('./src/models/BibleItemModel');
const { Op } = require('sequelize');

async function testQuery() {
  console.log('开始测试数据库查询...');
  
  // 连接数据库
  const connected = await connectDB();
  console.log('数据库连接状态:', connected);
  console.log('isDBConnected() 返回值:', isDBConnected());
  
  if (connected) {
    // 测试不同条件的查询
    console.log('\n1. 查询所有记录数量:');
    const allCount = await BibleItem.count();
    console.log('总记录数:', allCount);
    
    console.log('\n2. 查询前5条记录:');
    const first5 = await BibleItem.findAll({ limit: 5 });
    console.log('前5条记录:', first5.map(item => ({ id: item.id, title: item.title, category: item.category })));
    
    console.log('\n3. 使用与前端相同的查询条件:');
    const { count, rows } = await BibleItem.findAndCountAll({
      where: {}, // 空条件，应该返回所有记录
      offset: 0,
      limit: 6,
      order: [['created_at', 'DESC']]
    });
    
    console.log('查询结果数量:', rows.length);
    console.log('总计数:', count);
    console.log('返回的前3条记录:', rows.slice(0, 3).map(item => ({ id: item.id, title: item.title })));
    
    // 检查分类字段
    console.log('\n4. 所有可用的分类:');
    const categories = await BibleItem.findAll({
      attributes: ['category'],
      group: ['category']
    });
    console.log('分类列表:', categories.map(c => c.category));
    
  } else {
    console.log('数据库未连接，无法执行查询测试');
  }
}

testQuery().catch(err => {
  console.error('测试过程中出错:', err);
}).finally(() => {
  console.log('\n测试完成');
  process.exit();
});