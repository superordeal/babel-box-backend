const axios = require('axios');
const fs = require('fs');
const path = require('path');
// 简单的验证脚本，不依赖数据库模型初始化

async function verifyDataSource() {
  console.log('=== 数据来源验证测试 ===');
  
  // 1. 首先检查是否存在模拟数据文件
  console.log('\n检查模拟数据文件...');
  const mockDataPath = path.join(__dirname, 'src', 'data', 'mockBibleItems.js');
  const hasMockDataFile = fs.existsSync(mockDataPath);
  console.log(`是否存在模拟数据文件: ${hasMockDataFile ? '✅ 存在' : '❌ 不存在'}`);
  
  // 2. 检查server.js中关于数据库模式vs模拟模式的逻辑
  console.log('\n检查服务器模式配置...');
  const serverFilePath = path.join(__dirname, 'server.js');
  if (fs.existsSync(serverFilePath)) {
    const serverContent = fs.readFileSync(serverFilePath, 'utf8');
    const usesMockMode = serverContent.includes('mockMode') || 
                         serverContent.includes('useMockData') ||
                         serverContent.includes('模拟数据');
    console.log(`服务器代码中是否有模拟模式逻辑: ${usesMockMode ? '✅ 有' : '❌ 没有'}`);
  }
  
  // 3. 从API获取数据，重点分析数据特征
  try {
    console.log('\n=== 详细数据特征分析 ===');
    
    // 获取多页数据，分析ID和时间戳模式
    const response1 = await axios.get('http://localhost:3000/api/bible-items?page=1&pageSize=5');
    const response2 = await axios.get('http://localhost:3000/api/bible-items?page=2&pageSize=5');
    
    const allItems = [...response1.data.items, ...response2.data.items];
    console.log(`总共分析 ${allItems.length} 条记录`);
    
    // 分析ID分布模式
    const ids = allItems.map(item => item.id);
    const idRange = ids.length > 0 ? Math.max(...ids) - Math.min(...ids) : 0;
    console.log(`\nID分析:`);
    console.log(`  最小ID: ${Math.min(...ids)}`);
    console.log(`  最大ID: ${Math.max(...ids)}`);
    console.log(`  ID范围: ${idRange}`);
    console.log(`  ID是否连续: ${idRange === ids.length - 1 ? '✅ 连续（通常是模拟数据）' : '❌ 不连续（更可能是真实数据库）'}`);
    
    // 分析时间戳特征
    const timestampItems = allItems.filter(item => item.created_at);
    console.log(`\n时间戳分析:`);
    console.log(`  有时间戳的记录数: ${timestampItems.length}/${allItems.length}`);
    
    if (timestampItems.length > 0) {
      const timestamps = timestampItems.map(item => new Date(item.created_at).getTime());
      const timeRange = Math.max(...timestamps) - Math.min(...timestamps);
      const daysRange = timeRange / (1000 * 60 * 60 * 24);
      
      console.log(`  时间范围: ${daysRange.toFixed(1)} 天`);
      
      // 检查时间戳是否看起来真实（不是完全相同或有规律的间隔）
      const isRealisticTimestamps = daysRange > 0 && daysRange < 365; // 时间跨度在0-365天之间
      console.log(`  时间戳是否合理: ${isRealisticTimestamps ? '✅ 看起来合理' : '❌ 可能是模拟的'}`);
      
      // 显示一些时间戳示例
      console.log('  时间戳示例:');
      timestampItems.slice(0, 3).forEach(item => {
        console.log(`    - ${item.title}: ${item.created_at}`);
      });
    }
    
    // 分析数据内容多样性
    console.log(`\n内容分析:`);
    const categories = [...new Set(allItems.map(item => item.category))];
    console.log(`  不同分类数量: ${categories.length}`);
    console.log(`  分类列表: ${categories.slice(0, 5).join(', ')}${categories.length > 5 ? '...' : ''}`);
    
    // 4. 测试数据一致性 - 尝试删除一条记录，然后检查它是否真的被删除
    try {
      console.log('\n=== 数据操作测试 ===');
      const firstItem = allItems[0];
      if (firstItem) {
        console.log(`尝试删除ID为 ${firstItem.id} 的记录`);
        try {
          await axios.delete(`http://localhost:3000/api/bible-items/${firstItem.id}`);
          console.log(`✅ 成功发送删除请求`);
          
          // 等待一段时间让数据库操作完成
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 重新查询数据，检查是否真的被删除
          const checkResponse = await axios.get('http://localhost:3000/api/bible-items?search=' + encodeURIComponent(firstItem.title));
          const foundItems = checkResponse.data.items;
          const stillExists = foundItems.some(item => item.id === firstItem.id);
          
          if (!stillExists) {
            console.log(`✅ 记录真的被删除了！这强烈证明我们正在使用真实数据库！`);
          } else {
            console.log(`❌ 记录仍然存在，可能是模拟模式或删除功能未实现`);
          }
        } catch (deleteError) {
          console.log(`删除操作失败 (可能API没有实现删除功能):`, deleteError.message);
        }
      }
    } catch (opError) {
      console.error('数据操作测试失败:', opError.message);
    }
    
    // 最终结论
    console.log('\n=== 结论分析 ===');
    let isRealDatabase = true;
    let reasons = [];
    
    if (idRange !== ids.length - 1) {
      reasons.push('ID不连续');
    } else {
      reasons.push('ID完全连续（更像模拟数据）');
      isRealDatabase = false;
    }
    
    if (timestampItems.length > 0 && daysRange > 0 && daysRange < 365) {
      reasons.push('时间戳分布合理');
    } else {
      reasons.push('时间戳模式可疑');
      isRealDatabase = false;
    }
    
    console.log(`基于分析，这是${isRealDatabase ? '✅ 真实数据库' : '❌ 可能是模拟数据'}的理由:`);
    reasons.forEach(reason => console.log(`  - ${reason}`));
    
  } catch (apiError) {
    console.error('API请求失败:', apiError.message);
  }
  
  console.log('\n=== 验证完成 ===');
}

// 执行验证
verifyDataSource().catch(console.error);