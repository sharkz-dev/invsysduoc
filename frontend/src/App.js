import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

const categorias = [
  'General', 'Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Salud', 'Automóvil', 'Otros'
];

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: 'General'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Cargar productos al iniciar
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      formDataToSend.append('precio', formData.precio);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('categoria', formData.categoria);
      
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
      precio: product.precio.toString(),
      stock: product.stock.toString(),
      categoria: product.categoria || 'General'
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
      precio: '',
      stock: '',
      categoria: 'General'
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
                         product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Estadísticas
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= 5).length;
  const totalValue = products.reduce((sum, p) => sum + (p.precio * p.stock), 0);

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1>Sistema de Inventarios</h1>
            <div className="header-actions">
              <button className="btn btn-primary" onClick={openModal}>
                + Agregar Producto
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4m-8 0V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-8 0h8"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-number">{totalProducts}</div>
                <div className="stat-label">Total Productos</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-number">{lowStockProducts}</div>
                <div className="stat-label">Stock Bajo</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-number">${totalValue.toLocaleString()}</div>
                <div className="stat-label">Valor Total</div>
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
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="category-filter">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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
              <p>Cargando productos...</p>
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
                    {searchTerm || selectedCategory 
                      ? 'No se encontraron productos con los filtros aplicados'
                      : 'Agrega tu primer producto para comenzar'
                    }
                  </p>
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div key={product._id} className="product-card">
                    <div className="product-image">
                      {product.imagen ? (
                        <img 
                          src={`http://localhost:5000/uploads/${product.imagen}`} 
                          alt={product.nombre}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="placeholder-image" style={{display: product.imagen ? 'none' : 'flex'}}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                      </div>
                      <div className="product-actions">
                        <button 
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(product)}
                          title="Editar"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button 
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(product._id)}
                          title="Eliminar"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="product-content">
                      <div className="product-header">
                        <span className="product-code">{product.codigo}</span>
                        <span className="product-category">{product.categoria}</span>
                      </div>
                      
                      <h3 className="product-name">{product.nombre}</h3>
                      <p className="product-description">{product.descripcion}</p>
                      
                      <div className="product-details">
                        <div className="detail-item">
                          <span className="label">Precio:</span>
                          <span className="value price">${product.precio.toLocaleString()}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Stock:</span>
                          <span className={`value stock ${product.stock <= 5 ? 'low-stock' : ''}`}>
                            {product.stock} unidades
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</h2>
              <button className="btn-close" onClick={closeModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-section">
                <h3>Información Básica</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Código del Producto *</label>
                    <input
                      type="text"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: PROD001"
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
                </div>

                <div className="form-group">
                  <label>Nombre del Producto *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Laptop Dell Inspiron"
                  />
                </div>

                <div className="form-group">
                  <label>Descripción *</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    required
                    placeholder="Descripción detallada del producto"
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Precio *</label>
                    <input
                      type="number"
                      name="precio"
                      value={formData.precio}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock *</label>
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
                </div>
              </div>

              <div className="form-section">
                <h3>Imagen del Producto</h3>
                <div className="image-upload-section">
                  <div className="image-preview">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" />
                    ) : (
                      <div className="image-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                        <p>Sin imagen</p>
                      </div>
                    )}
                  </div>
                  <div className="image-upload-controls">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="btn btn-secondary">
                      Seleccionar Imagen
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Actualizar' : 'Guardar'}
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