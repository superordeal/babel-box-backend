const app = require('./app');
const { connectDB, isDBConnected } = require('./config/db');
require('dotenv').config();

console.log('=== 服务器启动初始化 ===');
console.log('环境变量PORT:', process.env.PORT || '未设置，将使用默认值5000');

// 确保在启动服务器前先连接数据库并初始化所有模型
async function startServer() {
  try {
    console.log('正在连接数据库...');
    
    // 先加载所有模型（确保它们在使用前被定义）
    console.log('正在加载数据模型...');
    require('./models/bibleItemModel');
    require('./models/CategoryModel');
    console.log('数据模型加载完成');
    
    // 连接数据库并同步模型
    await connectDB();
    const dbStatus = isDBConnected() ? '已成功连接' : '连接失败';
    console.log(`数据库状态: ${dbStatus}`);
    
    // 启动服务器
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      const mode = isDBConnected() ? '数据库模式' : '模拟数据模式';
      console.log(`服务器运行中 - 端口: ${PORT} - 模式: ${mode}`);
      console.log(`API接口地址: http://localhost:${PORT}/api`);
    });
    
    // 将服务器实例暴露给全局，以便在信号处理中使用
    global.server = server;
  } catch (error) {
    console.error('服务器启动过程中发生错误:', error);
    console.log('服务器将在有限功能模式下继续运行');
    
    // 即使数据库连接失败也要启动服务器
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`服务器运行中 - 端口: ${PORT} - 模式: 模拟数据模式`);
    });
    
    // 将服务器实例暴露给全局，以便在信号处理中使用
    global.server = server;
  }
}

// 执行启动
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`错误: ${err.message}`);
  // Don't exit process directly, continue running
  console.log('服务器继续运行，使用模拟数据模式');
});

// Handle termination signals for graceful shutdown
process.on('SIGINT', () => {
  console.log('正在关闭服务器...');
  if (global.server) {
    global.server.close(() => {
      console.log('服务器已关闭');
      process.exit(0);
    });
  } else {
    console.log('服务器实例不存在，直接退出');
    process.exit(0);
  }
});
