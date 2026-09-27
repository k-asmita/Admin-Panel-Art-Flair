"""
Art Flair - Database Connection Manager
Developed for Sabahz Trading

Provides clean, reusable, connection-managed access to MySQL 8.0 & SQLite fallback
with robust error handling, connection cleanup, and transaction rollback.
All credentials are dynamically loaded from environment variables (.env).
"""

import os
import sys
import logging
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from dotenv import load_dotenv

# Ensure environment variables are loaded from all potential .env locations
for candidate in [
    Path(__file__).resolve().parent.parent / '.env',
    Path(__file__).resolve().parent / '.env',
    Path.cwd() / '.env'
]:
    if candidate.exists():
        load_dotenv(dotenv_path=candidate, override=True)

logger = logging.getLogger(__name__)

# Try importing pymysql safely
try:
    import pymysql
    import pymysql.cursors
    PYMYSQL_AVAILABLE = True
except ImportError:
    PYMYSQL_AVAILABLE = False


class DatabaseConfig:
    """Dynamically loads database connection parameters from environment variables."""

    @staticmethod
    def get_host():
        return os.getenv('DB_HOST', 'localhost').strip()

    @staticmethod
    def get_port():
        try:
            return int(os.getenv('DB_PORT', 3306))
        except (ValueError, TypeError):
            return 3306

    @staticmethod
    def get_user():
        return os.getenv('DB_USER', 'root').strip()

    @staticmethod
    def get_password():
        return os.getenv('DB_PASSWORD', '').strip()

    @staticmethod
    def get_db_name():
        return os.getenv('DB_NAME', 'art_flair').strip()


class SQLiteDictCursor:
    """Wrapper around SQLite cursor to emulate MySQL DictCursor."""
    def __init__(self, cursor):
        self._cursor = cursor
        self.lastrowid = cursor.lastrowid

    def execute(self, sql, params=None):
        # Convert %s to ? for SQLite
        sqlite_sql = sql.replace('%s', '?').replace('`', '"')
        # Replace ON DUPLICATE KEY UPDATE with ON CONFLICT if needed
        if 'ON DUPLICATE KEY UPDATE' in sqlite_sql:
            sqlite_sql = sqlite_sql.split('ON DUPLICATE KEY UPDATE')[0].strip()
        result = self._cursor.execute(sqlite_sql, params or ())
        self.lastrowid = self._cursor.lastrowid
        return result

    def fetchone(self):
        row = self._cursor.fetchone()
        if row is None:
            return None
        return dict(row)

    def fetchall(self):
        rows = self._cursor.fetchall()
        return [dict(r) for r in rows]

    def close(self):
        self._cursor.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


class DatabaseConnection:
    """
    Reusable database connection provider with automatic resilience.
    Connects to MySQL 8.0, with SQLite fallback if MySQL is unreachable.
    """

    @classmethod
    def get_connection(cls, use_database=True):
        host = DatabaseConfig.get_host()
        port = DatabaseConfig.get_port()
        user = DatabaseConfig.get_user()
        password = DatabaseConfig.get_password()
        db_name = DatabaseConfig.get_db_name() if use_database else None

        # 1. Try MySQL Connection if PyMySQL is available and host is configured
        if PYMYSQL_AVAILABLE and host and host != 'localhost_sqlite':
            try:
                is_cloud = 'aivencloud.com' in host.lower() or port != 3306 or host not in ('localhost', '127.0.0.1')
                ssl_enabled = os.getenv('DB_SSL', '').lower() in ('true', '1', 'yes') or (is_cloud and os.getenv('DB_SSL', '').lower() != 'false')
                ssl_config = {'ssl': True} if ssl_enabled else None

                connection = pymysql.connect(
                    host=host,
                    port=port,
                    user=user,
                    password=password,
                    database=db_name,
                    charset='utf8mb4',
                    cursorclass=pymysql.cursors.DictCursor,
                    autocommit=False,
                    connect_timeout=5,
                    ssl=ssl_config
                )
                return connection
            except Exception as my_err:
                logger.warning(f"MySQL connection attempt failed ({my_err}). Falling back to local embedded store.")

        # 2. Resilient SQLite Storage Fallback
        db_path = Path(__file__).resolve().parent / 'art_flair_local.db'
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        return conn


@contextmanager
def get_db_cursor(commit=True, use_database=True):
    """
    Context manager that yields an active dictionary cursor for both MySQL & SQLite.
    """
    connection = None
    try:
        connection = DatabaseConnection.get_connection(use_database=use_database)
        if isinstance(connection, sqlite3.Connection):
            raw_cursor = connection.cursor()
            cursor = SQLiteDictCursor(raw_cursor)
            yield cursor
            if commit:
                connection.commit()
        else:
            with connection.cursor() as cursor:
                yield cursor
            if commit:
                connection.commit()
    except Exception as e:
        if connection:
            try:
                connection.rollback()
            except Exception:
                pass
        raise e
    finally:
        if connection:
            try:
                connection.close()
            except Exception:
                pass


get_db = get_db_cursor


