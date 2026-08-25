const {getListsCards, getCards, addCards, updateCards, deleteCardsId} = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

//this is a router call to get all cards in specific workspace
router.get('/lists/:id', protect, getListsCards);

//this is a router call to get cards by id
router.get('/:id', protect, getCards);

//this is the router call to add New cards
router.post('/', protect, addCards);

//this is the router call to update/edit the existing cards
router.put('/:id', protect, updateCards);

//this is the router call to delete existing cards
router.delete('/:id', protect, deleteCardsId);

module.exports = router;