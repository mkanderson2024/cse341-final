jest.mock('../config/db');
const userController = require('../controllers/userController');
const mongodb = require("../config/db");
const { ObjectId } = require('mongodb');

const mockUsers = [
{
_id: new ObjectId("656b8566a01b63777083049b"), 
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

const mockResponse = () => {
 const res = {};
 res.status = jest.fn().mockReturnValue(res);
 res.json = jest.fn().mockReturnValue(res);
 return res;
};

// Objeto de requisição (req) simples, pois não usamos o body/params em getAllUsers
const mockRequest = {};

// IDs Fictícios para teste
const VALID_ID = "656b8566a01b63777083049b"; 
const NON_EXISTENT_ID = "000000000000000000000000"; 
const INVALID_FORMAT_ID = "12345"; 

//================================================================================
// getAllUsers: SUCESSO E ERRO 500
//================================================================================
describe('getAllUsers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test('deve retornar status 200 e todos os usuários', async () => {
        const req = mockRequest; const res = mockResponse();
        await userController.getAllUsers(req, res);
        expect(mongodb.getDb).toHaveBeenCalled();
        expect(mongodb.getDb().collection).toHaveBeenCalledWith('users');
        expect(res.status).toHaveBeenCalledWith(200);
        // Asserção ajustada para o objeto completo (conforme correção anterior)
        expect(res.json).toHaveBeenCalledWith(expect.arrayContaining(mockUsers));});
    
    // Teste de Erro de Servidor (Status 500)
    test('deve retornar status 500 em caso de falha no DB', async () => {
        const req = mockRequest;
        const res = mockResponse();
        const errorMessage = 'Simulated DB connection error';

        // Faz o toArray() rejeitar a Promise
        mongodb.getDb().collection('users').find().toArray.mockRejectedValue(new Error(errorMessage));

        await userController.getAllUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
            message: "Failed to fetch all users!", 
            error: errorMessage 
        });
        
        // Restaura a função original do mock
        mongodb.getDb().collection('users').find().toArray.mockRestore(); 
    });
});

//================================================================================
// getUserById: SUCESSO, 400 (FORMATO), 404 (NÃO ENCONTRADO), 500 (ERRO DB)
//================================================================================
describe('getUserById', () => {
    
    beforeEach(() => {jest.clearAllMocks();});
    
    // Sucesso (200 OK)
    test('deve retornar status 200 e o usuário se o ID for válido e encontrado', async () => {
        const req = { params: { userId: VALID_ID } };
        const res = mockResponse();
        
        await userController.getUserById(req, res);
        
        expect(mongodb.getDb().collection('users').findOne).toHaveBeenCalledWith(
            { _id: new ObjectId(VALID_ID) }
        );
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUsers[0]); // Pega o primeiro usuário do array mock
    });

    // Falha de Validação (400 Bad Request)
    test('deve retornar status 400 se o ID for inválido (formato)', async () => {
        const req = { params: { userId: INVALID_FORMAT_ID } };
        const res = mockResponse();
        
        await userController.getUserById(req, res);
        
        // O DB não deve ser chamado
        expect(mongodb.getDb().collection('users').findOne).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid user ID format!" });
    });

    // Falha de Busca (404 Not Found)
    test('deve retornar status 404 se o ID for válido mas não encontrado', async () => {
        const req = { params: { userId: NON_EXISTENT_ID } };
        const res = mockResponse();
        
        await userController.getUserById(req, res);
        
        expect(mongodb.getDb().collection('users').findOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found!" });
    });

    // Falha de Servidor (500 Internal Server Error)
    test('deve retornar status 500 em caso de falha no DB', async () => {
        const req = { params: { userId: VALID_ID } };
        const res = mockResponse();
        const errorMessage = 'Internal DB Error';
        
        // Faz o findOne rejeitar a Promise
        mongodb.getDb().collection('users').findOne.mockRejectedValue(new Error(errorMessage));

        await userController.getUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Failed to fetch user by Id", error: errorMessage });
        
        mongodb.getDb().collection('users').findOne.mockRestore();
    });
});

