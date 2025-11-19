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
    throw new Error('AI API 密钥未配置');
  }

  try {
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
      return response.data.choices[0].message.content;
    }

    throw new Error('AI 响应格式异常');
  } catch (error) {
    if (error.response) {
      // API 返回错误
      console.error('AI API Error:', error.response.status, error.response.data);
      throw new Error(`AI API 错误: ${error.response.status}`);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('AI 请求超时');
    } else {
      throw new Error(`AI 请求失败: ${error.message}`);
    }
  }
}

module.exports = {
  generateText
};
