import { useState, useEffect } from 'react'
import type { Producto, CarritoItem } from '../components/types/global'

function App() {
  const [currentPage, setCurrentPage] = useState('pos')

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Mi POS System</h1>
        </div>
        <nav className="mt-4">
          <button
            onClick={() => setCurrentPage('pos')}
            className={`w-full text-left px-4 py-3 hover:bg-blue-50 ${
              currentPage === 'pos' ? 'bg-blue-100 border-r-2 border-blue-500' : ''
            }`}
          >
            🛒 Punto de Venta
          </button>
          <button
            onClick={() => setCurrentPage('inventory')}
            className={`w-full text-left px-4 py-3 hover:bg-blue-50 ${
              currentPage === 'inventory' ? 'bg-blue-100 border-r-2 border-blue-500' : ''
            }`}
          >
            📦 Inventario
          </button>
          <button
            onClick={() => setCurrentPage('reports')}
            className={`w-full text-left px-4 py-3 hover:bg-blue-50 ${
              currentPage === 'reports' ? 'bg-blue-100 border-r-2 border-blue-500' : ''
            }`}
          >
            📊 Reportes
          </button>
          <button
            onClick={() => setCurrentPage('settings')}
            className={`w-full text-left px-4 py-3 hover:bg-blue-50 ${
              currentPage === 'settings' ? 'bg-blue-100 border-r-2 border-blue-500' : ''
            }`}
          >
            ⚙️ Configuración
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {currentPage === 'pos' && 'Punto de Venta'}
              {currentPage === 'inventory' && 'Gestión de Inventario'}
              {currentPage === 'reports' && 'Reportes de Ventas'}
              {currentPage === 'settings' && 'Configuración'}
            </h2>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('es-ES')}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {currentPage === 'pos' && <POSPage />}
          {currentPage === 'inventory' && <InventoryPage />}
          {currentPage === 'reports' && <ReportsPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  )
}

// Componentes temporales de páginas
function POSPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [carrito, setCarrito] = useState<CarritoItem[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    try {
      const response = await window.api.productos.obtener()
      if (response.success) {
        setProductos(response.data)
      } else {
        console.error('Error cargando productos:', response.error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const agregarAlCarrito = (producto: Producto) => {
    const itemExistente = carrito.find(item => item.id === producto.id)
    if (itemExistente) {
      setCarrito(carrito.map(item => 
        item.id === producto.id 
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }])
    }
  }

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)

  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      {/* Productos */}
      <div className="col-span-2 bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Productos</h3>
          {loading && <p className="text-sm text-gray-500">Cargando productos...</p>}
        </div>
        <div className="p-4 grid grid-cols-4 gap-4 max-h-96 overflow-y-auto">
          {productos.map((producto) => (
            <div
              key={producto.id}
              onClick={() => agregarAlCarrito(producto)}
              className="bg-gray-50 p-4 rounded-lg border cursor-pointer hover:bg-blue-50 transition-colors"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <p className="font-medium text-sm">{producto.nombre}</p>
                <p className="text-blue-600 font-bold">${producto.precio.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Stock: {producto.stock}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carrito */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Carrito de Compras</h3>
        </div>
        <div className="p-4">
          {carrito.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No hay productos en el carrito</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {carrito.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.nombre}</p>
                    <p className="text-xs text-gray-500">${item.precio.toFixed(2)} x {item.cantidad}</p>
                  </div>
                  <p className="font-bold">${(item.precio * item.cantidad).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Impuestos:</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button 
              className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={carrito.length === 0}
            >
              Procesar Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InventoryPage() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Lista de Productos</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Nuevo Producto
        </button>
      </div>
      <div className="text-center py-12 text-gray-500">
        <p>Próximamente: Gestión de inventario completa</p>
      </div>
    </div>
  )
}

function ReportsPage() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6">Reportes de Ventas</h3>
      <div className="text-center py-12 text-gray-500">
        <p>Próximamente: Reportes y estadísticas</p>
      </div>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6">Configuración del Sistema</h3>
      <div className="text-center py-12 text-gray-500">
        <p>Próximamente: Configuración de empresa, impuestos, etc.</p>
      </div>
    </div>
  )
}

export default App