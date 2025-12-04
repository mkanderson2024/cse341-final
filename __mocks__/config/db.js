// Arquivo: __mock__/config/db.js

// 1. Simulação do ObjectId do MongoDB
// É crucial para que o código do controller que usa ObjectId.isValid e new ObjectId funcione.
const { ObjectId } = require('mongodb');

// 2. Dados Fictícios (Simulando a Coleção 'users')
// Adicione IDs válidos para simular o comportamento do MongoDB
const mockUsers = [
    {
        _id: new ObjectId("656b8566a01b63777083049b"), // Exemplo de ID válido
        type: "seller",
        email: "alice@example.com",
        phone: "11987654321",
        address: "Rua A, 123",
        password: "hashed_password_1",
        createdAt: new Date("2025-11-30T10:00:00.000Z"),
        updatedAt: new Date("2025-11-30T10:00:00.000Z")
    },
    {
        _id: new ObjectId("656b8566a01b63777083049c"),
        type: "buyer",
        email: "bob@example.com",
        phone: "21998877665",
        address: "Av B, 456",
        password: "hashed_password_2",
        createdAt: new Date("2025-11-30T11:00:00.000Z"),
        updatedAt: new Date("2025-11-30T11:00:00.000Z")
    }
];

// 3. Simulação da Função find().toArray()
// Esta função simula o método .find().toArray() usado no getAllUsers.
const mockFind = {
    toArray: jest.fn().mockResolvedValue(mockUsers) // Retorna a lista completa de usuários mock
};

// 4. Simulação da Coleção (o objeto retornado por db.collection('users'))
// Contém todas as operações de banco de dados que seu controller usa.
const mockCollection = {
    // Implementa a simulação para o getAllUsers (find().toArray())
    find: jest.fn(() => mockFind), 

    // Implementa a simulação para o getUserById (findOne)
    findOne: jest.fn(async (query) => {
        // Encontra o usuário na lista mock pelo _id.
        const idToFind = query._id.toHexString();
        return mockUsers.find(u => u._id.toHexString() === idToFind) || null;
    }),

    // Implementa a simulação para o createUser (insertOne)
    insertOne: jest.fn(async (doc) => {
        const newId = new ObjectId(); // Gera um novo ID mock
        const newUser = { ...doc, _id: newId };
        mockUsers.push(newUser); // Adiciona o novo usuário ao mock
        return { acknowledged: true, insertedId: newId };
    }),

    // Implementa a simulação para o updateUser (replaceOne)
    replaceOne: jest.fn(async (query, replacement) => {
        const idToReplace = query._id.toHexString();
        const index = mockUsers.findIndex(u => u._id.toHexString() === idToReplace);
        
        if (index === -1) {
            return { matchedCount: 0 };
        }

        const updatedUser = { ...replacement, _id: query._id };
        mockUsers[index] = updatedUser;
        return { matchedCount: 1 };
    }),

    // Implementa a simulação para o deleteUser (deleteOne)
    deleteOne: jest.fn(async (query) => {
        const idToDelete = query._id.toHexString();
        const initialLength = mockUsers.length;
        
        // Remove o usuário da lista mock
        const newMockUsers = mockUsers.filter(u => u._id.toHexString() !== idToDelete);
        mockUsers.splice(0, mockUsers.length, ...newMockUsers); // Atualiza o array mock

        return { deletedCount: initialLength - mockUsers.length };
    }),
};

// 5. Simulação da Instância do Banco de Dados (o objeto retornado por mongodb.getDb())
// Contém o método .collection(collectionName).
const mockDb = {
    // Verifica se a coleção é 'users' e retorna o mock da coleção.
    collection: jest.fn((name) => {
        if (name === 'users') {
            return mockCollection;
        }
        throw new Error(`Collection mock not found for: ${name}`);
    })
};

// 6. Objeto Mock Final (o módulo que será exportado)
// Contém o método getDb().
const mockMongodb = {
    // Retorna a instância do DB mock.
    getDb: jest.fn(() => mockDb)
};

module.exports = mockMongodb;