const { sequelize } = require('./src/config/db');
const Category = require('./src/models/CategoryModel');

async function debugCategoryQuery() {
  try {
    console.log('开始调试分类查询...');
    
    // 检查数据库连接状态
    console.log('数据库连接状态:', sequelize.connectionManager.hasOwnProperty('connection'));
    
    // 尝试直接查询ID为111的分类
    console.log('查询ID为111的分类...');
    const categoryById = await Category.findByPk('111');
    console.log('通过ID查询结果:', categoryById ? categoryById.toJSON() : '分类不存在');
    
    // 同时查询所有分类，查看是否存在ID为111的记录
    console.log('查询所有分类...');
    const allCategories = await Category.findAll();
    console.log('所有分类数量:', allCategories.length);
    
    // 检查是否有ID为111的分类
    const categoryWithId111 = allCategories.find(cat => cat.id === 111 || cat.id === '111');
    console.log('是否存在ID为111的分类:', !!categoryWithId111);
    
    // 如果存在，打印详细信息
    if (categoryWithId111) {
      console.log('分类详细信息:', categoryWithId111.toJSON());
    }
    
    // 打印部分分类记录以便查看
    console.log('\n前5条分类记录:');
    allCategories.slice(0, 5).forEach((cat, index) => {
      const catData = cat.toJSON();
      console.log(`${index + 1}. ID: ${catData.id}, 名称: ${catData.name}`);
    });
    
  } catch (error) {
    console.error('调试过程中出错:', error.message);
    console.error('错误堆栈:', error.stack);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
    console.log('\n数据库连接已关闭');
  }
}

// 运行调试
debugCategoryQuery();