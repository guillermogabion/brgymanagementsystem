const express = require('express');
const router = express.Router();
const { getResident, getResidentById, createResident, updateResident, deleteResident } = require('../controllers/residentController');

router.get('/', getResident);     
router.get('/:id', getResidentById);     
router.post('/', createResident);     
router.put('/:id', updateResident);   
router.delete('/:id', deleteResident);  

module.exports = router;