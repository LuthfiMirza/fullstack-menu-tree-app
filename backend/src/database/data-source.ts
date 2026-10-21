import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { Menu } from '../menus/menu.entity';
import { CreateMenusTable1700000000000 } from './migrations/1700000000000-CreateMenusTable';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'menu_user',
  password: process.env.DB_PASSWORD || 'change_me',
  database: process.env.DB_NAME || 'menu_db',
  entities: [Menu],
  migrations: [CreateMenusTable1700000000000],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
