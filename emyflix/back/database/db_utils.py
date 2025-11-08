import mysql.connector
from .db_config import DB_CONFIG

def get_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Erro ao conectar ao Banco de Dados!: {err}")
        return None