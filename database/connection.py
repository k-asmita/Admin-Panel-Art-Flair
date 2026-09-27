"""
Art Flair - Database Connection Manager
Developed for Sabahz Trading

Provides clean, reusable, connection-managed access to MySQL 8.0
with robust error handling, connection cleanup, and transaction rollback.
All credentials are dynamically loaded from environment variables (.env).
"""

import os
import logging
from contextlib import contextmanager
from pathlib import Path
from dotenv import load_dotenv
import pymysql
import pymysql.cursors

# Ensure environment variables are loaded
BASE_DIR = Path(__file__).resolve().parent.parent
env_file = BASE_DIR / '.env'
if env_file.exists():
    load_dotenv(dotenv_path=env_file)
else:
    load_dotenv()

logger = logging.getLogger(__name__)


class DatabaseConfig:
    """Dynamically loads MySQL connection parameters from environment variables."""

    @staticmethod
    def get_host():
        return os.getenv('DB_HOST', 'localhost')

    @staticmethod
    def get_port():
        return int(os.getenv('DB_PORT', 3306))

    @staticmethod
    def get_user():
        return os.getenv('DB_USER', 'root')

    @staticmethod
    def get_password():
        return os.getenv('DB_PASSWORD', '')

    @staticmethod
    def get_db_name():
        return os.getenv('DB_NAME', 'art_flair_db')


class DatabaseConnection:
    """
    Reusable database connection provider for MySQL 8.0.
    Ensures safe resource allocation, connection pooling compatibility,
    and automatic cleanup.
    """

    @classmethod
    def get_connection(cls, use_database=True):
        """
        Establishes and returns a live PyMySQL connection.
        Handles connection failures with descriptive errors.
        """
        host = DatabaseConfig.get_host()
        port = DatabaseConfig.get_port()
        user = DatabaseConfig.get_user()
        password = DatabaseConfig.get_password()
        db_name = DatabaseConfig.get_db_name() if use_database else None

        try:
            connection = pymysql.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                database=db_name,
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=False,  # Transactions managed explicitly
                connect_timeout=10,
                ssl={'ssl': True}
            )
            return connection
        except pymysql.err.OperationalError as op_err:
            error_code, error_msg = op_err.args
            logger.error(f"[Database Connection Error {error_code}]: {error_msg} (Host: {host}:{port}, User: {user})")
            raise ConnectionError(f"Failed to connect to MySQL database at {host}:{port}. Error {error_code}: {error_msg}")
        except Exception as e:
            logger.error(f"[Database Connection Failure]: {e}")
            raise ConnectionError(f"Unexpected database connection failure: {e}")


@contextmanager
def get_db_cursor(commit=True, use_database=True):
    """
    Context manager that yields an active dictionary cursor.
    Automatically handles:
    - Committing on success (if commit=True)
    - Rollback on exception
    - Reliable connection cleanup in finally block
    """
    connection = None
    try:
        connection = DatabaseConnection.get_connection(use_database=use_database)
        with connection.cursor() as cursor:
            yield cursor
        if commit:
            connection.commit()
    except Exception as e:
        if connection:
            try:
                connection.rollback()
                logger.info("[Database] Transaction successfully rolled back due to error.")
            except Exception as rb_err:
                logger.error(f"[Database] Rollback failed: {rb_err}")
        logger.error(f"[Database Query Error]: {e}")
        raise e
    finally:
        if connection:
            try:
                connection.close()
            except Exception as close_err:
                logger.warning(f"[Database] Error closing connection: {close_err}")


get_db = get_db_cursor


def execute_query(sql, params=None, commit=True):
    """
    Executes an INSERT, UPDATE, or DELETE query with parameters.
    Returns a dict with 'affected_rows' and 'last_id'.
    """
    with get_db_cursor(commit=commit) as cursor:
        affected = cursor.execute(sql, params or ())
        last_id = cursor.lastrowid
        return {"affected_rows": affected, "last_id": last_id}


def fetch_one(sql, params=None):
    """
    Executes a SELECT query and returns a single dictionary row or None.
    """
    with get_db_cursor(commit=False) as cursor:
        cursor.execute(sql, params or ())
        return cursor.fetchone()


def fetch_all(sql, params=None):
    """
    Executes a SELECT query and returns all matching dictionary rows.
    """
    with get_db_cursor(commit=False) as cursor:
        cursor.execute(sql, params or ())
        return cursor.fetchall()


def execute_transaction(operations):
    """
    Executes multiple SQL operations within a single atomic transaction.
    operations = [(sql_1, params_1), (sql_2, params_2), ...]
    """
    connection = None
    results = []
    try:
        connection = DatabaseConnection.get_connection()
        with connection.cursor() as cursor:
            for sql, params in operations:
                affected = cursor.execute(sql, params or ())
                results.append({"affected_rows": affected, "last_id": cursor.lastrowid})
        connection.commit()
        return results
    except Exception as e:
        if connection:
            connection.rollback()
        logger.error(f"[Database Transaction Failure]: {e}")
        raise e
    finally:
        if connection:
            connection.close()


def test_database_connection():
    """
    Verifies MySQL connectivity and retrieves server metadata.
    Returns:
        dict: Connection status, MySQL version, current database, host, port, error message.
    """
    host = DatabaseConfig.get_host()
    port = DatabaseConfig.get_port()
    user = DatabaseConfig.get_user()
    db_name = DatabaseConfig.get_db_name()

    try:
        # Step 1: Test raw server connection
        with get_db_cursor(commit=False, use_database=False) as cursor:
            cursor.execute("SELECT VERSION() AS version, CURRENT_USER() AS `authenticated_user`;")
            server_info = cursor.fetchone()

            # Step 2: Check if target database exists
            cursor.execute("SHOW DATABASES LIKE %s;", (db_name,))
            db_exists = cursor.fetchone() is not None

        return {
            "connected": True,
            "mysql_version": server_info.get("version"),
            "authenticated_user": server_info.get("current_user"),
            "host": host,
            "port": port,
            "database": db_name,
            "database_exists": db_exists,
            "message": f"Successfully connected to MySQL {server_info.get('version')} at {host}:{port}"
        }
    except Exception as e:
        return {
            "connected": False,
            "host": host,
            "port": port,
            "user": user,
            "database": db_name,
            "error": str(e),
            "message": f"Could not connect to MySQL at {host}:{port}. Please check .env credentials."
        }

