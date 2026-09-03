const pool = require('../db');

//Logic to get all cards in a list(by list id)
const getListsCards = async (req, res) => {
    try {
        const listId = req.params.id;

        const listResult = await pool.query(
            `SELECT lists.*
             FROM lists
             JOIN boards
             ON lists.board_id = boards.id
             JOIN workspaces
             ON boards.workspace_id = workspaces.id
             WHERE lists.id = $1
             AND workspaces.owner_id = $2`,
            [listId, req.user.user_id]
        );

        if(listResult.rows.length === 0){
            return res.status(404).json({
                error: 'List does not exist or you are not authorized!'
            });
        }

        //Get cards belonging to this list 
        const cardResult = await pool.query(
         `SELECT * FROM cards
         WHERE list_id = $1`,
         [listId]
        );


        res.status(200).json(cardResult.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
};

//Logic to get one card by its id 
const getCards = async (req, res) => {
    try {
        const cardsId = req.params.id;

        //Hit database
        const cardIdResult = await pool.query(`SELECT cards.*
             FROM cards
             JOIN lists
             ON cards.list_id = lists.id
             JOIN boards
             ON lists.board_id = boards.id
             JOIN workspaces
             ON boards.workspace_id = workspaces.id
             WHERE cards.id = $1
             AND workspaces.owner_id = $2`,
            [cardsId, req.user.user_id]);

        //Validation to check result
        if (cardIdResult.rows.length === 0) {
             return res.status(404).json({ error: 'Card does not exist or you are not authorized!' });
        }
        else {
            res.status(200).json(cardIdResult.rows[0]);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'error occured in server!' });

    }
}

//Logic to create new cards 
const addCards = async (req, res) => {
    try {
        const { title, position, description, list_id } = req.body;

        if (!title || position === undefined || !description || !list_id) {
            return res.status(400).json({
                error: 'All fields are required!'
            });
        }

        // Check whether the list belongs to the logged-in user
        const listResult = await pool.query(
            `SELECT lists.*
             FROM lists
             JOIN boards
             ON lists.board_id = boards.id
             JOIN workspaces
             ON boards.workspace_id = workspaces.id
             WHERE lists.id = $1
             AND workspaces.owner_id = $2`,
            [list_id, req.user.user_id]
        );

        if (listResult.rows.length === 0) {
            return res.status(404).json({
                error: 'List does not exist or you are not authorized!'
            });
        }

        // Use logged-in user's ID instead of trusting created_by from request
        const resultCards = await pool.query(
            `INSERT INTO cards
             (title, position, description, list_id, created_by)
             VALUES($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                title,
                position,
                description,
                list_id,
                req.user.user_id
            ]
        );

        const finalCards = resultCards.rows[0];

        res.status(201).json({
            title: finalCards.title,
            position: finalCards.position,
            description: finalCards.description,
            list_id: finalCards.list_id,
            created_by: finalCards.created_by
        });

    } catch (error) {
        console.error(error);

        if (error.code === '23505') {
            return res.status(500).json({
                error: 'Card already existed!'
            });
        }

        res.status(500).json({
            error: 'Server error'
        });
    }
};


//Logic to update/edit existing cards
const updateCards = async (req, res) => {
    try {
        const { title, description, position } = req.body;
        const id = req.params.id;

        // Validation
        if (!title || !description || position === undefined) {
            return res.status(400).json({
                error: 'All fields are required!'
            });
        }

        // Check whether the card belongs to the logged-in user
        const cardResult = await pool.query(
            `SELECT cards.*
            FROM cards
            JOIN lists
            ON cards.list_id = lists.id
            JOIN boards
            ON lists.board_id = boards.id
            JOIN workspaces
            ON boards.workspace_id = workspaces.id
            WHERE cards.id = $1
           AND workspaces.owner_id = $2`,
           [id, req.user.user_id]
        );

        if(cardResult.rows.length === 0){
            return res.status(404).json({
                error:'Card does not exist or you are not authorized!'
            });
        }
       
        //update the card
        const updatedCards = await pool.query(
            `UPDATE cards
             SET title = $1,
                 description = $2,
                 position = $3
             WHERE id = $4
             RETURNING *`,
            [title, description, position, id]
        );

        
        res.status(200).json({
            message: 'Card updated successfully!',
            card: updatedCards.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'An error occurred on server!'
        });
    }
};



//Logic to delete any existing cards 
const deleteCardsId = async (req, res) => {
    try {
        // extract data to update data
        const id = parseInt(req.params.id);

         // Check whether the card belongs to the logged-in user
        const cardResult = await pool.query(
            `SELECT cards
            FROM cards
            JOIN lists
            ON cards.list_id = lists.id
            JOIN boards
            ON lists.board_id = boards.id
            JOIN workspaces
            ON boards.workspace_id = workspaces.id
            WHERE cards.id = $1
            AND workspaces.owner_id = $2`,
            [id, req.user.user_id]
        );

         if (cardResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Card does not exist or you are not authorized!'
            });
        }

        //Hit Database(Delete the card)
        const deleteCards = await pool.query('DELETE FROM cards WHERE id = $1 RETURNING *',
            [id]);
 
             res.status(200).json({
            message: 'Card deleted successfully!'
        });
        
        

    } catch (error) {
        console.error(error);

        res.status(500).json({ error: 'An Error occured in server!' });
    }
}




  module.exports = {getListsCards, getCards, addCards, updateCards, deleteCardsId};