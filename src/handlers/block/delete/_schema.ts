export const BlockDeleteSchema = {
  tags: ['block'],
  description:
    'Delete a specific block by link. User must be the owner of the block.',
  security: [{ bearer: [] }],
  params: {
    type: 'object',
    required: ['link'],
    properties: {
      link: {
        type: 'string',
        minLength: 10,
        maxLength: 10,
        description: 'Unique short identifier for direct block access',
        examples: ['abc123def4'],
      },
    },
  } as const,
  response: {
    200: {
      type: 'object',
      description: 'Block successfully deleted',
      properties: {},
    },
    401: {
      type: 'object',
      description:
        'Unauthorized access - invalid or missing authentication token',
      properties: {
        error: { type: 'string', const: 'unauthorized' },
      },
    },
    404: {
      type: 'object',
      description: 'Block not found or user has no access to it',
      properties: {
        error: { type: 'string', const: 'not_found' },
      },
    },
    500: {
      type: 'object',
      description: 'Internal server error during block deletion',
      properties: {
        error: { type: 'string', const: 'server_error' },
        message: { type: 'string' },
      },
    },
  },
} as const;
