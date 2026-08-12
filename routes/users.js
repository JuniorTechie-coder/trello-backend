const { getAllUsers, userById, insertUsers, deleteUsers, updateUsers } = require('../controllers/userController');
const express = require('express');
const router = express.Router();



//This is the main get api with query calling 
router.get('/', getAllUsers); // no logic here — just "call this function"

//this is the router call for get api call by id
router.get('/:id', userById);

//this is the route call to insert users data 
router.post('/', insertUsers);

//Delete Route to delete a user by their id 
router.delete('/:id', deleteUsers) ;

//this is the route call to update user existing data by id 
router.put('/:id', updateUsers);

module.exports = router;


