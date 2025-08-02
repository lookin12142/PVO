
export interface Producto {
    id: string
    codigo: string
    nombre: string
    descripcion?: string
    precio: number
    costo: number
    stock: number
    stockMin: number
    imagen?: string
    activo: boolean
    createdAt: Date
    updatedAt: Date
    categoria?: Categoria
  }
  
  export interface Categoria {
    id: string
    nombre: string
    color: string
    activo: boolean
    createdAt: Date
  }
  
  export interface CarritoItem extends Producto {
    cantidad: number
  }
  
  // Extender el objeto window para incluir nuestras APIs
  declare global {
    interface Window {
      api: {
        productos: {
          obtener: () => Promise<{ success: boolean; data: Producto[]; error?: string }>
          buscar: (termino: string) => Promise<{ success: boolean; data: Producto[]; error?: string }>
          obtenerPorCodigo: (codigo: string) => Promise<{ success: boolean; data: Producto; error?: string }>
          crear: (datos: any) => Promise<{ success: boolean; data: Producto; error?: string }>
          actualizar: (id: string, datos: any) => Promise<{ success: boolean; data: Producto; error?: string }>
        }
      }
    }
  }