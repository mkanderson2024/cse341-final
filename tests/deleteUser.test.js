const request = require("supertest");
const app = require("../app");
jest.mock("../config/db");

describe("DELETE /user/:id", () => {
  it("should delete a user", async () => {
    const response = await request(app).delete("/user/1");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("User deleted successfully");
  });

  it("should return 400 for invalid ID", async () => {
    const response = await request(app).delete("/user/abc");
    expect(response.status).toBe(400);
  });
});
