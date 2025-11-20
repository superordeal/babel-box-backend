const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 数据库配置
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  database: process.env.MYSQL_DATABASE || 'babel box',
  username: process.env.MYSQL_USER || 'walker',
  password: process.env.MYSQL_PASSWORD || '123456',
  dialect: 'mysql'
};

// 同步创建Sequelize实例
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    logging: process.env.NODE_ENV === 'development',
    // 连接池配置
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 全局变量用于标记数据库连接状态
let dbConnected = false;

const connectDB = async () => {
  try {
    // 测试连接
    await sequelize.authenticate();
    console.log(`MySQL Connected: ${dbConfig.host}:${dbConfig.port}`);
    
    // 自动同步模型到数据库
    await sequelize.sync({ alter: true });
    console.log('数据库模型同步完成!');
    
    dbConnected = true;
    return true;
  } catch (error) {
    console.warn(`MySQL连接失败: ${error.message}`);
    dbConnected = false;
    return false;
  }
};

// 获取数据库连接状态
const isDBConnected = () => dbConnected;

// 获取Sequelize实例
const getSequelize = () => sequelize;

module.exports = {
  connectDB,
  isDBConnected,
  getSequelize,
  sequelize // 直接导出实例以便立即使用
};
