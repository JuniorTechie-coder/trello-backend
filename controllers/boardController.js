const pool = require('../db');


//Logic to Get all boards in a workspace
const getworkspacesboards = async (req, res) => {
    try {
        const workspacesboardId = req.params.id;

        //Hit the database
        const boardsResult = await pool.query('SELECT * FROM boards WHERE boards_id =$1',
            [workspacesboardId]);

        res.status(200).json(boardsResult.rows);

    } catch (error) {
        res.status(500).json({ error: 'An error occured in server!' });
    }
}

//Logic of Open a specific board
const getBoards = async (req, res) => {
    try {
        const boardsId = req.params.id;

        //Hit database
        const boardsIdResult = await pool.query('SELECT * FROM boards WHERE id = $1', [boardsId]);

        //Validation to check result
        if (boardsIdResult.rows.length === 0) {
            res.status(404).json({ error: 'Board with thsi id does not exist!' });
        }
        else {
            res.status(200).json(boardsIdResult.rows[0]);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'error occured in server!' });

    }
}

//Logic to create new boards 
const addBoards = async (req, res) => {
    try {
        //fetch key for data fetching      
        const { name, background, workspace_id } = req.body;

        //validation 1 
        if (!name || !background) {
            //bad request(missing field) code 400
            return res.status(400).json({ error: 'All fields are required!' });
        }
        //Hit the Database
        const resultBoards = await pool.query('INSERT INTO boards(name, background, workspace_id) VALUES($1, $2, $3) RETURNING *',
            [name, background, workspace_id]);

        //now extract newly created  workspaces from array
        const finalBoards = resultBoards.rows[0];
        res.status(201).json({
            name: finalBoards.name,
            description: finalBoards.background
        });

    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            res.status(500).json({ error: 'board already existed!' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
}

//Logic to update/edit boards
const updateBoards = async (req, res) => {
    try {
        // extract data to update data
        const { name, background } = req.body;
        const id = req.params.id;

        //Validation 
        if (!name || !background) {
            //Bad request(missing field 400 status code)
            return res.status(400).json({ error: 'Not found!' }); // add return
        }

        //Hit Database 
        const updatedResult = await pool.query('UPDATE boards SET name = $1, background = $2 WHERE id = $3 RETURNING *',
            [name, background, id]);

        //Check the result now 
        if (updatedResult.rows.length === 0) {
            res.status(404).json({ error: 'board with this id does not exist!' });
        } else {
            res.status(200).json({ message: 'board updated successfully!' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An Error occured in server!' });
    }
}

//Logic to delete the boards
const deleteBoardsId = async (req, res) => {
    try {
        // extract data to update data
        const id = parseInt(req.params.id);

        //Hit Database 
        const deleteBoards = await pool.query('DELETE FROM workspaces WHERE id = $1 RETURNING *',
            [id]);

        //Check the result now 
        if (deleteBoards.rows.length === 0) {
            res.status(404).json({ error: 'Boards with this id does not exist!' });
        } else {
            res.status(200).json({ message: 'Boards deleted successfully!' });
        }

    } catch (error) {
        res.status(500).json({ error: 'An Error occured in server!' });
    }
}

module.exports = {getworkspacesboards, getBoards, addBoards, updateBoards, deleteBoardsId}



