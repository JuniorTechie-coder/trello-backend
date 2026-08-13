const pool = require('../db');

//Logic to get all cards in a list(by list id)
const getListsCards = async (req, res) => {
    try {
        const listId = req.params.id;

        const cardResult = await pool.query(
            'SELECT * FROM cards WHERE list_id = $1',
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
        const cardIdResult = await pool.query('SELECT * FROM cards WHERE id = $1', [cardsId]);

        //Validation to check result
        if (cardIdResult.rows.length === 0) {
            res.status(404).json({ error: 'Card with this id does not exist!' });
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
        //fetch key for data fetching      
        const {title, position, description , list_id, created_by } = req.body;

        //validation 1 
        if (!title || !position|| !description || !list_id || !created_by) {
            return res.status(400).json({ error: 'All fields are required!' });
        }
        //Hit the Database
        const resultCards = await pool.query('INSERT INTO cards(title, position, description ,list_id, created_by) VALUES($1, $2, $3, $4, $5) RETURNING *',
            [title, position, description, list_id, created_by]);

        //now extract newly created  cards from array
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
            res.status(500).json({ error: 'cards already existed!' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
}

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

        const updatedCards = await pool.query(
            `UPDATE cards
             SET title = $1,
                 description = $2,
                 position = $3
             WHERE id = $4
             RETURNING *`,
            [title, description, position, id]
        );

        if (updatedCards.rows.length === 0) {
            return res.status(404).json({
                error: 'Card with this id does not exist!'
            });
        }

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

        //Hit Database 
        const deleteCards = await pool.query('DELETE FROM cards WHERE id = $1 RETURNING *',
            [id]);

        //Check the result now 
        if (deleteCards.rows.length === 0) {
            res.status(404).json({ error: 'Cards with this id does not exist!' });
        } else {
            res.status(200).json({ message: 'Card deleted successfully!' });
        }

    } catch (error) {
        res.status(500).json({ error: 'An Error occured in server!' });
    }
}




  module.exports = {getListsCards, getCards, addCards, updateCards, deleteCardsId};