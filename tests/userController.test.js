// userController.test.js

// Instruct Jest to use the mock database module in __mocks__/config/db.js
// This ensures that database interactions are simulated for testing purposes.
jest.mock('../config/db'); 
const userController = require('../controllers/userController');
const mongodb = require("../config/db");
const { ObjectId } = require('mongodb');

// Mock data array representing users in the database for testing success scenarios.
// Note: This list should mirror the structure expected by the controller.
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

// Mock function to simulate the Express response object (res).
// It tracks calls to res.status and res.json for assertions.
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// Simple mock request object for functions that don't require specific parameters.
const mockRequest = {};

// Fictitious IDs for testing various scenarios (Validation and Not Found checks).
const VALID_ID = "656b8566a01b63777083049b"; // Matches mockUsers[0]._id
const NON_EXISTENT_ID = "000000000000000000000000"; 
const INVALID_FORMAT_ID = "12345"; 

//================================================================================
// getAllUsers: SUCCESS AND ERROR 500 (Read All)
//================================================================================
describe('getAllUsers', () => {

    beforeEach(() => {
        // Clears mock history before each test to prevent side effects.
        jest.clearAllMocks();
        
        const mockUsersCollection = mongodb.getDb().collection('users');
        
        // CRITICAL FIX: Ensures mock DB returns the user list for success scenario.
        // This resolves the "Received: undefined" error in tests.
        mockUsersCollection.find().toArray.mockResolvedValue(mockUsers); 
    });

    test('should return status 200 and all users', async () => {
        // 1. Setup
        const req = mockRequest;
        const res = mockResponse();
        
        // 2. Execution
        await userController.getAllUsers(req, res);

        // 3. Assertions
        
        // Verify that the database read operation was called.
        expect(mongodb.getDb().collection('users').find().toArray).toHaveBeenCalled();

        // Verify HTTP status code (200 OK).
        expect(res.status).toHaveBeenCalledWith(200);

        // Verify the response body contains the mocked user data.
        expect(res.json).toHaveBeenCalledWith(expect.arrayContaining(mockUsers)); 
    });
    
    // Server Error Test (Status 500)
    test('should return status 500 on DB failure', async () => {
        const req = mockRequest;
        const res = mockResponse();
        const errorMessage = 'Simulated DB connection error';

        // Override the mock to force the DB operation to reject the promise.
        mongodb.getDb().collection('users').find().toArray.mockRejectedValue(new Error(errorMessage));

        // Mock console.error to prevent Jest warnings and verify logging.
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

        await userController.getAllUsers(req, res);

        // Check if the 500 status and error message were returned.
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
            message: "Failed to fetch all users!", 
            error: errorMessage 
        });
        
        consoleErrorMock.mockRestore();
    });
});

