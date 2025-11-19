const axios = require('axios');
require('dotenv').config();

/**
 * AI 服务管理器
 * 用于后端调用 AI 服务进行内容校验等操作
 */

const DOBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const API_KEY = process.env.VITE_DOBAO_API_KEY;
const TIMEOUT = parseInt(process.env.VITE_AI_TIMEOUT || '30000');
const MAX_TOKENS = parseInt(process.env.VITE_AI_MAX_TOKENS || '2000');

/**
 * 调用 AI API 生成文本
 * @param {string} prompt - 提示词
 * @returns {Promise<string>} - AI 生成的文本
 */
async function generateText(prompt) {
  if (!API_KEY) {
    console.error('AI API 密钥未配置');
    throw new Error('AI API 密钥未配置');
  }

  try {
    console.log('发送 AI 请求，超时设置:', TIMEOUT, '毫秒');
    const response = await axios.post(
      DOBAO_API_URL,
      {
        model: 'doubao-seed-1-6-flash-250828',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: MAX_TOKENS
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: TIMEOUT
      }
    );

    // 提取文本内容
    if (response.data && response.data.choices && response.data.choices[0]) {
      const result = response.data.choices[0].message.content;
      console.log('AI 请求成功，获取响应内容长度:', result.length);
      return result;
    }

    console.error('AI 响应格式异常:', response.data);
    throw new Error('AI 响应格式异常');
  } catch (error) {
    if (error.response) {
      // API 返回错误
      console.error('AI API Error:', error.response.status, error.response.data);
      throw new Error(`AI API 错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.code === 'ECONNABORTED') {
      console.error('AI 请求超时');
      throw new Error('AI 请求超时（60秒）');
    } else {
      console.error('AI 请求失败:', error.message);
      throw new Error(`AI 请求失败: ${error.message}`);
    }
  }
}

module.exports = {
  generateText
};
