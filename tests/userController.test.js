// userController.test.js

// Instruct Jest to use the mock database module in __mocks__/config/db.js
jest.mock('../config/db'); 
const userController = require('../controllers/userController');
const mongodb = require("../config/db");
const { ObjectId } = require('mongodb');

const mockUsers = [
    {
        _id: new ObjectId("656b8566a01b63777083049b"), 
        type: "seller",
        email: "alice@example.com",
        phone: "11987654321",
        address: "Rua A, 123",
        password: "hashed_password_1",
        createdAt: new Date("2025-11-30T10:00:00.000Z"),
        updatedAt: new Date("2025-11-30T10:00:00.000Z")
    },
    {
        _id: new ObjectId("656b8566a01b63777083049c"),
        type: "buyer",
        email: "bob@example.com",
        phone: "21998877665",
        address: "Av B, 456",
        password: "hashed_password_2",
        createdAt: new Date("2025-11-30T11:00:00.000Z"),
        updatedAt: new Date("2025-11-30T11:00:00.000Z")
    }
];

// Mock function to simulate Express response object
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// Simple request object (req), since we don't use body/params in getAllUsers success test
const mockRequest = {};

// Fictitious IDs for testing various scenarios
const VALID_ID = "656b8566a01b63777083049b"; 
const NON_EXISTENT_ID = "000000000000000000000000"; 
const INVALID_FORMAT_ID = "12345"; 

//================================================================================
// getAllUsers: SUCCESS AND ERROR 500
//================================================================================
describe('getAllUsers', () => {

    // Reset mocks before each test to ensure isolation
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return status 200 and all users', async () => {
        // 1. Setup
        const req = mockRequest;
        const res = mockResponse();

        // 2. Execution
        await userController.getAllUsers(req, res);

        // 3. Assertions
        
        // Should call the getDb() function from the mock module
        expect(mongodb.getDb).toHaveBeenCalled();

        // Should call the collection() function with the correct name ('users')
        expect(mongodb.getDb().collection).toHaveBeenCalledWith('users');

        // Should call the find() function
        expect(mongodb.getDb().collection('users').find).toHaveBeenCalled();
        
        // Should call toArray()
        expect(mongodb.getDb().collection('users').find().toArray).toHaveBeenCalled();

        // Should return status 200
        expect(res.status).toHaveBeenCalledWith(200);

        // Should return the mocked user list (full objects)
        expect(res.json).toHaveBeenCalledWith(expect.arrayContaining(mockUsers));
    });
    
    // Server Error Test (Status 500)
    test('should return status 500 on DB failure', async () => {
        const req = mockRequest;
        const res = mockResponse();
        const errorMessage = 'Simulated DB connection error';

        // Override the mock to MAKE the DB FAIL
        // Make toArray() reject the Promise
        mongodb.getDb().collection('users').find().toArray.mockRejectedValue(new Error(errorMessage));

        await userController.getAllUsers(req, res);

        // Check if the 500 status and error message were returned
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
            message: "Failed to fetch all users!", 
            error: errorMessage 
        });
        
        // Restore the original mock implementation for subsequent tests
        mongodb.getDb().collection('users').find().toArray.mockRestore(); 
    });
});

