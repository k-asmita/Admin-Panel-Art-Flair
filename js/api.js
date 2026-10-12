/* ==============================================================================
   Art Flair - Sabahz Trading | Unified Admin API & Persistent Data Layer
   ============================================================================== */

const INITIAL_CATALOG = [
  { id: 'AF-PNT-001', name: "Winsor & Newton Artists' Oil Colour Set (10 x 37ml)", category: 'Paints', brand: 'Winsor & Newton', price: 4850.00, discount: 10, stock: 28, rating: 4.9, image: 'Products/Paints/oil-colour.jpg', description: 'Formulated with single high-grade pigments for unsurpassed tinting strength and buttery consistency.' },
  { id: 'AF-BRS-002', name: 'Raphaël Kolinsky Red Sable Filbert Brush Set (3-Piece)', category: 'Brushes', brand: 'Raphaël Paris', price: 3250.00, discount: 10, stock: 14, rating: 4.9, image: 'Products/Brushes/professional-set.webp', description: 'Hand-crafted in France with finest Siberian Kolinsky hair offering exceptional spring, snap, and fluid capacity.' },
  { id: 'AF-CNV-003', name: 'Claessens Belgian Double Oil-Primed Linen Canvas Roll (2.1m x 10m)', category: 'Canvas', brand: 'Claessens Belgium', price: 18500.00, discount: 7, stock: 6, rating: 5.0, image: 'Products/Canvas/canvas-roll.webp', description: 'The worldwide gold standard in archival painting surfaces. Woven from 100% pure flax and zinc-white oil primed.' },
  { id: 'AF-PNT-004', name: 'Daniel Smith Extra Fine Watercolor 15ml - Lapis Lazuli Genuine', category: 'Paints', brand: 'Daniel Smith', price: 2150.00, discount: 0, stock: 4, rating: 5.0, image: 'Products/Paints/fine-water-colour.jpg', description: 'Hand-crafted mineral pigment ground from pure semi-precious Afghan Lapis Lazuli stone.' },
  { id: 'AF-DRW-005', name: "Caran d'Ache Luminance 6901 Colored Pencil 76-Piece Wood Box Set", category: 'Drawing Media', brand: "Caran d'Ache", price: 34500.00, discount: 5, stock: 3, rating: 4.9, image: 'Products/Drawing Media/oil-coloured-48.webp', description: 'Swiss made with highest lightfastness rating under ASTM D-6901 standards for gallery archival work.' },
  { id: 'AF-PAP-006', name: 'Arches Aquarelle 100% Pure Cotton 300gsm Rough Watercolour Block', category: 'Paper & Pads', brand: 'Arches France', price: 3850.00, discount: 8, stock: 18, rating: 4.9, image: 'Products/Paper & Pads/a4-300gsm-pad.jpg', description: 'Cylinder mould-made in France with natural gelatin sizing and deckled edges.' },
  { id: 'AF-CAL-007', name: 'Kuretake Zig Cartoonist Sumi Black Ink 60ml & Manga Nib Set', category: 'Calligraphy', brand: 'Kuretake Japan', price: 1450.00, discount: 0, stock: 32, rating: 4.8, image: 'Products/Calligraphy/calligraphy1.jpg', description: 'Dense lustrous waterproof black sumi ink for copperplate, broad edge, and Japanese calligraphy.' },
  { id: 'AF-EAS-008', name: 'Mabef M-02 Professional Double Mast Crank Studio Easel', category: 'Easels', brand: 'Mabef Italy', price: 29500.00, discount: 12, stock: 2, rating: 4.8, image: 'Products/Easels/easel1.webp', description: 'Constructed of stain-resistant oiled beech wood with heavy-duty mechanical crank handle.' },
  { id: 'AF-MED-009', name: 'Liquitex Professional Slow-Dri Fluid Retarder Medium 237ml', category: 'Painting Medium', brand: 'Liquitex', price: 1250.00, discount: 0, stock: 20, rating: 4.7, image: 'Products/Painting Medium/gloss-medium.webp', description: 'Extends acrylic work time by up to 40% for seamless wet-in-wet blending and soft shading.' },
  { id: 'AF-ACC-010', name: 'Holbein Artists Stainless Steel Palette Knives (Set of 4)', category: 'Accessories', brand: 'Holbein Japan', price: 2890.00, discount: 0, stock: 0, rating: 4.9, image: 'Products/Accessories/palette-knife.jpg', description: 'Precision forged one-piece stainless steel blade ensuring high flexibility and control.' },
  { id: 'AF-MRK-011', name: 'Posca Acrylic Paint Marker Full Studio Set (15 Assorted Nibs)', category: 'Pen & Markers', brand: 'Uni Posca Japan', price: 3490.00, discount: 5, stock: 12, rating: 4.8, image: 'Products/Pen & Markers/sta-acrylic.webp', description: 'Opaque water-based pigment markers adherence across paper, canvas, wood, metal, and glass.' }
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
    // Automatically upgrade any cached items that have legacy or broken image URLs
    let needsUpdate = false;
    const upgraded = cached.map(item => {
      const canonical = INITIAL_CATALOG.find(c => c.id === item.id);
      if (canonical && (!item.image || item.image.includes('unsplash.com') || item.image.includes('../Products') || item.image.includes('photo-1579783902614'))) {
        needsUpdate = true;
        return { ...item, image: canonical.image };
      }
      return item;
    });
    if (needsUpdate) {
      StorageService.set(API_CONFIG.STORAGE_KEYS.LOCAL_PRODUCTS, upgraded);
    }
    return upgraded;
  }
  StorageService.set(API_CONFIG.STORAGE_KEYS.LOCAL_PRODUCTS, INITIAL_CATALOG);
  return INITIAL_CATALOG;
}

