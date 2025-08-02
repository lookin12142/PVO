import { app } from 'electron'
import { join } from 'path'

// Configuración de la base de datos
export const DATABASE_CONFIG = {
  // Ruta donde se almacenará la base de datos SQLite
  getDatabasePath: () => {
    const userDataPath = app.getPath('userData')
    return join(userDataPath, 'database.db')
  },

  // URL de conexión para Prisma
  getDatabaseUrl: () => {
    const dbPath = DATABASE_CONFIG.getDatabasePath()
    return `file:${dbPath}`
  },

  // Configuración de timeouts
  timeouts: {
    connection: 5000, // 5 segundos
    query: 10000      // 10 segundos
  }
}

// Variables de entorno relacionadas con la base de datos
export const DB_ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || DATABASE_CONFIG.getDatabaseUrl(),
  ENABLE_QUERY_LOG: process.env.ENABLE_QUERY_LOG === 'true'
}

// Función para obtener la configuración de Prisma según el entorno
export function getPrismaConfig() {
  const isDevelopment = DB_ENV.NODE_ENV === 'development'
  
  return {
    log: DB_ENV.ENABLE_QUERY_LOG || isDevelopment 
      ? ['query', 'info', 'warn', 'error'] as const
      : ['error'] as const,
    errorFormat: 'pretty' as const
  }
}

// Función para verificar si estamos en modo desarrollo
export const isDevelopment = () => DB_ENV.NODE_ENV === 'development'