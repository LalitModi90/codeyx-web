import { Router } from 'express';

const router = Router();

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Codeyx Profile Aggregation Service API',
    version: '1.0.0',
    description: 'Production-ready, multi-tiered developer profile aggregator with caching, retries, and circuit breakers.',
  },
  servers: [
    {
      url: 'http://localhost:5005',
      description: 'Local development server',
    },
  ],
  paths: {
    '/api/github/{username}': {
      get: {
        summary: 'Resolve GitHub profile',
        description: 'Fetches followers, public repos, total stars, languages, and pinned repos with fallback cascading.',
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'GitHub handle',
          },
          {
            name: 'refresh',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Force cache bypass and fetch live data',
          },
        ],
        responses: {
          200: {
            description: 'Successful normalized response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UnifiedResponse' },
              },
            },
          },
        },
      },
    },
    '/api/leetcode/{username}': {
      get: {
        summary: 'Resolve LeetCode profile',
        description: 'Fetches solved problems, rankings, rating, streak, and badges.',
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'LeetCode handle',
          },
          {
            name: 'refresh',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Force cache bypass and fetch live data',
          },
        ],
        responses: {
          200: {
            description: 'Successful normalized response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UnifiedResponse' },
              },
            },
          },
        },
      },
    },
    '/api/codeforces/{username}': {
      get: {
        summary: 'Resolve Codeforces profile',
        description: 'Fetches rating, max rating, global rank, and contest attendance.',
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Codeforces handle',
          },
          {
            name: 'refresh',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Force cache bypass and fetch live data',
          },
        ],
        responses: {
          200: {
            description: 'Successful normalized response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UnifiedResponse' },
              },
            },
          },
        },
      },
    },
    '/api/codechef/{username}': {
      get: {
        summary: 'Resolve CodeChef profile',
        description: 'Fetches stars, global rating, highest rating, and ranks.',
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'CodeChef handle',
          },
          {
            name: 'refresh',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Force cache bypass and fetch live data',
          },
        ],
        responses: {
          200: {
            description: 'Successful normalized response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UnifiedResponse' },
              },
            },
          },
        },
      },
    },
    '/api/hackerrank/{username}': {
      get: {
        summary: 'Resolve HackerRank profile',
        description: 'Fetches profile, badges, skills, and certifications.',
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'HackerRank handle',
          },
          {
            name: 'refresh',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Force cache bypass and fetch live data',
          },
        ],
        responses: {
          200: {
            description: 'Successful normalized response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UnifiedResponse' },
              },
            },
          },
        },
      },
    },
    '/api/atcoder/{username}': {
      get: {
        summary: 'Resolve AtCoder profile',
        description: 'Fetches rating, global ranking, and solved submissions count.',
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'AtCoder handle',
          },
          {
            name: 'refresh',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Force cache bypass and fetch live data',
          },
        ],
        responses: {
          200: {
            description: 'Successful normalized response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UnifiedResponse' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      UnifiedResponse: {
        type: 'object',
        properties: {
          platform: { type: 'string', example: 'github' },
          username: { type: 'string', example: 'octocat' },
          rating: { type: 'number', example: 1540 },
          solved: { type: 'number', example: 48 },
          rank: { type: 'string', example: 'Specialist' },
          followers: { type: 'number', example: 420 },
          stars: { type: 'number', example: 89 },
          contests: { type: 'number', example: 12 },
          metadata: {
            type: 'object',
            properties: {
              languages: { type: 'array', items: { type: 'string' } },
              badges: { type: 'array', items: { type: 'string' } },
              streak: { type: 'number', example: 14 },
              resolutionDetails: {
                type: 'object',
                properties: {
                  strategyUsed: { type: 'string', example: 'primary' },
                  timestamp: { type: 'string', example: '2026-05-26T15:00:00.000Z' },
                },
              },
            },
          },
        },
      },
    },
  },
};

router.get('/docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

router.get('/docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Codeyx Swagger Documentation</title>
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js"></script>
        <style>
          html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
          *, *:before, *:after { box-sizing: inherit; }
          body { margin:0; background: #fafafa; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script>
          window.onload = function() {
            const ui = SwaggerUIBundle({
              url: "/api/docs/swagger.json",
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              layout: "BaseLayout"
            });
            window.ui = ui;
          };
        </script>
      </body>
    </html>
  `);
});

export default router;
