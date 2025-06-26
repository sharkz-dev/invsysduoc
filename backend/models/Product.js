const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: [true, 'El código es requerido'],
    unique: true,
    trim: true,
    uppercase: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio debe ser mayor a 0']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es requerida'],
    default: 'General',
    enum: ['General', 'Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Salud', 'Automóvil', 'Otros']
  },
  imagen: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar updatedAt antes de guardar
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);