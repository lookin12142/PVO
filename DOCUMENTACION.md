# 📋 Documentación Técnica - Sistema PVO

## 🎯 Resumen Ejecutivo

El Sistema PVO (Punto de Venta) es una aplicación de escritorio desarrollada para gestionar completamente las operaciones de venta de un negocio. Combina una interfaz de usuario moderna con una base de datos robusta para ofrecer funcionalidades completas de punto de venta, inventario y control financiero.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

#### 1. **Frontend (Renderer Process)**
- **Ubicación**: `src/renderer/`
- **Tecnología**: React + TypeScript + Tailwind CSS
- **Responsabilidades**:
  - Interfaz de usuario interactiva
  - Gestión del estado de la aplicación
  - Comunicación con el proceso principal vía IPC

#### 2. **Backend (Main Process)**
- **Ubicación**: `src/main/`
- **Tecnología**: Electron + Node.js + Prisma
- **Responsabilidades**:
  - Lógica de negocio
  - Gestión de base de datos
  - Manejo de IPC (Inter-Process Communication)

#### 3. **Preload Script**
- **Ubicación**: `src/preload/`
- **Responsabilidades**:
  - Puente seguro entre frontend y backend
  - Exposición controlada de APIs de Electron

### Flujo de Datos

```
Usuario → React Components → IPC → Main Process → Prisma → SQLite → Response
```

## 📊 Modelo de Datos

### Entidades Principales

#### Products (Productos)
```typescript
{
  id: string          // Identificador único
  name: string        // Nombre del producto
  code?: string       // Código opcional para búsqueda rápida
  description?: string // Descripción detallada
  createdAt: DateTime // Fecha de creación
}
```

#### Categories (Categorías)
```typescript
{
  id: string          // Identificador único
  name: string        // Nombre de la categoría (único)
}
```

#### CategoryPrices (Precios por Categoría)
```typescript
{
  id: string          // Identificador único
  productId: string   // Referencia al producto
  categoryId: string  // Referencia a la categoría
  price: number       // Precio específico
  createdAt: DateTime // Fecha de creación
}
```

#### Sales (Ventas)
```typescript
{
  id: string          // Identificador único
  clientName?: string // Nombre del cliente (opcional)
  total: number       // Total de la venta
  discount?: number   // Descuento aplicado
  type: string        // 'presencial' o 'rappi'
  createdAt: DateTime // Fecha y hora de la venta
}
```

### Relaciones de Datos

- **Producto ↔ Categoría**: Relación muchos-a-muchos a través de CategoryPrices
- **Venta → Detalles**: Relación uno-a-muchos
- **Producto → Ventas**: A través de CategoryPrices y SaleDetails

## 🔧 Servicios y APIs

### ProductService (Servicio de Productos)

#### Métodos Principales:

**Gestión de Productos:**
- `obtenerTodos()` - Lista todos los productos con precios
- `buscar(termino)` - Búsqueda por nombre/descripción
- `obtenerPorId(id)` - Obtiene producto específico
- `crear(datos)` - Crea nuevo producto
- `actualizar(id, datos)` - Actualiza producto existente
- `eliminar(id)` - Elimina producto

**Gestión de Categorías:**
- `obtenerCategorias()` - Lista todas las categorías
- `crearCategoria(datos)` - Crea nueva categoría

**Gestión de Precios:**
- `asignarPrecioCategoria(datos)` - Asigna precio a producto por categoría
- `actualizarPrecioCategoria(id, datos)` - Actualiza precio existente
- `obtenerPreciosProducto(productId)` - Precios de un producto
- `obtenerProductosPorCategoria(categoryId)` - Productos de una categoría

### IPC Handlers (Manejadores de Comunicación)

#### Productos:
- `productos:obtener` - Obtener todos los productos
- `productos:buscar` - Buscar productos
- `productos:crear` - Crear producto
- `productos:actualizar` - Actualizar producto
- `productos:eliminar` - Eliminar producto

