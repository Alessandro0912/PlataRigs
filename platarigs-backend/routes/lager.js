const express = require('express');
const router = express.Router();
const {
  getAllLager,
  addLagerItem,
  updateLagerItem,
  deleteLagerItem
} = require('../controllers/lagerController');

router.get('/', getAllLager);
router.post('/', addLagerItem);
router.put('/:id', updateLagerItem);
router.delete('/:id', deleteLagerItem);

module.exports = router;
