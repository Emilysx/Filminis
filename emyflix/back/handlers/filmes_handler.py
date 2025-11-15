# Este é o Controlador de Filmes, ele lida com a LÓGICA de buscar, listar, adicionar e editar filmes.

import json
from urllib.parse import urlparse, parse_qs
from database.db_utils import get_db_connection
from utils.respostas import parse_json_body, send_json_response, send_error_response 
import mysql.connector

def handle_get_all_filmes(handler_instance):
    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return

    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT 
            f.id, f.titulo, f.ano, f.sinopse, f.poster_url, f.duracao,
            l.linguagem AS linguagem,  -- <-- MUDANÇA AQUI
            GROUP_CONCAT(DISTINCT g.nome SEPARATOR ', ') AS generos
        FROM filmes f
        LEFT JOIN filmes_generos fg ON f.id = fg.filme_id
        LEFT JOIN generos g ON fg.genero_id = g.id
        LEFT JOIN linguagens l ON f.id_linguagem = l.id_linguagem -- <-- MUDANÇA AQUI
        GROUP BY f.id, l.linguagem;
    """
    
    try:
        cursor.execute(query)
        filmes = cursor.fetchall()
        for filme in filmes:
            filme['generos'] = filme['generos'].split(', ') if filme['generos'] else []
        send_json_response(handler_instance, 200, filmes)
    except mysql.connector.Error as err:
        send_error_response(handler_instance, 500, f"Erro no banco de dados: {err.errno} ({err.sqlstate}): {err.msg}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()


def handle_get_filme_by_id(handler_instance, filme_id):
    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return

    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT 
            f.id, f.titulo, f.ano, f.sinopse, f.poster_url, f.duracao,
            l.linguagem AS linguagem, -- <-- MUDANÇA AQUI
            GROUP_CONCAT(DISTINCT g.nome SEPARATOR ', ') AS generos,
            GROUP_CONCAT(DISTINCT d.nome SEPARATOR ', ') AS diretores,
            GROUP_CONCAT(DISTINCT a.nome SEPARATOR ', ') AS atores
        FROM filmes f
        LEFT JOIN filmes_generos fg ON f.id = fg.filme_id
        LEFT JOIN generos g ON fg.genero_id = g.id
        LEFT JOIN filmes_diretores fd ON f.id = fd.filme_id
        LEFT JOIN diretores d ON fd.diretor_id = d.id
        LEFT JOIN filmes_atores fa ON f.id = fa.filme_id
        LEFT JOIN atores a ON fa.ator_id = a.id
        LEFT JOIN linguagens l ON f.id_linguagem = l.id_linguagem -- <-- MUDANÇA AQUI
        WHERE f.id = %s
        GROUP BY f.id, l.linguagem;
    """
    
    try:
        cursor.execute(query, (filme_id,))
        filme = cursor.fetchone()
        
        if not filme:
            send_error_response(handler_instance, 404, "Filme não encontrado.")
            return

        def split_to_list(value):
            return value.split(', ') if value else []

        filme['generos'] = split_to_list(filme['generos'])
        filme['diretores'] = split_to_list(filme['diretores'])
        filme['atores'] = split_to_list(filme['atores'])
        
        send_json_response(handler_instance, 200, filme)
    except mysql.connector.Error as err:
        send_error_response(handler_instance, 500, f"Erro no banco de dados: {err.errno} ({err.sqlstate}): {err.msg}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()

def handle_get_all_generos(handler_instance):
    """ 
    Lida com [GET] /generos
    Busca no banco todos os gêneros disponíveis.
    """
    
    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return

    cursor = conn.cursor(dictionary=True)
    query = "SELECT * FROM generos ORDER BY nome ASC"
    
    try:
        cursor.execute(query)
        generos = cursor.fetchall()
        send_json_response(handler_instance, 200, generos)
        
    except mysql.connector.Error as err:
        send_error_response(handler_instance, 500, f"Erro no banco de dados: {err.errno} ({err.sqlstate}): {err.msg}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()


def handle_create_filme(handler_instance, user_data):
    """ 
    Lida com [POST] /filmes - Adição de um novo filme.
    Cria uma solicitação pendente na tabela 'solicitacoes_adicao'.
    """
    
    body = parse_json_body(handler_instance)
    if not body:
        send_error_response(handler_instance, 400, "Corpo da requisição inválido ou vazio.")
        return

    # Pega todos os compos do body
    titulo = body.get('titulo')
    ano = body.get('ano')
    duracao = body.get('duracao')
    poster_url = body.get('poster_url')
    sinopse = body.get('sinopse')
    id_linguagem = body.get('id_linguagem')
    generos_texto = body.get('generos_texto')
    
    # Campos opcionais
    diretores_texto = body.get('diretores_texto')
    atores_texto = body.get('atores_texto')

    # Verifica todos os campos que são obrigatórios no front-end
    if not all([titulo, ano, duracao, poster_url, sinopse, id_linguagem, generos_texto]):
        send_error_response(handler_instance, 400, "Todos os campos obrigatórios (*) devem ser preenchidos.")
        return

    # Pega o ID do usuário de dentro do "crachá" (Token)
    solicitado_por_id = user_data['user_id']
    
    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return

    cursor = conn.cursor()
    
    query = """
        INSERT INTO solicitacoes_adicao 
        (titulo, ano, sinopse, poster_url, duracao, 
         generos_texto, diretores_texto, atores_texto, 
         solicitado_por_id, id_linguagem, status) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    dados_para_inserir = (
        titulo, ano, sinopse, poster_url, 
        duracao,
        generos_texto, 
        diretores_texto, 
        atores_texto,
        solicitado_por_id,
        id_linguagem,
        'pendente'
    )
    
    try:
        cursor.execute(query, dados_para_inserir)
        conn.commit()
        send_json_response(handler_instance, 201, {
            "mensagem": "Filme enviado para aprovação com sucesso."
        })
        
    except mysql.connector.Error as err:
        # Adiciona uma checagem específica para o erro que você teve
        if err.errno == 1364:
            send_error_response(handler_instance, 400, f"Erro de campo obrigatório no banco: {err.msg}")
        else:
            send_error_response(handler_instance, 500, f"Erro no banco de dados: {err.errno} ({err.sqlstate}): {err.msg}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()


def handle_search_filmes(handler_instance):
    """
    Lida com [GET] /filmes/buscar?filtro=valor&filtro2=valor
    Busca e filtra filmes com base nos parâmetros da query.
    """
    
    # Pega os filtros da URL (ex: ?titulo=mario)
    parsed_path = urlparse(handler_instance.path)
    query_params = parse_qs(parsed_path.query)

    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return

    cursor = conn.cursor(dictionary=True)
    
    # Query ATUALIZADA para incluir 'duracao'
    base_query = """
        SELECT 
            f.id, f.titulo, f.ano, f.sinopse, f.poster_url, f.duracao,
            GROUP_CONCAT(DISTINCT g.nome SEPARATOR ', ') AS generos,
            GROUP_CONCAT(DISTINCT d.nome SEPARATOR ', ') AS diretores,
            GROUP_CONCAT(DISTINCT a.nome SEPARATOR ', ') AS atores
        FROM filmes f
        LEFT JOIN filmes_generos fg ON f.id = fg.filme_id
        LEFT JOIN generos g ON fg.genero_id = g.id
        LEFT JOIN filmes_diretores fd ON f.id = fd.filme_id
        LEFT JOIN diretores d ON fd.diretor_id = d.id
        LEFT JOIN filmes_atores fa ON f.id = fa.filme_id
        LEFT JOIN atores a ON fa.ator_id = a.id
    """
    
    where_clauses = [] # Lista para guardar os filtros (ex: "f.titulo LIKE %s")
    params = []        # Lista para guardar os valores (ex: "%Mario%")

    # Constrói a query dinamicamente, dependendo dos filtros que o usuário enviar
    if 'titulo' in query_params:
        where_clauses.append("f.titulo LIKE %s")
        params.append(f"%{query_params['titulo'][0]}%") 

    if 'ano' in query_params:
        where_clauses.append("f.ano = %s")
        params.append(query_params['ano'][0])
        
    if 'genero' in query_params:
        where_clauses.append("g.nome = %s")
        params.append(query_params['genero'][0])
        
    if 'diretor' in query_params:
        where_clauses.append("d.nome LIKE %s")
        params.append(f"%{query_params['diretor'][0]}%")
        
    if 'ator' in query_params: # Busca por Personagem
        where_clauses.append("a.nome LIKE %s")
        params.append(f"%{query_params['ator'][0]}%")

    query = base_query
    if where_clauses:
        query += " WHERE " + " AND ".join(where_clauses)
        
    query += " GROUP BY f.id, f.titulo, f.ano, f.sinopse, f.poster_url, f.duracao;"
    
    try:
        cursor.execute(query, tuple(params))
        filmes = cursor.fetchall()
        
        def split_to_list(value):
            return value.split(', ') if value else []

        for filme in filmes:
            filme['generos'] = split_to_list(filme['generos'])
            filme['diretores'] = split_to_list(filme['diretores'])
            filme['atores'] = split_to_list(filme['atores'])

        send_json_response(handler_instance, 200, filmes)
        
    except mysql.connector.Error as err:
        send_error_response(handler_instance, 500, f"Erro no banco de dados: {err.errno} ({err.sqlstate}): {err.msg}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()

def handle_edit_filme(handler_instance, filme_id, user_data):
    """
    Lida com [PUT] /filmes/<id> - Submissão de edição
    Cria uma solicitação de edição para aprovação do ADM.
    """
    
    body = parse_json_body(handler_instance)
    if not body:
        send_error_response(handler_instance, 400, "Corpo da requisição inválido (JSON).")
        return

    solicitado_por_id = user_data['user_id']

    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return

    conn.autocommit = False # Inicia uma transação (ou tudo funciona, ou nada é salvo)
    cursor = conn.cursor(dictionary=True)
    
    try:
        # 1. Busca o filme original para pegar os "valores antigos"
        cursor.execute("SELECT * FROM filmes WHERE id = %s", (filme_id,))
        filme_original = cursor.fetchone()
        
        if not filme_original:
            send_error_response(handler_instance, 404, "Filme não encontrado.")
            return

        # 2. Query para inserir na tabela de solicitações de edição
        query_insert = """
            INSERT INTO solicitacoes_edicao
            (filme_id, campo_alterado, valor_antigo, valor_novo, 
             solicitado_por_id, status)
            VALUES (%s, %s, %s, %s, %s, 'pendente')
        """
        
        alteracoes_enviadas = 0
        
        # 3. Itera sobre os campos enviados no body (ex: "titulo", "ano")
        for campo, valor_novo in body.items():
            # Checa se o campo existe mesmo no banco (para segurança)
            if campo in filme_original and campo != 'id':
                valor_antigo = str(filme_original[campo])
                valor_novo_str = str(valor_novo)
                
                # Se o valor mudou, cria a solicitação de edição
                if valor_novo_str != valor_antigo:
                    cursor.execute(query_insert, (
                        filme_id,
                        campo,
                        valor_antigo,
                        valor_novo_str,
                        solicitado_por_id
                    ))
                    alteracoes_enviadas += 1

        if alteracoes_enviadas > 0:
            conn.commit() # Salva todas as solicitações de edição
            send_json_response(handler_instance, 202, {
                "mensagem": f"{alteracoes_enviadas} alterações enviadas para aprovação."
            })
        else:
            # Se o usuário enviou dados, mas eram iguais aos antigos
            send_json_response(handler_instance, 200, {
                "mensagem": "Nenhuma alteração detectada."
            })

    except mysql.connector.Error as err:
        conn.rollback() # Desfaz a transação em caso de erro
        send_error_response(handler_instance, 500, f"Erro no banco de dados: {err}")
    except Exception as e:
        conn.rollback()
        send_error_response(handler_instance, 500, f"Erro inesperado: {e}")
    finally:
        conn.autocommit = True
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()