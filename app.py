"""
Art Flair - Sabahz Trading Backend REST API Server
Provides real database endpoints for Admin Atelier Dashboard
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from database.connection import get_db, test_database_connection, DatabaseConfig
from database import queries

# Load .env
env_file = Path(__file__).resolve().parent / '.env'
if env_file.exists():
    load_dotenv(dotenv_path=env_file)
else:
    load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)


# ------------------------------------------------------------------------------
# 1. Health & Database Status
# ------------------------------------------------------------------------------
@app.route('/api/health', methods=['GET'])
def health_check():
    db_status = test_database_connection()
    return jsonify({
        "status": "online",
        "database": db_status
    })


# ------------------------------------------------------------------------------
# 2. Admin Statistics Endpoint
# ------------------------------------------------------------------------------
@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    try:
        # Check database connection
        db_status = test_database_connection()
        if not db_status.get("connected"):
            return jsonify({
                "success": False,
                "isLiveDb": False,
                "error": db_status.get("error"),
                "message": "Database is currently disconnected. Check .env host and credentials."
            }), 503

        # Query real database products and users
        total_products = queries.count('products') if queries.count('products') else 0
        total_customers = queries.count('users', {'role': 'customer'}) if queries.count('users') else 0
        
        # Low stock products (stock <= 10)
        low_stock_products = queries.raw_query(
            "SELECT id, name, category_id AS category, stock, image FROM products WHERE stock <= 10 ORDER BY stock ASC LIMIT 8;"
        ) or []
        
        low_stock_count = len(low_stock_products)

        # Orders (No orders placed yet)
        orders_exist = False
        try:
            total_orders = queries.count('orders')
            recent_orders = queries.select_all('orders', order_by='created_at DESC', limit=10) or []
            orders_exist = True
        except Exception:
            total_orders = 0
            recent_orders = []

        return jsonify({
            "success": True,
            "isLiveDb": True,
            "stats": {
                "totalRevenue": 0.00,
                "totalOrders": total_orders if orders_exist else 0,
                "totalCustomers": total_customers,
                "totalProducts": total_products,
                "lowStockCount": low_stock_count,
                "lowStockProducts": low_stock_products,
                "recentOrders": recent_orders
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "isLiveDb": False,
            "error": str(e)
        }), 500


# ------------------------------------------------------------------------------
# 3. Product Catalog Endpoints (Real Database)
# ------------------------------------------------------------------------------
@app.route('/api/admin/products', methods=['GET'])
def get_products():
    try:
        products = queries.select_all('products', order_by='name ASC')
        return jsonify({"success": True, "products": products or []})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/admin/products', methods=['POST'])
def add_product():
    try:
        data = request.get_json() or {}
        if not data.get('name') or not data.get('price'):
            return jsonify({"success": False, "error": "Product name and price are required."}), 400

        product_id = data.get('id') or f"SKU-{os.urandom(3).hex().upper()}"
        product_record = {
            'id': product_id,
            'name': data.get('name'),
            'category_id': (data.get('category') or 'paints').lower(),
            'brand': data.get('brand', 'Artisan Atelier'),
            'price': float(data.get('price', 0)),
            'discount': int(data.get('discount', 0)),
            'stock': int(data.get('stock', 0)),
            'image': data.get('image', ''),
            'description': data.get('description', '')
        }
        queries.insert('products', product_record)
        return jsonify({"success": True, "product": product_record, "message": "Product saved to database."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ------------------------------------------------------------------------------
# 4. Inventory Endpoints
# ------------------------------------------------------------------------------
@app.route('/api/admin/inventory', methods=['GET'])
def get_inventory():
    try:
        items = queries.raw_query("""
            SELECT p.id, p.name, p.category_id AS category, p.brand, p.price, p.stock, p.image
            FROM products p
            ORDER BY p.stock ASC;
        """)
        return jsonify({"success": True, "inventory": items or []})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ------------------------------------------------------------------------------
# 5. Customers / Patrons Endpoint
# ------------------------------------------------------------------------------
@app.route('/api/admin/customers', methods=['GET'])
def get_customers():
    try:
        customers = queries.select_all('users', {'role': 'customer'}, columns="id, name, email, phone, city, discipline, created_at")
        return jsonify({"success": True, "customers": customers or []})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ------------------------------------------------------------------------------
# 6. Orders Endpoint (Returns empty list, no orders placed yet)
# ------------------------------------------------------------------------------
@app.route('/api/admin/orders', methods=['GET'])
def get_orders():
    try:
        # Check if table exists, return empty list if none
        try:
            orders = queries.select_all('orders', order_by='created_at DESC') or []
        except Exception:
            orders = []
        return jsonify({"success": True, "orders": orders})
    except Exception as e:
        return jsonify({"success": False, "orders": []})


# ------------------------------------------------------------------------------
# 7. Static Pages Fallback
# ------------------------------------------------------------------------------
@app.route('/', defaults={'path': 'dashboard.html'})
@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(path):
        return send_from_directory('.', path)
    return send_from_directory('.', 'dashboard.html')


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"Starting Art Flair Admin Backend on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
