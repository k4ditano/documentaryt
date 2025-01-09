import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config({ path: '.env.test' });

// Configurar base de datos de prueba
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
});

// Función para inicializar la base de datos de prueba
export const initTestDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('Error al inicializar la base de datos de prueba:', error);
    throw error;
  }
};

// Función para limpiar la base de datos después de las pruebas
export const cleanTestDB = async () => {
  try {
    await sequelize.close();
  } catch (error) {
    console.error('Error al cerrar la base de datos de prueba:', error);
    throw error;
  }
};

// Configurar variables de entorno para pruebas
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRE = '1h';
process.env.NODE_ENV = 'test'; 