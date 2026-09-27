/* ==============================================================================
   Art Flair - Sabahz Trading | Unified Admin API & Persistent Data Layer
   ============================================================================== */

const INITIAL_CATALOG = [
  { id: 'AF-PNT-001', name: "Winsor & Newton Artists' Oil Colour Set (10 x 37ml)", category: 'Paints', brand: 'Winsor & Newton', price: 4850.00, discount: 10, stock: 28, rating: 4.9, image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80', description: 'Formulated with single high-grade pigments for unsurpassed tinting strength and buttery consistency.' },
  { id: 'AF-BRS-002', name: 'Raphaël Kolinsky Red Sable Filbert Brush Set (3-Piece)', category: 'Brushes', brand: 'Raphaël Paris', price: 3250.00, discount: 10, stock: 14, rating: 4.9, image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&auto=format&fit=crop&q=80', description: 'Hand-crafted in France with finest Siberian Kolinsky hair offering exceptional spring, snap, and fluid capacity.' },
  { id: 'AF-CNV-003', name: 'Claessens Belgian Double Oil-Primed Linen Canvas Roll (2.1m x 10m)', category: 'Canvas', brand: 'Claessens Belgium', price: 18500.00, discount: 7, stock: 6, rating: 5.0, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80', description: 'The worldwide gold standard in archival painting surfaces. Woven from 100% pure flax and zinc-white oil primed.' },
  { id: 'AF-PNT-004', name: 'Daniel Smith Extra Fine Watercolor 15ml - Lapis Lazuli Genuine', category: 'Paints', brand: 'Daniel Smith', price: 2150.00, discount: 0, stock: 4, rating: 5.0, image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80', description: 'Hand-crafted mineral pigment ground from pure semi-precious Afghan Lapis Lazuli stone.' },
  { id: 'AF-DRW-005', name: "Caran d'Ache Luminance 6901 Colored Pencil 76-Piece Wood Box Set", category: 'Drawing Media', brand: "Caran d'Ache", price: 34500.00, discount: 5, stock: 3, rating: 4.9, image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80', description: 'Swiss made with highest lightfastness rating under ASTM D-6901 standards for gallery archival work.' },
  { id: 'AF-PAP-006', name: 'Arches Aquarelle 100% Pure Cotton 300gsm Rough Watercolour Block', category: 'Paper & Pads', brand: 'Arches France', price: 3850.00, discount: 8, stock: 18, rating: 4.9, image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80', description: 'Cylinder mould-made in France with natural gelatin sizing and deckled edges.' },
  { id: 'AF-CAL-007', name: 'Kuretake Zig Cartoonist Sumi Black Ink 60ml & Manga Nib Set', category: 'Calligraphy', brand: 'Kuretake Japan', price: 1450.00, discount: 0, stock: 32, rating: 4.8, image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&auto=format&fit=crop&q=80', description: 'Dense lustrous waterproof black sumi ink for copperplate, broad edge, and Japanese calligraphy.' },
  { id: 'AF-EAS-008', name: 'Mabef M-02 Professional Double Mast Crank Studio Easel', category: 'Easels', brand: 'Mabef Italy', price: 29500.00, discount: 12, stock: 2, rating: 4.8, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80', description: 'Constructed of stain-resistant oiled beech wood with heavy-duty mechanical crank handle.' },
  { id: 'AF-MED-009', name: 'Liquitex Professional Slow-Dri Fluid Retarder Medium 237ml', category: 'Painting Medium', brand: 'Liquitex', price: 1250.00, discount: 0, stock: 20, rating: 4.7, image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80', description: 'Extends acrylic work time by up to 40% for seamless wet-in-wet blending and soft shading.' },
  { id: 'AF-ACC-010', name: 'Holbein Artists Stainless Steel Palette Knives (Set of 4)', category: 'Accessories', brand: 'Holbein Japan', price: 2890.00, discount: 0, stock: 0, rating: 4.9, image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&auto=format&fit=crop&q=80', description: 'Precision forged one-piece stainless steel blade ensuring high flexibility and control.' },
  { id: 'AF-MRK-011', name: 'Posca Acrylic Paint Marker Full Studio Set (15 Assorted Nibs)', category: 'Pen & Markers', brand: 'Uni Posca Japan', price: 3490.00, discount: 5, stock: 12, rating: 4.8, image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80', description: 'Opaque water-based pigment markers adherence across paper, canvas, wood, metal, and glass.' }
];

const INITIAL_CUSTOMERS = [
  { id: 'CUST-104', name: 'Aarav Sharma', email: 'artist.patron@studio.com', phone: '+91 98201 45678', city: 'Mumbai', state: 'Maharashtra', discipline: 'Oil Painting & Mineral Glazes', ordersCount: 0, totalSpent: 0.00, lifetimeSpend: 0.00, joinedDate: '2025-03-12', createdAt: '2025-03-12', status: 'Active Atelier' },
  { id: 'CUST-105', name: 'Ananya Deshmukh', email: 'ananya.arts@pune.edu', phone: '+91 98110 33421', city: 'Pune', state: 'Maharashtra', discipline: 'Botanical Watercolor & Calligraphy', ordersCount: 0, totalSpent: 0.00, lifetimeSpend: 0.00, joinedDate: '2025-01-20', createdAt: '2025-01-20', status: 'Active Atelier' },
  { id: 'CUST-106', name: 'Vikram Mehta', email: 'vikram.m@studiobangalore.com', phone: '+91 99450 78123', city: 'Bengaluru', state: 'Karnataka', discipline: 'Large Scale Murals & Acrylic', ordersCount: 0, totalSpent: 0.00, lifetimeSpend: 0.00, joinedDate: '2025-06-18', createdAt: '2025-06-18', status: 'Active Atelier' },
  { id: 'CUST-107', name: 'Pooja Iyer', email: 'pooja.iyer@chennaiatelier.org', phone: '+91 94440 99881', city: 'Chennai', state: 'Tamil Nadu', discipline: 'Traditional Temple Arts & Gold Leaf', ordersCount: 0, totalSpent: 0.00, lifetimeSpend: 0.00, joinedDate: '2025-02-04', createdAt: '2025-02-04', status: 'Active Atelier' },
  { id: 'CUST-108', name: 'Dr. Kabir Sen', email: 'kabir.sen@barodaarts.ac.in', phone: '+91 98250 67431', city: 'Vadodara', state: 'Gujarat', discipline: 'Printmaking & Archival Drawing', ordersCount: 0, totalSpent: 0.00, lifetimeSpend: 0.00, joinedDate: '2025-05-30', createdAt: '2025-05-30', status: 'Active Atelier' }
];

function getStoredProducts() {
  const cached = StorageService.get(API_CONFIG.STORAGE_KEYS.LOCAL_PRODUCTS);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }
  StorageService.set(API_CONFIG.STORAGE_KEYS.LOCAL_PRODUCTS, INITIAL_CATALOG);
  return INITIAL_CATALOG;
}

function saveStoredProducts(products) {
  StorageService.set(API_CONFIG.STORAGE_KEYS.LOCAL_PRODUCTS, products);
}

const ApiClient = {
  async request(endpoint, options = {}) {
    const token = StorageService.get(API_CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP Error: ${response.status}`);
    } catch (networkOrServerError) {
      return this.handleFallback(endpoint, options);
    }
  },

  handleFallback(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const products = getStoredProducts();

    // 1. STATS
    if (endpoint.includes('/admin/stats')) {
      const lowStockProducts = products.filter(p => p.stock <= 10);
      return {
        success: true,
        isLiveDb: false,
        stats: {
          totalRevenue: 0.00,
          totalOrders: 0,
          totalCustomers: INITIAL_CUSTOMERS.length,
          totalProducts: products.length,
          lowStockCount: lowStockProducts.length,
          lowStockProducts: lowStockProducts,
          recentOrders: []
        }
      };
    }

    // 2. PRODUCTS (GET, POST, PUT, DELETE)
    if (endpoint.includes('/admin/products') || endpoint.includes('/products')) {
      if (method === 'GET') {
        return { success: true, products: products };
      }

      if (method === 'POST') {
        const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
        const newProduct = {
          id: body.id || `AF-${(body.category || 'GEN').substring(0, 3).toUpperCase()}-${String(Date.now()).slice(-3)}`,
          name: body.name || 'New Atelier Product',
          category: body.category || 'Paints',
          brand: body.brand || 'Artisan Atelier',
          price: parseFloat(body.price) || 0,
          discount: parseFloat(body.discount) || 0,
          stock: parseInt(body.stock, 10) || 0,
          rating: 5.0,
          image: body.image || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80',
          description: body.description || ''
        };
        const updated = [newProduct, ...products];
        saveStoredProducts(updated);
        return { success: true, product: newProduct, message: 'Product added to catalog successfully.' };
      }

      if (method === 'PUT') {
        const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
        const parts = endpoint.split('/');
        const id = parts[parts.length - 1] || body.id;
        const updated = products.map(p => p.id === id ? { ...p, ...body } : p);
        saveStoredProducts(updated);
        return { success: true, message: 'Product updated successfully.' };
      }

      if (method === 'DELETE') {
        const parts = endpoint.split('/');
        const id = parts[parts.length - 1];
        const updated = products.filter(p => p.id !== id);
        saveStoredProducts(updated);
        return { success: true, message: 'Product removed from catalog.' };
      }
    }

    // 3. INVENTORY
    if (endpoint.includes('/admin/inventory')) {
      if (method === 'PUT') {
        const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
        const parts = endpoint.split('/');
        const id = parts[parts.length - 1];
        const updated = products.map(p => p.id === id ? { ...p, stock: parseInt(body.stock, 10) || 0 } : p);
        saveStoredProducts(updated);
        return { success: true, message: 'Stock level updated.' };
      }
      return { success: true, inventory: products };
    }

    // 4. ORDERS (Always empty as requested)
    if (endpoint.includes('/admin/orders') || endpoint.includes('/orders')) {
      return { success: true, orders: [] };
    }

    // 5. CUSTOMERS
    if (endpoint.includes('/admin/customers') || endpoint.includes('/customers')) {
      return { success: true, customers: INITIAL_CUSTOMERS };
    }

    // 6. ANALYTICS
    if (endpoint.includes('/admin/analytics')) {
      const categoryCounts = {};
      products.forEach(p => {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      });

      return {
        success: true,
        analytics: {
          categories: Object.keys(categoryCounts).map(cat => ({
            name: cat,
            count: categoryCounts[cat],
            share: `${Math.round((categoryCounts[cat] / products.length) * 100)}%`
          })),
          salesTrends: [
            { month: 'Apr', sales: 0 },
            { month: 'May', sales: 0 },
            { month: 'Jun', sales: 0 },
            { month: 'Jul', sales: 0 },
            { month: 'Aug', sales: 0 },
            { month: 'Sep', sales: 0 }
          ]
        }
      };
    }

    // 7. UPLOAD SIMULATION
    if (endpoint.includes('/upload')) {
      const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
      return {
        success: true,
        url: body.dataUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80',
        message: 'Image uploaded successfully.'
      };
    }

    return { success: true, message: 'Operation completed successfully.' };
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};
