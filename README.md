# Almacén Central ISSSTE - Portal Web & Torre de Control

Plataforma Web Ejecutiva e Institucional para la administración, auditoría, trazabilidad y control de inventarios del **Almacén Central del ISSSTE**.

---

## 🏛️ Propósito de la Plataforma

Esta aplicación web actúa como la **Torre de Control Central** complementaria a la aplicación operativa móvil (`almacen-issste-app`), proporcionando a directores de almacén, auditores y coordinadores logísticos:
- Monitoreo en tiempo real de entradas y salidas vía WebSockets.
- Control de inventario y balances de stock automatizados (`Total Recibido - Total Enviado`).
- Trazabilidad y kardex individual por insumo o equipo médico.
- **Plano 2D interactivo de Racks** con generación de **Marbetes imprimibles y Códigos QR** para colocación física en bodega y futuro escaneo móvil.
- Expediente digital de auditoría con visor fotográfico en alta resolución de remisiones, actas, placas de serie y transportes.
- Exportación multiformato: **Excel (.xlsx)** estructurado, **PDF Oficial Membretado** e **Imágenes JPG**.
- **Verificador de Autenticidad de Folios** institucionales (`REC-...` y `ENV-...`).

---

## 🛠️ Tecnologías Utilizadas

- **Frontend Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Estilos & UI**: [Tailwind CSS v4](https://tailwindcss.com/) + Design Tokens Institucionales ISSSTE (Guinda `#691C32`, Dorado `#BC955C`, Verde Bandera `#10312B`)
- **Base de Datos & Realtime**: [@supabase/supabase-js](https://supabase.com/) con suscripciones en vivo a cambios en tablas
- **Gráficas y Dashboards**: [Recharts](https://recharts.org/)
- **Generación de Códigos QR**: [qrcode.react](https://github.com/zpao/qrcode.react)
- **Exportación de Reportes**:
  - [SheetJS (xlsx)](https://docs.sheetjs.com/) para libros de Excel de auditoría
  - [jsPDF](https://github.com/parallax/jsPDF) para expedientes membretados oficiales
  - [html2canvas](https://html2canvas.hertzen.com/) para generación de comprobantes y marbetes en JPG

---

## 📦 Módulos del Sistema

1. **Torre de Control (Dashboard)**:
   - Indicadores KPI globales (Piezas en stock, Total recepciones, Total despachos, Hospitales abastecidos).
   - Semáforos de stock crítico y alertamiento inmediato de insumos agotados.
   - Gráfica interactiva de los 5 hospitales con mayor volumen de insumos recibidos.
   - Gráfica de dona por categoría de bien.
   - Feed en vivo de movimientos en bodega con notificaciones toast en tiempo real.

2. **Inventario & Kardex**:
   - Catálogo general con stock en tiempo real y buscador inteligente.
   - Panel lateral de Kardex con el historial cronológico de entradas y salidas de cada producto.
   - Exportación de corte a Excel y PDF.

3. **Mapa de Racks & QR de Almacenamiento**:
   - Distribución gráfica 2D de estanterías y pasillos (Rack A, B, C, D).
   - Asignación de bienes, cantidades y números de lote por celda y nivel.
   - **Marbete Imprimible Oficial**: Etiqueta con diseño normativo del ISSSTE, código de ubicación (ej. `RCK-A-N2-E03`), datos de carga y Código QR para escaneo físico en bodega.
   - Exportador del marbete a impresión directa o imagen JPG.

4. **Auditoría & Registros**:
   - Expedientes de recepciones y envíos con filtros por tipo y búsqueda.
   - Visor de evidencias fotográficas en alta resolución (fotos de remisiones, sellos, bienes físicos, placas y camiones).
   - Generación de comprobante oficial en PDF y descarga de libros contables en Excel.

5. **Verificador de Autenticidad de Folios**:
   - Herramienta de consulta para validar la autenticidad e integridad de folios `REC-` y `ENV-` directamente contra la base de datos central.

---

## 🚀 Puesta en Marcha Local

### Prerrequisitos
- Node.js 18+ instalado.

### Instalación
```bash
# 1. Clonar el repositorio
git clone https://github.com/luisgermagana/almacen-issste-web.git
cd almacen-issste-web

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Agregar tus credenciales de Supabase en .env:
# VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
# VITE_SUPABASE_ANON_KEY=tu-anon-key

# 4. Iniciar servidor de desarrollo
npm run dev
```

### Compilar para Producción
```bash
npm run build
```

---

## 🏛️ Identidad Gráfica

El diseño implementa la identidad cromática institucional del Gobierno de México y el ISSSTE:
- **Guinda Principal**: `#691C32`
- **Dorado Oficial**: `#BC955C`
- **Verde Institucional**: `#10312B`
- **Gris Plata**: `#98989A`
- **Tipografías**: *Montserrat* (títulos y encabezados) + *Inter* (lectura de datos).
