"""
Art Flair - Existing Database Data Enricher
Developed for Sabahz Trading

Enriches existing `art_flair` MySQL database:
1. Assigns realistic INR prices to the 73 catalog products based on category.
2. Initializes `inventory` records for each product.
3. Seeds initial test users (customer & admin).
4. Seeds starter customer interactions and reviews.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pymysql
from werkzeug.security import generate_password_hash
from database.connection import get_db, execute_query, fetch_all, fetch_one
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("init_existing_data")

# Category-based realistic baseline pricing in INR (₹)
CATEGORY_BASE_PRICES = {
    "CAT001": 280.00,   # Accessories
    "CAT002": 450.00,   # Brushes
    "CAT003": 520.00,   # Calligraphy
    "CAT004": 850.00,   # Canvas
    "CAT005": 620.00,   # Drawing Media
    "CAT006": 2450.00,  # Easels
    "CAT007": 390.00,   # Painting Medium
    "CAT008": 750.00,   # Paints
    "CAT009": 480.00,   # Paper & Pads
    "CAT010": 340.00    # Pen & Markers
}


def enrich_database():
    logger.info("Enriching existing art_flair database...")

    with get_db() as cur:
        # 1. Update Product Prices if 0.00
        cur.execute("SELECT product_id, category_id, product_name, price FROM products;")
        products = cur.fetchall()

        for i, p in enumerate(products):
            current_price = float(p['price'])
            if current_price <= 0.0:
                base = CATEGORY_BASE_PRICES.get(p['category_id'], 350.00)
                price_inr = base + ((i * 37) % 450)
                cur.execute("UPDATE products SET price = %s WHERE product_id = %s;", (price_inr, p['product_id']))

        logger.info(f"Updated product pricing across {len(products)} products.")

        # 2. Populate Inventory for all products
        for i, p in enumerate(products):
            inv_id = f"INV{str(i + 1).zfill(3)}"
            cur.execute("SELECT inventory_id FROM inventory WHERE product_id = %s;", (p['product_id'],))
            exists = cur.fetchone()
            if not exists:
                initial_qty = 20 + ((i * 7) % 35)
                cur.execute("""
                    INSERT INTO inventory (inventory_id, product_id, quantity, reorder_level)
                    VALUES (%s, %s, %s, 5);
                """, (inv_id, p['product_id'], initial_qty))

        logger.info("Initialized inventory quantities.")

        # 3. Create default test users if empty
        cur.execute("SELECT user_id FROM users WHERE email = 'artist.patron@studio.com';")
        if not cur.fetchone():
            patron_pwd = generate_password_hash("masterpiece2026")
            cur.execute("""
                INSERT INTO users (user_id, first_name, last_name, email, password_hash, phone, role)
                VALUES ('USR001', 'Aarav', 'Sharma', 'artist.patron@studio.com', %s, '+91 98765 43210', 'customer');
            """, (patron_pwd,))

        cur.execute("SELECT user_id FROM users WHERE email = 'admin@artflair.com';")
        if not cur.fetchone():
            admin_pwd = generate_password_hash("sabahzadmin2026")
            cur.execute("""
                INSERT INTO users (user_id, first_name, last_name, email, password_hash, phone, role)
                VALUES ('ADM001', 'Sabahz', 'Admin', 'admin@artflair.com', %s, '+91 98765 00000', 'admin');
            """, (admin_pwd,))

        logger.info("Verified default patron and administrator accounts.")

        # 4. Seed initial reviews and interactions
        cur.execute("SELECT COUNT(*) AS c FROM reviews;")
        if cur.fetchone()['c'] == 0:
            reviews_seed = [
                ('REV001', 'USR001', 'PRO001', 5, 'Exceptional craftsmanship. These tools hold precision edges wonderfully.'),
                ('REV002', 'USR001', 'PRO013', 5, 'Ultra fine points with perfect snap for miniature and botanical works.'),
                ('REV003', 'USR001', 'PRO060', 5, 'Buttery consistency and intense pigmentation. True master series standard.')
            ]
            for r in reviews_seed:
                cur.execute("""
                    INSERT INTO reviews (review_id, user_id, product_id, rating, review_text)
                    VALUES (%s, %s, %s, %s, %s);
                """, r)

        cur.execute("SELECT COUNT(*) AS c FROM customer_interactions;")
        if cur.fetchone()['c'] == 0:
            interactions_seed = [
                ('INT001', 'USR001', 'PRO001', 'view', None),
                ('INT002', 'USR001', 'PRO013', 'view', None),
                ('INT003', 'USR001', 'PRO060', 'cart', None),
                ('INT004', 'USR001', None, 'search', 'oil colour paints')
            ]
            for it in interactions_seed:
                cur.execute("""
                    INSERT INTO customer_interactions (interaction_id, user_id, product_id, interaction_type, search_query)
                    VALUES (%s, %s, %s, %s, %s);
                """, it)

        logger.info("✓ art_flair database enriched and verified!")


if __name__ == '__main__':
    enrich_database()
