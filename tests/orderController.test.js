const { ObjectId } = require("mongodb");
// Instructs Jest to automatically use the database mock implementation 
// located in the __mocks__/config/db.js directory.
const mongodb = require("../config/db"); 

// Destructures and imports the controller functions to be tested.
const {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
} = require("../controllers/orderController");

// Mock function to simulate the Express response object (res).
// It ensures that status and json calls are tracked for assertions.
const mockResponse = () => {
    const res = {};
    // Mocks res.status to return 'res' itself, allowing method chaining (res.status().json()).
    res.status = jest.fn().mockReturnValue(res);
    res.json  = jest.fn().mockReturnValue(res);
    return res;
};

// Variable used to store the reference to the mocked cursor object returned by find().
// This allows the test suite to configure the return value of toArray().
let mockFindOrdersReturn; 

describe("Order Controller Tests", () => {

    beforeEach(() => {
        // Clears the call history and reset mock implementations before every test case.
        jest.clearAllMocks(); 
        
        // Obtains the mocked cursor reference by calling find() on the mocked 'orders' collection.
        // This relies on the structure set up in __mocks__/config/db.js.
        mockFindOrdersReturn = mongodb.getDb().collection("orders").find();
    });

    // ------------------------------------------
    // 1. GET ALL ORDERS (GET /orders)
    // ------------------------------------------
    describe('getAllOrders', () => {
        // Mock data representing a list of orders to be returned in a success scenario.
        const mockOrders = [
            { _id: new ObjectId(), shippingAddress: "Address A" },
            { _id: new ObjectId(), shippingAddress: "Address B" }
        ];

        test("should return status 200 and the orders list", async () => {
            const req = {}; // Empty request object for this endpoint
            const res = mockResponse();

            // Configures the mock cursor's toArray method to resolve with the mock data list.
            mockFindOrdersReturn.toArray.mockResolvedValue(mockOrders);

            await getAllOrders(req, res);

            // Asserts that the toArray method on the mocked cursor was called.
            expect(mockFindOrdersReturn.toArray).toHaveBeenCalled();
            // Asserts the HTTP status code is 200 (OK).
            expect(res.status).toHaveBeenCalledWith(200);
            // Asserts the response body matches the mock data.
            expect(res.json).toHaveBeenCalledWith(mockOrders);
        });
        
        // This block tests a scenario intended for the createOrder controller but is included here.
        test("createOrder should return 500 on DB error", async () => {
            // 1. DEFINE req and res HERE using the base Swagger structure

            // The controller expects userId and bookIds to be valid ObjectId strings.
            // We use valid fictitious string IDs.
            const mockValidUserId = '656b8566a01b63777083049a';
            const mockValidBookId1 = '69382f7d1bf8940683c124e1';
            const mockValidBookId2 = '69382f7d1bf8940683c124e2';
            
            // Simulates the request body payload for creating a new order.
            const req = { 
                body: { 
                    userId: mockValidUserId,
                    shippingAddress: "123 Main St, City, State",
                    date: "2023-10-01",
                    paymentMethod: "Credit Card",
                    trackingNumber: "TRACK123",
                    bookIds: [mockValidBookId1, mockValidBookId2]
                }
            };
            
            const res = mockResponse();
            
            const error = new Error("Insertion failed due to DB lock");

            // Mock to simulate DB failure (insertOne rejects the promise).
            // Note: This mock configuration affects the createOrder test case.
            mongodb.getDb().collection("orders").insertOne.mockRejectedValue(error);

            // Mocks console.error to track error logging and silence output during test execution.
            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            // 2. Function Execution
            await createOrder(req, res);

            // Assertions for the error response
            expect(res.status).toHaveBeenCalledWith(500);
            
            // Asserts the JSON response matches the expected internal server error message.
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error while creating order" });
            
            consoleErrorMock.mockRestore();
        });
    });

    // ------------------------------------------
    // 2. GET ORDER BY ID (GET /orders/:orderId)
    // ------------------------------------------
    describe('getOrderById', () => {
        const validId = new ObjectId();

        test("should return 400 for invalid ID format", async () => {
            const req = { params: { orderId: "INVALID_ID" } }; // Non-ObjectId string
            const res = mockResponse();

            await getOrderById(req, res);

            // Asserts the controller fails early due to validation.
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid order ID." });
        });

        test("should return 404 if the order does not exist", async () => {
            const nonExistentId = new ObjectId().toString();
            const req = { params: { orderId: nonExistentId } };
            const res = mockResponse();

            // Simulates DB returning null (order not found).
            mongodb.getDb().collection("orders").findOne.mockResolvedValue(null);

            await getOrderById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Order not found." });
        });

        test("should return 200 and the order if found", async () => {
            const req = { params: { orderId: validId.toString() } };
            const res = mockResponse();

            const order = { _id: validId, shippingAddress: "Test Street" };
            
            // Simulates successful retrieval of the order object.
            mongodb.getDb().collection("orders").findOne.mockResolvedValue(order);

            await getOrderById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(order);
        });

        test("should return 500 on DB error", async () => {
            const req = { params: { orderId: validId.toString() } };
            const res = mockResponse();
            const error = new Error("Internal DB Error");

            // Forces findOne to reject the promise.
            mongodb.getDb().collection("orders").findOne.mockRejectedValue(error);

            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            await getOrderById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            // Asserts the specific 500 error message returned by the controller logic.
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error getting order by Id." });

            consoleErrorMock.mockRestore();
        });
    });
    
    // ------------------------------------------
    // 3. CREATE ORDER (POST /orders)
    // ------------------------------------------
    describe('createOrder', () => {
        const newUserId = new ObjectId().toString();
        const newBookId = new ObjectId().toString();
        // Standard body used for successful creation tests.
        const validBody = {
            userId: newUserId,
            shippingAddress: "Rua Teste",
            date: "2025-12-01",
            paymentMethod: "card",
            trackingNumber: "ABC123456",
            bookIds: [newBookId]
        };

        test("should return 201 with insertedId on successful creation", async () => {
            const req = { body: validBody };
            const res = mockResponse();

            const insertedId = new ObjectId();
            // Simulates successful insertion with acknowledgement and the new ID.
            mongodb.getDb().collection("orders").insertOne.mockResolvedValue({
                acknowledged: true,
                insertedId
            });

            await createOrder(req, res);

            expect(mongodb.getDb().collection("orders").insertOne).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Order created successfully.",
                orderId: insertedId
            });
        });

        test("should return 500 on DB error", async () => {
            const req = { body: validBody };
            const res = mockResponse();
            const error = new Error("Insertion failed due to DB lock");

            // Forces insertOne to reject the promise (DB failure).
            mongodb.getDb().collection("orders").insertOne.mockRejectedValue(error);

            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            await createOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            // Asserts the specific 500 error message returned by the controller logic.
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error while creating order" });

            consoleErrorMock.mockRestore();
        });
    });

    // ------------------------------------------
    // 4. UPDATE ORDER (PUT /orders/:orderId)
    // ------------------------------------------
    describe('updateOrder', () => {
        const validId = new ObjectId().toString();
        // Payload containing the fields to update.
        const updateBody = {
            userId: new ObjectId().toString(),
            shippingAddress: "Updated St",
            date: "2025-12-01",
            paymentMethod: "card",
            trackingNumber: "XYZ987",
            bookIds: [new ObjectId().toString()]
        };

        test("should return 400 if ID is invalid", async () => {
            const req = { params: { orderId: "INVALID_ID" }, body: updateBody };
            const res = mockResponse();

            await updateOrder(req, res);

            // Asserts early validation failure.
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid order ID." });
        });

        test("should return 404 if no match found", async () => {
            const req = { params: { orderId: validId }, body: updateBody };
            const res = mockResponse();

            // Simulates updateOne finding 0 matching documents.
            mongodb.getDb().collection("orders").updateOne.mockResolvedValue({ matchedCount: 0 });

            await updateOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Order not found." });
        });

        test("should return 200 for successful update", async () => {
            const req = { params: { orderId: validId }, body: updateBody };
            const res = mockResponse();

            // Simulates successful update (matchedCount: 1).
            mongodb.getDb().collection("orders").updateOne.mockResolvedValue({ matchedCount: 1 });

            await updateOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Order updated successfully." });
        });

        test("should return 500 on DB error", async () => {
            const req = { params: { orderId: validId }, body: updateBody };
            const res = mockResponse();
            const error = new Error("DB Error during replacement");

            // Forces updateOne to reject the promise.
            mongodb.getDb().collection("orders").updateOne.mockRejectedValue(error);

            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            await updateOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            // Asserts the specific 500 error message returned by the controller logic.
            expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error while updating order.' });

            consoleErrorMock.mockRestore();
        });
    });

    // ------------------------------------------
    // 5. DELETE ORDER (DELETE /orders/:orderId)
    // ------------------------------------------
    describe('deleteOrder', () => {
        const validId = new ObjectId().toString();

        test("should return 400 for invalid ID", async () => {
            const req = { params: { orderId: "INVALID_ID" } };
            const res = mockResponse();

            await deleteOrder(req, res);

            // Asserts early validation failure.
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid order ID." });
        });

        test("should return 404 when nothing deleted", async () => {
            const req = { params: { orderId: validId } };
            const res = mockResponse();

            // Simulates deleteOne returning deletedCount: 0 (record not found).
            mongodb.getDb().collection("orders").deleteOne.mockResolvedValue({ deletedCount: 0 });

            await deleteOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Order not found." });
        });

        test("should return 200 when successful", async () => {
            const req = { params: { orderId: validId } };
            const res = mockResponse();

            // Simulates successful deletion (deletedCount: 1).
            mongodb.getDb().collection("orders").deleteOne.mockResolvedValue({ deletedCount: 1 });

            await deleteOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Order deleted successfully." });
        });

        test("deleteOrder should return 500 on DB error", async () => {
            const req = { params: { orderId: validId } };
            const res = mockResponse();
            const error = new Error("DB Error during deletion");

            // Forces deleteOne to reject the promise.
            mongodb.getDb().collection("orders").deleteOne.mockRejectedValue(error);

            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

            await deleteOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            // Asserts the specific 500 error message returned by the controller logic.
            expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error.' });

            consoleErrorMock.mockRestore();
        });
    });
});