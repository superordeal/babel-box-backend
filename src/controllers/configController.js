const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../../.env');

const readEnv = () => {
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, 'utf8');
  return dotenv.parse(raw);
};

const writeEnv = (envObj) => {
  const content = Object.entries(envObj)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  fs.writeFileSync(envPath, content, 'utf8');
};

const getConfig = (req, res) => {
  try {
    const env = readEnv();
    return res.json({ success: true, config: env });
  } catch (err) {
    console.error('读取配置失败:', err);
    return res.status(500).json({ success: false, message: '读取配置失败' });
  }
};

const updateConfig = (req, res) => {
  try {
    const { key, value } = req.body || {};
    if (!key || typeof value === 'undefined') {
      return res.status(400).json({ success: false, message: '参数缺失' });
    }
    const env = readEnv();
    env[key] = value;
    writeEnv(env);
    return res.json({ success: true });
  } catch (err) {
    console.error('更新配置失败:', err);
    return res.status(500).json({ success: false, message: '更新配置失败' });
  }
};

module.exports = { getConfig, updateConfig };
