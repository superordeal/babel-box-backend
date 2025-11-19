const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  let connection;
  let dbConnection;
  try {
    // 第一步：连接到 MySQL 服务器（不指定数据库），创建数据库
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '123456',
    });

    console.log('✓ 已连接到 MySQL 服务器\n');

    // 创建数据库
    console.log('[1/2] 正在创建数据库...');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`babel box\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✓ 数据库创建/检查完成\n');
    
    await connection.end();

    // 第二步：连接到指定的数据库，创建表和插入数据
    console.log('[2/2] 正在初始化表和数据...\n');
    dbConnection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '123456',
      database: 'babel box',
    });

    const tableStatements = [
      `CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        color_type VARCHAR(50) DEFAULT 'primary',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_category_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS bible_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(255) NOT NULL,
        example TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `INSERT INTO categories (name, color_type) VALUES 
        ('技术', 'primary'),
        ('生活', 'success'),
        ('工作', 'warning'),
        ('学习', 'info')
        ON DUPLICATE KEY UPDATE name = VALUES(name), color_type = VALUES(color_type)`,
      `INSERT INTO bible_items (title, content, category, example) VALUES 
        ('Hello World', '这是第一个八股文示例', '技术', 'print("Hello World")'),
        ('如何高效学习', '制定计划，坚持不懈', '学习', '每天学习2小时'),
        ('工作效率提升', '番茄工作法，专注工作', '工作', '25分钟专注+5分钟休息'),
        ('健康生活方式', '早睡早起，适量运动', '生活', '每天步行10000步')
        ON DUPLICATE KEY UPDATE title = VALUES(title)`
    ];

    const operations = [
      '创建 categories 表',
      '创建 bible_items 表',
      '插入分类数据（4条）',
      '插入八股文数据（4条）'
    ];

    for (let i = 0; i < tableStatements.length; i++) {
      try {
        await dbConnection.execute(tableStatements[i]);
        console.log(`✓ ${operations[i]}`);
      } catch (error) {
        console.error(`✗ ${operations[i]}`);
        console.error(`  错误: ${error.message}`);
      }
    }

    console.log('\n✓✓✓ 数据库初始化完成！✓✓✓');
    console.log('✓ 数据库: babel box');
    console.log('✓ 表: categories (分类), bible_items (八股文)');
    console.log('✓ 示例数据: 已插入');

  } catch (error) {
    console.error('数据库连接失败:', error.message);
    console.error('\n请检查:');
    console.error('1. MySQL 服务是否运行中');
    console.error('2. 主机是否为 localhost');
    console.error('3. 端口是否为 3306');
    console.error('4. 用户名是否为 root');
    console.error('5. 密码是否正确');
    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {}
    }
    if (dbConnection) {
      try {
        await dbConnection.end();
      } catch (e) {}
    }
  }
}

initializeDatabase();
