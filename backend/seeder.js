const mongoose = require('mongoose');
const Product = require('./models/Product');

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maestranzas_inventario';

const productosIniciales = [
  // Motor y Transmisión
  {
    codigo: 'MT-001',
    nombre: 'Filtro de Aceite Motor Caterpillar 3406E',
    descripcion: 'Filtro de aceite para motor Caterpillar 3406E, diseñado para equipos de minería pesada. Capacidad de filtración de 99.5% de partículas mayores a 25 micrones.',
    stock: 45,
    categoria: 'Motor y Transmisión',
    ubicacion: 'A-02-15',
    stockMinimo: 10,
    proveedor: 'Caterpillar Chile',
    equipoCompatible: ['Camión 793F', 'Excavadora 390F', 'Cargador 993K'],
    unidadMedida: 'Unidad',
    observaciones: 'Cambio cada 250 horas de operación',
    imagenUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop'
  },
  {
    codigo: 'MT-002',
    nombre: 'Bomba de Agua Motor Komatsu 6D170',
    descripcion: 'Bomba de agua centrífuga para motor Komatsu 6D170. Fabricada en hierro fundido con impulsor de bronce. Incluye empaque y tornillería.',
    stock: 8,
    categoria: 'Motor y Transmisión',
    ubicacion: 'A-02-22',
    stockMinimo: 3,
    proveedor: 'Komatsu Mitsui',
    equipoCompatible: ['Bulldozer D475A', 'Excavadora PC800'],
    unidadMedida: 'Unidad',
    observaciones: 'Verificar compatibilidad con número de serie del motor',
    imagenUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=300&fit=crop'
  },
  {
    codigo: 'MT-003',
    nombre: 'Transmisión Completa Allison 4700 RDS',
    descripcion: 'Transmisión automática Allison 4700 RDS completamente reconstruida. 7 velocidades hacia adelante, 1 reversa. Torque máximo 2440 lb-ft.',
    stock: 2,
    categoria: 'Motor y Transmisión',
    ubicacion: 'B-01-05',
    stockMinimo: 1,
    proveedor: 'Allison Transmission',
    equipoCompatible: ['Camión 789C', 'Camión 793C'],
    unidadMedida: 'Unidad',
    observaciones: 'Requiere instalación especializada - 30 días entrega',
    imagenUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
  },

  // Sistema Hidráulico
  {
    codigo: 'SH-001',
    nombre: 'Cilindro Hidráulico Brazo Excavadora',
    descripcion: 'Cilindro hidráulico para brazo de excavadora. Diámetro 140mm, carrera 1200mm. Presión máxima 350 bar. Incluye sellos y conexiones.',
    stock: 12,
    categoria: 'Sistema Hidráulico',
    ubicacion: 'C-03-08',
    stockMinimo: 4,
    proveedor: 'Parker Hannifin',
    equipoCompatible: ['Excavadora 330D', 'Excavadora 336E'],
    unidadMedida: 'Unidad',
    observaciones: 'Probar presión antes de instalación',
    imagenUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop'
  },
  {
    codigo: 'SH-002',
    nombre: 'Bomba Hidráulica Principal Piston',
    descripcion: 'Bomba hidráulica de pistones axiales, caudal variable. Desplazamiento 250 cc/rev, presión máxima 420 bar.',
    stock: 5,
    categoria: 'Sistema Hidráulico',
    ubicacion: 'C-03-12',
    stockMinimo: 2,
    proveedor: 'Bosch Rexroth',
    equipoCompatible: ['Cargador 980K', 'Excavadora 390F'],
    unidadMedida: 'Unidad',
    observaciones: 'Requiere calibración especializada',
    imagenUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=300&fit=crop'
  },
  {
    codigo: 'SH-003',
    nombre: 'Manguera Hidráulica Alta Presión 1/2"',
    descripcion: 'Manguera hidráulica de alta presión 1/2 pulgada. Presión trabajo 350 bar, presión ruptura 1400 bar. Longitud 10 metros.',
    stock: 25,
    categoria: 'Sistema Hidráulico',
    ubicacion: 'C-04-01',
    stockMinimo: 8,
    proveedor: 'Gates Corporation',
    equipoCompatible: ['Aplicación universal'],
    unidadMedida: 'Metro',
    observaciones: 'Cortar a medida según requerimiento',
    imagenUrl: 'https://images.unsplash.com/photo-1622737133809-d95047b9e673?w=400&h=300&fit=crop'
  },

  // Frenos y Suspensión
  {
    codigo: 'FS-001',
    nombre: 'Pastillas de Freno Delanteras Camión Minero',
    descripcion: 'Juego de pastillas de freno delanteras para camión minero. Material cerámico de alta resistencia. Incluye sensores de desgaste.',
    stock: 20,
    categoria: 'Frenos y Suspensión',
    ubicacion: 'D-01-10',
    stockMinimo: 6,
    proveedor: 'Bendix',
    equipoCompatible: ['Camión 793F', 'Camión 797F'],
    unidadMedida: 'Juego',
    observaciones: 'Cambiar en pares - revisar discos',
    imagenUrl: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=300&fit=crop'
  },
  {
    codigo: 'FS-002',
    nombre: 'Amortiguador Trasero Nitrógeno',
    descripcion: 'Amortiguador trasero con gas nitrógeno. Carrera 400mm, diámetro 80mm. Válvulas de compresión y rebote ajustables.',
    stock: 16,
    categoria: 'Frenos y Suspensión',
    ubicacion: 'D-02-03',
    stockMinimo: 4,
    proveedor: 'Monroe',
    equipoCompatible: ['Cargador 993K', 'Motoniveladora 24M'],
    unidadMedida: 'Unidad',
    observaciones: 'Verificar presión de nitrógeno antes de instalar',
    imagenUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop'
  },

  // Eléctrico y Electrónico
  {
    codigo: 'EE-001',
    nombre: 'Alternador 24V 100A Servicio Pesado',
    descripcion: 'Alternador 24 voltios 100 amperios para servicio pesado. Carcasa sellada contra polvo y humedad. Incluye regulador de voltaje.',
    stock: 18,
    categoria: 'Eléctrico y Electrónico',
    ubicacion: 'E-01-05',
    stockMinimo: 5,
    proveedor: 'Bosch',
    equipoCompatible: ['Camión 789C', 'Excavadora 390F', 'Cargador 980K'],
    unidadMedida: 'Unidad',
    observaciones: 'Probar carga antes de instalación',
    imagenUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'
  },
  {
    codigo: 'EE-002',
    nombre: 'ECU Motor Caterpillar ADEM A4',
    descripcion: 'Unidad de control electrónico ADEM A4 para motores Caterpillar. Controla inyección, sincronización y diagnósticos.',
    stock: 6,
    categoria: 'Eléctrico y Electrónico',
    ubicacion: 'E-02-08',
    stockMinimo: 2,
    proveedor: 'Caterpillar Chile',
    equipoCompatible: ['Motor 3406E', 'Motor C15'],
    unidadMedida: 'Unidad',
    observaciones: 'Requiere programación específica por técnico certificado',
    imagenUrl: 'https://images.unsplash.com/photo-1581092336614-09fa1cec8b8d?w=400&h=300&fit=crop'
  },

  // Filtros y Lubricantes
  {
    codigo: 'FL-001',
    nombre: 'Filtro de Aire Primario Donaldson',
    descripcion: 'Filtro de aire primario Donaldson PowerCore. Eficiencia 99.9% para partículas > 2 micrones. Vida útil extendida.',
    stock: 35,
    categoria: 'Filtros y Lubricantes',
    ubicacion: 'F-01-12',
    stockMinimo: 12,
    proveedor: 'Donaldson',
    equipoCompatible: ['Camión 793F', 'Excavadora 390F', 'Cargador 993K'],
    unidadMedida: 'Unidad',
    observaciones: 'Cambiar cada 1000 horas o según indicador',
    imagenUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop'
  },
  {
    codigo: 'FL-002',
    nombre: 'Aceite Hidráulico ISO 46 Mobil DTE',
    descripcion: 'Aceite hidráulico Mobil DTE 25 ISO VG 46. Formulado para sistemas hidráulicos de alta presión. Tambor de 208 litros.',
    stock: 48,
    categoria: 'Filtros y Lubricantes',
    ubicacion: 'F-03-01',
    stockMinimo: 15,
    proveedor: 'ExxonMobil',
    equipoCompatible: ['Aplicación universal'],
    unidadMedida: 'Litro',
    observaciones: 'Almacenar en lugar seco y fresco',
    imagenUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'
  },

  // Neumáticos y Llantas
  {
    codigo: 'NL-001',
    nombre: 'Neumático Radial Minero 40.00R57',
    descripcion: 'Neumático radial para camión minero 40.00R57. Compuesto resistente a cortes y perforaciones. Banda de rodadura profunda.',
    stock: 8,
    categoria: 'Neumáticos y Llantas',
    ubicacion: 'G-01-01',
    stockMinimo: 4,
    proveedor: 'Bridgestone',
    equipoCompatible: ['Camión 793F', 'Camión 797F'],
    unidadMedida: 'Unidad',
    observaciones: 'Inspeccionar presión y desgaste regularmente',
    imagenUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
  },
  {
    codigo: 'NL-002',
    nombre: 'Llanta Acero Split Rim 35x15',
    descripcion: 'Llanta de acero tipo split rim 35x15 para equipos pesados. Tratamiento anticorrosivo. Incluye anillo de seguridad.',
    stock: 12,
    categoria: 'Neumáticos y Llantas',
    ubicacion: 'G-01-15',
    stockMinimo: 6,
    proveedor: 'Maxion Wheels',
    equipoCompatible: ['Cargador 993K', 'Excavadora 6020B'],
    unidadMedida: 'Unidad',
    observaciones: 'Verificar integridad antes del montaje',
    imagenUrl: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=300&fit=crop'
  },

  // Estructura y Chasis
  {
    codigo: 'EC-001',
    nombre: 'Diente Excavadora Caterpillar J460',
    descripcion: 'Diente para excavadora Caterpillar sistema J460. Acero al carbono templado. Diseño autoafilante para máxima penetración.',
    stock: 60,
    categoria: 'Estructura y Chasis',
    ubicacion: 'H-02-05',
    stockMinimo: 20,
    proveedor: 'Caterpillar Chile',
    equipoCompatible: ['Excavadora 390F', 'Excavadora 336E'],
    unidadMedida: 'Unidad',
    observaciones: 'Cambiar cuando desgaste alcance 50%',
    imagenUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop'
  },
  {
    codigo: 'EC-002',
    nombre: 'Buje Pivote Brazo Excavadora',
    descripcion: 'Buje de bronce para pivote de brazo excavadora. Diámetro interior 120mm, exterior 140mm. Tratamiento antifricción.',
    stock: 24,
    categoria: 'Estructura y Chasis',
    ubicacion: 'H-03-08',
    stockMinimo: 8,
    proveedor: 'SKF',
    equipoCompatible: ['Excavadora 330D', 'Excavadora 336E'],
    unidadMedida: 'Unidad',
    observaciones: 'Lubricar según programa de mantenimiento',
    imagenUrl: 'https://images.unsplash.com/photo-1622737133809-d95047b9e673?w=400&h=300&fit=crop'
  },

  // Herramientas y Accesorios
  {
    codigo: 'HA-001',
    nombre: 'Martillo Hidráulico Atlas Copco HB7000',
    descripcion: 'Martillo hidráulico Atlas Copco HB7000 para demolición. Peso 7.5 toneladas. Incluye cinceles y herramientas especiales.',
    stock: 3,
    categoria: 'Herramientas y Accesorios',
    ubicacion: 'I-01-02',
    stockMinimo: 1,
    proveedor: 'Atlas Copco',
    equipoCompatible: ['Excavadora 390F', 'Excavadora 6020B'],
    unidadMedida: 'Unidad',
    observaciones: 'Requiere certificación para operación',
    imagenUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop'
  },
  {
    codigo: 'HA-002',
    nombre: 'Cuchara Excavadora 3.5 m³',
    descripcion: 'Cuchara para excavadora capacidad 3.5 m³. Acero Hardox 450. Incluye dientes intercambiables y cuchillas laterales.',
    stock: 4,
    categoria: 'Herramientas y Accesorios',
    ubicacion: 'I-02-01',
    stockMinimo: 2,
    proveedor: 'Hensley Industries',
    equipoCompatible: ['Excavadora 390F'],
    unidadMedida: 'Unidad',
    observaciones: 'Inspeccionar soldaduras regularmente',
    imagenUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
  },

  // Componentes de Seguridad
  {
    codigo: 'CS-001',
    nombre: 'Alarma Reversa LED Strobe',
    descripcion: 'Alarma de reversa con luz LED estroboscópica. 97 dB a 1 metro. Resistente al agua y polvo IP67.',
    stock: 30,
    categoria: 'Componentes de Seguridad',
    ubicacion: 'J-01-10',
    stockMinimo: 10,
    proveedor: 'Federal Signal',
    equipoCompatible: ['Aplicación universal'],
    unidadMedida: 'Unidad',
    observaciones: 'Verificar funcionamiento semanalmente',
    imagenUrl: 'https://images.unsplash.com/photo-1581092336614-09fa1cec8b8d?w=400&h=300&fit=crop'
  },
  {
    codigo: 'CS-002',
    nombre: 'Extintor CO2 9 Kg Vehicular',
    descripcion: 'Extintor de CO2 de 9 kg para vehículos. Certificado para fuegos clase B y C. Incluye soporte vehicular.',
    stock: 25,
    categoria: 'Componentes de Seguridad',
    ubicacion: 'J-02-05',
    stockMinimo: 8,
    proveedor: 'Amerex',
    equipoCompatible: ['Aplicación universal'],
    unidadMedida: 'Unidad',
    observaciones: 'Revisar presión mensualmente',
    imagenUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'
  },

  // Estructura y Chasis
  {
    codigo: 'EC-001',
    nombre: 'Diente Excavadora Caterpillar J460',
    descripcion: 'Diente para excavadora Caterpillar sistema J460. Acero al carbono templado. Diseño autoafilante para máxima penetración.',
    stock: 60,
    categoria: 'Estructura y Chasis',
    ubicacion: 'H-02-05',
    stockMinimo: 20,
    proveedor: 'Caterpillar Chile',
    equipoCompatible: ['Excavadora 390F', 'Excavadora 336E'],
    unidadMedida: 'Unidad',
    observaciones: 'Cambiar cuando desgaste alcance 50%'
  },
  {
    codigo: 'EC-002',
    nombre: 'Buje Pivote Brazo Excavadora',
    descripcion: 'Buje de bronce para pivote de brazo excavadora. Diámetro interior 120mm, exterior 140mm. Tratamiento antifricción.',
    stock: 24,
    categoria: 'Estructura y Chasis',
    ubicacion: 'H-03-08',
    stockMinimo: 8,
    proveedor: 'SKF',
    equipoCompatible: ['Excavadora 330D', 'Excavadora 336E'],
    unidadMedida: 'Unidad',
    observaciones: 'Lubricar según programa de mantenimiento'
  },

  // Herramientas y Accesorios
  {
    codigo: 'HA-001',
    nombre: 'Martillo Hidráulico Atlas Copco HB7000',
    descripcion: 'Martillo hidráulico Atlas Copco HB7000 para demolición. Peso 7.5 toneladas. Incluye cinceles y herramientas especiales.',
    stock: 3,
    categoria: 'Herramientas y Accesorios',
    ubicacion: 'I-01-02',
    stockMinimo: 1,
    proveedor: 'Atlas Copco',
    equipoCompatible: ['Excavadora 390F', 'Excavadora 6020B'],
    unidadMedida: 'Unidad',
    observaciones: 'Requiere certificación para operación'
  },
  {
    codigo: 'HA-002',
    nombre: 'Cuchara Excavadora 3.5 m³',
    descripcion: 'Cuchara para excavadora capacidad 3.5 m³. Acero Hardox 450. Incluye dientes intercambiables y cuchillas laterales.',
    stock: 4,
    categoria: 'Herramientas y Accesorios',
    ubicacion: 'I-02-01',
    stockMinimo: 2,
    proveedor: 'Hensley Industries',
    equipoCompatible: ['Excavadora 390F'],
    unidadMedida: 'Unidad',
    observaciones: 'Inspeccionar soldaduras regularmente'
  },

  // Componentes de Seguridad
  {
    codigo: 'CS-001',
    nombre: 'Alarma Reversa LED Strobe',
    descripcion: 'Alarma de reversa con luz LED estroboscópica. 97 dB a 1 metro. Resistente al agua y polvo IP67.',
    stock: 30,
    categoria: 'Componentes de Seguridad',
    ubicacion: 'J-01-10',
    stockMinimo: 10,
    proveedor: 'Federal Signal',
    equipoCompatible: ['Aplicación universal'],
    unidadMedida: 'Unidad',
    observaciones: 'Verificar funcionamiento semanalmente'
  },
  {
    codigo: 'CS-002',
    nombre: 'Extintor CO2 9 Kg Vehicular',
    descripcion: 'Extintor de CO2 de 9 kg para vehículos. Certificado para fuegos clase B y C. Incluye soporte vehicular.',
    stock: 25,
    categoria: 'Componentes de Seguridad',
    ubicacion: 'J-02-05',
    stockMinimo: 8,
    proveedor: 'Amerex',
    equipoCompatible: ['Aplicación universal'],
    unidadMedida: 'Unidad',
    observaciones: 'Revisar presión mensualmente'
  }
];