//================================================================================
// getUserById: SUCCESS, 400 (FORMAT), 404 (NOT FOUND), 500 (DB ERROR) (Read One)
//================================================================================
describe('getUserById', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        const mockUsersCollection = mongodb.getDb().collection('users');
        
        // CRITICAL FIX: Ensures mock DB returns the successful user for testing.
        // This resolves the "Received: 404" error in the success test.
        mockUsersCollection.findOne.mockResolvedValue(mockUsers[0]);
        
        // We configure the mock implementation for the 404 test below,
        // but the default mockResolvedValue handles the 200 success case cleanly.
    });
    
    // Success Test (200 OK)
    test('should return status 200 and the user if the ID is valid and found', async () => {
        const req = { params: { userId: VALID_ID } };
        const res = mockResponse();
        
        await userController.getUserById(req, res);
        
        // Check if findOne was called with the correct ObjectId for the lookup.
        expect(mongodb.getDb().collection('users').findOne).toHaveBeenCalledWith(
            { _id: new ObjectId(VALID_ID) }
        );
        
        expect(res.status).toHaveBeenCalledWith(200);
        // Expect the first user from the mock list to be returned.
        expect(res.json).toHaveBeenCalledWith(mockUsers[0]); 
    });

    // Validation Failure Test (400 Bad Request)
    test('should return status 400 if the user ID format is invalid', async () => {
        const req = { params: { userId: INVALID_FORMAT_ID } };
        const res = mockResponse();
        
        await userController.getUserById(req, res);
        
        // The DB should NOT be called since ObjectId.isValid fails first.
        expect(mongodb.getDb().collection('users').findOne).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid user ID format!" });
    });

    // Not Found Failure Test (404 Not Found)
    test('should return status 404 if the valid ID is not found in the DB', async () => {
        const req = { params: { userId: NON_EXISTENT_ID } };
        const res = mockResponse();
        
        // Override the mock for this specific test to simulate "not found".
        mongodb.getDb().collection('users').findOne.mockResolvedValue(null);
        
        await userController.getUserById(req, res);
        
        // findOne should still be called as validation succeeded.
        expect(mongodb.getDb().collection('users').findOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found!" });
    });

    // Server Error Test (500 Internal Server Error)
    test('should return status 500 on DB failure', async () => {
        const req = { params: { userId: VALID_ID } };
        const res = mockResponse();
        const errorMessage = 'Internal DB Error';
        
        // Force findOne to reject the Promise (DB error).
        mongodb.getDb().collection('users').findOne.mockRejectedValue(new Error(errorMessage));
        
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

        await userController.getUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Failed to fetch user by Id", error: errorMessage });
        
        consoleErrorMock.mockRestore();
    });
});

//================================================================================
// createUser: SUCCESS, 400 (MISSING FIELD), 500 (DB ERROR) (Create)
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
        
        // Configure the mock to return success on insertOne.
        mongodb.getDb().collection('users').insertOne.mockResolvedValue({ 
            acknowledged: true, 
            insertedId: newMockId 
        });

        await userController.createUser(req, res);

        // Check if insertOne was called with the correct data.
        expect(mongodb.getDb().collection('users').insertOne).toHaveBeenCalledWith(
            expect.objectContaining({ email: validUserData.email, type: validUserData.type })
        );
        
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ 
            message: "New user created successfuly!", 
            userId: newMockId 
        });
    });

    // Validation Failure Test (400 Bad Request)
    test('should return status 400 if a required field is missing (e.g., password)', async () => {
        // Simulate missing 'password' field
        const req = { body: { email: 'fail@test.com', type: 'buyer' } };
        const res = mockResponse();

        await userController.createUser(req, res);

        // The DB should NOT be called since validation fails early.
        expect(mongodb.getDb().collection('users').insertOne).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Some Required fields missing: email, password or type" });
    });

    // Server Error Test (500 Internal Server Error)
    test('should return status 500 on DB failure during insertion', async () => {
        const req = { body: validUserData };
        const res = mockResponse();
        const errorMessage = 'Insertion failed due to DB lock';

        // Force insertOne to reject the Promise (DB error).
        mongodb.getDb().collection('users').insertOne.mockRejectedValue(new Error(errorMessage));

        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

        await userController.createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
            message: "Failed to create a new user", 
            error: errorMessage 
        });

        consoleErrorMock.mockRestore(); 
    });
});

