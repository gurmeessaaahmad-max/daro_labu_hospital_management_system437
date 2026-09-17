import mysql.connector

print("1. Python started", flush=True)

try:
    print("2. Connecting to MySQL using pure Python...", flush=True)

    connection = mysql.connector.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="G.a@437.com",
        database="daro_labu_hospital",
        connection_timeout=5,
        use_pure=True
    )

    print("3. CONNECTION SUCCESSFUL!", flush=True)
    print("4. Database: daro_labu_hospital", flush=True)

    connection.close()

    print("5. Connection closed.", flush=True)

except BaseException as error:
    print("6. CONNECTION FAILED!", flush=True)
    print("ERROR TYPE:", type(error).__name__, flush=True)
    print("ERROR:", error, flush=True)