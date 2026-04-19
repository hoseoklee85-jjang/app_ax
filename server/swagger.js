const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Storefront & Admin API',
      version: '1.0.0',
      description: 'API 명세서 및 테스트 화면 (Swagger UI)',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local API Server',
      },
    ],
  },
  apis: ['./routes/*.js'], // 주석이 있는 모든 라우트 파일
};

const specs = swaggerJsdoc(options);

module.exports = specs;
