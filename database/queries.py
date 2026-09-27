"""
Art Flair - Reusable Database Query Helper Layer
Developed for Sabahz Trading

Provides clean, standardized abstraction for CRUD queries, preventing code duplication
across routes and services while ensuring parameterized SQL injection prevention.
"""

from database.connection import fetch_one, fetch_all, execute_query, execute_transaction
import logging

logger = logging.getLogger(__name__)


class QueryBuilder:
    """Helper for constructing parameterized SQL statements safely."""

    @staticmethod
    def _build_where(where_dict):
        """Constructs WHERE clause and parameter list from a dictionary."""
        if not where_dict:
            return "", []

        conditions = []
        params = []
        for key, val in where_dict.items():
            if val is None:
                conditions.append(f"`{key}` IS NULL")
            else:
                conditions.append(f"`{key}` = %s")
                params.append(val)

        where_clause = " WHERE " + " AND ".join(conditions)
        return where_clause, params


def select_one(table, where_dict=None, columns="*", order_by=None):
    """
    Fetches a single record from a table matching where_dict.
    Example: select_one('users', {'email': 'artist@studio.com'})
    """
    where_clause, params = QueryBuilder._build_where(where_dict)
    sql = f"SELECT {columns} FROM `{table}`{where_clause}"

    if order_by:
        sql += f" ORDER BY {order_by}"
    sql += " LIMIT 1;"

    return fetch_one(sql, tuple(params))


def select_all(table, where_dict=None, columns="*", order_by=None, limit=None, offset=None):
    """
    Fetches all records matching where_dict with optional sorting and pagination.
    Example: select_all('products', {'category_id': 'paints', 'is_active': 1}, order_by='price ASC')
    """
    where_clause, params = QueryBuilder._build_where(where_dict)
    sql = f"SELECT {columns} FROM `{table}`{where_clause}"

    if order_by:
        sql += f" ORDER BY {order_by}"

    if limit is not None:
        sql += " LIMIT %s"
        params.append(int(limit))
        if offset is not None:
            sql += " OFFSET %s"
            params.append(int(offset))

    sql += ";"
    return fetch_all(sql, tuple(params))


def insert(table, data_dict):
    """
    Inserts a dictionary record into a table.
    Returns: {"affected_rows": 1, "last_id": <id>}
    Example: insert('cart_items', {'user_id': 'CUST-104', 'product_id': 'AF-PNT-001', 'quantity': 2})
    """
    if not data_dict:
        raise ValueError("Cannot insert empty data dictionary.")

    columns = [f"`{k}`" for k in data_dict.keys()]
    placeholders = ["%s"] * len(data_dict)
    values = list(data_dict.values())

    sql = f"INSERT INTO `{table}` ({', '.join(columns)}) VALUES ({', '.join(placeholders)});"
    return execute_query(sql, tuple(values))


def update(table, data_dict, where_dict):
    """
    Updates records in a table matching where_dict.
    Example: update('products', {'stock': 45}, {'id': 'AF-PNT-001'})
    """
    if not data_dict or not where_dict:
        raise ValueError("Both data_dict and where_dict must be provided for update.")

    set_clauses = [f"`{k}` = %s" for k in data_dict.keys()]
    values = list(data_dict.values())

    where_clause, where_params = QueryBuilder._build_where(where_dict)
    values.extend(where_params)

    sql = f"UPDATE `{table}` SET {', '.join(set_clauses)}{where_clause};"
    return execute_query(sql, tuple(values))


def delete(table, where_dict):
    """
    Deletes records matching where_dict.
    Example: delete('cart_items', {'user_id': 'CUST-104', 'product_id': 'AF-PNT-001'})
    """
    if not where_dict:
        raise ValueError("where_dict cannot be empty for delete operation.")

    where_clause, params = QueryBuilder._build_where(where_dict)
    sql = f"DELETE FROM `{table}`{where_clause};"
    return execute_query(sql, tuple(params))


def count(table, where_dict=None):
    """
    Counts matching records in a table.
    """
    where_clause, params = QueryBuilder._build_where(where_dict)
    sql = f"SELECT COUNT(*) AS total FROM `{table}`{where_clause};"
    result = fetch_one(sql, tuple(params))
    return result['total'] if result else 0


def raw_query(sql, params=None, fetch="all"):
    """
    Executes raw SQL query when complex joins, groupings, or subqueries are required.
    fetch options: 'all' (fetch_all), 'one' (fetch_one), 'none' (execute_query)
    """
    if fetch == "one":
        return fetch_one(sql, params)
    elif fetch == "none":
        return execute_query(sql, params)
    else:
        return fetch_all(sql, params)
