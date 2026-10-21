export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  database: DatabaseConfig;
  frontendOrigin: string;
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'menu_user',
    password: process.env.DB_PASSWORD || 'change_me',
    name: process.env.DB_NAME || 'menu_db',
  },
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
});
