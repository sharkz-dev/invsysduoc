const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Crear carpeta uploads si no existe
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/inventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('✅ Conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.log('❌ Error de conexión a MongoDB:', err);
});

// Rutas del API

// Obtener todos los productos
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
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
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear un nuevo producto con imagen
app.post('/api/products', upload.single('imagen'), async (req, res) => {
  try {
    const { codigo, nombre, descripcion, precio, stock, categoria } = req.body;
    
    // Verificar si el código ya existe
    const existingProduct = await Product.findOne({ codigo });
    if (existingProduct) {
      // Si hay imagen subida, eliminarla
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'El código del producto ya existe' });
    }

    const productData = {
      codigo,
      nombre,
      descripcion,
      precio: parseFloat(precio),
      stock: parseInt(stock),
      categoria: categoria || 'General'
    };

    // Si se subió una imagen, agregar la ruta
    if (req.file) {
      productData.imagen = req.file.filename;
    }

    const product = new Product(productData);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    // Si hay error y se subió una imagen, eliminarla
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: error.message });
  }
});

// Actualizar un producto con imagen
app.put('/api/products/:id', upload.single('imagen'), async (req, res) => {
  try {
    const { codigo, nombre, descripcion, precio, stock, categoria } = req.body;
    
    // Verificar si el código ya existe en otro producto
    const existingProduct = await Product.findOne({ 
      codigo, 
      _id: { $ne: req.params.id } 
    });
    
    if (existingProduct) {
      // Si hay imagen subida, eliminarla
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'El código del producto ya existe' });
    }

    // Obtener el producto actual para manejar la imagen anterior
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const updateData = {
      codigo,
      nombre,
      descripcion,
      precio: parseFloat(precio),
      stock: parseInt(stock),
      categoria: categoria || 'General',
      updatedAt: Date.now()
    };

    // Si se subió una nueva imagen
    if (req.file) {
      // Eliminar imagen anterior si existe
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

    res.json(updatedProduct);
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

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: '🚀 API de Inventario funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`🌟 Servidor corriendo en puerto ${PORT}`);
});