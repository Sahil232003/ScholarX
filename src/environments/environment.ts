export const environment = {
  production: false,
  gemini: {
    apiKey: 'YOUR_GEMINI_API_KEY',
    primaryModel: 'gemini-3.6-flash',
    fallbackModel: 'gemini-3.5-flash-lite',
    apiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta'
  },
  openai: {
    apiKeys: [
      'YOUR_OPENAI_API_KEY_1',
      'YOUR_OPENAI_API_KEY_2',
      'YOUR_OPENAI_API_KEY_3',
      'YOUR_OPENAI_API_KEY_4'
    ],
    primaryModel: 'gpt-4o-mini',
    visionModel: 'gpt-4o-mini',
    apiBaseUrl: 'https://api.openai.com/v1'
  },
  supabase: {
    url: 'https://lsniafobwbqnzkzizunc.supabase.co',
    anonKey: 'sb_publishable_5IpF54JI_wZwrtgYCZ0BmA_fNDbmrQ1'
  }
};