//================================================================================
// createUser: SUCESSO, 400 (FALTA CAMPO), 500 (ERRO DB)
//================================================================================
describe('createUser', () => {
    
    beforeEach(() => { jest.clearAllMocks();});
    
    const validUserData = {
        type: 'seller',
        email: 'newuser@test.com',
        phone: '11900000000',
        address: 'Rua teste',
        password: 'password123'
    };
    
    const newMockId = new ObjectId();

    // Sucesso (201 Created)
    test('deve retornar status 201 e o ID do novo usuário em caso de sucesso', async () => {
        const req = { body: validUserData };
        const res = mockResponse();
        
        // Configura o mock para retornar sucesso (acknowledged: true)
        mongodb.getDb().collection('users').insertOne.mockResolvedValue({ 
            acknowledged: true, 
            insertedId: newMockId 
        });

        await userController.createUser(req, res);

        // Verifica se o insertOne foi chamado com os dados corretos (excluindo createdAt/updatedAt)
        expect(mongodb.getDb().collection('users').insertOne).toHaveBeenCalledWith(
            expect.objectContaining({ email: validUserData.email, type: validUserData.type })
        );
        
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ 
            message: "New user created successfuly!", 
            userId: newMockId 
        });
        
        mongodb.getDb().collection('users').insertOne.mockRestore();
    });

    // Falha de Validação (400 Bad Request)
    test('deve retornar status 400 se faltar um campo obrigatório (password)', async () => {
        // Simula a falta do campo 'password'
        const req = { body: { email: 'fail@test.com', type: 'buyer' } };
        const res = mockResponse();

        await userController.createUser(req, res);

        // O DB não deve ser chamado
        expect(mongodb.getDb().collection('users').insertOne).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Some Required fields missing: email, password or type" });
    });

    // Falha de Servidor (500 Internal Server Error)
    test('deve retornar status 500 se houver falha na inserção do DB', async () => {
        const req = { body: validUserData };
        const res = mockResponse();
        const errorMessage = 'Insertion failed due to DB lock';

        // Faz o insertOne FALHAR (rejeita a Promise)
        mongodb.getDb().collection('users').insertOne.mockRejectedValue(new Error(errorMessage));

        await userController.createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
            message: "Failed to create a new user", 
            error: errorMessage 
        });

        mongodb.getDb().collection('users').insertOne.mockRestore(); 
    });
});

// userController.test.js (Adicione este bloco no final do arquivo)

//================================================================================
// updateUser: SUCESSO, 400 (FORMATO), 404 (NÃO ENCONTRADO), 500 (ERRO DB)
//================================================================================
describe('updateUser', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const updateBody = {
        type: 'seller',
        email: 'alice.updated@example.com',
        phone: '11911112222',
        address: 'Rua Principal, 500',
        password: 'new_hashed_password'
    };
    
    // Sucesso (200 OK)
    test('deve retornar status 200 e mensagem de sucesso ao atualizar o usuário', async () => {
        const req = { params: { userId: VALID_ID }, body: updateBody };
        const res = mockResponse();

        // Configura o mockDB para simular uma atualização bem-sucedida
        mongodb.getDb().collection('users').replaceOne.mockResolvedValue({ 
            matchedCount: 1, // Indica que 1 documento foi encontrado e substituído
            modifiedCount: 1 
        });

        await userController.updateUser(req, res);

        // Verifica se a função replaceOne foi chamada com o ID e os dados corretos
        expect(mongodb.getDb().collection('users').replaceOne).toHaveBeenCalledWith(
            { _id: new ObjectId(VALID_ID) },
            expect.objectContaining({ email: updateBody.email, type: updateBody.type })
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'User updated successfully!' });

        mongodb.getDb().collection('users').replaceOne.mockRestore();
    });

    // Falha de Validação (400 Bad Request)
    test('deve retornar status 400 se o ID do usuário for inválido (formato)', async () => {
        const req = { params: { userId: INVALID_FORMAT_ID }, body: updateBody };
        const res = mockResponse();
        
        await userController.updateUser(req, res);
        
        // O DB não deve ser chamado
        expect(mongodb.getDb().collection('users').replaceOne).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID format' });
    });

    // Falha de Busca (404 Not Found)
    test('deve retornar status 404 se o ID for válido mas não for encontrado no DB', async () => {
        const req = { params: { userId: NON_EXISTENT_ID }, body: updateBody };
        const res = mockResponse();

        // Configura o mockDB para simular que nenhum documento foi encontrado
        mongodb.getDb().collection('users').replaceOne.mockResolvedValue({ 
            matchedCount: 0, 
            modifiedCount: 0 
        });
        
        await userController.updateUser(req, res);
        
        // O replaceOne deve ser chamado
        expect(mongodb.getDb().collection('users').replaceOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found!' });

        mongodb.getDb().collection('users').replaceOne.mockRestore();
    });

    // Falha de Servidor (500 Internal Server Error)
    test('deve retornar status 500 em caso de falha no DB', async () => {
        const req = { params: { userId: VALID_ID }, body: updateBody };
        const res = mockResponse();
        const errorMessage = 'DB Error during replacement';

        // Faz o replaceOne rejeitar a Promise
        mongodb.getDb().collection('users').replaceOne.mockRejectedValue(new Error(errorMessage));

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
            message: 'Failed to update user!', 
            error: errorMessage 
        });

        mongodb.getDb().collection('users').replaceOne.mockRestore();
    });
});
// userController.test.js (Adicione este bloco no final do arquivo)

