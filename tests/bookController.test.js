const { ObjectId } = require("mongodb");
// Imports the MongoDB ObjectId type, used for creating mock IDs.
// Jest is configured to use the mock database module in __mocks__/config/db.js.
const mongodb = require("../config/db"); 

// Destructures and imports the controller functions to be tested (CRUD operations for Books).
const {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
}
= require("../controllers/bookController");

// Mock function to simulate the Express response object (res).
// This allows testing if status and json were called correctly.
const mockResponse = () => {
    const res = {};
    // Mocks res.status to return 'res' itself, enabling method chaining (res.status().json()).
    res.status = jest.fn().mockReturnValue(res);
    res.json  = jest.fn().mockReturnValue(res);
    return res;
};

// Common Mock Variables
const VALID_ID = "656b8566a01b63777083049b"; // A valid, existing mock ID.
const INVALID_ID = "12345"; // An ID that fails MongoDB's format validation.
const NON_EXISTENT_ID = new ObjectId().toString(); // A valid ID that doesn't exist in mock data.

// Mock data object representing a typical book record, used for successful retrieval.
const mockBookData = {
    _id: new ObjectId(VALID_ID),
    title: "The Mocked Book",
    author: "Jane Doe",
    pages: 300,
    genre: "Fiction",
    printType: "Paper",
    publisher: "Mock Publishers",
    hasAudiobook: false,
    audiobooks: [] // Expected result from the '$'lookup' stage in the controller's aggregate pipeline.
};

// Reference variable to hold the mocked 'books' collection object.
let mockBooksCollection; 

