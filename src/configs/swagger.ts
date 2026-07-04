import swaggerJsDoc, { type Options } from 'swagger-jsdoc'

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Welcome to TA Project Documentations',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },

  apis: ['./src/docs/*.ts']
}

const swaggerSpec = swaggerJsDoc(options)

export default swaggerSpec
