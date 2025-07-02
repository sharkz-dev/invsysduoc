const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Importar modelo
const Product = require('./models/Product');

// Configuración de CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maestranzas_inventario';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB - Maestranzas Unidos S.A.'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

// RUTAS DEL API

// Obtener todos los productos con filtros avanzados
app.get('/api/products', async (req, res) => {
  try {
    const { 
      categoria, 
      proveedor, 
      ubicacion, 
      stockBajo, 
      estado, 
      search,
      page = 1,
      limit = 50
    } = req.query;

    // Construir filtros
    let filtros = {};
    
    if (categoria) filtros.categoria = categoria;
    if (proveedor) filtros.proveedor = new RegExp(proveedor, 'i');
    if (ubicacion) filtros.ubicacion = new RegExp(ubicacion, 'i');
    if (estado) filtros.estado = estado;
    
    // Filtro de stock bajo
    if (stockBajo === 'true') {
      filtros.$expr = { $lte: ['$stock', '$stockMinimo'] };
    }
    
    // Búsqueda por texto
    if (search) {
      filtros.$or = [
        { codigo: new RegExp(search, 'i') },
        { nombre: new RegExp(search, 'i') },
        { descripcion: new RegExp(search, 'i') },
        { equipoCompatible: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const productos = await Product.find(filtros)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filtros);

    res.json({
      productos,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener estadísticas del inventario
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $facet: {
          porCategoria: [
            {
              $group: {
                _id: '$categoria',
                cantidad: { $sum: 1 },
                stockTotal: { $sum: '$stock' }
              }
            }
          ],
          porProveedor: [
            {
              $group: {
                _id: '$proveedor',
                cantidad: { $sum: 1 }
              }
            },
            { $sort: { cantidad: -1 } },
            { $limit: 5 }
          ],
          general: [
            {
              $group: {
                _id: null,
                totalProductos: { $sum: 1 },
                stockTotal: { $sum: '$stock' },
                stockBajo: {
                  $sum: {
                    $cond: [{ $lte: ['$stock', '$stockMinimo'] }, 1, 0]
                  }
                }
              }
            }
          ],
          porUbicacion: [
            {
              $group: {
                _id: { $substr: ['$ubicacion', 0, 1] }, // Primer carácter (pasillo)
                cantidad: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener un producto por ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product.getFullInfo());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear un nuevo producto con imagen
app.post('/api/products', upload.single('imagen'), async (req, res) => {
  try {
    const { 
      codigo, 
      nombre, 
      descripcion, 
      stock, 
      categoria, 
      ubicacion,
      stockMinimo,
      proveedor,
      equipoCompatible,
      unidadMedida,
      observaciones
    } = req.body;
    
    // Verificar si el código ya existe
    const existingProduct = await Product.findOne({ codigo: codigo.toUpperCase() });
    if (existingProduct) {
      // Si hay imagen subida, eliminarla
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'El código del producto ya existe' });
    }

    const productData = {
      codigo: codigo.toUpperCase(),
      nombre,
      descripcion,
      stock: parseInt(stock),
      categoria: categoria || 'Repuestos Generales',
      ubicacion: ubicacion || 'A-01-01',
      stockMinimo: parseInt(stockMinimo) || 1,
      proveedor: proveedor || 'Sin asignar',
      equipoCompatible: equipoCompatible ? equipoCompatible.split(',').map(e => e.trim()) : [],
      unidadMedida: unidadMedida || 'Unidad',
      observaciones: observaciones || ''
    };

    // Si se subió una imagen, agregar la ruta
    if (req.file) {
      productData.imagen = req.file.filename;
    }

    const product = new Product(productData);
    const savedProduct = await product.save();
    
    res.status(201).json(savedProduct.getFullInfo());
  } catch (error) {
    // Si hay error y se subió una imagen, eliminarla
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: error.message });
  }
});

// Actualizar un producto
app.put('/api/products/:id', upload.single('imagen'), async (req, res) => {
  try {
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const { 
      codigo, 
      nombre, 
      descripcion, 
      stock, 
      categoria, 
      ubicacion,
      stockMinimo,
      proveedor,
      equipoCompatible,
      unidadMedida,
      observaciones,
      estado
    } = req.body;

    // Verificar si el código ya existe (excluyendo el producto actual)
    if (codigo && codigo.toUpperCase() !== currentProduct.codigo) {
      const existingProduct = await Product.findOne({ 
        codigo: codigo.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingProduct) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: 'El código del producto ya existe' });
      }
    }

    const updateData = {
      codigo: codigo ? codigo.toUpperCase() : currentProduct.codigo,
      nombre: nombre || currentProduct.nombre,
      descripcion: descripcion || currentProduct.descripcion,
      stock: stock !== undefined ? parseInt(stock) : currentProduct.stock,
      categoria: categoria || currentProduct.categoria,
      ubicacion: ubicacion || currentProduct.ubicacion,
      stockMinimo: stockMinimo !== undefined ? parseInt(stockMinimo) : currentProduct.stockMinimo,
      proveedor: proveedor || currentProduct.proveedor,
      equipoCompatible: equipoCompatible ? equipoCompatible.split(',').map(e => e.trim()) : currentProduct.equipoCompatible,
      unidadMedida: unidadMedida || currentProduct.unidadMedida,
      observaciones: observaciones !== undefined ? observaciones : currentProduct.observaciones,
      estado: estado || currentProduct.estado
    };

    // Si se subió una nueva imagen, eliminar la anterior y usar la nueva
    if (req.file) {
      if (currentProduct.imagen) {
        const oldImagePath = path.join('uploads', currentProduct.imagen);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.imagen = req.file.filename;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedProduct.getFullInfo());
  } catch (error) {
    // Si hay error y se subió una imagen, eliminarla
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: error.message });
  }
});

// Eliminar un producto
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Eliminar imagen si existe
    if (product.imagen) {
      const imagePath = path.join('uploads', product.imagen);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Actualizar stock de un producto
app.patch('/api/products/:id/stock', async (req, res) => {
  try {
    const { stock, operacion } = req.body; // operacion: 'entrada', 'salida', 'ajuste'
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    let nuevoStock = product.stock;
    
    switch (operacion) {
      case 'entrada':
        nuevoStock += parseInt(stock);
        break;
      case 'salida':
        nuevoStock -= parseInt(stock);
        break;
      case 'ajuste':
        nuevoStock = parseInt(stock);
        break;
      default:
        return res.status(400).json({ message: 'Operación no válida' });
    }

    if (nuevoStock < 0) {
      return res.status(400).json({ message: 'El stock no puede ser negativo' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: nuevoStock },
      { new: true, runValidators: true }
    );

    res.json(updatedProduct.getFullInfo());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtener productos con stock bajo
app.get('/api/products/alerts/low-stock', async (req, res) => {
  try {
    const productosStockBajo = await Product.find({
      $expr: { $lte: ['$stock', '$stockMinimo'] }
    }).sort({ categoria: 1, nombre: 1 });

    res.json(productosStockBajo.map(p => p.getFullInfo()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Buscar productos por equipo compatible
app.get('/api/products/equipment/:equipment', async (req, res) => {
  try {
    const equipment = req.params.equipment;
    const productos = await Product.find({
      equipoCompatible: { $in: [new RegExp(equipment, 'i')] }
    }).sort({ categoria: 1, nombre: 1 });

    res.json(productos.map(p => p.getFullInfo()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener todas las categorías
app.get('/api/categories', async (req, res) => {
  try {
    const categorias = await Product.distinct('categoria');
    res.json(categorias.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener todos los proveedores
app.get('/api/providers', async (req, res) => {
  try {
    const proveedores = await Product.distinct('proveedor');
    res.json(proveedores.filter(p => p !== 'Sin asignar').sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener todas las ubicaciones
app.get('/api/locations', async (req, res) => {
  try {
    const ubicaciones = await Product.distinct('ubicacion');
    res.json(ubicaciones.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '🏭 API de Inventario - Maestranzas Unidos S.A. funcionando correctamente',
    empresa: 'Maestranzas Unidos S.A.',
    region: 'Atacama',
    descripcion: 'Sistema de gestión de inventario para equipos pesados de minería y construcción'
  });
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'El archivo es demasiado grande (máximo 5MB)' });
    }
  }
  
  if (error.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({ message: error.message });
  }
  
  res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🌟 Servidor Maestranzas Unidos S.A. corriendo en puerto ${PORT}`);
  console.log(`🏭 Sistema de inventario para equipos pesados de minería y construcción`);
  console.log(`📍 Región de Atacama, Chile`);
});