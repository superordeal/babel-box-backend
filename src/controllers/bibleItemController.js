const BibleItem = require('../models/bibleItemModel');
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

const getPaginationParams = (page, pageSize) => {
  const parsedPage = parseInt(page, 10) || 1;
  const parsedPageSize = parseInt(pageSize, 10) || 6;
  const offset = (parsedPage - 1) * parsedPageSize;
  return { parsedPage, parsedPageSize, offset };
};

const getCategoryColorMap = async () => {
  const categories = await Category.findAll();
  const map = {};
  categories.forEach((cat) => {
    map[cat.name] = cat.color_type || 'primary';
  });
  return map;
};

const getAllBibleItems = async (req, res) => {
  if (!ensureConnected(res)) return;
  try {
    const { page = 1, pageSize = 6, category = 'all' } = req.query;
    const { parsedPage, parsedPageSize, offset } = getPaginationParams(page, pageSize);
    const decodedCategory = decodeValue(category);
    const whereCondition = {};
    if (decodedCategory && decodedCategory !== 'all') {
      whereCondition.category = decodedCategory;
    }
    const categoryColorMap = await getCategoryColorMap();
    const rows = await BibleItem.findAll({
      where: whereCondition,
      offset,
      limit: parsedPageSize,
      order: [['created_at', 'DESC']]
    });
    const count = await BibleItem.count({ where: whereCondition });
    const items = rows.map((row) => {
      const item = row.toJSON();
      item.category_color = categoryColorMap[item.category] || 'primary';
      return item;
    });
    res.status(200).json({
      items,
      pagination: {
        currentPage: parsedPage,
        pageSize: parsedPageSize,
        totalItems: count,
        totalPages: Math.ceil(count / parsedPageSize)
      }
    });
  } catch (err) {
    console.error('获取全部八股文失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
};

const getBibleItems = async (req, res) => {
  if (!ensureConnected(res)) return;
  try {
    const { page = 1, pageSize = 6, search = '', category = 'all' } = req.query;
    const { parsedPage, parsedPageSize, offset } = getPaginationParams(page, pageSize);
    const decodedCategory = decodeValue(category);
    const decodedSearch = search && search.trim() ? decodeValue(search) : '';
    const whereCondition = {};
    if (decodedSearch) {
      whereCondition.title = { [Op.like]: `%${decodedSearch}%` };
    }
    if (decodedCategory && decodedCategory !== 'all') {
      whereCondition.category = decodedCategory;
    }
    const categoryColorMap = await getCategoryColorMap();
    const rows = await BibleItem.findAll({
      where: whereCondition,
      offset,
      limit: parsedPageSize,
      order: [['created_at', 'DESC']]
    });
    const count = await BibleItem.count({ where: whereCondition });
    const items = rows.map((row) => {
      const item = row.toJSON();
      item.category_color = categoryColorMap[item.category] || 'primary';
      return item;
    });
    res.status(200).json({
      items,
      pagination: {
        currentPage: parsedPage,
        pageSize: parsedPageSize,
        totalItems: count,
        totalPages: Math.ceil(count / parsedPageSize)
      }
    });
  } catch (err) {
    console.error('搜索八股文失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
};

const getBibleItemById = async (req, res) => {
  if (!ensureConnected(res)) return;
  try {
    const bibleItem = await BibleItem.findByPk(req.params.id);
    if (!bibleItem) {
      return res.status(404).json({ message: '八股文条目不存在' });
    }
    const item = bibleItem.toJSON();
    const category = await Category.findOne({ where: { name: item.category } });
    item.category_color = category ? (category.color_type || 'primary') : 'primary';
    res.status(200).json(item);
  } catch (err) {
    console.error('获取八股文条目失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
};

const createBibleItem = async (req, res) => {
  if (!ensureConnected(res)) return;
  const { title, content, category, example } = req.body;
  try {
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: '标题不能为空' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: '内容不能为空' });
    }
    if (!category || category.trim() === '') {
      return res.status(400).json({ message: '分类不能为空' });
    }
    const bibleItem = await BibleItem.create({
      title,
      content,
      category,
      example: example || null
    });
    const item = bibleItem.toJSON();
    const categoryRecord = await Category.findOne({ where: { name: category } });
    item.category_color = categoryRecord ? (categoryRecord.color_type || 'primary') : 'primary';
    res.status(201).json(item);
  } catch (err) {
    console.error('创建八股文失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
};

const updateBibleItem = async (req, res) => {
  if (!ensureConnected(res)) return;
  const { title, content, category, example } = req.body;
  try {
    const bibleItem = await BibleItem.findByPk(req.params.id);
    if (!bibleItem) {
      return res.status(404).json({ message: '八股文条目不存在' });
    }
    if (title !== undefined && title.trim() === '') {
      return res.status(400).json({ message: '标题不能为空' });
    }
    if (content !== undefined && content.trim() === '') {
      return res.status(400).json({ message: '内容不能为空' });
    }
    if (title !== undefined) bibleItem.title = title;
    if (content !== undefined) bibleItem.content = content;
    if (category !== undefined) bibleItem.category = category;
    if (example !== undefined) bibleItem.example = example;
    bibleItem.updated_at = new Date();
    await bibleItem.save();
    const item = bibleItem.toJSON();
    const categoryRecord = await Category.findOne({ where: { name: item.category } });
    item.category_color = categoryRecord ? (categoryRecord.color_type || 'primary') : 'primary';
    res.status(200).json(item);
  } catch (err) {
    console.error('更新八股文失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
};

const deleteBibleItem = async (req, res) => {
  if (!ensureConnected(res)) return;
  try {
    const bibleItem = await BibleItem.findByPk(req.params.id);
    if (!bibleItem) {
      return res.status(404).json({ message: '八股文条目不存在' });
    }
    await bibleItem.destroy();
    res.status(200).json({ message: '八股文条目已删除' });
  } catch (err) {
    console.error('删除八股文失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  getAllBibleItems,
  getBibleItems,
  getBibleItemById,
  createBibleItem,
  updateBibleItem,
  deleteBibleItem
};