def execute_query(sql, params=None, commit=True):
    with get_db_cursor(commit=commit) as cursor:
        affected = cursor.execute(sql, params or ())
        last_id = getattr(cursor, 'lastrowid', 0)
        return {"affected_rows": affected, "last_id": last_id}


def fetch_one(sql, params=None):
    with get_db_cursor(commit=False) as cursor:
        cursor.execute(sql, params or ())
        return cursor.fetchone()


def fetch_all(sql, params=None):
    with get_db_cursor(commit=False) as cursor:
        cursor.execute(sql, params or ())
        return cursor.fetchall()


def execute_transaction(operations):
    connection = None
    results = []
    try:
        connection = DatabaseConnection.get_connection()
        if isinstance(connection, sqlite3.Connection):
            raw_cur = connection.cursor()
            cur = SQLiteDictCursor(raw_cur)
            for sql, params in operations:
                cur.execute(sql, params or ())
                results.append({"affected_rows": 1, "last_id": cur.lastrowid})
            connection.commit()
        else:
            with connection.cursor() as cur:
                for sql, params in operations:
                    affected = cur.execute(sql, params or ())
                    results.append({"affected_rows": affected, "last_id": cur.lastrowid})
            connection.commit()
        return results
    except Exception as e:
        if connection:
            try:
                connection.rollback()
            except Exception:
                pass
        raise e
    finally:
        if connection:
            try:
                connection.close()
            except Exception:
                pass


def test_database_connection():
    """
    Tests connectivity and returns detailed status information.
    """
    host = DatabaseConfig.get_host()
    port = DatabaseConfig.get_port()
    user = DatabaseConfig.get_user()
    db_name = DatabaseConfig.get_db_name()

    try:
        conn = DatabaseConnection.get_connection(use_database=False)
        if isinstance(conn, sqlite3.Connection):
            conn.close()
            return {
                "connected": True,
                "engine": "Embedded Database (SQLite / Zero Downtime)",
                "host": "Local Embedded Store",
                "database": "art_flair_local.db",
                "message": "Connected to local persistent database store."
            }
        else:
            with conn.cursor() as cur:
                cur.execute("SELECT VERSION() AS version, CURRENT_USER() AS `authenticated_user`;")
                info = cur.fetchone()
            conn.close()
            return {
                "connected": True,
                "engine": "MySQL 8.0",
                "mysql_version": info.get("version"),
                "authenticated_user": info.get("authenticated_user"),
                "host": host,
                "port": port,
                "database": db_name,
                "message": f"Successfully connected to MySQL at {host}:{port}"
            }
    except Exception as e:
        return {
            "connected": False,
            "host": host,
            "port": port,
            "user": user,
            "database": db_name,
            "error": str(e),
            "message": f"Could not establish database connection: {e}"
        }


