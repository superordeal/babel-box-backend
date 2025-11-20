const Category = require('../models/CategoryModel');
const { Op } = require('sequelize');
const { isDBConnected } = require('../config/db');

const ensureConnected = (res) => {
  if (!isDBConnected()) {
    res.status(503).json({ message: '数据库未连接' });
    return false;
  }
  return true;
};

const decodeValue = (value) => {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
};

const getCategories = async (req, res) => {
  if (!ensureConnected(res)) return;
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (err) {
    console.error('获取分类失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
};

const getCategoryById = async (req, res) => {
  if (!ensureConnected(res)) return;
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }
    res.json(category);
  } catch (err) {
    console.error('获取分类详情失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
};

const createCategory = async (req, res) => {
  if (!ensureConnected(res)) return;
  const { name, color_type } = req.body;
  try {
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: '分类名称不能为空' });
    }
    const normalizedColor = color_type && color_type.trim() !== '' ? color_type : 'primary';
    const category = await Category.create({
      name,
      color_type: normalizedColor
    });
    res.status(201).json(category);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: '分类已存在' });
    }
    console.error('创建分类失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
};

const updateCategory = async (req, res) => {
  if (!ensureConnected(res)) return;
  const { name, color_type } = req.body;
  try {
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: '分类名称不能为空' });
    }
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }
    const existing = await Category.findOne({
      where: { name, id: { [Op.ne]: req.params.id } }
    });
    if (existing) {
      return res.status(400).json({ message: '分类名称已被使用' });
    }
    category.name = name;
    if (color_type !== undefined) {
      category.color_type = color_type && color_type.trim() !== '' ? color_type : 'primary';
    }
    await category.save();
    res.json(category);
  } catch (err) {
    console.error('更新分类失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
};

const deleteCategory = async (req, res) => {
  if (!ensureConnected(res)) return;
  try {
    const categoryName = decodeValue(req.params.id);
    const category = await Category.findOne({ where: { name: categoryName } });
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }
    await category.destroy();
    res.json({ message: '分类已删除' });
  } catch (err) {
    console.error('删除分类失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
