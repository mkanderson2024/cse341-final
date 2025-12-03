const request = require("supertest");
const app = require("../app");
jest.mock("../config/db");

describe("GET /user/:id", () => {
  it("should return one user with status 200", async () => {
    const response = await request(app).get("/user/1");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("_id");
    expect(response.body).toHaveProperty("name");
  });

  it("should return 400 if ID is invalid", async () => {
    const response = await request(app).get("/user/abc");

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  it("should return 404 if user not found", async () => {
    const mockDb = require("../config/db").getDb();
    mockDb.collection().findOne.mockResolvedValueOnce(null);

    const response = await request(app).get("/user/000000000000000000000000");

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("User not found!");
  });
});
