const express = require('express');
const router = express.Router();
const {
  getAllPcs,
  addPc,
  updatePc,
  deletePc
} = require('../controllers/pcsController');

router.get('/', getAllPcs);
router.post('/', addPc);
router.put('/:id', updatePc);
router.delete('/:id', deletePc);

module.exports = router;
