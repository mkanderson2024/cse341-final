//////DB simulation//////////////////
module.exports = {
  getDb: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue({
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { _id: "1", name: "John Doe", email: "john@example.com" }
        ])
      }),
      findOne: jest.fn().mockResolvedValue({ _id: "1", name: "John Doe" }),
      insertOne: jest.fn().mockResolvedValue({
        acknowledged: true,
        insertedId: "12345"
      }),
      replaceOne: jest.fn().mockResolvedValue({
        matchedCount: 1
      }),
      deleteOne: jest.fn().mockResolvedValue({
        deletedCount: 1
      })
    })
  })
};
