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
            l.linguagem AS linguagem,  
            GROUP_CONCAT(DISTINCT g.nome SEPARATOR ', ') AS generos
        FROM filmes f
        LEFT JOIN filmes_generos fg ON f.id = fg.filme_id
        LEFT JOIN generos g ON fg.genero_id = g.id
        LEFT JOIN linguagens l ON f.id_linguagem = l.id_linguagem 
        GROUP BY f.id, l.linguagem
        ORDER BY f.id DESC;
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
    Lida com [GET] /filmes/buscar?...
    Busca por Título/Ator/Diretor (q=) E/OU Gênero (genero=) E/OU Ano (ano=).
    """

    parsed_path = urlparse(handler_instance.path)
    query_params = parse_qs(parsed_path.query)

    # 1. Pega TODOS os filtros possíveis da URL
    termo_q = query_params.get('q', [None])[0]
    filtro_genero = query_params.get('genero', [None])[0]
    filtro_ano = query_params.get('ano', [None])[0]

    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return

    cursor = conn.cursor(dictionary=True)

    # Query base (sempre pega tudo)
    base_query = """
        SELECT 
            f.id, f.titulo, f.ano, f.sinopse, f.poster_url, f.duracao,
            l.linguagem AS linguagem,
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
        LEFT JOIN linguagens l ON f.id_linguagem = l.id_linguagem
    """

    # 2. Constrói a cláusula WHERE dinamicamente
    where_clauses = []
    params = []

    # Filtro da Navbar (q=...)
    if termo_q:
        # Procura em Título, Ator (Personagem) ou Diretor
        where_clauses.append("(f.titulo LIKE %s OR a.nome LIKE %s OR d.nome LIKE %s)")
        like_termo = f"%{termo_q}%"
        params.extend([like_termo, like_termo, like_termo])

    # Filtro de Gênero (genero=...)
    if filtro_genero:
        where_clauses.append("g.nome = %s")
        params.append(filtro_genero)

    # Filtro de Ano (ano=...)
    if filtro_ano:
        where_clauses.append("f.ano = %s")
        params.append(filtro_ano)

    # 3. Junta tudo com "AND"
    query = base_query
    if where_clauses:
        query += " WHERE " + " AND ".join(where_clauses)

    query += " GROUP BY f.id, l.linguagem ORDER BY f.id DESC;"

    try:
        cursor.execute(query, tuple(params))
        filmes = cursor.fetchall()

        if not filmes:
            send_error_response(handler_instance, 404, "Nenhum filme encontrado para estes filtros.")
            return

        # Função helper para formatar os dados
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

    conn.autocommit = False 
    cursor = conn.cursor(dictionary=True)
    
    try:
        # --- ETAPA 1: BUSCAR OS DADOS ORIGINAIS ---
        # (Esta query é mais inteligente, igual à do get_by_id)
        query_original = """
            SELECT 
                f.id, f.titulo, f.ano, f.sinopse, f.poster_url, f.duracao, f.id_linguagem,
                GROUP_CONCAT(DISTINCT g.nome SEPARATOR ', ') AS generos_texto,
                GROUP_CONCAT(DISTINCT d.nome SEPARATOR ', ') AS diretores_texto,
                GROUP_CONCAT(DISTINCT a.nome SEPARATOR ', ') AS atores_texto
            FROM filmes f
            LEFT JOIN filmes_generos fg ON f.id = fg.filme_id
            LEFT JOIN generos g ON fg.genero_id = g.id
            LEFT JOIN filmes_diretores fd ON f.id = fd.filme_id
            LEFT JOIN diretores d ON fd.diretor_id = d.id
            LEFT JOIN filmes_atores fa ON f.id = fa.filme_id
            LEFT JOIN atores a ON fa.ator_id = a.id
            WHERE f.id = %s
            GROUP BY f.id, f.id_linguagem;
        """
        cursor.execute(query_original, (filme_id,))
        filme_original = cursor.fetchone()
        
        if not filme_original:
            send_error_response(handler_instance, 404, "Filme não encontrado.")
            return

        # --- ETAPA 2: COMPARAR E INSERIR SOLICITAÇÕES ---
        query_insert = """
            INSERT INTO solicitacoes_edicao
            (filme_id, campo_alterado, valor_antigo, valor_novo, 
             solicitado_por_id, status)
            VALUES (%s, %s, %s, %s, %s, 'pendente')
        """
        
        alteracoes_enviadas = 0
        
        # Lista de TODOS os campos que o usuário pode editar
        campos_para_checar = [
            'titulo', 'ano', 'duracao', 'poster_url', 'sinopse', 
            'id_linguagem', 'generos_texto', 'atores_texto', 'diretores_texto'
        ]

        for campo in campos_para_checar:
            # Verifica se o front-end enviou este campo
            if campo in body:
                # Pega o valor antigo (do banco) e o novo (do front-end)
                valor_antigo = str(filme_original.get(campo) or '')
                valor_novo = str(body.get(campo) or '')
                
                # Se forem diferentes, cria a solicitação
                if valor_novo != valor_antigo:
                    cursor.execute(query_insert, (
                        filme_id,
                        campo,
                        valor_antigo,
                        valor_novo,
                        solicitado_por_id
                    ))
                    alteracoes_enviadas += 1

        # --- ETAPA 3: FINALIZAR ---
        if alteracoes_enviadas > 0:
            conn.commit() 
            send_json_response(handler_instance, 202, {
                "mensagem": f"{alteracoes_enviadas} alterações enviadas para aprovação."
            })
        else:
            send_json_response(handler_instance, 200, {
                "mensagem": "Nenhuma alteração detectada."
            })

    except mysql.connector.Error as err:
        conn.rollback() 
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