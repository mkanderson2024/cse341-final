const request = require("supertest");
const app = require("../app");
jest.mock("../config/db");

describe("POST /user", () => {
  it("should create a new user", async () => {
    const newUser = {
      type: "buyer",
      email: "test@example.com",
      password: "123456",
      address: "Street ABC",
      phone: "999999999"
    };

    const response = await request(app).post("/user").send(newUser);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("userId");
  });

  it("should return 400 if required fields are missing", async () => {
    const response = await request(app).post("/user").send({
      type: "buyer"
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/missing/i);
  });
});
