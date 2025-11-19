const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// 获取 .env 文件路径
const envPath = path.join(__dirname, '../../.env');

/**
 * 读取 .env 配置
 * GET /api/config
 */
router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(envPath)) {
      return res.status(404).json({
        success: false,
        message: '.env 文件不存在'
      });
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const config = {};
    
    // 解析 .env 文件
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');
        if (key) {
          config[key.trim()] = value;
        }
      }
    });

    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('读取 .env 文件失败:', error);
    res.status(500).json({
      success: false,
      message: '读取配置失败',
      error: error.message
    });
  }
});

/**
 * 更新 .env 配置
 * POST /api/config
 * Body: { key: string, value: string }
 */
router.post('/', (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: key 和 value'
      });
    }

    // 验证密钥名称，防止注入
    if (!/^[A-Z0-9_]+$/.test(key)) {
      return res.status(400).json({
        success: false,
        message: '密钥名称格式不正确'
      });
    }

    // 读取现有的 .env 文件
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const lines = envContent.split('\n');
    let found = false;

    // 查找并更新已存在的配置
    const updatedLines = lines.map(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith(key + '=') && !trimmedLine.startsWith('#')) {
        found = true;
        return `${key}='${value}'`;
      }
      return line;
    });

    // 如果未找到，添加新配置
    if (!found) {
      updatedLines.push(`${key}='${value}'`);
    }

    // 写入 .env 文件
    fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf8');

    console.log(`配置已更新: ${key}=${value.slice(-4).padStart(value.length, '*')}`);

    res.json({
      success: true,
      message: `配置已更新: ${key}`,
      key,
      value: `***${value.slice(-4)}`
    });
  } catch (error) {
    console.error('更新 .env 文件失败:', error);
    res.status(500).json({
      success: false,
      message: '更新配置失败',
      error: error.message
    });
  }
});

/**
 * 批量更新 .env 配置
 * POST /api/config/batch
 * Body: { configs: { key: value, ... } }
 */
router.post('/batch', (req, res) => {
  try {
    const { configs } = req.body;

    if (!configs || typeof configs !== 'object') {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: configs'
      });
    }

    // 验证所有密钥名称
    for (const key in configs) {
      if (!/^[A-Z0-9_]+$/.test(key)) {
        return res.status(400).json({
          success: false,
          message: `密钥名称格式不正确: ${key}`
        });
      }
    }

    // 读取现有的 .env 文件
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const lines = envContent.split('\n');
    const updatedKeys = new Set();

    // 更新现有的配置
    const updatedLines = lines.map(line => {
      const trimmedLine = line.trim();
      for (const key in configs) {
        if (trimmedLine.startsWith(key + '=') && !trimmedLine.startsWith('#')) {
          updatedKeys.add(key);
          return `${key}='${configs[key]}'`;
        }
      }
      return line;
    });

    // 添加新配置
    for (const key in configs) {
      if (!updatedKeys.has(key)) {
        updatedLines.push(`${key}='${configs[key]}'`);
      }
    }

    // 写入 .env 文件
    fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf8');

    console.log(`已批量更新 ${updatedKeys.size} 个配置`);

    res.json({
      success: true,
      message: `已批量更新 ${updatedKeys.size} 个配置`,
      updated: Array.from(updatedKeys)
    });
  } catch (error) {
    console.error('批量更新 .env 文件失败:', error);
    res.status(500).json({
      success: false,
      message: '批量更新配置失败',
      error: error.message
    });
  }
});

module.exports = router;
