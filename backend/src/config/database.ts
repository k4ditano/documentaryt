import { Sequelize, Options } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Asegurarnos de que estamos en un entorno ES module
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || join(__dirname, '../../database.sqlite');

const config: Options = {
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development',
  define: {
    timestamps: true,
    underscored: true
  }
};

const sequelize = new Sequelize(config);

export default sequelize; 