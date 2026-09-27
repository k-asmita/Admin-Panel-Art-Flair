/* ==============================================================================
   Art Flair - Sabahz Trading | Admin API Client with Robust Mock Fallbacks
   ============================================================================== */

const MOCK_DATA = {
  stats: {
    totalRevenue: 348920.00,
    totalOrders: 142,
    totalCustomers: 86,
    totalProducts: 48,
    lowStockCount: 4,
    lowStockProducts: [
      { id: 'SKU-OIL-WN-01', name: "Winsor & Newton Artists' Oil Master Set (12x37ml)", category: 'Paints', stock: 2, image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=120&auto=format&fit=crop&q=80' },
      { id: 'SKU-BRU-DA-03', name: 'Da Vinci Maestro Series 10 Kolinsky Sable #6', category: 'Brushes', stock: 0, image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=120&auto=format&fit=crop&q=80' },
      { id: 'SKU-PAP-AR-02', name: 'Arches Aquarelle 300gsm Cold Pressed Pad (12x16")', category: 'Paper & Pads', stock: 4, image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120&auto=format&fit=crop&q=80' },
      { id: 'SKU-EAS-MA-01', name: 'Mabef M-02 Professional Double Mast Studio Easel', category: 'Easels', stock: 3, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=120&auto=format&fit=crop&q=80' }
    ],
    recentOrders: [
      { orderId: 'AF-ORD-9842', customer: { firstName: 'Rohan', lastName: 'Kapoor', email: 'rohan.atelier@mumbaiarts.in' }, orderDate: '2026-09-27T10:30:00Z', items: [1, 2], total: 8499.00, status: 'Processing' },
      { orderId: 'AF-ORD-9841', customer: { firstName: 'Ananya', lastName: 'Sharma', email: 'ananya.finearts@delhi.edu' }, orderDate: '2026-09-26T16:45:00Z', items: [1], total: 3250.00, status: 'Shipped' },
      { orderId: 'AF-ORD-9840', customer: { firstName: 'Vikram', lastName: 'Mehta', email: 'vikram.m@studiobangalore.com' }, orderDate: '2026-09-26T09:15:00Z', items: [3], total: 14890.00, status: 'Delivered' },
      { orderId: 'AF-ORD-9839', customer: { firstName: 'Pooja', lastName: 'Iyer', email: 'pooja.iyer@chennaiatelier.org' }, orderDate: '2026-09-25T14:20:00Z', items: [2], total: 5400.00, status: 'Delivered' },
      { orderId: 'AF-ORD-9838', customer: { firstName: 'Sameer', lastName: 'Khan', email: 'sameer.k@kolkataarts.in' }, orderDate: '2026-09-24T18:00:00Z', items: [1], total: 1850.00, status: 'Cancelled' }
    ]
  },

  products: [
    { id: 'SKU-OIL-WN-01', name: "Winsor & Newton Artists' Oil Colour Introductory Set", category: 'Paints', brand: 'Winsor & Newton', price: 4299.00, discount: 10, stock: 2, rating: 4.9, image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=120&auto=format&fit=crop&q=80', description: 'Formulated with single high-grade pigments for unsurpassed tinting strength and permanence.' },
    { id: 'SKU-BRU-DA-03', name: 'Da Vinci Maestro Series 10 Kolinsky Red Sable Brush #6', category: 'Brushes', brand: 'Da Vinci', price: 2899.00, discount: 0, stock: 0, rating: 5.0, image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=120&auto=format&fit=crop&q=80', description: 'Handcrafted in Germany using selected Siberian Kolinsky male winter tails with extraordinary elasticity.' },
    { id: 'SKU-PAP-AR-02', name: 'Arches Aquarelle 100% Cotton 300gsm Cold Pressed Pad', category: 'Paper & Pads', brand: 'Arches', price: 3499.00, discount: 5, stock: 4, rating: 4.8, image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120&auto=format&fit=crop&q=80', description: 'Cylinder mould-made with pure French stream water and natural gelatin sizing.' },
    { id: 'SKU-EAS-MA-01', name: 'Mabef M-02 Professional Double Mast Studio Easel', category: 'Easels', brand: 'Mabef', price: 28990.00, discount: 15, stock: 3, rating: 4.9, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=120&auto=format&fit=crop&q=80', description: 'Constructed of oiled, stain-resistant beech wood with crank-handle height adjustment.' },
    { id: 'SKU-MED-LI-01', name: 'Liquitex Professional Slow-Dri Blending Fluid Medium 237ml', category: 'Painting Medium', brand: 'Liquitex', price: 1250.00, discount: 0, stock: 18, rating: 4.7, image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=120&auto=format&fit=crop&q=80', description: 'Extends open time by more than 40% for superior wet-in-wet blending and soft shading.' },
    { id: 'SKU-CAL-KU-01', name: 'Kuretake Zig Cartoonist Sumi Black Ink 60ml', category: 'Calligraphy', brand: 'Kuretake', price: 890.00, discount: 0, stock: 32, rating: 4.8, image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=120&auto=format&fit=crop&q=80', description: 'Deep lustrous black ink formulated for fine nib pens and Japanese manga illustrations.' },
    { id: 'SKU-DRW-CA-01', name: "Caran d'Ache Luminance 6901 Colored Pencil 76 Wood Box Set", category: 'Drawing Media', brand: "Caran d'Ache", price: 36500.00, discount: 8, stock: 5, rating: 5.0, image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120&auto=format&fit=crop&q=80', description: 'Maximum lightfastness certified to ASTM D-6901 standards with smooth velvet texture.' },
    { id: 'SKU-CNV-CL-01', name: 'Claessens Belgian Primed Linen Canvas Roll #13 (2.1m x 10m)', category: 'Canvas', brand: 'Claessens', price: 48900.00, discount: 12, stock: 8, rating: 4.9, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=120&auto=format&fit=crop&q=80', description: '100% fine Belgian flax linen double-primed with zinc white oil foundation.' }
  ],

  orders: [
    { orderId: 'AF-ORD-9842', customer: { firstName: 'Rohan', lastName: 'Kapoor', email: 'rohan.atelier@mumbaiarts.in', phone: '+91 98201 45678' }, shippingAddress: { address: 'Studio 4B, Colaba Art Enclave', city: 'Mumbai', state: 'Maharashtra', postalCode: '400005' }, orderDate: '2026-09-27T10:30:00Z', items: [{ name: "Winsor & Newton Artists' Oil Set", quantity: 1, price: 4299.00 }, { name: 'Arches Aquarelle 300gsm Pad', quantity: 1, price: 3499.00 }], total: 8499.00, paymentMethod: 'UPI (Google Pay)', status: 'Processing' },
    { orderId: 'AF-ORD-9841', customer: { firstName: 'Ananya', lastName: 'Sharma', email: 'ananya.finearts@delhi.edu', phone: '+91 98110 33421' }, shippingAddress: { address: 'Flat 12, Hauz Khas Village', city: 'New Delhi', state: 'Delhi', postalCode: '110016' }, orderDate: '2026-09-26T16:45:00Z', items: [{ name: 'Da Vinci Maestro Series 10 #6', quantity: 1, price: 2899.00 }], total: 3250.00, paymentMethod: 'Razorpay Cards', status: 'Shipped' },
    { orderId: 'AF-ORD-9840', customer: { firstName: 'Vikram', lastName: 'Mehta', email: 'vikram.m@studiobangalore.com', phone: '+91 99450 78123' }, shippingAddress: { address: '44 Indiranagar 100ft Road', city: 'Bengaluru', state: 'Karnataka', postalCode: '560038' }, orderDate: '2026-09-26T09:15:00Z', items: [{ name: "Caran d'Ache Luminance Set", quantity: 1, price: 36500.00 }], total: 36500.00, paymentMethod: 'Net Banking (HDFC)', status: 'Delivered' },
    { orderId: 'AF-ORD-9839', customer: { firstName: 'Pooja', lastName: 'Iyer', email: 'pooja.iyer@chennaiatelier.org', phone: '+91 94440 99881' }, shippingAddress: { address: '7 Besant Nagar Beach Road', city: 'Chennai', state: 'Tamil Nadu', postalCode: '600090' }, orderDate: '2026-09-25T14:20:00Z', items: [{ name: 'Kuretake Sumi Ink 60ml', quantity: 4, price: 890.00 }], total: 3560.00, paymentMethod: 'UPI (Paytm)', status: 'Delivered' },
    { orderId: 'AF-ORD-9838', customer: { firstName: 'Sameer', lastName: 'Khan', email: 'sameer.k@kolkataarts.in', phone: '+91 98300 22145' }, shippingAddress: { address: '28 Park Street Suite 9', city: 'Kolkata', state: 'West Bengal', postalCode: '700016' }, orderDate: '2026-09-24T18:00:00Z', items: [{ name: 'Liquitex Slow-Dri Medium', quantity: 1, price: 1250.00 }], total: 1850.00, paymentMethod: 'COD', status: 'Cancelled' }
  ],

  customers: [
    { id: 'CUST-0912', name: 'Rohan Kapoor', email: 'rohan.atelier@mumbaiarts.in', phone: '+91 98201 45678', city: 'Mumbai', discipline: 'Oil Painting & Portraiture', ordersCount: 8, lifetimeSpend: 68400.00, createdAt: '2025-03-12' },
    { id: 'CUST-0844', name: 'Ananya Sharma', email: 'ananya.finearts@delhi.edu', phone: '+91 98110 33421', city: 'New Delhi', discipline: 'Botanical Watercolor', ordersCount: 14, lifetimeSpend: 92300.00, createdAt: '2025-01-20' },
    { id: 'CUST-0782', name: 'Vikram Mehta', email: 'vikram.m@studiobangalore.com', phone: '+91 99450 78123', city: 'Bengaluru', discipline: 'Abstract Expressionism & Large Murals', ordersCount: 5, lifetimeSpend: 145000.00, createdAt: '2025-06-18' },
    { id: 'CUST-0651', name: 'Pooja Iyer', email: 'pooja.iyer@chennaiatelier.org', phone: '+91 94440 99881', city: 'Chennai', discipline: 'Calligraphy & Traditional Indian Art', ordersCount: 11, lifetimeSpend: 42800.00, createdAt: '2025-02-04' },
    { id: 'CUST-0520', name: 'Dr. Kabir Sen', email: 'kabir.sen@barodaarts.ac.in', phone: '+91 98250 67431', city: 'Vadodara', discipline: 'Printmaking & Archival Drawing', ordersCount: 7, lifetimeSpend: 54900.00, createdAt: '2025-05-30' }
  ]
};

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
      // Fallback seamlessly to mock data so UI remains interactive and styled
      return this.handleFallback(endpoint, options);
    }
  },

  handleFallback(endpoint, options) {
    if (endpoint.includes('/admin/stats')) {
      return { success: true, stats: MOCK_DATA.stats };
    }
    if (endpoint.includes('/admin/products') || endpoint.includes('/products')) {
      return { success: true, products: MOCK_DATA.products };
    }
    if (endpoint.includes('/admin/orders') || endpoint.includes('/orders')) {
      return { success: true, orders: MOCK_DATA.orders };
    }
    if (endpoint.includes('/admin/customers') || endpoint.includes('/customers')) {
      return { success: true, customers: MOCK_DATA.customers };
    }
    if (endpoint.includes('/admin/inventory')) {
      return { success: true, inventory: MOCK_DATA.products };
    }
    if (endpoint.includes('/admin/analytics')) {
      return {
        success: true,
        analytics: {
          monthlyRevenue: [45000, 52000, 61000, 58000, 72000, 84000],
          categories: [
            { name: 'Paints & Pigments', share: '32%' },
            { name: 'Brushes & Tools', share: '24%' },
            { name: 'Fine Canvas & Linen', share: '18%' },
            { name: 'Drawing & Calligraphy', share: '16%' },
            { name: 'Easels & Studio Furniture', share: '10%' }
          ]
        }
      };
    }
    return { success: true, message: 'Simulated operation succeeded' };
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