function saveStoredProducts(products) {
  StorageService.set(API_CONFIG.STORAGE_KEYS.LOCAL_PRODUCTS, products);
}

function getStoredOrders() {
  const cached = StorageService.get('art_flair_orders_cache');
  if (cached && Array.isArray(cached)) {
    return cached;
  }
  return [];
}

function saveStoredOrders(orders) {
  StorageService.set('art_flair_orders_cache', orders);
}

const ApiClient = {
  async request(endpoint, options = {}) {
    const token = StorageService.get(API_CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        return await response.json();
      }
      const errorData = await response.json().catch(() => null);
      if (errorData) {
        return errorData;
      }
      throw new Error(`HTTP Error: ${response.status}`);
    } catch (networkOrServerError) {
      clearTimeout(timeoutId);
      const method = (options.method || 'GET').toUpperCase();
      console.error(`[ApiClient] ${method} ${endpoint} failed:`, networkOrServerError);
      
      // For state-changing mutations (POST, PUT, DELETE), never fake success with mock data
      if (method !== 'GET') {
        return {
          success: false,
          error: networkOrServerError.message || 'Database server communication failed.'
        };
      }
      return this.handleFallback(endpoint, options);
    }
  },

  handleFallback(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const products = getStoredProducts();
    const orders = getStoredOrders();

    // 0. AUTHENTICATION (Fixed Master Credentials)
    if (endpoint.includes('/login')) {
      const body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
      const email = (body.email || '').trim().toLowerCase();
      const password = (body.password || '').trim();

      const ALLOWED_EMAILS = ['admin@artflair.in', 'admin@artflair.com'];
      const ALLOWED_PASSWORD = 'Admin@24';

      if (ALLOWED_EMAILS.includes(email) && password === ALLOWED_PASSWORD) {
        return {
          success: true,
          token: 'art_flair_admin_jwt_' + Date.now(),
          user: {
            name: 'Sabahz Curator',
            email: 'admin@artflair.in',
            role: 'Master Atelier Administrator'
          }
        };
      }
      return {
        success: false,
        error: 'Invalid administrator credentials. Access restricted to authorized Atelier administrators only.'
      };
    }

    // 1. STATS
    if (endpoint.includes('/admin/stats')) {
      const stockEvaluation = typeof AdminInventory !== 'undefined'
        ? AdminInventory.evaluateStock(products)
        : {
            outOfStock: products.filter(p => p.stock === 0),
            lowStock: products.filter(p => p.stock > 0 && p.stock <= 10),
            healthy: products.filter(p => p.stock > 10),
            allAlerts: products.filter(p => p.stock <= 10).sort((a, b) => a.stock - b.stock),
            outCount: products.filter(p => p.stock === 0).length,
            lowCount: products.filter(p => p.stock > 0 && p.stock <= 10).length,
            alertCount: products.filter(p => p.stock <= 10).length,
            summaryText: `${products.filter(p => p.stock > 0 && p.stock <= 10).length} low stock · ${products.filter(p => p.stock === 0).length} out of stock`
          };

      const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      return {
        success: true,
        isLiveDb: false,
        stats: {
          totalRevenue: totalRevenue,
          totalOrders: orders.length,
          totalCustomers: INITIAL_CUSTOMERS.length,
          totalProducts: products.length,
          lowStockCount: stockEvaluation.lowCount,
          outOfStockCount: stockEvaluation.outCount,
          totalAlertCount: stockEvaluation.alertCount,
          lowStockProducts: stockEvaluation.allAlerts,
          summaryText: stockEvaluation.summaryText,
          recentOrders: orders.slice(0, 10)
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
          image: body.image || 'Products/placeholder-art.svg',
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

    // 4. ORDERS (Derived from unified orders store)
    if (endpoint.includes('/admin/orders') || endpoint.includes('/orders')) {
      if (method === 'PUT') {
        const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
        const parts = endpoint.split('/');
        const id = parts[parts.length - 2] || parts[parts.length - 1];
        const updated = orders.map(o => o.orderId === id ? { ...o, status: body.status || o.status } : o);
        saveStoredOrders(updated);
        return { success: true, message: 'Order status updated successfully.' };
      }
      return { success: true, orders: orders };
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
            { month: 'May 2026', orders: 12, revenue: 48500.0 },
            { month: 'Jun 2026', orders: 18, revenue: 72400.0 },
            { month: 'Jul 2026', orders: 24, revenue: 105800.0 },
            { month: 'Aug 2026', orders: 31, revenue: 142000.0 },
            { month: 'Sep 2026', orders: 2, revenue: 2181.6 }
          ],
          customerPreferences: [
            { discipline: "Oil Painting & Archival Glazes", percentage: 38, count: 152, growth: "+18%" },
            { discipline: "Botanical Watercolor & Calligraphy", percentage: 27, count: 108, growth: "+14%" },
            { discipline: "Large Scale Murals & Acrylics", percentage: 19, count: 76, growth: "+9%" },
            { discipline: "Printmaking & Drawing Media", percentage: 16, count: 64, growth: "+6%" }
          ],
          popularProducts: products.slice(0, 5).map((p, idx) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            image: p.image,
            salesVolume: 24 - idx * 3,
            revenue: (24 - idx * 3) * Number(p.price || 1200)
          })),
          categoryPerformance: Object.keys(categoryCounts).map(cat => ({
            category: cat,
            productCount: categoryCounts[cat],
            score: Math.round(categoryCounts[cat] * 9.5 + 15)
          }))
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

    return { success: false, error: 'Endpoint not supported.' };
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
