const axios = require('axios');

// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 专门测试删除名为"111"的分类
async function testDeleteNumericCategory() {
  try {
    console.log('开始专门测试删除名为"111"的分类...');
    
    // 先获取所有分类，确认"111"分类是否存在
    console.log('获取当前所有分类...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`);
    const categories = categoriesResponse.data;
    
    console.log('当前分类列表:');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ID: ${cat.id}, 名称: ${cat.name}, 名称类型: ${typeof cat.name}`);
    });
    
    // 检查"111"分类是否存在
    const numericCategory = categories.find(cat => cat.name === '111');
    if (!numericCategory) {
      console.log('未找到名为"111"的分类，创建一个...');
      await axios.post(`${API_BASE_URL}/categories`, { name: '111' });
      console.log('已创建名为"111"的分类');
    }
    
    // 现在尝试删除"111"分类
    console.log('\n测试删除名为"111"的分类...');
    const encodedCategoryName = encodeURIComponent('111');
    const deleteUrl = `${API_BASE_URL}/categories/${encodedCategoryName}`;
    console.log('删除请求URL:', deleteUrl);
    
    try {
      const response = await axios.delete(deleteUrl);
      console.log('删除成功!');
      console.log('响应状态码:', response.status);
      console.log('响应数据:', response.data);
      
      // 验证删除是否生效
      console.log('\n验证"111"分类是否已删除...');
      const afterDeleteResponse = await axios.get(`${API_BASE_URL}/categories`);
      const afterDeleteCategories = afterDeleteResponse.data;
      
      const deletedCategoryExists = afterDeleteCategories.some(cat => cat.name === '111');
      console.log('"111"分类是否仍然存在:', deletedCategoryExists);
      
      if (!deletedCategoryExists) {
        console.log('\n测试结果: 成功！名为"111"的分类已被正确删除。');
        return true;
      } else {
        console.log('\n测试结果: 失败！名为"111"的分类仍然存在。');
        return false;
      }
    } catch (deleteError) {
      console.log('删除失败!');
      if (deleteError.response) {
        console.log('错误状态码:', deleteError.response.status);
        console.log('错误数据:', deleteError.response.data);
      } else if (deleteError.request) {
        console.log('没有收到响应:', deleteError.request);
      } else {
        console.log('请求配置错误:', deleteError.message);
      }
      return false;
    }
  } catch (error) {
    console.error('测试过程中发生错误:', error);
    return false;
  }
}

// 运行测试
testDeleteNumericCategory().then(success => {
  console.log('\n测试结果:', success ? '通过' : '失败');
  process.exit(success ? 0 : 1);
});