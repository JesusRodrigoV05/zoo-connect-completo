import psycopg2
try:
    conn = psycopg2.connect("postgresql://postgres:admin@localhost:5432/postgres")
    print("Connection successful!")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
