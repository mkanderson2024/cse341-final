const mongodb = require("./config/db");
const { objectId } = require('mongobd');

const collectionName = 'users';//Here I assume the collection name will be 'users'. Change accordingly if necessary!

//GET all users
const getAllUsers = async (req, res) => {
    
    //try-catch block
    try {
        const db = mongodb.getDb();
        const users = await db.collection(collectionName).find().toArray();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching all users!", error);
        res.status(500).json({ message: "Failed to fetch all users!", error: error.message });
    }
}
//GET user by ID

//POST create a new user

//PUT update user

//DELETE use