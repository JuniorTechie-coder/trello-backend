const {getworkspacesboards, getBoards, addBoards, updateBoards, deleteBoardsId} = require('../controllers/boardController');
const express = require('express');
const router = express.Router();

//this is a router call to get all boards in specific workspace
router.get('/workspace/:id', getworkspacesboards);

//this is a router call to get boards by id
router.get('/:id', getBoards);

//this is the router call to add New boards
router.post('/', addBoards);

//thsi is the router call to update/edit the existing boards
router.put('/:id', updateBoards);

//thsi is the router call to delete existing boards
router.delete('/:id', deleteBoardsId);

module.exports = router;
