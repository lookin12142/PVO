import { app, session, ipcMain, BrowserWindow, shell } from "electron";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
const is = {
  dev: !app.isPackaged
};
const platform = {
  isWindows: process.platform === "win32",
  isMacOS: process.platform === "darwin",
  isLinux: process.platform === "linux"
};
const electronApp = {
  setAppUserModelId(id) {
    if (platform.isWindows)
      app.setAppUserModelId(is.dev ? process.execPath : id);
  },
  setAutoLaunch(auto) {
    if (platform.isLinux)
      return false;
    const isOpenAtLogin = () => {
      return app.getLoginItemSettings().openAtLogin;
    };
    if (isOpenAtLogin() !== auto) {
      app.setLoginItemSettings({ openAtLogin: auto });
      return isOpenAtLogin() === auto;
    } else {
      return true;
    }
  },
  skipProxy() {
    return session.defaultSession.setProxy({ mode: "direct" });
  }
};
const optimizer = {
  watchWindowShortcuts(window, shortcutOptions) {
    if (!window)
      return;
    const { webContents } = window;
    const { escToCloseWindow = false, zoom = false } = shortcutOptions || {};
    webContents.on("before-input-event", (event, input) => {
      if (input.type === "keyDown") {
        if (!is.dev) {
          if (input.code === "KeyR" && (input.control || input.meta))
            event.preventDefault();
          if (input.code === "KeyI" && (input.alt && input.meta || input.control && input.shift)) {
            event.preventDefault();
          }
        } else {
          if (input.code === "F12") {
            if (webContents.isDevToolsOpened()) {
              webContents.closeDevTools();
            } else {
              webContents.openDevTools({ mode: "undocked" });
              console.log("Open dev tool...");
            }
          }
        }
        if (escToCloseWindow) {
          if (input.code === "Escape" && input.key !== "Process") {
            window.close();
            event.preventDefault();
          }
        }
        if (!zoom) {
          if (input.code === "Minus" && (input.control || input.meta))
            event.preventDefault();
          if (input.code === "Equal" && input.shift && (input.control || input.meta))
            event.preventDefault();
        }
      }
    });
  },
  registerFramelessWindowIpc() {
    ipcMain.on("win:invoke", (event, action) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) {
        if (action === "show") {
          win.show();
        } else if (action === "showInactive") {
          win.showInactive();
        } else if (action === "min") {
          win.minimize();
        } else if (action === "max") {
          const isMaximized = win.isMaximized();
          if (isMaximized) {
            win.unmaximize();
          } else {
            win.maximize();
          }
        } else if (action === "close") {
          win.close();
        }
      }
    });
  }
};
const DATABASE_CONFIG = {
  // Ruta donde se almacenará la base de datos SQLite
  getDatabasePath: () => {
    const userDataPath = app.getPath("userData");
    return join(userDataPath, "database.db");
  },
  // URL de conexión para Prisma
  getDatabaseUrl: () => {
    const dbPath = DATABASE_CONFIG.getDatabasePath();
    return `file:${dbPath}`;
  },
  // Configuración de timeouts
  timeouts: {
    connection: 5e3,
    // 5 segundos
    query: 1e4
    // 10 segundos
  }
};
const DB_ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || DATABASE_CONFIG.getDatabaseUrl(),
  ENABLE_QUERY_LOG: process.env.ENABLE_QUERY_LOG === "true"
};
function getPrismaConfig() {
  const isDevelopment2 = DB_ENV.NODE_ENV === "development";
  return {
    log: DB_ENV.ENABLE_QUERY_LOG || isDevelopment2 ? ["query", "info", "warn", "error"] : ["error"],
    errorFormat: "pretty"
  };
}
class DatabaseConnection {
  static instance;
  _prisma = null;
  _isConnected = false;
  // Constructor privado para evitar instanciación directa
  constructor() {
  }
  // Método para obtener la instancia única
  static getInstance() {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
  // Getter para el cliente Prisma
  get prisma() {
    if (!this._prisma) {
      const config = getPrismaConfig();
      this._prisma = new PrismaClient({
        log: config.log.slice(),
        errorFormat: config.errorFormat,
        // Configurar la URL de la base de datos dinámicamente
        datasources: {
          db: {
            url: DATABASE_CONFIG.getDatabaseUrl()
          }
        }
      });
      console.log(`📁 Base de datos ubicada en: ${DATABASE_CONFIG.getDatabasePath()}`);
    }
    return this._prisma;
  }
  // Verificar si está conectado
  get isConnected() {
    return this._isConnected;
  }
  // Inicializar la conexión
  async connect() {
    if (this._isConnected) {
      console.log("ℹ️ Base de datos ya conectada");
      return;
    }
    try {
      await Promise.race([
        this.prisma.$connect(),
        new Promise(
          (_, reject) => setTimeout(
            () => reject(new Error("Database connection timeout")),
            DATABASE_CONFIG.timeouts.connection
          )
        )
      ]);
      this._isConnected = true;
      console.log("✅ Base de datos conectada correctamente");
    } catch (error) {
      this._isConnected = false;
      console.error("❌ Error conectando a la base de datos:", error);
      throw error;
    }
  }
  // Cerrar la conexión
  async disconnect() {
    if (!this._isConnected || !this._prisma) {
      return;
    }
    try {
      await this._prisma.$disconnect();
      this._isConnected = false;
      console.log("✅ Conexión a base de datos cerrada correctamente");
    } catch (error) {
      console.error("❌ Error cerrando la conexión a la base de datos:", error);
      throw error;
    }
  }
  // Verificar el estado de la conexión
  async checkHealth() {
    if (!this._isConnected || !this._prisma) {
      return false;
    }
    try {
      await Promise.race([
        this._prisma.$queryRaw`SELECT 1`,
        new Promise(
          (_, reject) => setTimeout(
            () => reject(new Error("Health check timeout")),
            DATABASE_CONFIG.timeouts.query
          )
        )
      ]);
      return true;
    } catch (error) {
      console.error("❌ Base de datos no disponible:", error);
      this._isConnected = false;
      return false;
    }
  }
  // Reiniciar la conexión si es necesario
  async reconnect() {
    console.log("🔄 Intentando reconectar a la base de datos...");
    await this.disconnect();
    await this.connect();
  }
  // Obtener información de configuración
  getInfo() {
    return {
      isConnected: this._isConnected,
      databasePath: DATABASE_CONFIG.getDatabasePath(),
      databaseUrl: DATABASE_CONFIG.getDatabaseUrl(),
      timeouts: DATABASE_CONFIG.timeouts
    };
  }
}
const dbConnection = DatabaseConnection.getInstance();
const prisma = dbConnection.prisma;
const initializeDatabase = () => dbConnection.connect();
process.on("beforeExit", async () => {
  await dbConnection.disconnect();
});
process.on("SIGINT", async () => {
  await dbConnection.disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await dbConnection.disconnect();
  process.exit(0);
});
class ProductService {
  // ==================== PRODUCTOS ====================
  // Obtener todos los productos con sus precios por categoría
  static async obtenerTodos() {
    try {
      return await prisma.product.findMany({
        include: {
          categoryPrices: {
            include: {
              category: true
            }
          }
        },
        orderBy: { name: "asc" }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error obteniendo productos: ${message}`);
    }
  }
  // Buscar productos por nombre o descripción
  static async buscar(termino) {
    try {
      return await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: termino } },
            { description: { contains: termino } }
          ]
        },
        include: {
          categoryPrices: {
            include: {
              category: true
            }
          }
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error buscando productos: ${message}`);
    }
  }
  // Obtener producto por ID
  static async obtenerPorId(id) {
    try {
      return await prisma.product.findUnique({
        where: { id },
        include: {
          categoryPrices: {
            include: {
              category: true
            }
          }
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error obteniendo producto por ID: ${message}`);
    }
  }
  // Crear nuevo producto
  static async crear(datos) {
    try {
      return await prisma.product.create({
        data: {
          name: datos.name,
          description: datos.description
        },
        include: {
          categoryPrices: {
            include: {
              category: true
            }
          }
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error creando producto: ${message}`);
    }
  }
  // Actualizar producto
  static async actualizar(id, datos) {
    try {
      return await prisma.product.update({
        where: { id },
        data: datos,
        include: {
          categoryPrices: {
            include: {
              category: true
            }
          }
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error actualizando producto: ${message}`);
    }
  }
  // Eliminar producto (también elimina los precios asociados por CASCADE)
  static async eliminar(id) {
    try {
      return await prisma.product.delete({
        where: { id }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error eliminando producto: ${message}`);
    }
  }
  // ==================== CATEGORÍAS ====================
  // Obtener todas las categorías
  static async obtenerCategorias() {
    try {
      return await prisma.category.findMany({
        orderBy: { name: "asc" }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error obteniendo categorías: ${message}`);
    }
  }
  // Crear nueva categoría
  static async crearCategoria(datos) {
    try {
      return await prisma.category.create({
        data: {
          name: datos.name,
          description: datos.description
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error creando categoría: ${message}`);
    }
  }
  // ==================== PRECIOS POR CATEGORÍA ====================
  // Asignar producto a categoría con precio
  static async asignarPrecioCategoria(datos) {
    try {
      let margin = null;
      if (datos.cost && datos.cost > 0) {
        margin = (datos.price - datos.cost) / datos.cost * 100;
      }
      return await prisma.categoryPrice.create({
        data: {
          productId: datos.productId,
          categoryId: datos.categoryId,
          price: datos.price,
          cost: datos.cost,
          margin
        },
        include: {
          product: true,
          category: true
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error asignando precio a categoría: ${message}`);
    }
  }
  // Actualizar precio de producto en categoría específica
  static async actualizarPrecioCategoria(id, datos) {
    try {
      const updateData = { ...datos };
      if (datos.price !== void 0 || datos.cost !== void 0) {
        const current = await prisma.categoryPrice.findUnique({ where: { id } });
        if (current) {
          const newPrice = datos.price ?? Number(current.price);
          const newCost = datos.cost ?? (current.cost ? Number(current.cost) : 0);
          if (newCost > 0) {
            updateData.margin = (newPrice - newCost) / newCost * 100;
          }
        }
      }
      return await prisma.categoryPrice.update({
        where: { id },
        data: updateData,
        include: {
          product: true,
          category: true
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error actualizando precio de categoría: ${message}`);
    }
  }
  // Obtener precios de un producto en todas sus categorías
  static async obtenerPreciosProducto(productId) {
    try {
      return await prisma.categoryPrice.findMany({
        where: {
          productId
        },
        include: {
          category: true
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error obteniendo precios del producto: ${message}`);
    }
  }
  // Obtener productos de una categoría específica
  static async obtenerProductosPorCategoria(categoryId) {
    try {
      return await prisma.categoryPrice.findMany({
        where: {
          categoryId
        },
        include: {
          product: true
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error obteniendo productos por categoría: ${message}`);
    }
  }
  // Eliminar precio en categoría (hard delete)
  static async eliminarPrecioCategoria(id) {
    try {
      return await prisma.categoryPrice.delete({
        where: { id }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error eliminando precio de categoría: ${message}`);
    }
  }
  // ==================== HISTORIAL DE PRECIOS ====================
  // Registrar cambio de precio en historial
  static async registrarCambioPrecio(productId, categoryId, oldPrice, newPrice, reason, changedBy) {
    try {
      return await prisma.priceHistory.create({
        data: {
          productId,
          categoryId,
          oldPrice,
          newPrice,
          reason,
          changedBy
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error registrando historial de precio: ${message}`);
    }
  }
  // Obtener historial de precios de un producto
  static async obtenerHistorialPrecios(productId, categoryId) {
    try {
      const where = { productId };
      if (categoryId) where.categoryId = categoryId;
      return await prisma.priceHistory.findMany({
        where,
        orderBy: { changedAt: "desc" }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error obteniendo historial de precios: ${message}`);
    }
  }
}
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? {} : {},
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}
function setupIPCHandlers() {
  ipcMain.handle("productos:obtener", async () => {
    try {
      const productos = await ProductService.obtenerTodos();
      return { success: true, data: productos };
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  ipcMain.handle("productos:buscar", async (_, termino) => {
    try {
      const productos = await ProductService.buscar(termino);
      return { success: true, data: productos };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  ipcMain.handle("productos:obtenerPorId", async (_, id) => {
    try {
      const producto = await ProductService.obtenerPorId(id);
      return { success: true, data: producto };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  ipcMain.handle("productos:crear", async (_, datos) => {
    try {
      const producto = await ProductService.crear(datos);
      return { success: true, data: producto };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  ipcMain.handle("productos:actualizar", async (_, id, datos) => {
    try {
      const producto = await ProductService.actualizar(id, datos);
      return { success: true, data: producto };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  ipcMain.handle("productos:eliminar", async (_, id) => {
    try {
      await ProductService.eliminar(id);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  ipcMain.handle("categorias:obtener", async () => {
    try {
      const categorias = await ProductService.obtenerCategorias();
      return { success: true, data: categorias };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  ipcMain.handle("categorias:crear", async (_, datos) => {
    try {
      const categoria = await ProductService.crearCategoria(datos);
      return { success: true, data: categoria };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  ipcMain.handle("precios:asignar", async (_, datos) => {
    try {
      const precio = await ProductService.asignarPrecioCategoria(datos);
      return { success: true, data: precio };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  ipcMain.handle("precios:actualizar", async (_, id, datos) => {
    try {
      const precio = await ProductService.actualizarPrecioCategoria(id, datos);
      return { success: true, data: precio };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  ipcMain.handle("precios:obtenerPorProducto", async (_, productId) => {
    try {
      const precios = await ProductService.obtenerPreciosProducto(productId);
      return { success: true, data: precios };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  ipcMain.handle("precios:obtenerPorCategoria", async (_, categoryId) => {
    try {
      const productos = await ProductService.obtenerProductosPorCategoria(categoryId);
      return { success: true, data: productos };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  ipcMain.handle("precios:eliminar", async (_, id) => {
    try {
      await ProductService.eliminarPrecioCategoria(id);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  ipcMain.handle("historial:registrar", async (_, datos) => {
    try {
      const historial = await ProductService.registrarCambioPrecio(
        datos.productId,
        datos.categoryId,
        datos.oldPrice,
        datos.newPrice,
        datos.reason,
        datos.changedBy
      );
      return { success: true, data: historial };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
  ipcMain.handle("historial:obtener", async (_, productId, categoryId) => {
    try {
      const historial = await ProductService.obtenerHistorialPrecios(productId, categoryId);
      return { success: true, data: historial };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });
}
app.whenReady().then(async () => {
  electronApp.setAppUserModelId("com.electron");
  try {
    await initializeDatabase();
    console.log("✅ Base de datos inicializada correctamente");
  } catch (error) {
    console.error("❌ Error inicializando base de datos:", error);
    app.quit();
  }
  setupIPCHandlers();
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
  createWindow();
  app.on("activate", function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
