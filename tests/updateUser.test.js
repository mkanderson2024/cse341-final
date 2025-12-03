const request = require("supertest");
const app = require("../app");
jest.mock("../config/db");

describe("PUT /user/:id", () => {
  it("should update a user", async () => {
    const updatedUser = {
      type: "seller",
      email: "updated@example.com",
      phone: "88888888",
      address: "New street",
      password: "updated"
    };

    const response = await request(app)
      .put("/user/1")
      .send(updatedUser);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("User updated successfully!");
  });

  it("should return 400 if ID is invalid", async () => {
    const response = await request(app)
      .put("/user/abc")
      .send({});

    expect(response.status).toBe(400);
  });
});
