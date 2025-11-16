const express = require('express');
const router = express.Router();
const {
  getAllBibleItems,
  getBibleItems,
  getBibleItemById,
  createBibleItem,
  updateBibleItem,
  deleteBibleItem
} = require('../controllers/bibleItemController');

// @route   GET /api/bible-items/all
// @desc    Get all bible items without search filtering
// @access  Public
router.get('/all', getAllBibleItems);

// @route   GET /api/bible-items
// @desc    Get all bible items with search filtering
// @access  Public
router.get('/', getBibleItems);

// @route   GET /api/bible-items/:id
// @desc    Get bible item by ID
// @access  Public
router.get('/:id', getBibleItemById);

// @route   POST /api/bible-items
// @desc    Create a bible item
// @access  Public
router.post('/', createBibleItem);

// @route   PUT /api/bible-items/:id
// @desc    Update a bible item
// @access  Public
router.put('/:id', updateBibleItem);

// @route   DELETE /api/bible-items/:id
// @desc    Delete a bible item
// @access  Public
router.delete('/:id', deleteBibleItem);

module.exports = router;
