const mongodb = require("../config/db");
const { ObjectId } = require('mongodb');

const collectionName = 'users';//Here I assume the collection name will be 'users'. Change accordingly if necessary!

//GET all users
const getAllUsers = async (req, res) => {
    
    //try-catch block
    try {
        const db = mongodb.getDb();
        const users = await db.collection(collectionName).find().toArray();
        res.status(200).json(users);
    } catch (error) { //handling error codes
        console.error("Error fetching all users!", error);
        res.status(500).json({ message: "Failed to fetch all users!", error: error.message });
    }
};

//GET user by ID
//handling error codes (400, 404, 500, 200)
const getUserById = async (req, res) => {
    
    try {
        const userId = req.params.userId;
        
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID format!" });//if different from mongodb requirements for id´s
        }

        const db = mongodb.getDb();
        const user = await db.collection(collectionName).findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json(user);//ok response
      
    } catch (error) {
        console.error("Error fetching user by Id!", error);
        res.status(500).json({ message: "Failed to fetch user by Id", error: error.message });
    }
};

//POST create a new user
const createUser = async (req, res) => {
    try {

        //validate required fields
        if (!req.body.email || !req.body.password || !req.body.type) {
            
            return res.status(400).json({ message: "Some Required fields missing: email, password or type" });
        }
        const user = {//assuming user will have all those fields
            
            type: req.body.type, //buyer or seller
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            password: req.body.password,//should be encypted later
            createdAt: new Date(),
            updatedAt: new Date()

        };

        const db = mongodb.getDb();
        const result = await db.collection(collectionName).insertOne(user);

        if (result.acknowledged) {
            res.status(201).json({ message: "New user created successfuly!", userId: result.insertedId });
        } else {
            res.status(500).json({ message: 'Failed to create a new user' });
        }
    } catch (error) {
        
        console.error('Error creating a new user:', error);
        res.status(500).json({ message: 'Failed to create a new user', error: error.message });
    }
};

//PUT update user

const updateUser = async (req, res) => {
    
    try {
        const userId = req.params.userId;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const updatedUser = {//assuming user will have all those fields
        
            type: req.body.type,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            password: req.body.password,
            updatedAt: new Date()
      
        };

        const db = mongodb.getDb();
        const result = await db.collection(collectionName).replaceOne(
            { _id: new ObjectId(userId) },
            updatedUser
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found!' });
        }

        res.status(200).json({ message: 'User updated successfully!' });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user!', error: error.message });
    }
    
};

//DELETE user

const deleteUser = async (req, res) => {
    
   try {
    const userId = req.params.userId;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const db = mongodb.getDb();
    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};