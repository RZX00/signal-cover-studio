export const projectSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://cover-edit.local/schema/project.schema.json',
  title: 'CoverEdit ProjectSpec',
  type: 'object',
  required: ['version', 'projectId', 'source', 'targets'],
  additionalProperties: false,
  properties: {
    version: { type: 'string', const: '1.0' },
    projectId: { type: 'string', minLength: 1 },
    locale: { type: 'string', default: 'zh-CN' },
    source: {
      type: 'object',
      required: ['title'],
      additionalProperties: false,
      properties: {
        title: { type: 'string', minLength: 1 },
        subtitle: { type: 'string', default: '' },
        summary: { type: 'string', default: '' },
        body: {
          type: 'array',
          default: [],
          items: {
            type: 'object',
            required: ['type'],
            additionalProperties: true,
            properties: {
              type: {
                type: 'string',
                enum: ['title', 'subtitle', 'lead', 'paragraph', 'quote', 'list', 'divider', 'image', 'callout', 'code']
              },
              text: { type: 'string' },
              items: { type: 'array', items: { type: 'string' } },
              tone: { type: 'string' },
              assetId: { type: 'string' },
              caption: { type: 'string' },
              language: { type: 'string' }
            }
          }
        },
        keywords: { type: 'array', default: [], items: { type: 'string' } },
        language: { type: 'string', default: 'zh-CN' }
      }
    },
    assets: {
      type: 'object',
      default: {},
      additionalProperties: false,
      properties: {
        images: {
          type: 'array',
          default: [],
          items: {
            type: 'object',
            required: ['id', 'path'],
            additionalProperties: false,
            properties: {
              id: { type: 'string' },
              path: { type: 'string' },
              role: { type: 'string' },
              alt: { type: 'string' }
            }
          }
        }
      }
    },
    style: {
      type: 'object',
      default: {},
      additionalProperties: false,
      properties: {
        theme: { type: 'string', default: '' },
        mood: { type: 'string', default: 'editorial' },
        density: { type: 'string', default: 'medium' },
        contrast: { type: 'string', default: 'high' },
        fontProfile: { type: 'string', default: '' },
        allowIllustration: { type: 'boolean', default: true },
        allowSpeechBubble: { type: 'boolean', default: false }
      }
    },
    targets: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['platform'],
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          platform: { type: 'string', enum: ['wechat-cover', 'wechat-article', 'xhs-cover', 'x-post'] },
          template: { type: 'string' },
          variant: { type: 'string', default: 'default' },
          overrides: {
            type: 'object',
            default: {},
            additionalProperties: false,
            properties: {
              title: { type: 'string' },
              subtitle: { type: 'string' },
              summary: { type: 'string' },
              theme: { type: 'string' }
            }
          },
          output: {
            type: 'object',
            default: {},
            additionalProperties: false,
            properties: {
              format: { type: 'string', enum: ['png', 'jpg', 'html', 'json'] },
              path: { type: 'string' }
            }
          },
          slug: { type: 'string' }
        }
      }
    }
  }
};
