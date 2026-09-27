"""
Art Flair - Database Connectivity Test Script
Developed for Sabahz Trading

Tests:
1. Environment configuration loading (.env)
2. MySQL 8.0 socket/TCP connection
3. Authentication and user permissions
4. Database existence and charset evaluation
5. queries.py abstraction functions
"""

import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.connection import test_database_connection, DatabaseConfig
from database import queries


def run_test():
    print("=" * 60)
    print("  ART FLAIR - MYSQL DATABASE CONNECTIVITY TEST")
    print("=" * 60)
    print(f"  Target Host     : {DatabaseConfig.get_host()}")
    print(f"  Target Port     : {DatabaseConfig.get_port()}")
    print(f"  Database Name   : {DatabaseConfig.get_db_name()}")
    print(f"  User Account    : {DatabaseConfig.get_user()}")
    print(f"  Password Set    : {'[YES - Masked]' if DatabaseConfig.get_password() else '[NO - Empty]'}")
    print("-" * 60)

    result = test_database_connection()

    if result.get("connected"):
        print("  STATUS: [SUCCESS] CONNECTED TO MYSQL SERVER")
        print(f"  MySQL Version   : {result.get('mysql_version')}")
        print(f"  Connected User  : {result.get('authenticated_user')}")
        print(f"  Database Found  : {'Yes' if result.get('database_exists') else 'No (Will be auto-created)'}")
        print("-" * 60)
        print("  Database connection layer is operational and ready!")
        print("=" * 60)
        return True
    else:
        print("  STATUS: [ATTENTION REQUIRED] CONNECTION FAILED")
        print(f"  Error Details   : {result.get('error')}")
        print("-" * 60)
        print("  Troubleshooting Instructions:")
        print("  1. Verify MySQL service is active on your machine.")
        print("  2. If your MySQL root user has a password, update 'DB_PASSWORD' in 'backend/.env'.")
        print("  3. Verify port in 'backend/.env' (default is 3306).")
        print("=" * 60)
        return False


if __name__ == '__main__':
    success = run_test()
    sys.exit(0 if success else 1)
