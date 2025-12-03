const request = require("supertest");
const app = require("../app");

// Mostra ao Jest para usar o mock ao invés do db real
/*jest.mock("../config/db");

describe("GET /user", () => {

  it("should return mocked users with status 200", async () => {
    const response = await request(app).get("/user");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty("name", "Mock User 1");
  });

});*/