// product.types.ts - DTOs para productos y categorías

// ==================== PRODUCT DTOs ====================
export interface CreateProductDTO {
    name: string
    description?: string
  }
  
  export interface UpdateProductDTO {
    name?: string
    description?: string
  }
  
  // ==================== CATEGORY DTOs ====================
  export interface CreateCategoryDTO {
    name: string
    description?: string
  }
  
  export interface UpdateCategoryDTO {
    name?: string
    description?: string
  }
  
  // ==================== CATEGORY PRICE DTOs ====================
  export interface CreateCategoryPriceDTO {
    productId: string
    categoryId: string
    price: number
    cost?: number
  }
  
  export interface UpdateCategoryPriceDTO {
    price?: number
    cost?: number
    margin?: number
  }
  
  // ==================== PRICE HISTORY DTOs ====================
  export interface CreatePriceHistoryDTO {
    productId: string
    categoryId: string
    oldPrice: number
    newPrice: number
    reason?: string
    changedBy?: string
  }
  
  // ==================== RESPONSE TYPES ====================
  export interface ProductWithPrices {
    id: string
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    categoryPrices: {
      id: string
      price: number
      cost: number | null
      margin: number | null
      isActive: boolean
      category: {
        id: string
        name: string
        description: string | null
      }
    }[]
  }
  
  export interface CategoryWithProducts {
    id: string
    name: string
    description: string | null
    isActive: boolean
    categoryPrices: {
      id: string
      price: number
      cost: number | null
      margin: number | null
      product: {
        id: string
        name: string
        description: string | null
      }
    }[]
  }
  
  // ==================== SEARCH & FILTER TYPES ====================
  export interface ProductSearchParams {
    term?: string
    categoryId?: string
    minPrice?: number
    maxPrice?: number
  }
  
  export interface PriceHistoryParams {
    productId: string
    categoryId?: string
    limit?: number
    offset?: number
  }