import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

const categorias = [
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
];

const unidadesMedida = ['Unidad', 'Metro', 'Litro', 'Kilogramo', 'Juego', 'Par', 'Rollo', 'Caja'];
const estadosProducto = ['Activo', 'Descontinuado', 'En Evaluación'];

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [showStockBajo, setShowStockBajo] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    stock: '',
    categoria: 'Repuestos Generales',
    ubicacion: '',
    stockMinimo: '',
    proveedor: '',
    equipoCompatible: '',
    unidadMedida: 'Unidad',
    observaciones: '',
    estado: 'Activo'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Cargar productos y estadísticas al iniciar
  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoria', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (showStockBajo) params.append('stockBajo', 'true');
      
      const response = await axios.get(`${API_URL}/products?${params}`);
      setProducts(response.data.productos || response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  // Actualizar lista cuando cambien los filtros
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm, showStockBajo]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('codigo', formData.codigo);
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('categoria', formData.categoria);
      formDataToSend.append('ubicacion', formData.ubicacion);
      formDataToSend.append('stockMinimo', formData.stockMinimo);
      formDataToSend.append('proveedor', formData.proveedor);
      formDataToSend.append('equipoCompatible', formData.equipoCompatible);
      formDataToSend.append('unidadMedida', formData.unidadMedida);
      formDataToSend.append('observaciones', formData.observaciones);
      formDataToSend.append('estado', formData.estado);
      
      if (imageFile) {
        formDataToSend.append('imagen', imageFile);
      }

      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post(`${API_URL}/products`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      fetchProducts();
      fetchStats();
      resetForm();
      setShowModal(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el producto');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      codigo: product.codigo,
      nombre: product.nombre,
      descripcion: product.descripcion,
      stock: product.stock.toString(),
      categoria: product.categoria || 'Repuestos Generales',
      ubicacion: product.ubicacion || '',
      stockMinimo: product.stockMinimo?.toString() || '1',
      proveedor: product.proveedor || '',
      equipoCompatible: product.equipoCompatible?.join(', ') || '',
      unidadMedida: product.unidadMedida || 'Unidad',
      observaciones: product.observaciones || '',
      estado: product.estado || 'Activo'
    });
    if (product.imagen) {
      setImagePreview(`http://localhost:5000/uploads/${product.imagen}`);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await axios.delete(`${API_URL}/products/${id}`);
        fetchProducts();
        fetchStats();
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Error al eliminar el producto');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      stock: '',
      categoria: 'Repuestos Generales',
      ubicacion: '',
      stockMinimo: '',
      proveedor: '',
      equipoCompatible: '',
      unidadMedida: 'Unidad',
      observaciones: '',
      estado: 'Activo'
    });
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setError('');
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.equipoCompatible && product.equipoCompatible.some(equipo => 
                           equipo.toLowerCase().includes(searchTerm.toLowerCase())
                         ));
    const matchesCategory = selectedCategory === '' || product.categoria === selectedCategory;
    const matchesStockBajo = !showStockBajo || (product.stock <= product.stockMinimo);
    return matchesSearch && matchesCategory && matchesStockBajo;
  });

  // Estadísticas calculadas
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= (p.stockMinimo || 1)).length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="company-info">
              <h1>🏭 Maestranzas Unidos S.A.</h1>
              <p>Sistema de Inventario - Equipos Pesados | Región de Atacama</p>
            </div>
            <div className="header-actions">
              <button 
                className="btn btn-primary"
                onClick={openModal}
              >
                ➕ Agregar Producto
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="stats-bar">
        <div className="container">
          <div className="stats">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7h-9V5a3 3 0 0 0-6 0v2H3l2 13h14l2-13z"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-number">{totalProducts.toLocaleString()}</div>
                <div className="stat-label">Total Productos</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-number">{lowStockProducts.toLocaleString()}</div>
                <div className="stat-label">Stock Bajo</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-number">{totalStock.toLocaleString()}</div>
                <div className="stat-label">Total Stock</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="main">
        <div className="container">
          <div className="filters-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="🔍 Buscar por código, nombre, descripción o equipo compatible..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filters-row">
              <div className="category-filter">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  <option value="">📂 Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="stock-filter">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={showStockBajo}
                    onChange={(e) => setShowStockBajo(e.target.checked)}
                  />
                  ⚠️ Solo stock bajo
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Cargando inventario...</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 7h-9V5a3 3 0 0 0-6 0v2H3l2 13h14l2-13z"/>
                    </svg>
                  </div>
                  <h3>No hay productos</h3>
                  <p>
                    {searchTerm || selectedCategory || showStockBajo
                      ? 'No se encontraron productos con los filtros aplicados'
                      : 'Agrega tu primer producto para comenzar'
                    }
                  </p>
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div key={product._id} className={`product-card ${product.stock <= (product.stockMinimo || 1) ? 'low-stock' : ''}`}>
                    <div className="product-image">
                      {product.imagen ? (
                        <img 
                          src={`http://localhost:5000/uploads/${product.imagen}`} 
                          alt={product.nombre}
                          onError={(e) => {
                            // Si falla la imagen local, mostrar placeholder
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="placeholder-image" 
                        style={{display: product.imagen ? 'none' : 'flex'}}
                      >
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                        <p>Sin imagen</p>
                      </div>
                      <div className="product-actions">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(product)}
                          title="Editar producto"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(product._id)}
                          title="Eliminar producto"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="product-content">
                      <div className="product-header">
                        <span className="product-code">{product.codigo}</span>
                        <span className={`product-status ${product.estado?.toLowerCase().replace(' ', '-')}`}>
                          {product.estado || 'Activo'}
                        </span>
                      </div>
                      <h3 className="product-name">{product.nombre}</h3>
                      <p className="product-description">{product.descripcion}</p>
                      
                      <div className="product-details">
                        <div className="detail-row">
                          <span className="detail-label">📦 Stock:</span>
                          <span className={`detail-value ${product.stock <= (product.stockMinimo || 1) ? 'low-stock-text' : ''}`}>
                            {product.stock} {product.unidadMedida || 'Unidad'}
                            {product.stock <= (product.stockMinimo || 1) && ' ⚠️'}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">📍 Ubicación:</span>
                          <span className="detail-value">{product.ubicacion || 'Sin asignar'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">🏪 Proveedor:</span>
                          <span className="detail-value">{product.proveedor || 'Sin asignar'}</span>
                        </div>
                        {product.equipoCompatible && product.equipoCompatible.length > 0 && (
                          <div className="detail-row">
                            <span className="detail-label">🚛 Equipos:</span>
                            <span className="detail-value">{product.equipoCompatible.join(', ')}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="product-footer">
                        <span className="product-category">{product.categoria}</span>
                        {product.observaciones && (
                          <span className="product-notes" title={product.observaciones}>📝</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal para agregar/editar producto */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Código *</label>
                  <input
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: MT-001"
                  />
                </div>

                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    required
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    placeholder="Nombre del producto"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Descripción *</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    placeholder="Descripción detallada del producto"
                  />
                </div>

                <div className="form-group">
                  <label>Stock Actual *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Stock Mínimo *</label>
                  <input
                    type="number"
                    name="stockMinimo"
                    value={formData.stockMinimo}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="1"
                  />
                </div>

                <div className="form-group">
                  <label>Ubicación en Bodega *</label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: A-02-15"
                  />
                </div>

                <div className="form-group">
                  <label>Unidad de Medida *</label>
                  <select
                    name="unidadMedida"
                    value={formData.unidadMedida}
                    onChange={handleInputChange}
                    required
                  >
                    {unidadesMedida.map(unidad => (
                      <option key={unidad} value={unidad}>{unidad}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Proveedor</label>
                  <input
                    type="text"
                    name="proveedor"
                    value={formData.proveedor}
                    onChange={handleInputChange}
                    placeholder="Nombre del proveedor"
                  />
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                  >
                    {estadosProducto.map(estado => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Equipos Compatibles</label>
                  <input
                    type="text"
                    name="equipoCompatible"
                    value={formData.equipoCompatible}
                    onChange={handleInputChange}
                    placeholder="Separar con comas: Excavadora 390F, Camión 793F"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Notas adicionales sobre el producto"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Imagen del Producto</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Actualizar' : 'Agregar'} Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;