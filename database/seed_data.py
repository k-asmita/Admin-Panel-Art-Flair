"""
Art Flair - Database Initializer & Seeder
Developed for Sabahz Trading

Seeds:
- 10 Exact Art Categories
- Curated Fine Art Catalog Products (Paints, Brushes, Canvases, Drawing Media, Calligraphy, Easels, etc.)
- Demo Customer and Administrator Accounts
"""

import json
from werkzeug.security import generate_password_hash
from database.connection import init_db, get_db, execute_query, fetch_one
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_data")

CATEGORIES = [
    {"id": "accessories", "name": "Accessories", "slug": "accessories", "icon": "palette", "description": "Studio palettes, mahl sticks, palette knives, brush washers, and archival cleaning tools.", "display_order": 1},
    {"id": "brushes", "name": "Brushes", "slug": "brushes", "icon": "brush", "description": "Kolinsky red sable, pure Kazan squirrel, hog bristle, and synthetic filbert/round brushes.", "display_order": 2},
    {"id": "calligraphy", "name": "Calligraphy", "slug": "calligraphy", "icon": "feather", "description": "Sumi-e ink sticks, Japanese obliques, dip pens, and archival carbon calligraphy inks.", "display_order": 3},
    {"id": "canvas", "name": "Canvas", "slug": "canvas", "icon": "square", "description": "Claessens Belgian double oil-primed linen rolls, stretched cotton panels, and gesso boards.", "display_order": 4},
    {"id": "drawing-media", "name": "Drawing Media", "slug": "drawing-media", "icon": "edit-2", "description": "Lightfast colored pencils, vine charcoal, archival graphite, and soft artist pastels.", "display_order": 5},
    {"id": "easels", "name": "Easels", "slug": "easels", "icon": "triangle", "description": "Oiled beechwood studio crank easels, convertible French plein air boxes, and table easels.", "display_order": 6},
    {"id": "painting-medium", "name": "Painting Medium", "slug": "painting-medium", "icon": "droplet", "description": "Cold-pressed linseed oil, Venetian Venice turpentine, odorless mineral spirits, and dammar.", "display_order": 7},
    {"id": "paints", "name": "Paints", "slug": "paints", "icon": "disc", "description": "Artists' professional oil paints, pure pigment watercolors, acrylics, and gouache.", "display_order": 8},
    {"id": "paper-pads", "name": "Paper & Pads", "slug": "paper-pads", "icon": "book-open", "description": "100% cotton 300gsm cold press watercolor blocks, smooth bristol boards, and sketchbooks.", "display_order": 9},
    {"id": "pen-markers", "name": "Pen & Markers", "slug": "pen-markers", "icon": "pen-tool", "description": "Pigment fineliners, Japanese brush pens, acrylic paint markers, and alcohol ink sets.", "display_order": 10}
]

