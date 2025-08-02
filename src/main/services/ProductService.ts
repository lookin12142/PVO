import { prisma } from '../database/connection'
import {
  CreateProductDTO,
  UpdateProductDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CreateCategoryPriceDTO,
  UpdateCategoryPriceDTO,
  CreatePriceHistoryDTO,
  ProductSearchParams,
  PriceHistoryParams
} from '../types/product.types'

export class ProductService {
  
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
        orderBy: { name: 'asc' }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Error obteniendo productos: ${message}`)
    }
  }

  // Buscar productos por nombre o descripción
  static async buscar(termino: string) {
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
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Error buscando productos: ${message}`)
    }
  }

  // Obtener producto por ID
  static async obtenerPorId(id: string) {
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
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Error obteniendo producto por ID: ${message}`)
    }
  }

  // Crear nuevo producto
  static async crear(datos: CreateProductDTO) {
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
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Error creando producto: ${message}`)
    }
  }

  // Actualizar producto
  static async actualizar(id: string, datos: UpdateProductDTO) {
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
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Error actualizando producto: ${message}`)
    }
  }

  // Eliminar producto (también elimina los precios asociados por CASCADE)
  static async eliminar(id: string) {
    try {
      return await prisma.product.delete({
        where: { id }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Error eliminando producto: ${message}`)
    }
  }

  // ==================== CATEGORÍAS ====================
  
  // Obtener todas las categorías
  static async obtenerCategorias() {
    try {
      return await prisma.category.findMany({
        orderBy: { name: 'asc' }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Error obteniendo categorías: ${message}`)
    }
  }

  // Crear nueva categoría
  static async crearCategoria(datos: CreateCategoryDTO) {
    try {
      return await prisma.category.create({
        data: {
          name: datos.name,
          description: datos.description
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Error creando categoría: ${message}`)
    }
  }

  // ==================== PRECIOS POR CATEGORÍA ====================
  
  // Asignar producto a categoría con precio
  static async asignarPrecioCategoria(datos: CreateCategoryPriceDTO) {
    try {
      // Calcular margen si se proporciona costo
      let margin = null
      if (datos.cost && datos.cost > 0) {
        margin = ((datos.price - datos.cost) / datos.cost) * 100
      }

      return await prisma.categoryPrice.create({
        data: {
          productId: datos.productId,
          categoryId: datos.categoryId,
          price: datos.price,
          cost: datos.cost,
          margin: margin
        },
        include: {
          product: true,
          category: true
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Error asignando precio a categoría: ${message}`)
    }
  }

  // Actualizar precio de producto en categoría específica
  static async actualizarPrecioCategoria(id: string, datos: UpdateCategoryPriceDTO) {
    try {
      // Recalcular margen si se actualiza precio o costo
      const updateData: any = { ...datos }
      
      if (datos.price !== undefined || datos.cost !== undefined) {
        const current = await prisma.categoryPrice.findUnique({ where: { id } })
        if (current) {
          const newPrice = datos.price ?? Number(current.price)
          const newCost = datos.cost ?? (current.cost ? Number(current.cost) : 0)
          
          if (newCost > 0) {
            updateData.margin = ((newPrice - newCost) / newCost) * 100
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
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Error actualizando precio de categoría: ${message}`)
    }
  }

  // Obtener precios de un producto en todas sus categorías
  static async obtenerPreciosProducto(productId: string) {
    try {
      return await prisma.categoryPrice.findMany({
        where: { 
          productId
        },
        include: {
          category: true
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Error obteniendo precios del producto: ${message}`)
    }
  }

  // Obtener productos de una categoría específica
  static async obtenerProductosPorCategoria(categoryId: string) {
    try {
      return await prisma.categoryPrice.findMany({
        where: { 
          categoryId
        },
        include: {
          product: true
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Error obteniendo productos por categoría: ${message}`)
    }
  }

  // Eliminar precio en categoría (hard delete)
  static async eliminarPrecioCategoria(id: string) {
    try {
      return await prisma.categoryPrice.delete({
        where: { id }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Error eliminando precio de categoría: ${message}`)
    }
  }

  // ==================== HISTORIAL DE PRECIOS ====================
  
  // Registrar cambio de precio en historial
  static async registrarCambioPrecio(
    productId: string,
    categoryId: string,
    oldPrice: number,
    newPrice: number,
    reason?: string,
    changedBy?: string
  ) {
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
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Error registrando historial de precio: ${message}`)
    }
  }

  // Obtener historial de precios de un producto
  static async obtenerHistorialPrecios(productId: string, categoryId?: string) {
    try {
      const where: any = { productId }
      if (categoryId) where.categoryId = categoryId

      return await prisma.priceHistory.findMany({
        where,
        orderBy: { changedAt: 'desc' }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Error obteniendo historial de precios: ${message}`)
    }
  }
}