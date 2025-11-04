/**
 * Swagger/OpenAPI Configuration
 */

export const getApiDocs = async () => {
  return {
    openapi: '3.0.0',
    info: {
      title: 'SWIP Dashboard API',
      version: '1.0.0',
      description: `
# SWIP Dashboard API Documentation

Complete API documentation for the SWIP (Smart Wellness Intelligence Protocol) Dashboard.

## Authentication

Most endpoints require API key authentication:

\`\`\`
x-api-key: YOUR_API_KEY
\`\`\`

## Public Endpoints

Some endpoints are public and don't require authentication:
- \`/api/public/*\` - Public data endpoints

## Rate Limiting

Rate limits apply to all endpoints:
- Public API: 60 requests/minute
- Ingest API: 60 requests/minute per IP
- Apps API: 60 requests/minute (GET), 20 requests/minute (POST)
      `.trim()
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://your-domain.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Public',
        description: 'Public endpoints (no authentication required)'
      },
      {
        name: 'Apps',
        description: 'App management endpoints'
      },
      {
        name: 'Sessions',
        description: 'Session data ingestion'
      },
      {
        name: 'API Keys',
        description: 'API key management'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for authentication'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            ok: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Error message'
            }
          }
        }
      }
    },
    paths: {
      '/api/public/apps': {
        get: {
          summary: 'Get list of apps',
          description: 'Returns a list of all registered apps with basic statistics (public endpoint)',
          tags: ['Public'],
          parameters: [
            {
              in: 'query',
              name: 'category',
              schema: { type: 'string' },
              description: 'Filter by app category'
            },
            {
              in: 'query',
              name: 'os',
              schema: { 
                type: 'string',
                enum: ['android', 'ios', 'web']
              },
              description: 'Filter by operating system'
            },
            {
              in: 'query',
              name: 'limit',
              schema: { 
                type: 'integer',
                default: 50
              },
              description: 'Maximum number of apps to return'
            }
          ],
          responses: {
            '200': {
              description: 'List of apps'
            }
          }
        }
      },
      '/api/public/apps/{id}': {
        get: {
          summary: 'Get app details',
          description: 'Returns detailed information and statistics for a specific app',
          tags: ['Public'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'App ID'
            }
          ],
          responses: {
            '200': {
              description: 'App details'
            },
            '404': {
              description: 'App not found'
            }
          }
        }
      },
      '/api/public/stats': {
        get: {
          summary: 'Get platform statistics',
          description: 'Returns public platform-wide statistics',
          tags: ['Public'],
          responses: {
            '200': {
              description: 'Platform statistics'
            }
          }
        }
      },
      '/api/swip/ingest': {
        post: {
          summary: 'Ingest wellness session data',
          description: 'Submit wellness session data for SWIP score calculation',
          tags: ['Sessions'],
          security: [{ ApiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['app_id', 'session_id', 'metrics'],
                  properties: {
                    app_id: { type: 'string' },
                    session_id: { type: 'string' },
                    metrics: {
                      type: 'object',
                      properties: {
                        hr: { type: 'array', items: { type: 'number' } },
                        rr: { type: 'array', items: { type: 'number' } },
                        hrv: {
                          type: 'object',
                          properties: {
                            sdnn: { type: 'number' },
                            rmssd: { type: 'number' }
                          }
                        },
                        emotion: { 
                          type: 'string',
                          enum: ['calm', 'focused', 'excited', 'happy', 'neutral', 'sad', 'stressed', 'anxious']
                        },
                        timestamp: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Session ingested successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean' },
                      swip_score: { type: 'number' }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Missing or invalid API key'
            },
            '400': {
              description: 'Bad request - Invalid data'
            },
            '429': {
              description: 'Rate limit exceeded'
            }
          }
        }
      },
      '/api/apps': {
        get: {
          summary: 'List user apps',
          description: 'Get all apps owned by the authenticated user',
          tags: ['Apps'],
          security: [{ ApiKeyAuth: [] }],
          responses: {
            '200': {
              description: 'List of user apps'
            }
          }
        },
        post: {
          summary: 'Create new app',
          description: 'Register a new app in the SWIP platform',
          tags: ['Apps'],
          security: [{ ApiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100 },
                    category: { type: 'string' },
                    description: { type: 'string' },
                    os: { type: 'string', enum: ['android', 'ios', 'web'] },
                    appId: { type: 'string' },
                    iconUrl: { type: 'string', format: 'uri' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'App created successfully'
            },
            '400': {
              description: 'Invalid request data'
            }
          }
        }
      }
    }
  };
};
