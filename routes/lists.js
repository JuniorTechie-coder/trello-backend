const {getboardLists, addLists, updateLists, deleteListsId} = require('../controllers/listController');
const express = require('express');
const router = express.Router();

//to get all lsit from board id 1
router.get('/board/:id', getboardLists);

//this is the router call to add New lists
router.post('/', addLists);

//thsi is the router call to update/edit the existing lists
router.put('/:id', updateLists);

//thsi is the router call to delete existing Lists
router.delete('/:id', deleteListsId);

module.exports = router;