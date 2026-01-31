export const AuthLoginSchema = {
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string', minLength: 1 },
      password: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            username: { type: 'string' },
          },
          required: ['id', 'username'],
        },
      },
      required: ['token', 'user'],
    },
    401: {
      type: 'object',
      properties: {
        error: { type: 'string', const: 'unauthorized' },
      },
      required: ['error'],
    },
  },
} as const;
