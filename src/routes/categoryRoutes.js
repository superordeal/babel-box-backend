const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', getCategories);

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', getCategoryById);

// @route   POST /api/categories
// @desc    Create a category
// @access  Public
router.post('/', createCategory);

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Public
router.put('/:id', updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Public
router.delete('/:id', deleteCategory);

module.exports = router;
