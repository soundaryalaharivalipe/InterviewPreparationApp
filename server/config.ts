export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    parameterPath: process.env.NODE_ENV === 'production' 
      ? '/interview-app/Production/DATABASE_URL'
      : undefined
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  }
};