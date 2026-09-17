import mysql.connector


def get_db_connection():
    connection = mysql.connector.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="G.a@437.com",
        database="daro_labu_hospital",
        connection_timeout=5,
        use_pure=True
    )

    return connection