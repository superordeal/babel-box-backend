const { connectDB, sequelize } = require('./src/config/db');
const BibleItem = require('./src/models/BibleItemModel');

async function checkDatabaseData() {
  try {
    // 连接数据库
    await connectDB();
    
    // 查询数据库中记录的总数
    const count = await BibleItem.count();
    console.log(`数据库中bible_items表的记录总数: ${count}`);
    
    // 如果记录数量较少，显示所有记录
    if (count <= 20) {
      console.log('\n所有记录详情:');
      const allItems = await BibleItem.findAll({
        attributes: ['id', 'title', 'category', 'created_at'],
        order: [['created_at', 'DESC']]
      });
      
      allItems.forEach(item => {
        console.log(`ID: ${item.id}, 标题: ${item.title}, 分类: ${item.category}, 创建时间: ${item.created_at}`);
      });
    }
    
  } catch (error) {
    console.error('查询数据库失败:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
}

// 执行检查
checkDatabaseData();