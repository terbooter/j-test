import { blockTypes, ideaContentTemplates } from '../../../types/block';

const blockItem = {
  type: 'object',
  description: 'Block item with content and metadata',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      description: 'Unique block identifier',
    },
    childs: {
      type: 'integer',
      description: 'Number of child blocks',
    },
    order: {
      type: 'integer',
      description: 'Display order within parent container',
    },
    type: {
      type: 'string',
      enum: blockTypes,
      description: 'Block type defining its behavior and content structure',
    },
    link: {
      type: 'string',
      description: 'Unique short identifier for direct block access',
    },
    content: {
      oneOf: [
        {
          type: 'object',
          title: 'idea',
          description: 'Content for idea type blocks',
          properties: {
            image: {
              type: 'string',
              nullable: true,
              description: 'Optional image URL or path',
            },
            template: {
              type: 'string',
              enum: ideaContentTemplates,
              description: 'Optional template identifier for content rendering',
            },
            body: {
              type: 'string',
              description: 'Main text content of the block',
            },
          },
          required: ['body'],
        },
        {
          type: 'object',
          title: 'article',
          description: 'Content for article type blocks',
          properties: {
            title: {
              type: 'string',
              description: 'Article title',
            },
            image: {
              type: 'string',
              nullable: true,
              format: 'uuid',
              description: 'Optional image file id',
            },
            body: {
              type: 'string',
              description: 'Article content',
            },
          },
          required: ['title', 'body'],
        },
        {
          type: 'object',
          title: 'checklist',
          description: 'Content for checklist type blocks',
          properties: {
            title: {
              type: 'string',
              description: 'Checklist title',
            },
            items: {
              type: 'array',
              description: 'Checklist items',
              items: {
                type: 'object',
                properties: {
                  text: { type: 'string', description: 'Item text' },
                  completed: {
                    type: 'boolean',
                    description: 'Whether item is completed',
                  },
                },
                required: ['text', 'completed'],
              },
            },
          },
          required: ['title', 'items'],
        },
      ],
    },
  },
};

export const BlockUpdateSchema = {
  tags: ['block'],
  description: 'Update an existing block content',
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
  body: {
    type: 'object',
    required: ['content'],
    properties: {
      content: {
        oneOf: [
          {
            type: 'object',
            title: 'idea',
            description: 'Content for idea type blocks',
            properties: {
              image: {
                type: 'string',
                nullable: true,
                description: 'Optional image URL or path',
              },
              template: {
                type: 'string',
                enum: ideaContentTemplates,
                description:
                  'Optional template identifier for content rendering',
              },
              body: {
                type: 'string',
                description: 'Main text content of the block',
              },
            },
            required: ['body', 'template'],
            // Without template required, title cut for article type
            additionalProperties: false,
          },
          {
            type: 'object',
            title: 'article',
            description: 'Content for article type blocks',
            properties: {
              title: {
                type: 'string',
                description: 'Article title',
              },
              image: {
                type: 'string',
                nullable: true,
                description: 'Optional article image URL or path',
              },
              body: {
                type: 'string',
                description: 'Article content',
              },
            },
            required: ['title', 'body'],
            additionalProperties: false,
          },
          {
            type: 'object',
            title: 'checklist',
            description: 'Content for checklist type blocks',
            properties: {
              title: {
                type: 'string',
                description: 'Checklist title',
              },
              items: {
                type: 'array',
                description: 'Checklist items',
                items: {
                  type: 'object',
                  properties: {
                    text: { type: 'string', description: 'Item text' },
                    completed: {
                      type: 'boolean',
                      description: 'Whether item is completed',
                    },
                  },
                  required: ['text', 'completed'],
                },
              },
            },
            required: ['title', 'items'],
            additionalProperties: false,
          },
        ],
      },
    },
  } as const,
  response: {
    200: {
      type: 'object',
      description: 'Block updated successfully',
      properties: {
        data: blockItem,
      },
      examples: [
        {
          data: {
            id: '019895ce-a038-7ddc-9875-725eff3ad967',
            childs: 2,
            order: 1,
            type: 'idea',
            link: 'intro-block',
            content: {
              image: null,
              template: 'default',
              body: 'Updated content for my block',
            },
          },
        },
      ],
    },
    400: {
      type: 'object',
      description: 'Invalid content format for the block type',
      properties: {
        error: { type: 'string', const: 'invalid_content' },
      },
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
      description: 'Internal server error during block update',
      properties: {
        error: { type: 'string', const: 'server_error' },
        message: { type: 'string' },
      },
    },
  },
} as const;