PRODUCTS = [
    {
        "id": "AF-PNT-001",
        "name": "Winsor & Newton Artists' Oil Colour Set (10 x 37ml)",
        "category_id": "paints",
        "brand": "Winsor & Newton",
        "price": 4850.00,
        "original_price": 5400.00,
        "discount": 10,
        "stock": 28,
        "rating": 4.9,
        "reviews_count": 84,
        "image": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
        "badge": "Master Series",
        "ai_tag": "Pure Cadmium & Cobalt Pigments",
        "description": "Formulated with single high-grade pigments for unsurpassed tinting strength and buttery consistency.",
        "specs_json": {
            "Medium Classification": "Artists' Grade Professional Oil Paint",
            "Vehicle Binder": "Refined Alkali Cold-Pressed Linseed Oil",
            "Lightfastness Rating": "ASTM Class I (Excellent Permanence)",
            "Country of Origin": "United Kingdom"
        }
    },
    {
        "id": "AF-BRS-002",
        "name": "Raphaël Kolinsky Red Sable Filbert Brush Set (3-Piece)",
        "category_id": "brushes",
        "brand": "Raphaël Paris",
        "price": 3250.00,
        "original_price": 3600.00,
        "discount": 10,
        "stock": 14,
        "rating": 4.9,
        "reviews_count": 52,
        "image": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80",
        "badge": "Handmade in France",
        "ai_tag": "Siberian Kolinsky Hair",
        "description": "Hand-crafted in France with finest Siberian Kolinsky hair offering exceptional spring, snap, and fluid capacity.",
        "specs_json": {
            "Hair Type": "Pure Kolinsky Red Sable",
            "Handle": "Long Matte Black Hardwood",
            "Ferrule": "Seamless Nickel-Plated Brass",
            "Sizes Included": "Sizes #2, #6, #10 Filbert"
        }
    },
    {
        "id": "AF-CNV-003",
        "name": "Claessens Belgian Double Oil-Primed Linen Canvas Roll (2.1m x 10m)",
        "category_id": "canvas",
        "brand": "Claessens Belgium",
        "price": 18500.00,
        "original_price": 19800.00,
        "discount": 7,
        "stock": 6,
        "rating": 5.0,
        "reviews_count": 46,
        "image": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
        "badge": "Belgian Linen",
        "ai_tag": "AI Matched Surface for Oil",
        "description": "The worldwide gold standard in archival painting surfaces. Woven from 100% pure flax and zinc-white oil primed.",
        "specs_json": {
            "Fiber Material": "100% Belgian Flax Linen",
            "Priming Formula": "Double Zinc White Oil Primed",
            "Texture Grade": "Medium Fine (No. 13)",
            "Weight": "415 gsm"
        }
    },
    {
        "id": "AF-PNT-004",
        "name": "Schmincke Horadam Aquarell Artists' Watercolors (24 Half-Pan Set)",
        "category_id": "paints",
        "brand": "Schmincke Germany",
        "price": 8900.00,
        "original_price": 9500.00,
        "discount": 6,
        "stock": 18,
        "rating": 4.9,
        "reviews_count": 78,
        "image": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
        "badge": "Premium Watercolor",
        "ai_tag": "Kordofan Gum Arabic",
        "description": "Finest artists' watercolours containing highest quality single pigments and pure Southern Kordofan gum arabic binder.",
        "specs_json": {
            "Binder Formula": "Natural Kordofan Gum Arabic",
            "Lightfastness": "4 to 5 Stars (Maximum)",
            "Enclosure": "Compact Enameled Metal Palette Box"
        }
    },
    {
        "id": "AF-DRW-005",
        "name": "Caran d'Ache Luminance 6901 Colored Pencil Wooden Box (76 Colors)",
        "category_id": "drawing-media",
        "brand": "Caran d'Ache",
        "price": 14200.00,
        "original_price": 15800.00,
        "discount": 10,
        "stock": 8,
        "rating": 5.0,
        "reviews_count": 64,
        "image": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80",
        "badge": "ASTM D-6901 Certified",
        "ai_tag": "Permanent Wax Core",
        "description": "Smooth, wax-based permanent lead offering the highest lightfastness standard in the world.",
        "specs_json": {
            "Lead Diameter": "3.8 mm Extra-Fine Wax Core",
            "Casing": "FSC Certified Californian Cedar Wood",
            "Certification": "100% ASTM D-6901 Compliant"
        }
    },
    {
        "id": "AF-EAS-006",
        "name": "Mabef M-04 Studio Heavy-Duty Beechwood Crank Easel",
        "category_id": "easels",
        "brand": "Mabef Italy",
        "price": 32000.00,
        "original_price": 35000.00,
        "discount": 9,
        "stock": 0,
        "rating": 4.8,
        "reviews_count": 29,
        "image": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80",
        "badge": "Made in Italy",
        "ai_tag": "Oiled Beechwood Construction",
        "description": "Constructed of stain-resistant oiled beech wood with heavy-duty mechanical crank handle for canvases up to 235 cm.",
        "specs_json": {
            "Material": "Solid Italian Beechwood",
            "Max Canvas Height": "235 cm (92.5 inches)",
            "Base Dimensions": "70 x 68 cm",
            "Weight Capacity": "40 kg"
        }
    }
]


def seed():
    """Seeds database with categories, products, and default accounts."""
    logger.info("Starting Art Flair database seeding...")
    init_db()

    with get_db() as conn:
        with conn.cursor() as cur:
            # 1. Categories
            for cat in CATEGORIES:
                cur.execute("""
                    INSERT INTO categories (id, name, slug, icon, description, display_order)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);
                """, (cat['id'], cat['name'], cat['slug'], cat['icon'], cat['description'], cat['display_order']))

            # 2. Products
            for p in PRODUCTS:
                cur.execute("""
                    INSERT INTO products (
                        id, name, category_id, brand, price, original_price,
                        discount, stock, rating, reviews_count, image, badge,
                        ai_tag, description, specs_json, is_active
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, 1
                    ) ON DUPLICATE KEY UPDATE
                        name = VALUES(name), price = VALUES(price), stock = VALUES(stock);
                """, (
                    p['id'], p['name'], p['category_id'], p['brand'], p['price'], p.get('original_price'),
                    p.get('discount', 0), p.get('stock', 0), p.get('rating', 5.0), p.get('reviews_count', 0),
                    p['image'], p.get('badge'), p.get('ai_tag'), p.get('description'), json.dumps(p.get('specs_json') or {})
                ))

            # 3. Default Patron User
            patron_pwd = generate_password_hash("masterpiece2026")
            cur.execute("""
                INSERT INTO users (id, name, email, password_hash, role, discipline, city, state)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE name = VALUES(name);
            """, (
                "CUST-104", "Aarav Sharma", "artist.patron@studio.com", patron_pwd,
                "customer", "Oil Painting & Mineral Glazes", "Mumbai", "Maharashtra"
            ))

            # 4. Default Admin User
            admin_pwd = generate_password_hash("Admin@24")
            cur.execute("""
                INSERT INTO users (id, name, email, password_hash, role, discipline)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = VALUES(role);
            """, (
                "ADM-001", "Sabahz Admin", "admin@gmail.com", admin_pwd,
                "admin", "Atelier Management"
            ))

    logger.info("✓ Art Flair MySQL Database successfully seeded!")


if __name__ == '__main__':
    seed()
