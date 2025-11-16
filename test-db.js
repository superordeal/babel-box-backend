const { Sequelize, DataTypes } = require('sequelize');

// 创建数据库连接（使用正确的配置）
const sequelize = new Sequelize('babel box', 'walker', '123456', {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log,
  dialectOptions: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
});

// 定义模型，指定正确的表名
const BibleItem = sequelize.define('BibleItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  example: {
    type: DataTypes.TEXT
  },
  created_at: {
    type: DataTypes.DATE
  },
  updated_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'bible_items',
  timestamps: false
});

// 测试数据库连接和数据查询
async function testDatabase() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 查询所有数据
    const items = await BibleItem.findAll();
    console.log('数据库中的数据数量:', items.length);
    
    // 如果没有数据，插入一些测试数据
    if (items.length === 0) {
      console.log('数据库中没有数据，插入测试数据...');
      
      const testData = [
        {
          title: '创世记 1:1',
          content: '起初，神创造天地。',
          category: '旧约',
          example: '这是圣经的第一句话'
        },
        {
          title: '约翰福音 3:16',
          content: '神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。',
          category: '新约',
          example: '最著名的圣经经文之一'
        },
        {
          title: '诗篇 23:1',
          content: '耶和华是我的牧者，我必不至缺乏。',
          category: '诗歌',
          example: '著名的牧者诗'
        }
      ];
      
      await BibleItem.bulkCreate(testData);
      console.log('测试数据插入成功');
      
      // 再次查询确认
      const newItems = await BibleItem.findAll();
      console.log('插入后的数据数量:', newItems.length);
      console.log('插入的数据:', newItems.map(item => item.title));
    } else {
      console.log('数据列表:', items.map(item => item.title));
    }
    
  } catch (error) {
    console.error('数据库操作失败:', error);
  } finally {
    await sequelize.close();
  }
}

testDatabase();
