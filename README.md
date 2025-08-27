# 🛒 Sistema PVO (Punto de Venta)

## ¿Qué hace este código?

Este proyecto es un **Sistema de Punto de Venta (POS)** completo desarrollado como aplicación de escritorio usando tecnologías web modernas. El sistema está diseñado para pequeños y medianos negocios que necesitan gestionar ventas, inventario y control de caja de manera eficiente.

## 🎯 Funcionalidades Principales

### 1. 📦 Gestión de Productos
- **Crear, editar y eliminar productos** con información detallada
- **Búsqueda rápida** por nombre, descripción o código de producto
- **Sistema de códigos** para identificación rápida durante las ventas

### 2. 🏷️ Categorías y Precios Dinámicos
- **Categorías de productos** personalizables
- **Precios diferenciados** por categoría (ej: precio al por mayor, al detal, delivery)
- **Historial de cambios de precios** para auditoría y control

### 3. 💰 Punto de Venta
- **Interfaz intuitiva** para procesar ventas rápidamente
- **Carrito de compras** con cálculo automático de totales
- **Descuentos** generales e individuales por producto
- **Soporte para diferentes tipos de venta** (presencial, delivery como Rappi)

### 4. 📊 Control de Caja
- **Registro de ingresos y egresos** con descripciones detalladas
- **Cierre de caja diario** con comparación entre dinero físico y sistema
- **Resúmenes por categoría** en cada cierre de caja

### 5. 📈 Reportes y Análisis
- **Reportes de ventas** por períodos
- **Análisis por categorías** de productos
- **Estadísticas de rendimiento** del negocio

## 🔧 Tecnologías Utilizadas

### Frontend (Interfaz de Usuario)
- **React 18** - Biblioteca principal para la interfaz de usuario
- **TypeScript** - Tipado estático para mayor seguridad del código
- **Tailwind CSS** - Framework CSS para diseño moderno y responsive
- **Vite** - Herramienta de desarrollo rápida y moderna

### Backend (Lógica de Negocio)
- **Electron** - Permite ejecutar la aplicación web como aplicación de escritorio
- **Prisma ORM** - Mapeo objeto-relacional para manejo de base de datos
- **SQLite** - Base de datos ligera y confiable para almacenamiento local

### Herramientas de Desarrollo
- **ESLint** - Análisis de código para mantener calidad
- **electron-builder** - Construcción de ejecutables para diferentes sistemas operativos

## 🗄️ Estructura de la Base de Datos

El sistema utiliza una base de datos SQLite con las siguientes entidades principales:

- **Products** - Información básica de productos (nombre, descripción, código)
- **Categories** - Categorías de productos (mayorista, detal, etc.)
- **CategoryPrices** - Precios específicos por producto y categoría
- **Sales** - Registro de ventas con información del cliente
- **SaleDetails** - Detalles específicos de cada venta (productos, cantidades, precios)
- **CashMovements** - Movimientos de caja (ingresos y egresos)
- **CashClosures** - Cierres de caja diarios

## 🚀 Cómo Ejecutar el Sistema

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run dev
```

### Construcción para Producción
```bash
npm run build
```

### Inicializar Base de Datos
```bash
npx prisma migrate dev
npx prisma generate
```

## 💡 Casos de Uso Típicos

1. **Tienda de Abarrotes**: Gestión de productos con precios diferenciados para clientes mayoristas y minoristas
2. **Restaurante**: Control de ingredientes y platillos con diferentes precios para delivery y consumo local
3. **Farmacia**: Inventario de medicamentos con códigos de barras y precios especiales
4. **Boutique**: Ropa y accesorios con categorías por temporada y descuentos especiales

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React (UI)    │    │  Electron Main  │    │ SQLite Database │
│                 │◄──►│                 │◄──►│                 │
│ - Punto de Venta│    │ - IPC Handlers  │    │ - Products      │
│ - Inventario    │    │ - Business Logic│    │ - Sales         │
│ - Reportes      │    │ - Database Conn │    │ - Categories    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

Este sistema demuestra cómo construir una aplicación empresarial completa usando tecnologías web modernas, proporcionando una solución robusta y escalable para la gestión de puntos de venta.
