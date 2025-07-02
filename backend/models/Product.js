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
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es requerida'],
    default: 'Repuestos Generales',
    enum: [
      'Repuestos Generales',
      'Motor y Transmisión',
      'Sistema Hidráulico',
      'Frenos y Suspensión',
      'Eléctrico y Electrónico',
      'Filtros y Lubricantes',
      'Neumáticos y Llantas',
      'Estructura y Chasis',
      'Herramientas y Accesorios',
      'Componentes de Seguridad'
    ]
  },
  ubicacion: {
    type: String,
    required: [true, 'La ubicación en bodega es requerida'],
    trim: true,
    default: 'A-01-01'
  },
  stockMinimo: {
    type: Number,
    required: [true, 'El stock mínimo es requerido'],
    min: [0, 'El stock mínimo no puede ser negativo'],
    default: 1
  },
  proveedor: {
    type: String,
    trim: true,
    default: 'Sin asignar'
  },
  equipoCompatible: {
    type: [String],
    default: []
  },
  unidadMedida: {
    type: String,
    required: [true, 'La unidad de medida es requerida'],
    enum: ['Unidad', 'Metro', 'Litro', 'Kilogramo', 'Juego', 'Par', 'Rollo', 'Caja'],
    default: 'Unidad'
  },
  estado: {
    type: String,
    enum: ['Activo', 'Descontinuado', 'En Evaluación'],
    default: 'Activo'
  },
  imagen: {
    type: String,
    default: null
  },
  observaciones: {
    type: String,
    trim: true,
    default: ''
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

// Índices para mejorar las consultas
productSchema.index({ codigo: 1 });
productSchema.index({ categoria: 1 });
productSchema.index({ ubicacion: 1 });
productSchema.index({ proveedor: 1 });

// Método virtual para determinar si el stock está bajo
productSchema.virtual('stockBajo').get(function() {
  return this.stock <= this.stockMinimo;
});

// Método para obtener información completa del producto
productSchema.methods.getFullInfo = function() {
  return {
    ...this.toObject(),
    stockBajo: this.stockBajo
  };
};

module.exports = mongoose.model('Product', productSchema);