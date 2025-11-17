const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

// 获取sequelize实例
const sequelize = getSequelize();

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true, // 这个设置会自动创建唯一索引
    validate: {
      notEmpty: true
    }
  },
  color_type: {
    type: DataTypes.STRING(50),
    defaultValue: 'primary'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'categories',
  timestamps: false
  // 移除额外的indexes定义，避免重复创建索引
});

module.exports = Category;