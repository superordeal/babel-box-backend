const axios = require('axios');

// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 测试删除分类函数
async function testDeleteCategory(categoryName) {
  try {
    console.log(`测试删除分类: ${categoryName}`);
    
    // 确保分类名称已编码
    const encodedCategoryName = encodeURIComponent(categoryName);
    const deleteUrl = `${API_BASE_URL}/categories/${encodedCategoryName}`;
    console.log('删除请求URL:', deleteUrl);
    
    // 发送删除请求
    const response = await axios.delete(deleteUrl);
    
    console.log('删除成功!');
    console.log('响应状态码:', response.status);
    console.log('响应数据:', response.data);
    
    return true;
  } catch (error) {
    console.log('删除失败!');
    if (error.response) {
      // 服务器返回了错误响应
      console.log('错误状态码:', error.response.status);
      console.log('错误数据:', error.response.data);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.log('没有收到响应:', error.request);
    } else {
      // 请求配置出错
      console.log('请求配置错误:', error.message);
    }
    return false;
  }
}

// 先获取所有分类，然后选择一个存在的分类进行测试
async function runTest() {
  try {
    console.log('开始测试分类删除功能...');
    
    // 先获取所有分类
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`);
    const categories = categoriesResponse.data;
    
    console.log('当前分类列表:');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ID: ${cat.id}, 名称: ${cat.name}`);
    });
    
    // 测试删除一个存在的分类（如果有的话）
    if (categories.length > 0) {
      const testCategory = categories[0]; // 选择第一个分类进行测试
      console.log(`\n测试删除存在的分类: ${testCategory.name}`);
      
      // 先复制这个分类，以便后续可以重新创建
      const categoryBackup = { ...testCategory };
      
      // 测试删除
      const deleteSuccess = await testDeleteCategory(testCategory.name);
      
      if (deleteSuccess) {
        console.log('\n验证删除是否生效...');
        const afterDeleteResponse = await axios.get(`${API_BASE_URL}/categories`);
        const afterDeleteCategories = afterDeleteResponse.data;
        
        const deletedCategoryExists = afterDeleteCategories.some(
          cat => cat.name === testCategory.name
        );
        
        console.log('分类是否仍然存在:', deletedCategoryExists);
        
        // 恢复被删除的分类
        console.log('\n恢复测试分类...');
        await axios.post(`${API_BASE_URL}/categories`, { name: categoryBackup.name });
        console.log('测试分类已恢复');
        
        return !deletedCategoryExists;
      }
    }
    
    // 测试删除不存在的分类
    console.log('\n测试删除不存在的分类: non_existent_category_123');
    const deleteNonExistent = await testDeleteCategory('non_existent_category_123');
    console.log('预期结果: 删除不存在的分类应该失败');
    
    return !deleteNonExistent; // 对于不存在的分类，删除应该失败，所以返回true表示测试通过
  } catch (error) {
    console.error('测试过程中发生错误:', error);
    return false;
  }
}

// 运行测试
runTest().then(success => {
  console.log('\n测试结果:', success ? '通过' : '失败');
  process.exit(success ? 0 : 1);
});