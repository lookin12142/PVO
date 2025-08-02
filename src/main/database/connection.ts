import { PrismaClient } from '@prisma/client'
import { getPrismaConfig, DATABASE_CONFIG } from './config'

// Singleton class para PrismaClient
class DatabaseConnection {
  private static instance: DatabaseConnection
  private _prisma: PrismaClient | null = null
  private _isConnected = false

  // Constructor privado para evitar instanciación directa
  private constructor() {}

  // Método para obtener la instancia única
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection()
    }
    return DatabaseConnection.instance
  }

  // Getter para el cliente Prisma
  public get prisma(): PrismaClient {
    if (!this._prisma) {
      const config = getPrismaConfig()
      
      this._prisma = new PrismaClient({
        log: config.log.slice(),
        errorFormat: config.errorFormat,
        // Configurar la URL de la base de datos dinámicamente
        datasources: {
          db: {
            url: DATABASE_CONFIG.getDatabaseUrl()
          }
        }
      })

      console.log(`📁 Base de datos ubicada en: ${DATABASE_CONFIG.getDatabasePath()}`)
    }
    return this._prisma
  }

  // Verificar si está conectado
  public get isConnected(): boolean {
    return this._isConnected
  }

  // Inicializar la conexión
  public async connect(): Promise<void> {
    if (this._isConnected) {
      console.log('ℹ️ Base de datos ya conectada')
      return
    }

    try {
      // Verificar conexión con timeout configurado
      await Promise.race([
        this.prisma.$connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout')), 
          DATABASE_CONFIG.timeouts.connection)
        )
      ])
      
      this._isConnected = true
      console.log('✅ Base de datos conectada correctamente')
      
    } catch (error) {
      this._isConnected = false
      console.error('❌ Error conectando a la base de datos:', error)
      throw error
    }
  }

  // Cerrar la conexión
  public async disconnect(): Promise<void> {
    if (!this._isConnected || !this._prisma) {
      return
    }

    try {
      await this._prisma.$disconnect()
      this._isConnected = false
      console.log('✅ Conexión a base de datos cerrada correctamente')
    } catch (error) {
      console.error('❌ Error cerrando la conexión a la base de datos:', error)
      throw error
    }
  }

  // Verificar el estado de la conexión
  public async checkHealth(): Promise<boolean> {
    if (!this._isConnected || !this._prisma) {
      return false
    }

    try {
      // Usar timeout configurado para el health check
      await Promise.race([
        this._prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), 
          DATABASE_CONFIG.timeouts.query)
        )
      ])
      return true
    } catch (error) {
      console.error('❌ Base de datos no disponible:', error)
      this._isConnected = false
      return false
    }
  }

  // Reiniciar la conexión si es necesario
  public async reconnect(): Promise<void> {
    console.log('🔄 Intentando reconectar a la base de datos...')
    await this.disconnect()
    await this.connect()
  }

  // Obtener información de configuración
  public getInfo() {
    return {
      isConnected: this._isConnected,
      databasePath: DATABASE_CONFIG.getDatabasePath(),
      databaseUrl: DATABASE_CONFIG.getDatabaseUrl(),
      timeouts: DATABASE_CONFIG.timeouts
    }
  }
}

// Exportar instancia única
const dbConnection = DatabaseConnection.getInstance()

// Exportar el cliente Prisma (para compatibilidad con código existente)
export const prisma = dbConnection.prisma

// Exportar funciones de conveniencia
export const initializeDatabase = () => dbConnection.connect()
export const closeDatabase = () => dbConnection.disconnect()
export const checkDatabaseHealth = () => dbConnection.checkHealth()
export const reconnectDatabase = () => dbConnection.reconnect()
export const getDatabaseInfo = () => dbConnection.getInfo()

// Exportar la instancia completa si necesitas más control
export { dbConnection as database }

// Manejar cierre graceful
process.on('beforeExit', async () => {
  await dbConnection.disconnect()
})

process.on('SIGINT', async () => {
  await dbConnection.disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await dbConnection.disconnect()
  process.exit(0)
})