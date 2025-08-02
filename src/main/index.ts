import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initializeDatabase } from './database/connection'
import { ProductService } from './services/ProductService'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({ 
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? {  } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function setupIPCHandlers() {
  // ==================== PRODUCTOS ====================
  
  ipcMain.handle('productos:obtener', async () => {
    try {
      const productos = await ProductService.obtenerTodos()
      return { success: true, data: productos }
    } catch (error) {
      console.error('Error obteniendo productos:', error)
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('productos:buscar', async (_, termino: string) => {
    try {
      const productos = await ProductService.buscar(termino)
      return { success: true, data: productos }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('productos:obtenerPorId', async (_, id: string) => {
    try {
      const producto = await ProductService.obtenerPorId(id)
      return { success: true, data: producto }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('productos:crear', async (_, datos) => {
    try {
      const producto = await ProductService.crear(datos)
      return { success: true, data: producto }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('productos:actualizar', async (_, id: string, datos) => {
    try {
      const producto = await ProductService.actualizar(id, datos)
      return { success: true, data: producto }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('productos:eliminar', async (_, id: string) => {
    try {
      await ProductService.eliminar(id)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  })

  // ==================== CATEGORÍAS ====================
  
  ipcMain.handle('categorias:obtener', async () => {
    try {
      const categorias = await ProductService.obtenerCategorias()
      return { success: true, data: categorias }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('categorias:crear', async (_, datos) => {
    try {
      const categoria = await ProductService.crearCategoria(datos)
      return { success: true, data: categoria }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  })

  // ==================== PRECIOS POR CATEGORÍA ====================
  
  ipcMain.handle('precios:asignar', async (_, datos) => {
    try {
      const precio = await ProductService.asignarPrecioCategoria(datos)
      return { success: true, data: precio }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('precios:actualizar', async (_, id: string, datos) => {
    try {
      const precio = await ProductService.actualizarPrecioCategoria(id, datos)
      return { success: true, data: precio }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('precios:obtenerPorProducto', async (_, productId: string) => {
    try {
      const precios = await ProductService.obtenerPreciosProducto(productId)
      return { success: true, data: precios }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('precios:obtenerPorCategoria', async (_, categoryId: string) => {
    try {
      const productos = await ProductService.obtenerProductosPorCategoria(categoryId)
      return { success: true, data: productos }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('precios:eliminar', async (_, id: string) => {
    try {
      await ProductService.eliminarPrecioCategoria(id)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  })

  // ==================== HISTORIAL DE PRECIOS ====================
  
  ipcMain.handle('historial:registrar', async (_, datos) => {
    try {
      const historial = await ProductService.registrarCambioPrecio(
        datos.productId,
        datos.categoryId,
        datos.oldPrice,
        datos.newPrice,
        datos.reason,
        datos.changedBy
      )
      return { success: true, data: historial }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  })

  ipcMain.handle('historial:obtener', async (_, productId: string, categoryId?: string) => {
    try {
      const historial = await ProductService.obtenerHistorialPrecios(productId, categoryId)
      return { success: true, data: historial }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  })
}

app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Initialize database
  try {
    await initializeDatabase()
    console.log('✅ Base de datos inicializada correctamente')
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error)
    // Opcional: puedes decidir si continuar o cerrar la app
    app.quit()
  }

  // Setup IPC handlers
  setupIPCHandlers()
  
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Solo manejar el cierre de ventanas, NO de la base de datos
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})