describe("Book Controller Tests", () => {

    beforeEach(() => {
        // Clears the call history and resets mock implementations before every test case.
        jest.clearAllMocks(); 
        
        // 1. Get the reference to the mocked 'books' collection.
        mockBooksCollection = mongodb.getDb().collection("books");
        
        // 2. Obtain the mocked cursor instance from the aggregate call (this mock is necessary for chaining).
        const mockCursor = mockBooksCollection.aggregate();
        
        // This prevents the setup call from being counted in tests that expect 0 calls (like the 400 invalid ID test).
        mockBooksCollection.aggregate.mockClear(); 

        // --- Common CRUD Mock Setup ---
        // Configures default resolutions for common database operations,
        // which can be overridden in specific test cases (e.g., 404 tests).
        mockBooksCollection.findOne.mockResolvedValue(mockBookData);
        mockBooksCollection.insertOne.mockResolvedValue({ acknowledged: true, insertedId: new ObjectId() });
        mockBooksCollection.updateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
        mockBooksCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });
    });

    // ------------------------------------------
    // 1. GET ALL BOOKS (READ ALL)
    // ------------------------------------------
    describe('getAllBooks', () => {

        test("should return status 200 and a list of books", async () => {
            const req = {};
            const res = mockResponse();

            const mockBooksList = [mockBookData, { ...mockBookData, _id: new ObjectId() }];

            // Configures the mock cursor's toArray method to return the list of books.
            mockBooksCollection.aggregate().toArray.mockResolvedValue(mockBooksList);

            await getAllBooks(req, res);

            // Asserts that the database method (aggregate) was called.
            expect(mockBooksCollection.aggregate).toHaveBeenCalled();
            expect(mockBooksCollection.aggregate().toArray).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockBooksList);
        });
        
        test("should return status 500 on DB error", async () => {
            const req = {};
            const res = mockResponse();
            const error = new Error("Simulated DB connection error");
            
            // Forces the database operation to reject the promise.
            mockBooksCollection.aggregate().toArray.mockRejectedValue(error);

            // Mocks console.error to track and suppress error logging during the test.
            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            await getAllBooks(req, res);

            expect(res.status).toHaveBeenCalledWith(500); 
            // Asserts the specific error message structure expected from the controller.
            expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch books', error: error.message });

            consoleErrorMock.mockRestore(); 
        });
    });

    // ------------------------------------------
    // 2. GET BOOK BY ID (READ ONE)
    // ------------------------------------------
    describe('getBookById', () => {
        
        test("should return 400 for invalid ID format", async () => {
            const req = { params: { bookId: INVALID_ID } };
            const res = mockResponse();

            await getBookById(req, res);

            // Asserts that the DB operation was NOT called, as validation should fail first.
            expect(mockBooksCollection.aggregate).not.toHaveBeenCalled(); 
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid book ID format' });
        });

        test("should return 404 if the book is not found", async () => {
            const req = { params: { bookId: NON_EXISTENT_ID } };
            const res = mockResponse();

            // Configures the toArray() to return an empty array, simulating 'not found' in the aggregate pipeline.
            mockBooksCollection.aggregate().toArray.mockResolvedValue([]); 

            await getBookById(req, res);

            // The DB operation should be called since the ID format was valid.
            expect(mockBooksCollection.aggregate).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Book not found' });
        });

        test("should return 200 and the book if found", async () => {
            const req = { params: { bookId: VALID_ID } };
            const res = mockResponse();
            
            // Configures the toArray() to return the single book data inside an array.
            mockBooksCollection.aggregate().toArray.mockResolvedValue([mockBookData]);

            await getBookById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([mockBookData]); // Controller returns the array from aggregate.
        });

        test("should return 500 on DB error", async () => {
            const req = { params: { bookId: VALID_ID } };
            const res = mockResponse();
            const error = new Error("Internal DB Error");

            // Forces the aggregate operation to reject the promise.
            mockBooksCollection.aggregate().toArray.mockRejectedValue(error);

            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            await getBookById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch book', error: error.message });

            consoleErrorMock.mockRestore();
        });
    });

    // ------------------------------------------
    // 3. CREATE BOOK (POST)
    // ------------------------------------------
    describe('createBook', () => {
        const validBody = {
            title: "New Title",
            author: "New Author",
            pages: 400,
            genre: "Sci-Fi",
            printType: "Hardback",
            publisher: "Test Pub"
        };
        const newMockId = new ObjectId();

        test("should return 201 and new book ID on successful insertion", async () => {
            const req = { body: validBody };
            const res = mockResponse();

            // Simulates successful insertion response.
            mongodb.getDb().collection('books').insertOne.mockResolvedValue({
                acknowledged: true,
                insertedId: newMockId
            });

            await createBook(req, res);

            expect(mongodb.getDb().collection('books').insertOne).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Book created successfully',
                bookId: newMockId
            });
        });

        test("should return 500 if insertion is not acknowledged", async () => {
            const req = { body: validBody };
            const res = mockResponse();

            // Simulates a database operation that completes but insertion is not acknowledged.
            mongodb.getDb().collection('books').insertOne.mockResolvedValue({
                acknowledged: false,
                insertedId: null
            });

            await createBook(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Failed to create book' }); 
        });

        test("should return 500 on DB error", async () => {
            const req = { body: validBody };
            const res = mockResponse();
            const error = new Error("Insertion DB Error");

            // Forces insertOne to reject the promise.
            mongodb.getDb().collection('books').insertOne.mockRejectedValue(error);

            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            await createBook(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Failed to create book', error: error.message });

            consoleErrorMock.mockRestore();
        });
    });

    // ------------------------------------------
    // 4. UPDATE BOOK (PUT)
    // ------------------------------------------
    describe('updateBook', () => {
        const updateBody = {
            title: "Updated Title",
            author: "Updated Author",
            pages: 450,
            genre: "Horror",
            printType: "Digital",
            publisher: "Test Pub",
            hasAudiobook: true
        };

        test("should return 400 for invalid ID format", async () => {
            const req = { params: { bookId: INVALID_ID }, body: updateBody };
            const res = mockResponse();

            await updateBook(req, res);

            // Asserts early validation failure.
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid book ID format' });
        });

        test("should return 404 if the book is not found (matchedCount === 0)", async () => {
            const req = { params: { bookId: NON_EXISTENT_ID }, body: updateBody };
            const res = mockResponse();

            // Simulates updateOne finding 0 matching documents.
            mongodb.getDb().collection('books').updateOne.mockResolvedValue({ matchedCount: 0 });

            await updateBook(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Book not found' });
        });

        test("should return 200 on successful update", async () => {
            const req = { params: { bookId: VALID_ID }, body: updateBody };
            const res = mockResponse();

            // Simulates successful update (matchedCount: 1).
            mongodb.getDb().collection('books').updateOne.mockResolvedValue({ matchedCount: 1 });

            await updateBook(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Book updated successfully' });
        });

        test("should return 500 on DB error", async () => {
            const req = { params: { bookId: VALID_ID }, body: updateBody };
            const res = mockResponse();
            const error = new Error("Update DB Error");

            // Forces updateOne to reject the promise.
            mongodb.getDb().collection('books').updateOne.mockRejectedValue(error);

            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            await updateBook(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Failed to update book', error: error.message });

            consoleErrorMock.mockRestore();
        });
    });

    // ------------------------------------------
    // 5. DELETE BOOK (DELETE)
    // ------------------------------------------
    describe('deleteBook', () => {
        
        test("should return 400 for invalid ID format", async () => {
            const req = { params: { bookId: INVALID_ID } };
            const res = mockResponse();

            await deleteBook(req, res);

            // Asserts early validation failure.
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid book ID format' });
        });

        test("should return 404 if the book is not found (deletedCount === 0)", async () => {
            const req = { params: { bookId: NON_EXISTENT_ID } };
            const res = mockResponse();

            // Simulates deleteOne returning deletedCount: 0.
            mongodb.getDb().collection('books').deleteOne.mockResolvedValue({ deletedCount: 0 });

            await deleteBook(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Book not found' });
        });

        test("should return 200 on successful deletion", async () => {
            const req = { params: { bookId: VALID_ID } };
            const res = mockResponse();

            // Simulates successful deletion (deletedCount: 1).
            mongodb.getDb().collection('books').deleteOne.mockResolvedValue({ deletedCount: 1 });

            await deleteBook(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Book deleted successfully' });
        });

        test("should return 500 on DB error", async () => {
            const req = { params: { bookId: VALID_ID } };
            const res = mockResponse();
            const error = new Error("Delete DB Error");

            // Forces deleteOne to reject the promise.
            mongodb.getDb().collection('books').deleteOne.mockRejectedValue(error);

            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            await deleteBook(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Failed to delete book', error: error.message });

            consoleErrorMock.mockRestore();
        });
    });
});