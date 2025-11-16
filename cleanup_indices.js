const mysql = require('mysql2/promise');

// 数据库连接配置
const config = {
  host: 'localhost',
  port: 3306,
  user: 'walker',
  password: '123456',
  database: 'babel box'
};

async function cleanupIndices() {
  let connection;
  try {
    // 连接数据库
    connection = await mysql.createConnection(config);
    console.log('成功连接到数据库');

    // 获取categories表中的所有索引
    const [categoryIndices] = await connection.execute(
      `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
       WHERE TABLE_SCHEMA = 'babel box' AND TABLE_NAME = 'categories' AND INDEX_NAME != 'PRIMARY'`
    );

    // 获取bible_items表中的所有索引
    const [bibleItemIndices] = await connection.execute(
      `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
       WHERE TABLE_SCHEMA = 'babel box' AND TABLE_NAME = 'bible_items' AND INDEX_NAME != 'PRIMARY'`
    );

    // 删除categories表中的所有非主键索引
    for (const index of categoryIndices) {
      if (index.INDEX_NAME) {
        console.log(`删除categories表的索引: ${index.INDEX_NAME}`);
        await connection.execute(`DROP INDEX \`${index.INDEX_NAME}\` ON \`categories\``);
      }
    }

    // 删除bible_items表中的所有非主键索引
    for (const index of bibleItemIndices) {
      if (index.INDEX_NAME) {
        console.log(`删除bible_items表的索引: ${index.INDEX_NAME}`);
        await connection.execute(`DROP INDEX \`${index.INDEX_NAME}\` ON \`bible_items\``);
      }
    }

    // 检查是否有unique约束需要删除（可能作为索引存在）
    const [uniqueConstraints] = await connection.execute(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
       WHERE TABLE_SCHEMA = 'babel box' AND TABLE_NAME = 'categories' 
       AND CONSTRAINT_TYPE = 'UNIQUE' AND CONSTRAINT_NAME != 'PRIMARY'`
    );

    for (const constraint of uniqueConstraints) {
      if (constraint.CONSTRAINT_NAME) {
        console.log(`删除categories表的唯一约束: ${constraint.CONSTRAINT_NAME}`);
        await connection.execute(`ALTER TABLE \`categories\` DROP INDEX \`${constraint.CONSTRAINT_NAME}\``);
      }
    }

    console.log('索引清理完成!');
    
  } catch (error) {
    console.error('清理索引时出错:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行清理
cleanupIndices();