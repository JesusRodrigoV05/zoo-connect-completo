import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    conn = psycopg2.connect("postgresql://postgres:admin@localhost:5432/postgres")
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    
    # Check if database exists
    cur.execute("SELECT 1 FROM pg_database WHERE datname='ZOOCONNECT'")
    exists = cur.fetchone()
    if not exists:
        cur.execute('CREATE DATABASE "ZOOCONNECT"')
        print("Database ZOOCONNECT created successfully.")
    else:
        print("Database ZOOCONNECT already exists.")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
