const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '123456',
      database: process.env.MYSQL_DATABASE || 'babel box',
    });

    console.log('✓ 数据库连接成功！');
    console.log(`✓ 主机: ${process.env.MYSQL_HOST || 'localhost'}`);
    console.log(`✓ 端口: ${process.env.MYSQL_PORT || 3306}`);
    console.log(`✓ 用户: ${process.env.MYSQL_USER || 'root'}`);
    console.log(`✓ 数据库: ${process.env.MYSQL_DATABASE || 'babel box'}`);

    // 查询表中的数据
    const [categories] = await connection.execute('SELECT * FROM categories');
    const [items] = await connection.execute('SELECT * FROM bible_items');

    console.log(`\n✓ categories 表中有 ${categories.length} 条数据`);
    console.log(`✓ bible_items 表中有 ${items.length} 条数据`);

    if (items.length > 0) {
      console.log('\n示例数据（前2条）：');
      items.slice(0, 2).forEach((item, idx) => {
        console.log(`${idx + 1}. ${item.title} (分类: ${item.category})`);
      });
    }

    await connection.end();
  } catch (error) {
    console.error('✗ 数据库连接失败:', error.message);
    process.exit(1);
  }
}

testConnection();
