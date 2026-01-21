const express = require('express');
const router = express.Router();
const { 
    getDocuments, 
    getDocumentById, // Add this
    createDocument, 
    updateDocument, 
    deleteDocument 
} = require('../controllers/templateController');

router.get('/', getDocuments); 
router.get('/:id', getDocumentById); // New route for the Designer to load data
router.post('/', createDocument);     
router.put('/:id', updateDocument);   
router.delete('/:id', deleteDocument);  

module.exports = router;