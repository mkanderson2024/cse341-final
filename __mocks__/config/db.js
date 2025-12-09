// Arquivo: __mock__/config/db.js

const { ObjectId } = require('mongodb');

//
// ======================================================
// 0. DEFINIÇÕES DE CURSOR GLOBAIS (CRUCIAL PARA ENCADEMENTO)
// ======================================================
//

// Instância de cursor genérico mockada para AGGREGATE e FIND
const mockCursorReturn = {
    // toArray é a função que o teste irá configurar o valor de retorno (mockResolvedValue)
    toArray: jest.fn(), 
    // Garante que métodos de cursor e pipeline retornam a si mesmos para encadeamento
    sort: jest.fn(function() { return this; }), 
    limit: jest.fn(function() { return this; }),
    project: jest.fn(function() { return this; }),
    match: jest.fn(function() { return this; }),
    lookup: jest.fn(function() { return this; }), 
    next: jest.fn(), 
};

//
// ======================================================
// 1. USERS COLLECTION
// ======================================================
//

const mockUsers = [
    // ... (Seus dados mockUsers originais)
];

const mockUsersCollection = {
    find: jest.fn(() => mockCursorReturn),

    findOne: jest.fn(async (query) => {
        const idToFind = query._id.toHexString();
        return mockUsers.find(u => u._id.toHexString() === idToFind) || null;
    }),

    insertOne: jest.fn(async (doc) => {
        const newId = new ObjectId();
        const newUser = { ...doc, _id: newId };
        mockUsers.push(newUser);
        return { acknowledged: true, insertedId: newId };
    }),

    replaceOne: jest.fn(async (query, replacement) => {
        const idToReplace = query._id.toHexString();
        const index = mockUsers.findIndex(u => u._id.toHexString() === idToReplace);
        
        if (index === -1) return { matchedCount: 0 };

        const updatedUser = { ...replacement, _id: query._id };
        mockUsers[index] = updatedUser;
        return { matchedCount: 1 };
    }),

    deleteOne: jest.fn(async (query) => {
        const id = query._id.toHexString();
        const initial = mockUsers.length;

        const newList = mockUsers.filter(u => u._id.toHexString() !== id);
        mockUsers.splice(0, mockUsers.length, ...newList);

        return { deletedCount: initial - mockUsers.length };
    }),
    
    aggregate: jest.fn(() => mockCursorReturn),
};


//
// ======================================================
// 2. ORDERS COLLECTION
// ======================================================
//

const mockOrders = [];

const mockOrdersCollection = {
    
    find: jest.fn(() => mockCursorReturn),
    aggregate: jest.fn(() => mockCursorReturn),

    findOne: jest.fn(async (query) => {
        return mockOrders.find(o => o._id.toHexString() === query._id.toHexString()) || null;
    }),

    insertOne: jest.fn(async (doc) => {
        const newId = new ObjectId();
        const newOrder = { ...doc, _id: newId };
        mockOrders.push(newOrder);
        return { acknowledged: true, insertedId: newId };
    }),

    updateOne: jest.fn(async (query, update) => {
        const id = query._id.toHexString();
        const index = mockOrders.findIndex(o => o._id.toHexString() === id);

        if (index === -1) return { matchedCount: 0 };

        mockOrders[index] = { ...mockOrders[index], ...update.$set };
        return { matchedCount: 1 };
    }),

    deleteOne: jest.fn(async (query) => {
        const id = query._id.toHexString();
        const initial = mockOrders.length;

        const newList = mockOrders.filter(o => o._id.toHexString() !== id);
        mockOrders.splice(0, mockOrders.length, ...newList);

        return { deletedCount: initial - mockOrders.length };
    })
};


//
// ======================================================
// 3. BOOKS COLLECTION (REMOVIDAS REFERÊNCIAS AO AUDIOBOOK)
// ======================================================
//

const mockBooksCollection = {
    // Books usa aggregate extensivamente
    aggregate: jest.fn(() => mockCursorReturn), 
    find: jest.fn(() => mockCursorReturn),
    
    // Mocks CRUD simples
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    
    countDocuments: jest.fn(), 
};


//
// ======================================================
// 4. MOCK DB (Central Dispatch)
// ======================================================
//

// Cria uma coleção genérica de fallback para as coleções não definidas
const genericCollectionMock = {
    find: jest.fn(() => mockCursorReturn),
    aggregate: jest.fn(() => mockCursorReturn),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
};

const mockDb = {
    collection: jest.fn((name) => {
        if (name === "users") return mockUsersCollection;
        if (name === "orders") return mockOrdersCollection;
        if (name === "books") return mockBooksCollection; 
        
        return genericCollectionMock;
    })
};

//
// ======================================================
// 5. EXPORT FINAL
// ======================================================
//

module.exports = {
    getDb: jest.fn(() => mockDb),
    mockUsers // Exporta mockUsers para userController.test.js
};