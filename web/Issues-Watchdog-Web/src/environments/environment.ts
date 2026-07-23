export const environment = {
  apiBaseUrl: 'http://localhost:3000/api', // Set to your backend API URL
  openRouterApiKey: '', // Set via build environment or runtime configuration
  // Base URL for the OpenRouter API (used by OpenRouterService). Can be overridden per-deploy.
  openRouterApiUrl: 'https://openrouter.ai/api/v1',
  openRouterModel: 'openai/gpt-4-turbo',
  n8nWebhookUrl: '', // Set to your n8n webhook URL for auto-fix submissions
};