//================================================================================
// getUserById: SUCCESS, 400 (FORMAT), 404 (NOT FOUND), 500 (DB ERROR)
//================================================================================
describe('getUserById', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    // Success Test (200 OK)
    test('should return status 200 and the user if the ID is valid and found', async () => {
        const req = { params: { userId: VALID_ID } };
        const res = mockResponse();
        
        await userController.getUserById(req, res);
        
        // Check if findOne was called with the correct ObjectId
        expect(mongodb.getDb().collection('users').findOne).toHaveBeenCalledWith(
            { _id: new ObjectId(VALID_ID) }
        );
        
        expect(res.status).toHaveBeenCalledWith(200);
        // Expect the first user from the mock array to be returned
        expect(res.json).toHaveBeenCalledWith(mockUsers[0]); 
    });

    // Validation Failure Test (400 Bad Request)
    test('should return status 400 if the user ID format is invalid', async () => {
        const req = { params: { userId: INVALID_FORMAT_ID } };
        const res = mockResponse();
        
        await userController.getUserById(req, res);
        
        // The DB should NOT be called since validation failed first
        expect(mongodb.getDb().collection('users').findOne).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid user ID format!" });
    });

    // Not Found Failure Test (404 Not Found)
    test('should return status 404 if the valid ID is not found in the DB', async () => {
        const req = { params: { userId: NON_EXISTENT_ID } };
        const res = mockResponse();
        
        // The mockDb.findOne is configured to return null for this ID
        
        await userController.getUserById(req, res);
        
        // findOne should still be called
        expect(mongodb.getDb().collection('users').findOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found!" });
    });

    // Server Error Test (500 Internal Server Error)
    test('should return status 500 on DB failure', async () => {
        const req = { params: { userId: VALID_ID } };
        const res = mockResponse();
        const errorMessage = 'Internal DB Error';
        
        // Force findOne to reject the Promise
        mongodb.getDb().collection('users').findOne.mockRejectedValue(new Error(errorMessage));

        await userController.getUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Failed to fetch user by Id", error: errorMessage });
        
        mongodb.getDb().collection('users').findOne.mockRestore();
    });
});

//================================================================================
// createUser: SUCCESS, 400 (MISSING FIELD), 500 (DB ERROR)
//================================================================================
describe('createUser', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    const validUserData = {
        type: 'seller',
        email: 'newuser@test.com',
        phone: '11900000000',
        address: 'Rua teste',
        password: 'password123'
    };
    
    const newMockId = new ObjectId();

    // Success Test (201 Created)
    test('should return status 201 and the new user ID upon successful creation', async () => {
        const req = { body: validUserData };
        const res = mockResponse();
        
        // Configure the mock to return success (acknowledged: true)
        mongodb.getDb().collection('users').insertOne.mockResolvedValue({ 
            acknowledged: true, 
            insertedId: newMockId 
        });

        await userController.createUser(req, res);

        // Check if insertOne was called with the correct data (excluding auto-generated fields like createdAt/updatedAt)
        expect(mongodb.getDb().collection('users').insertOne).toHaveBeenCalledWith(
            expect.objectContaining({ email: validUserData.email, type: validUserData.type })
        );
        
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ 
            message: "New user created successfuly!", 
            userId: newMockId 
        });
        
        mongodb.getDb().collection('users').insertOne.mockRestore();
    });

    // Validation Failure Test (400 Bad Request)
    test('should return status 400 if a required field is missing (e.g., password)', async () => {
        // Simulate missing 'password' field
        const req = { body: { email: 'fail@test.com', type: 'buyer' } };
        const res = mockResponse();

        await userController.createUser(req, res);

        // The DB should NOT be called
        expect(mongodb.getDb().collection('users').insertOne).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Some Required fields missing: email, password or type" });
    });

    // Server Error Test (500 Internal Server Error)
    test('should return status 500 on DB failure during insertion', async () => {
        const req = { body: validUserData };
        const res = mockResponse();
        const errorMessage = 'Insertion failed due to DB lock';

        // Force insertOne to reject the Promise
        mongodb.getDb().collection('users').insertOne.mockRejectedValue(new Error(errorMessage));

        await userController.createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
            message: "Failed to create a new user", 
            error: errorMessage 
        });

        mongodb.getDb().collection('users').insertOne.mockRestore(); 
    });
});