#### Categorías:
- `categorias:obtener` - Obtener categorías
- `categorias:crear` - Crear categoría

#### Precios:
- `precios:asignar` - Asignar precio por categoría
- `precios:actualizar` - Actualizar precio
- `precios:obtenerPorProducto` - Precios de un producto
- `precios:obtenerPorCategoria` - Productos de una categoría
- `precios:eliminar` - Eliminar precio

## 🎨 Interfaz de Usuario

### Páginas Principales

#### 1. Punto de Venta (POSPage)
- **Función**: Procesamiento de ventas en tiempo real
- **Características**:
  - Grid de productos con imágenes y precios
  - Carrito de compras interactivo
  - Cálculo automático de totales
  - Procesamiento de ventas

#### 2. Inventario (InventoryPage)
- **Función**: Gestión completa de productos
- **Características**:
  - Lista de productos
  - Formularios de creación/edición
  - Gestión de categorías y precios

#### 3. Reportes (ReportsPage)
- **Función**: Análisis de ventas y rendimiento
- **Características**:
  - Reportes por período
  - Gráficos y estadísticas
  - Exportación de datos

#### 4. Configuración (SettingsPage)
- **Función**: Configuración del sistema
- **Características**:
  - Configuración de empresa
  - Gestión de impuestos
  - Parámetros del sistema

## 🛠️ Configuración de Desarrollo

### Estructura de Archivos
```
src/
├── main/                    # Proceso principal de Electron
│   ├── database/           # Configuración de base de datos
│   ├── services/           # Servicios de negocio
│   ├── types/              # Definiciones de tipos
│   └── index.ts            # Punto de entrada principal
├── renderer/               # Interfaz de usuario React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── types/          # Tipos de frontend
│   │   ├── App.tsx         # Componente principal
│   │   └── main.tsx        # Punto de entrada React
│   └── index.html          # HTML base
└── preload/                # Scripts de preload
    └── index.ts            # Puente IPC seguro
```

### Variables de Entorno
- Base de datos SQLite almacenada localmente
- Configuración de desarrollo vs producción
- Rutas de archivos dinámicas

### Scripts de NPM
- `npm run dev` - Desarrollo con hot reload
- `npm run build` - Construcción para producción
- `npm run start` - Ejecutar aplicación construida
- `npm run lint` - Análisis de código

## 🔒 Consideraciones de Seguridad

### Context Isolation
- Uso de `contextBridge` para comunicación segura
- Aislamiento del contexto del renderer
- APIs expuestas controladamente

### Validación de Datos
- Validación en backend con Prisma
- Tipos TypeScript para prevenir errores
- Manejo seguro de errores

## 📈 Escalabilidad y Mantenimiento

### Patrones de Diseño
- **Singleton**: Para conexión de base de datos
- **Service Layer**: Para lógica de negocio
- **Repository Pattern**: Implícito con Prisma

### Ventajas del Stack Tecnológico
- **TypeScript**: Detección temprana de errores
- **Prisma**: Migrations automáticas y type-safety
- **React**: Componentes reutilizables y mantenibles
- **Electron**: Aplicación nativa multiplataforma

## 🎯 Casos de Uso Detallados

### Flujo de Venta Típico
1. Usuario selecciona productos en el grid
2. Productos se agregan al carrito
3. Sistema calcula totales automáticamente
4. Usuario procesa la venta
5. Venta se registra en base de datos
6. Inventario se actualiza (futuro)

### Gestión de Precios por Categoría
1. Administrador crea categorías (mayorista, detal)
2. Asigna precios específicos por categoría
3. En punto de venta, se aplica precio según categoría seleccionada
4. Historial de cambios se mantiene automáticamente

Este sistema demuestra una implementación profesional de un punto de venta usando tecnologías modernas, con arquitectura escalable y mantenible.