//================================================================================
// deleteUser: SUCESSO, 400, 404, 500
//================================================================================
describe('deleteUser', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Sucesso (200 OK)
    test('deve retornar status 200 e mensagem de sucesso ao deletar o usuário', async () => {
        const req = { params: { userId: VALID_ID } };
        const res = mockResponse();

        // Configura o mockDB para simular uma exclusão bem-sucedida
        mongodb.getDb().collection('users').deleteOne.mockResolvedValue({ 
            deletedCount: 1 // Indica que 1 documento foi excluído
        });

        await userController.deleteUser(req, res);

        // Verifica se a função deleteOne foi chamada com o ID correto
        expect(mongodb.getDb().collection('users').deleteOne).toHaveBeenCalledWith(
            { _id: new ObjectId(VALID_ID) }
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });

        mongodb.getDb().collection('users').deleteOne.mockRestore();
    });

    // Falha de Validação (400 Bad Request)
    test('deve retornar status 400 se o ID do usuário for inválido (formato)', async () => {
        const req = { params: { userId: INVALID_FORMAT_ID } };
        const res = mockResponse();
        
        await userController.deleteUser(req, res);
        
        // O DB não deve ser chamado
        expect(mongodb.getDb().collection('users').deleteOne).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID format' });
    });

    // Falha de Busca (404 Not Found)
    test('deve retornar status 404 se o ID for válido mas não for encontrado no DB', async () => {
        const req = { params: { userId: NON_EXISTENT_ID } };
        const res = mockResponse();

        // Configura o mockDB para simular que nenhum documento foi excluído
        mongodb.getDb().collection('users').deleteOne.mockResolvedValue({ 
            deletedCount: 0 
        });
        
        await userController.deleteUser(req, res);
        
        // O deleteOne deve ser chamado
        expect(mongodb.getDb().collection('users').deleteOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });

        mongodb.getDb().collection('users').deleteOne.mockRestore();
    });

    // Falha de Servidor (500 Internal Server Error)
    test('deve retornar status 500 em caso de falha no DB', async () => {
        const req = { params: { userId: VALID_ID } };
        const res = mockResponse();
        const errorMessage = 'DB Error during deletion';

        // Faz o deleteOne rejeitar a Promise
        mongodb.getDb().collection('users').deleteOne.mockRejectedValue(new Error(errorMessage));

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
            message: 'Failed to delete user', 
            error: errorMessage 
        });

        mongodb.getDb().collection('users').deleteOne.mockRestore();
    });
});