//================================================================================
// updateUser: SUCCESS, 400 (FORMAT), 404 (NOT FOUND), 500 (DB ERROR)
//================================================================================
describe('updateUser', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const updateBody = {
        type: 'seller',
        email: 'alice.updated@example.com',
        phone: '11911112222',
        address: 'Rua Principal, 500',
        password: 'new_hashed_password'
    };
    
    // Success Test (200 OK)
    test('should return status 200 and success message upon updating the user', async () => {
        const req = { params: { userId: VALID_ID }, body: updateBody };
        const res = mockResponse();

        // Configure the mockDB to simulate a successful update
        mongodb.getDb().collection('users').replaceOne.mockResolvedValue({ 
            matchedCount: 1, 
            modifiedCount: 1 
        });

        await userController.updateUser(req, res);

        // Check if replaceOne was called with the correct ID and data
        expect(mongodb.getDb().collection('users').replaceOne).toHaveBeenCalledWith(
            { _id: new ObjectId(VALID_ID) },
            expect.objectContaining({ email: updateBody.email, type: updateBody.type })
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'User updated successfully!' });

        mongodb.getDb().collection('users').replaceOne.mockRestore();
    });

    // Validation Failure Test (400 Bad Request)
    test('should return status 400 if the user ID format is invalid', async () => {
        const req = { params: { userId: INVALID_FORMAT_ID }, body: updateBody };
        const res = mockResponse();
        
        await userController.updateUser(req, res);
        
        // The DB should NOT be called
        expect(mongodb.getDb().collection('users').replaceOne).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID format' });
    });

    // Not Found Failure Test (404 Not Found)
    test('should return status 404 if the valid ID is not found in the DB', async () => {
        const req = { params: { userId: NON_EXISTENT_ID }, body: updateBody };
        const res = mockResponse();

        // Configure the mockDB to simulate user not found
        mongodb.getDb().collection('users').replaceOne.mockResolvedValue({ 
            matchedCount: 0, 
            modifiedCount: 0 
        });
        
        await userController.updateUser(req, res);
        
        // replaceOne should be called but matchedCount should be 0
        expect(mongodb.getDb().collection('users').replaceOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found!' });

        mongodb.getDb().collection('users').replaceOne.mockRestore();
    });

    // Server Error Test (500 Internal Server Error)
    test('should return status 500 on DB failure', async () => {
        const req = { params: { userId: VALID_ID }, body: updateBody };
        const res = mockResponse();
        const errorMessage = 'DB Error during replacement';

        // Force replaceOne to reject the Promise
        mongodb.getDb().collection('users').replaceOne.mockRejectedValue(new Error(errorMessage));

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
            message: 'Failed to update user!', 
            error: errorMessage 
        });

        mongodb.getDb().collection('users').replaceOne.mockRestore();
    });
});

//================================================================================
// deleteUser: SUCCESS, 400 (FORMAT), 404 (NOT FOUND), 500 (DB ERROR)
//================================================================================
describe('deleteUser', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Success Test (200 OK)
    test('should return status 200 and success message upon deleting the user', async () => {
        const req = { params: { userId: VALID_ID } };
        const res = mockResponse();

        // Configure the mockDB to simulate a successful deletion
        mongodb.getDb().collection('users').deleteOne.mockResolvedValue({ 
            deletedCount: 1 // Indicates that 1 document was deleted
        });

        await userController.deleteUser(req, res);

        // Check if deleteOne was called with the correct ID
        expect(mongodb.getDb().collection('users').deleteOne).toHaveBeenCalledWith(
            { _id: new ObjectId(VALID_ID) }
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });

        mongodb.getDb().collection('users').deleteOne.mockRestore();
    });

    // Validation Failure Test (400 Bad Request)
    test('should return status 400 if the user ID format is invalid', async () => {
        const req = { params: { userId: INVALID_FORMAT_ID } };
        const res = mockResponse();
        
        await userController.deleteUser(req, res);
        
        // The DB should NOT be called
        expect(mongodb.getDb().collection('users').deleteOne).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID format' });
    });

    // Not Found Failure Test (404 Not Found)
    test('should return status 404 if the valid ID is not found in the DB', async () => {
        const req = { params: { userId: NON_EXISTENT_ID } };
        const res = mockResponse();

        // Configure the mockDB to simulate user not found (deletedCount: 0)
        mongodb.getDb().collection('users').deleteOne.mockResolvedValue({ 
            deletedCount: 0 
        });
        
        await userController.deleteUser(req, res);
        
        // deleteOne should be called but deletedCount should be 0
        expect(mongodb.getDb().collection('users').deleteOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });

        mongodb.getDb().collection('users').deleteOne.mockRestore();
    });

    // Server Error Test (500 Internal Server Error)
    test('should return status 500 on DB failure', async () => {
        const req = { params: { userId: VALID_ID } };
        const res = mockResponse();
        const errorMessage = 'DB Error during deletion';

        // Force deleteOne to reject the Promise
        mongodb.getDb().collection('users').deleteOne.mockRejectedValue(new Error(errorMessage));

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
            message: 'Failed to delete user', 
            error: errorMessage 
        });

        mongodb.getDb().collection('users').deleteOne.mockRestore();
    });
});