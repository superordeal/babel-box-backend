const Category = require('../models/CategoryModel');
const { isDBConnected } = require('../config/db');

// 模拟数据，当数据库连接失败时使用
let mockCategories = [
  { id: '1', name: '前端框架', created_at: new Date().toISOString() },
  { id: '2', name: '后端开发', created_at: new Date().toISOString() },
  { id: '3', name: '算法原理', created_at: new Date().toISOString() },
  { id: '4', name: '数据库', created_at: new Date().toISOString() }
];

let mockCategoryIdCounter = 5;

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    if (isDBConnected()) {
      // 使用数据库
      const categories = await Category.findAll();
      res.status(200).json(categories);
    } else {
      // 使用模拟数据
      console.log('使用模拟数据返回分类列表');
      res.status(200).json(mockCategories);
    }
  } catch (err) {
    console.error('获取分类失败:', err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    if (isDBConnected()) {
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        return res.status(404).json({ message: '分类不存在' });
      }
      res.json(category);
    } else {
      // 使用模拟数据
      const category = mockCategories.find(item => item.id === req.params.id);
      if (!category) {
        return res.status(404).json({ message: '分类不存在' });
      }
      res.json(category);
    }
  } catch (err) {
    console.error('获取分类详情失败:', err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Public
const createCategory = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: '分类名称不能为空' });
    }

    if (isDBConnected()) {
      // 使用数据库
      try {
        const category = await Category.create({ name });
        res.status(201).json(category);
      } catch (dbError) {
        if (dbError.name === 'SequelizeUniqueConstraintError') {
          return res.status(400).json({ message: '分类已存在' });
        }
        throw dbError;
      }
    } else {
      // 使用模拟数据
      // Check if category already exists in mock data
      if (mockCategories.some(item => item.name === name)) {
        return res.status(400).json({ message: '分类已存在' });
      }
      const newCategory = {
        id: (mockCategoryIdCounter++).toString(),
        name,
        created_at: new Date().toISOString()
      };
      mockCategories.push(newCategory);
      res.status(201).json(newCategory);
    }
  } catch (err) {
    console.error('创建分类失败:', err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Public
const updateCategory = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: '分类名称不能为空' });
    }

    if (isDBConnected()) {
      // 使用数据库
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        return res.status(404).json({ message: '分类不存在' });
      }

      // 检查新名称是否已被使用
      const nameExists = await Category.findOne({
        where: { name, id: { [Category.sequelize.Op.ne]: req.params.id } }
      });
      if (nameExists) {
        return res.status(400).json({ message: '分类名称已被使用' });
      }

      category.name = name;
      await category.save();
      res.json(category);
    } else {
      // 使用模拟数据
      const index = mockCategories.findIndex(item => item.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: '分类不存在' });
      }
      
      // Check if new name already exists in mock data
      if (name) {
        const existingCategory = mockCategories.find(item => item.name === name);
        if (existingCategory && existingCategory.id !== req.params.id) {
          return res.status(400).json({ message: '分类名称已被使用' });
        }
      }
      
      mockCategories[index] = {
        ...mockCategories[index],
        name: name || mockCategories[index].name
      };
      res.json(mockCategories[index]);
    }
  } catch (err) {
    console.error('更新分类失败:', err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Public
const deleteCategory = async (req, res) => {
  try {
    if (isDBConnected()) {
      // 使用数据库
      // 修改：不再尝试自动判断是ID还是名称，直接通过名称查找
      // 因为前端传来的是经过编码的分类名称，而不是ID
      let category = await Category.findOne({ where: { name: req.params.id } });
      
      if (!category) {
        return res.status(404).json({ message: '分类不存在' });
      }

      await category.destroy();
      res.json({ message: '分类已删除' });
    } else {
      // 使用模拟数据
      // 与数据库部分保持一致，直接通过名称查找
      let index = mockCategories.findIndex(item => item.name === req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ message: '分类不存在' });
      }
      mockCategories.splice(index, 1);
      res.json({ message: '分类已删除' });
    }
  } catch (err) {
    console.error('删除分类失败:', err.message);
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
