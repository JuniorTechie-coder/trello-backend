const {getAllWorkspaces, getworkspacesId, addWorkspace, updateWorkspaces, deleteWorkspaces} = require('../controllers/workspaceController');
const express = require('express');
const router = express.Router();


//this is a router call to get all workspaces 
router.get('/', getAllWorkspaces);

//this is a router call to get workspaces by id
router.get('/:id', getworkspacesId);

//this is the router call to add New data
router.post('/', addWorkspace);

//thsi is the router call to update the existing data
router.put('/:id', updateWorkspaces);

//thsi is the router call to delete existing data
router.delete('/:id', deleteWorkspaces);


module.exports = router;
