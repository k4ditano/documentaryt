declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      DB_PATH?: string;
      JWT_SECRET?: string;
    }
  }
}

export {}; 