const request = require("supertest");
const app = require("../app");

// Indicates Jest to use db mocked instead of the real db
const request = require("supertest");
const app = require("../app");

  jest.mock("../config/db");

  describe("GET /user", () => {
    it("should return a list of users with status 200", async () => {
    const response = await request(app).get("/user");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty("name");
  });
});