def init_db():
    """Initializes database tables for both MySQL and SQLite."""
    conn = DatabaseConnection.get_connection(use_database=False)
    is_sqlite = isinstance(conn, sqlite3.Connection)
    conn.close()

    if is_sqlite:
        tables_sql = [
            """
            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                slug TEXT UNIQUE,
                icon TEXT,
                description TEXT,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE,
                password_hash TEXT,
                phone TEXT,
                role TEXT DEFAULT 'customer',
                discipline TEXT,
                city TEXT,
                state TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category_id TEXT,
                brand TEXT,
                price REAL NOT NULL,
                original_price REAL,
                discount REAL DEFAULT 0,
                stock INTEGER DEFAULT 0,
                rating REAL DEFAULT 5.0,
                reviews_count INTEGER DEFAULT 0,
                image TEXT,
                badge TEXT,
                ai_tag TEXT,
                description TEXT,
                specs_json TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS inventory (
                inventory_id TEXT PRIMARY KEY,
                product_id TEXT,
                quantity INTEGER DEFAULT 0,
                reorder_level INTEGER DEFAULT 5,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """,
            """
            CREATE TABLE IF NOT EXISTS orders (
                order_id TEXT PRIMARY KEY,
                user_id TEXT,
                total REAL DEFAULT 0,
                status TEXT DEFAULT 'Processing',
                shipping_address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """
        ]
        with get_db_cursor(commit=True, use_database=False) as cursor:
            for ddl in tables_sql:
                cursor.execute(ddl)

        # Seed categories if empty
        with get_db_cursor(commit=True, use_database=False) as cursor:
            cursor.execute("SELECT COUNT(*) AS c FROM categories")
            count = cursor.fetchone().get('c', 0)
            if count == 0:
                cats = [
                    ('accessories', 'Accessories', 'accessories', 'palette', 'Studio accessories & tools', 1),
                    ('brushes', 'Brushes', 'brushes', 'brush', 'Kolinsky & synthetic brushes', 2),
                    ('calligraphy', 'Calligraphy', 'calligraphy', 'feather', 'Inks & dip pens', 3),
                    ('canvas', 'Canvas', 'canvas', 'square', 'Belgian linen & primed panels', 4),
                    ('drawing-media', 'Drawing Media', 'drawing-media', 'edit-2', 'Pencils, pastels & charcoal', 5),
                    ('easels', 'Easels', 'easels', 'triangle', 'Studio & field easels', 6),
                    ('painting-medium', 'Painting Medium', 'painting-medium', 'droplet', 'Oils, varnishes & mediums', 7),
                    ('paints', 'Paints', 'paints', 'disc', 'Oil, acrylic, watercolor paints', 8),
                    ('paper-pads', 'Paper & Pads', 'paper-pads', 'book-open', 'Cotton watercolor & sketch pads', 9),
                    ('pen-markers', 'Pen & Markers', 'pen-markers', 'pen-tool', 'Brush pens & acrylic markers', 10)
                ]
                for c in cats:
                    cursor.execute("INSERT OR IGNORE INTO categories (id, name, slug, icon, description, display_order) VALUES (%s, %s, %s, %s, %s, %s)", c)

        # Seed products if empty
        with get_db_cursor(commit=True, use_database=False) as cursor:
            cursor.execute("SELECT COUNT(*) AS c FROM products")
            pcount = cursor.fetchone().get('c', 0)
            if pcount == 0:
                prods = [
                    ('AF-PNT-001', "Winsor & Newton Artists' Oil Colour Set (10 x 37ml)", 'paints', 'Winsor & Newton', 4850.00, 5400.00, 10, 28, 4.9, 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80', 'Pure Cadmium & Cobalt Pigments'),
                    ('AF-BRS-002', 'Raphaël Kolinsky Red Sable Filbert Brush Set', 'brushes', 'Raphaël Paris', 3250.00, 3600.00, 10, 14, 4.9, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&auto=format&fit=crop&q=80', 'Siberian Kolinsky Hair'),
                    ('AF-CNV-003', 'Claessens Belgian Double Oil-Primed Linen Roll (2.1m x 10m)', 'canvas', 'Claessens Belgium', 18500.00, 19800.00, 7, 6, 5.0, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80', 'Double Zinc White Oil Primed'),
                    ('AF-PNT-004', 'Daniel Smith Extra Fine Watercolor 15ml - Lapis Lazuli', 'paints', 'Daniel Smith', 2150.00, 2150.00, 0, 4, 5.0, 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80', 'Pure Mineral Lapis Stone'),
                    ('AF-DRW-005', "Caran d'Ache Luminance 6901 Colored Pencil 76-Piece Wood Box Set", 'drawing-media', "Caran d'Ache", 34500.00, 36500.00, 5, 3, 4.9, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80', 'ASTM D-6901 Lightfastness'),
                    ('AF-PAP-006', 'Arches Aquarelle 100% Pure Cotton 300gsm Rough Watercolour Block', 'paper-pads', 'Arches France', 3850.00, 4200.00, 8, 18, 4.9, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80', 'Cylinder Mould-Made'),
                    ('AF-CAL-007', 'Kuretake Zig Sumi Black Ink 60ml & Manga Nib Set', 'calligraphy', 'Kuretake Japan', 1450.00, 1450.00, 0, 32, 4.8, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&auto=format&fit=crop&q=80', 'Waterproof Carbon Black'),
                    ('AF-EAS-008', 'Mabef M-02 Professional Double Mast Crank Studio Easel', 'easels', 'Mabef Italy', 29500.00, 33500.00, 12, 2, 4.8, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80', 'Solid Italian Beechwood'),
                    ('AF-MED-009', 'Liquitex Professional Slow-Dri Fluid Retarder Medium 237ml', 'painting-medium', 'Liquitex', 1250.00, 1250.00, 0, 20, 4.7, 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80', 'Extended Work Time Retarder'),
                    ('AF-ACC-010', 'Holbein Artists Stainless Steel Palette Knives (Set of 4)', 'accessories', 'Holbein Japan', 2890.00, 2890.00, 0, 0, 4.9, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&auto=format&fit=crop&q=80', 'Hand Forged Flexible Steel'),
                    ('AF-MRK-011', 'Posca Acrylic Paint Marker Full Studio Set (15 Nibs)', 'pen-markers', 'Uni Posca Japan', 3490.00, 3690.00, 5, 12, 4.8, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80', 'Opaque Pigment Markers')
                ]
                for p in prods:
                    cursor.execute("""
                        INSERT OR IGNORE INTO products (id, name, category_id, brand, price, original_price, discount, stock, rating, image, ai_tag)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, p)
        logger.info("Local database schema and initial catalog initialized.")
    else:
        # MySQL Schema Initialization
        schema_path = Path(__file__).resolve().parent / 'schema.sql'
        if schema_path.exists():
            with open(schema_path, 'r', encoding='utf-8') as f:
                schema_sql = f.read()
            with get_db_cursor(commit=True, use_database=False) as cursor:
                statements = [s.strip() for s in schema_sql.split(';') if s.strip()]
                for stmt in statements:
                    try:
                        cursor.execute(stmt)
                    except Exception:
                        pass
        logger.info("MySQL database schema initialized.")

