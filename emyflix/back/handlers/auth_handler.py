# Este é o Controlador de Autenticação. Ele lida com a LÓGICA de login e registro.

import json
from database.db_utils import get_db_connection
from utils.respostas import parse_json_body, send_json_response, send_error_response
from utils.auth_seguranca import hash_password, check_password, create_token
import mysql.connector

def handle_register(handler_instance):
    # Lida com [POST] /register - Registro de novo usuário.
    # Lê o JSON enviado pelo React
    body = parse_json_body(handler_instance)
    if not body:
        send_error_response(handler_instance, 400, "Corpo da requisição inválido ou vazio.")
        return

    # Pega os dados do corpo JSON
    nome = body.get('nome')
    email = body.get('email')
    senha = body.get('senha')
    role_nome = body.get('role', 'comum') # Padrão é 'comum' se não for enviado

    if not nome or not email or not senha:
        send_error_response(handler_instance, 400, "Campos 'nome', 'email' e 'senha' são obrigatórios.")
        return

    if role_nome not in ['comum', 'adm']:
        send_error_response(handler_instance, 400, "Role deve ser 'comum' ou 'adm'.")
        return
    
    # Converte o nome do "papel" para o ID do banco (1 = comum, 2 = adm)
    role_id_para_inserir = 1 if role_nome == 'comum' else 2

    # Criptografa a senha ANTES de salvar
    senha_hashed = hash_password(senha)

    # Conecta ao banco
    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return
    
    cursor = conn.cursor()
    query = "INSERT INTO usuarios (nome, email, senha, role_id) VALUES (%s, %s, %s, %s)"
    
    try:
        # Executa a query no banco
        cursor.execute(query, (nome, email, senha_hashed, role_id_para_inserir))
        conn.commit()
        
        # Envia a resposta de sucesso
        send_json_response(handler_instance, 201, {"mensagem": "Usuário criado com sucesso."})

    except mysql.connector.Error as err:
        # 1062 é o código de erro do MySQL para "Chave duplicada" (email já existe)
        if err.errno == 1062: 
            send_error_response(handler_instance, 409, "Email já cadastrado.")
        else:
            send_error_response(handler_instance, 500, f"Erro no banco de dados: {err.errno} ({err.sqlstate}): {err.msg}")
    finally:
        # Fecha a conexão
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()


def handle_login(handler_instance):
    # Lida com [POST] /login - Login do usuário.
    # Lê o JSON
    body = parse_json_body(handler_instance)
    if not body:
        send_error_response(handler_instance, 400, "Corpo da requisição inválido ou vazio.")
        return

    email = body.get('email')
    senha_digitada = body.get('senha')

    if not email or not senha_digitada:
        send_error_response(handler_instance, 400, "Campos 'email' e 'senha' são obrigatórios.")
        return

    # Conecta com o servidor
    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return
    
    # 'dictionary=True' faz o MySQL retornar os dados como um dicionário Python
    cursor = conn.cursor(dictionary=True) 
    
    # Busca o usuário E o nome do "papel" dele (comum ou adm)
    query = """
        SELECT u.*, r.nome AS role_nome 
        FROM usuarios u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = %s
    """
    
    try:
        cursor.execute(query, (email,))
        usuario = cursor.fetchone() # Pega o primeiro resultado

        if not usuario:
            # Por segurança, não dizemos "usuário não encontrado"
            send_error_response(handler_instance, 404, "Usuário ou senha inválidos.")
            return 

        senha_hashed_do_banco = usuario['senha']

        # Compara a senha digitada com a do banco
        if check_password(senha_digitada, senha_hashed_do_banco):
            # Senha correta!
            # Cria um "crachá" (Token)
            token = create_token(user_id=usuario['id'], user_role=usuario['role_nome'])
            
            # Envia a resposta de sucesso com o token
            send_json_response(handler_instance, 200, {
                "mensagem": "Login bem-sucedido!",
                "token": token,
                "usuario": {
                    "nome": usuario['nome'],
                    "email": usuario['email'],
                    "role": usuario['role_nome']
                }
            })
        else:
            # Senha incorreta
            send_error_response(handler_instance, 401, "Usuário ou senha inválidos.")
            
    except mysql.connector.Error as err:
        send_error_response(handler_instance, 500, f"Erro no banco de dados: {err.errno} ({err.sqlstate}): {err.msg}")
    
    finally:
        # Fecha a conexão
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()