const app = require('./app');
const { connectDB, isDBConnected } = require('./config/db');
require('dotenv').config();

async function startServer() {
  try {
    require('./models/bibleItemModel');
    require('./models/CategoryModel');

    const connected = await connectDB();
    if (!connected) {
      console.warn('数据库未连接，接口将返回错误');
    }

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      const mode = isDBConnected() ? '数据库模式' : '数据库未连接';
      console.log(`服务器运行中 - 端口: ${PORT} - 模式: ${mode}`);
      console.log(`API接口地址: http://localhost:${PORT}/api`);
    });

    global.server = server;
  } catch (error) {
    console.error('服务器启动过程中发生错误:', error);
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`服务器运行中 - 端口: ${PORT} - 模式: 数据库未连接`);
    });
    global.server = server;
  }
}

startServer();

process.on('unhandledRejection', (err) => {
  console.log(`错误: ${err.message}`);
});

process.on('SIGINT', () => {
  console.log('正在关闭服务器...');
  if (global.server) {
    global.server.close(() => {
      console.log('服务器已关闭');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