async function seedDatabase() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');

    // Limpiar completamente la colección y sus índices
    console.log('🧹 Limpiando base de datos...');
    try {
      // Primero eliminar todos los índices
      await Product.collection.dropIndexes();
      console.log('🗂️ Índices eliminados');
    } catch (err) {
      console.log('ℹ️ No había índices que eliminar');
    }
    
    try {
      // Luego eliminar la colección completa
      await Product.collection.drop();
      console.log('🗑️ Colección eliminada');
    } catch (err) {
      console.log('ℹ️ Colección no existía');
    }
    
    console.log('🧹 Base de datos limpiada completamente');

    // Función para descargar y guardar imagen
    const downloadImage = async (url, filename) => {
      try {
        const https = require('https');
        const fs = require('fs');
        const path = require('path');
        
        // Crear directorio uploads si no existe
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filePath = path.join(uploadsDir, filename);
        
        // Si el archivo ya existe, no descargarlo de nuevo
        if (fs.existsSync(filePath)) {
          console.log(`✅ Imagen ya existe: ${filename}`);
          return filename;
        }
        
        return new Promise((resolve, reject) => {
          const file = fs.createWriteStream(filePath);
          https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve(filename);
            });
          }).on('error', (err) => {
            fs.unlink(filePath, () => {});
            reject(err);
          });
        });
      } catch (error) {
        console.log(`⚠️ Error descargando imagen para ${filename}:`, error.message);
        return null;
      }
    };

    // Procesar productos con imágenes
    const productosConImagenes = [];
    
    console.log('📸 Procesando imágenes de productos...');
    for (let i = 0; i < productosIniciales.length; i++) {
      const producto = { ...productosIniciales[i] };
      
      if (producto.imagenUrl) {
        const extension = '.jpg';
        const filename = `${producto.codigo.toLowerCase()}${extension}`;
        
        try {
          const imagenGuardada = await downloadImage(producto.imagenUrl, filename);
          if (imagenGuardada) {
            producto.imagen = imagenGuardada;
            console.log(`✅ Imagen procesada: ${filename}`);
          }
        } catch (error) {
          console.log(`❌ Error con imagen de ${producto.codigo}: ${error.message}`);
        }
        
        // Remover imagenUrl ya que no es parte del modelo
        delete producto.imagenUrl;
      }
      
      productosConImagenes.push(producto);
    }

    // Insertar productos uno por uno para mejor control de errores
    console.log('💾 Insertando productos...');
    const productosCreados = [];
    
    for (const productoData of productosConImagenes) {
      try {
        const producto = new Product(productoData);
        const productoGuardado = await producto.save();
        productosCreados.push(productoGuardado);
        console.log(`✅ Producto insertado: ${productoData.codigo} - ${productoData.nombre}`);
      } catch (error) {
        console.log(`❌ Error insertando ${productoData.codigo}: ${error.message}`);
      }
    }

    console.log(`\n✨ ${productosCreados.length} productos insertados exitosamente`);

    // Mostrar estadísticas
    const stats = await Product.aggregate([
      {
        $group: {
          _id: '$categoria',
          cantidad: { $sum: 1 },
          stockTotal: { $sum: '$stock' }
        }
      },
      {
        $sort: { cantidad: -1 }
      }
    ]);

    console.log('\n📊 Estadísticas por categoría:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.cantidad} productos, ${stat.stockTotal} unidades en stock`);
    });

    // Mostrar productos con stock bajo
    const stockBajo = await Product.find({
      $expr: { $lte: ['$stock', '$stockMinimo'] }
    });

    if (stockBajo.length > 0) {
      console.log('\n⚠️ Productos con stock bajo:');
      stockBajo.forEach(producto => {
        console.log(`   ${producto.codigo} - ${producto.nombre}: ${producto.stock}/${producto.stockMinimo}`);
      });
    }

    // Mostrar productos con imágenes
    const productosConImagenCount = await Product.countDocuments({ imagen: { $exists: true, $ne: null } });
    console.log(`\n🖼️ Productos con imágenes: ${productosConImagenCount}/${productosCreados.length}`);

    console.log('\n🎉 Seeder ejecutado exitosamente');
    console.log('💼 Sistema de inventario listo para Maestranzas Unidos S.A.');
    console.log('📸 Imágenes descargadas y asociadas a los productos');
    
  } catch (error) {
    console.error('❌ Error al ejecutar seeder:', error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
  }
}

// Ejecutar seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, productosIniciales };