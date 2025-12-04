// jest.config.js

module.exports = {
  // ... outras configurações ...
  
  moduleNameMapper: {
    // ESTA É A CHAVE CORRETA. Note que não há barras externas (/).
    // O ponto (.) deve ser escapado (\.). A barra (/) NÃO deve ser escapada.
    '^\\.\\./config/db$': '<rootDir>/__mocks__/config/db.js',
  },
  
  // Inclua esta linha também para garantir o path base do mock:
  moduleDirectories: ['node_modules', '<rootDir>'],

  // ... outras configurações ...
};