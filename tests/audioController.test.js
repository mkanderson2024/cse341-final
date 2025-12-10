const { ObjectId } = require("mongodb");
// Jest is configured to use the mock database module in __mocks__/config/db.js.
const mongodb = require("../config/db");

// Destructures and imports only the controller functions to be tested (GET operations).
const {
    getAllAudio,
    getAudioById
} = require("../controllers/audioController");

// Mock function to simulate the Express response object (res).
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// Common Mock Variables
const VALID_ID = "656b8566a01b637770830600"; // A valid, existing mock ID.
const INVALID_ID = "12345"; // An ID that fails MongoDB's format validation.
const NON_EXISTENT_ID = new ObjectId().toString(); // A valid ID that doesn't exist in mock data.

// Mock data object representing a typical audiobook record.
const mockAudioData = {
    _id: new ObjectId(VALID_ID),
    title: "Mystery at Midnight",
    author: "Sarah Johnson",
    voiceActor: "Morgan Freeman",
    recordingStudio: "Audible Studios",
    genre: "Mystery",
    audioFormat: "MP3",
    time: "8:30:00"
};

// Reference variable to hold the mocked 'audioBook' collection object.
let mockAudioCollection;

describe("Audio Controller Tests", () => {

    beforeEach(() => {
        // Clears the call history and resets mock implementations before every test case.
        jest.clearAllMocks();

        // Get the reference to the mocked 'audioBook' collection.
        mockAudioCollection = mongodb.getDb().collection("audioBook");

        // Create the mock cursor for find().toArray() chain
        const mockCursor = {
            toArray: jest.fn()
        };
        mockAudioCollection.find = jest.fn().mockReturnValue(mockCursor);

        // Default mock setup for findOne
        mockAudioCollection.findOne = jest.fn();
    });

    // ------------------------------------------
    // 1. GET ALL AUDIOBOOKS (READ ALL)
    // ------------------------------------------
    describe('getAllAudio', () => {

        test("should return status 200 and a list of audiobooks", async () => {
            const req = {};
            const res = mockResponse();

            const mockAudioList = [mockAudioData, { ...mockAudioData, _id: new ObjectId() }];

            // Configures the mock cursor's toArray method to return the list of audiobooks.
            mockAudioCollection.find().toArray.mockResolvedValue(mockAudioList);

            await getAllAudio(req, res);

            // Asserts that the database method (find) was called.
            expect(mockAudioCollection.find).toHaveBeenCalled();
            expect(mockAudioCollection.find().toArray).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockAudioList);
        });

        test("should return status 500 on DB error", async () => {
            const req = {};
            const res = mockResponse();
            const error = new Error("Simulated DB connection error");

            // Forces the database operation to reject the promise.
            mockAudioCollection.find().toArray.mockRejectedValue(error);

            // Mocks console.error to suppress error logging during the test.
            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            await getAllAudio(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ 
                message: 'Failed to fetch audiobooks', 
                error: error.message 
            });

            consoleErrorMock.mockRestore();
        });
    });

    // ------------------------------------------
    // 2. GET AUDIOBOOK BY ID (READ ONE)
    // ------------------------------------------
    describe('getAudioById', () => {

        test("should return 400 for invalid ID format", async () => {
            const req = { params: { audioId: INVALID_ID } };
            const res = mockResponse();

            await getAudioById(req, res);

            // Asserts that the DB operation was NOT called, as validation should fail first.
            expect(mockAudioCollection.findOne).not.toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid audiobook ID format' });
        });

        test("should return 404 if the audiobook is not found", async () => {
            const req = { params: { audioId: NON_EXISTENT_ID } };
            const res = mockResponse();

            // Configures findOne to return null, simulating 'not found'.
            mockAudioCollection.findOne.mockResolvedValue(null);

            await getAudioById(req, res);

            // The DB operation should be called since the ID format was valid.
            expect(mockAudioCollection.findOne).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Audiobook not found' });
        });

        test("should return 200 and the audiobook if found", async () => {
            const req = { params: { audioId: VALID_ID } };
            const res = mockResponse();

            // Configures findOne to return the audiobook data.
            mockAudioCollection.findOne.mockResolvedValue(mockAudioData);

            await getAudioById(req, res);

            expect(mockAudioCollection.findOne).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockAudioData);
        });

        test("should return 500 on DB error", async () => {
            const req = { params: { audioId: VALID_ID } };
            const res = mockResponse();
            const error = new Error("Internal DB Error");

            // Forces findOne to reject the promise.
            mockAudioCollection.findOne.mockRejectedValue(error);

            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            await getAudioById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ 
                message: 'Failed to fetch audiobook', 
                error: error.message 
            });

            consoleErrorMock.mockRestore();
        });
    });
});