//================================================================================
// updateUser: SUCCESS, 400 (FORMAT), 404 (NOT FOUND), 500 (DB ERROR) (Update)
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

        // Configure the mockDB to simulate a successful update (matchedCount: 1).
        mongodb.getDb().collection('users').replaceOne.mockResolvedValue({ 
            matchedCount: 1, 
            modifiedCount: 1 
        });

        await userController.updateUser(req, res);

        // Check if replaceOne was called with the correct ID and data.
        expect(mongodb.getDb().collection('users').replaceOne).toHaveBeenCalledWith(
            { _id: new ObjectId(VALID_ID) },
            // Verify the update payload includes the expected fields.
            expect.objectContaining({ email: updateBody.email, type: updateBody.type }) 
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'User updated successfully!' });
    });

    // Validation Failure Test (400 Bad Request)
    test('should return status 400 if the user ID format is invalid', async () => {
        const req = { params: { userId: INVALID_FORMAT_ID }, body: updateBody };
        const res = mockResponse();
        
        await userController.updateUser(req, res);
        
        // The DB should NOT be called.
        expect(mongodb.getDb().collection('users').replaceOne).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID format' });
    });

    // Not Found Failure Test (404 Not Found)
    test('should return status 404 if the valid ID is not found in the DB', async () => {
        const req = { params: { userId: NON_EXISTENT_ID }, body: updateBody };
        const res = mockResponse();

        // Configure the mockDB to simulate user not found (matchedCount: 0).
        mongodb.getDb().collection('users').replaceOne.mockResolvedValue({ 
            matchedCount: 0, 
            modifiedCount: 0 
        });
        
        await userController.updateUser(req, res);
        
        // replaceOne should be called but fail the matchedCount check.
        expect(mongodb.getDb().collection('users').replaceOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found!' });
    });

    // Server Error Test (500 Internal Server Error)
    test('should return status 500 on DB failure', async () => {
        const req = { params: { userId: VALID_ID }, body: updateBody };
        const res = mockResponse();
        const errorMessage = 'DB Error during replacement';

        // Force replaceOne to reject the Promise (DB error).
        mongodb.getDb().collection('users').replaceOne.mockRejectedValue(new Error(errorMessage));
        
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
            message: 'Failed to update user!', 
            error: errorMessage 
        });

        consoleErrorMock.mockRestore();
    });
});

//================================================================================
// deleteUser: SUCCESS, 400 (FORMAT), 404 (NOT FOUND), 500 (DB ERROR) (Delete)
//================================================================================
describe('deleteUser', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Success Test (200 OK)
    test('should return status 200 and success message upon deleting the user', async () => {
        const req = { params: { userId: VALID_ID } };
        const res = mockResponse();

        // Configure the mockDB to simulate a successful deletion (deletedCount: 1).
        mongodb.getDb().collection('users').deleteOne.mockResolvedValue({ 
            deletedCount: 1 
        });

        await userController.deleteUser(req, res);

        // Check if deleteOne was called with the correct ID.
        expect(mongodb.getDb().collection('users').deleteOne).toHaveBeenCalledWith(
            { _id: new ObjectId(VALID_ID) }
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });

    // Validation Failure Test (400 Bad Request)
    test('should return status 400 if the user ID format is invalid', async () => {
        const req = { params: { userId: INVALID_FORMAT_ID } };
        const res = mockResponse();
        
        await userController.deleteUser(req, res);
        
        // The DB should NOT be called.
        expect(mongodb.getDb().collection('users').deleteOne).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID format' });
    });

    // Not Found Failure Test (404 Not Found)
    test('should return status 404 if the valid ID is not found in the DB', async () => {
        const req = { params: { userId: NON_EXISTENT_ID } };
        const res = mockResponse();

        // Configure the mockDB to simulate user not found (deletedCount: 0).
        mongodb.getDb().collection('users').deleteOne.mockResolvedValue({ 
            deletedCount: 0 
        });
        
        await userController.deleteUser(req, res);
        
        // deleteOne should be called but fail the deletedCount check.
        expect(mongodb.getDb().collection('users').deleteOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    // Server Error Test (500 Internal Server Error)
    test('should return status 500 on DB failure', async () => {
        const req = { params: { userId: VALID_ID } };
        const res = mockResponse();
        const errorMessage = 'DB Error during deletion';

        // Force deleteOne to reject the Promise (DB error).
        mongodb.getDb().collection('users').deleteOne.mockRejectedValue(new Error(errorMessage));
        
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
            message: 'Failed to delete user', 
            error: errorMessage 
        });

        consoleErrorMock.mockRestore();
    });
});