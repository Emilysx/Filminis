# Este é o Controlador do Administrador, ele lida com a LÓGICA de aprovar, rejeitar e deletar conteúdo.

import json
from database.db_utils import get_db_connection
from utils.respostas import send_json_response, send_error_response 
import mysql.connector

EDIT_COLUMNS_WHITELIST = [
    'titulo', 'ano', 'sinopse', 'poster_url', 'duracao', 'id_linguagem',
    'generos_texto', 'atores_texto', 'diretores_texto' 
]

def handle_get_pending_filmes(handler_instance):
    """
    Lida com [GET] /admin/solicitacoes
    Busca todas as solicitações de ADIÇÃO de filmes com status 'pendente'.
    """
    
    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return

    cursor = conn.cursor(dictionary=True)
    # Busca na tabela de solicitações, não na de filmes
    query = "SELECT * FROM solicitacoes_adicao WHERE status = 'pendente' ORDER BY data_solicitacao ASC;"
    
    try:
        cursor.execute(query)
        solicitacoes = cursor.fetchall()
        send_json_response(handler_instance, 200, solicitacoes)
        
    except mysql.connector.Error as err:
        send_error_response(handler_instance, 500, f"Erro no banco de dados: {err.errno} ({err.sqlstate}): {err.msg}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()


def _processar_e_linkar_dados(cursor, filme_id, tabela_catalogo, tabela_link, coluna_link, texto_csv):
    """
    Função helper interna para processar texto (ex: "Personagem1, Personagem2")
    e conectar nas tabelas intermediárias (filmes_atores, filmes_generos, etc.)
    """
    if not texto_csv: 
        return
        
    nomes = [nome.strip() for nome in texto_csv.split(',')]
    for nome in nomes:
        if not nome: continue # Pula nomes vazios

        # Verifica se o item (ex: Gênero "Animação") já existe
        cursor.execute(f"SELECT id FROM {tabela_catalogo} WHERE nome = %s", (nome,))
        resultado = cursor.fetchone()
        
        if resultado:
            item_id = resultado['id']
        else:
            # Se não existe, cria o item (ex: Adiciona "Terror" na tabela generos)
            cursor.execute(f"INSERT INTO {tabela_catalogo} (nome) VALUES (%s)", (nome,))
            item_id = cursor.lastrowid # Pega o ID do item que acabou de criar
            
        # Liga o filme ao item (ex: Liga filme 21 com genero 9)
        # INSERT IGNORE é usado para não dar erro se a ligação já existir
        cursor.execute(f"INSERT IGNORE INTO {tabela_link} (filme_id, {coluna_link}) VALUES (%s, %s)", (filme_id, item_id))


def handle_approve_filme(handler_instance, solicitacao_id):
    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return
    
    conn.autocommit = False 
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM solicitacoes_adicao WHERE id = %s AND status = 'pendente'", (solicitacao_id,))
        solicitacao = cursor.fetchone()
        
        if not solicitacao:
            send_error_response(handler_instance, 404, "Solicitação não encontrada ou já processada.")
            return

        query_filme = """
            INSERT INTO filmes (titulo, ano, sinopse, poster_url, duracao, id_linguagem)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query_filme, (
            solicitacao['titulo'], solicitacao['ano'], 
            solicitacao['sinopse'], solicitacao['poster_url'],
            solicitacao['duracao'],
            solicitacao['id_linguagem']
        ))
        
        filme_id = cursor.lastrowid 
        _processar_e_linkar_dados(cursor, filme_id, 'generos', 'filmes_generos', 'genero_id', solicitacao['generos_texto'])
        _processar_e_linkar_dados(cursor, filme_id, 'diretores', 'filmes_diretores', 'diretor_id', solicitacao['diretores_texto'])
        _processar_e_linkar_dados(cursor, filme_id, 'atores', 'filmes_atores', 'ator_id', solicitacao['atores_texto'])

        cursor.execute("UPDATE solicitacoes_adicao SET status = 'aprovado' WHERE id = %s", (solicitacao_id,))
        
        conn.commit()
        send_json_response(handler_instance, 200, {
            "mensagem": "Filme aprovado e publicado com sucesso.",
            "filme_id_criado": filme_id
        })

    except mysql.connector.Error as err:
        conn.rollback() # Desfaz tudo se der erro
        send_error_response(handler_instance, 500, f"Erro no banco de dados durante a transação: {err}")
    except Exception as e:
        conn.rollback()
        send_error_response(handler_instance, 500, f"Erro inesperado: {e}")
    finally:
        conn.autocommit = True # Devolve o autocommit ao normal
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()


def handle_delete_filme(handler_instance, filme_id):
    """
    Lida com [DELETE] /filmes/<id>
    Deleta um filme da tabela principal 'filmes'.
    (Graças ao "ON DELETE CASCADE" no SQL, as ligações são deletadas automaticamente)
    """
    
    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return

    cursor = conn.cursor()
    
    try:
        query = "DELETE FROM filmes WHERE id = %s"
        cursor.execute(query, (filme_id,))
        
        if cursor.rowcount == 0:
            # Se rowcount for 0, o ID não existia
            send_error_response(handler_instance, 404, "Filme não encontrado para deletar.")
        else:
            conn.commit() 
            send_json_response(handler_instance, 200, {
                "mensagem": "Filme deletado com sucesso."
            })
        
    except mysql.connector.Error as err:
        conn.rollback() 
        send_error_response(handler_instance, 500, f"Erro no banco de dados: {err}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()

def handle_reject_submission(handler_instance, solicitacao_id):
    """
    Lida com [PUT] /admin/rejeitar/<id>
    Rejeita (muda o status) de uma solicitação de ADIÇÃO de filme.
    """
    
    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return

    cursor = conn.cursor()
    
    try:
        # Em vez de deletar, mudamos o status para 'rejeitado'
        # Isso nos permite manter um histórico do que foi rejeitado
        query = "UPDATE solicitacoes_adicao SET status = 'rejeitado' WHERE id = %s AND status = 'pendente'"
        cursor.execute(query, (solicitacao_id,))
        
        if cursor.rowcount == 0:
            send_error_response(handler_instance, 404, "Solicitação não encontrada ou já processada.")
        else:
            conn.commit() 
            send_json_response(handler_instance, 200, {
                "mensagem": "Solicitação rejeitada com sucesso."
            })
        
    except mysql.connector.Error as err:
        conn.rollback() 
        send_error_response(handler_instance, 500, f"Erro no banco de dados: {err}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()

def handle_get_solicitacao_by_id(handler_instance, solicitacao_id):
    """
    Lida com [GET] /admin/solicitacao/<id>
    Busca os detalhes de UMA ÚNICA solicitação pendente.
    """
    
    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return

    cursor = conn.cursor(dictionary=True)
    
    # Faz um JOIN para pegar o nome do usuário que enviou
    query = """
        SELECT s.*, u.nome AS usuario_nome
        FROM solicitacoes_adicao s
        JOIN usuarios u ON s.solicitado_por_id = u.id
        WHERE s.id = %s
    """
    
    try:
        cursor.execute(query, (solicitacao_id,))
        solicitacao = cursor.fetchone()
        
        if not solicitacao:
            send_error_response(handler_instance, 404, "Solicitação não encontrada.")
        else:
            send_json_response(handler_instance, 200, solicitacao)
            
    except mysql.connector.Error as err:
        send_error_response(handler_instance, 500, f"Erro no banco de dados: {err}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()


def handle_approve_edit(handler_instance, solicitacao_id):
    """
    Lida com [PUT] /admin/aprovar-edicao/<id>
    Aprova uma solicitação de EDIÇÃO e aplica a mudança no filme.
    """
    
    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return
        
    conn.autocommit = False 
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM solicitacoes_edicao WHERE id = %s AND status = 'pendente'", (solicitacao_id,))
        solicitacao = cursor.fetchone()
        
        if not solicitacao:
            send_error_response(handler_instance, 404, "Solicitação de edição não encontrada ou já processada.")
            return

        filme_id = solicitacao['filme_id']
        campo = solicitacao['campo_alterado']
        valor_novo = solicitacao['valor_novo']
 
        if campo not in EDIT_COLUMNS_WHITELIST:
            raise ValueError(f"A edição do campo '{campo}' não é permitida.")
        
        if campo == 'generos_texto':
            cursor.execute("DELETE FROM filmes_generos WHERE filme_id = %s", (filme_id,))
            _processar_e_linkar_dados(cursor, filme_id, 'generos', 'filmes_generos', 'genero_id', valor_novo)
        
        elif campo == 'atores_texto':
            cursor.execute("DELETE FROM filmes_atores WHERE filme_id = %s", (filme_id,))
            _processar_e_linkar_dados(cursor, filme_id, 'atores', 'filmes_atores', 'ator_id', valor_novo)
            
        elif campo == 'diretores_texto':
            cursor.execute("DELETE FROM filmes_diretores WHERE filme_id = %s", (filme_id,))
            _processar_e_linkar_dados(cursor, filme_id, 'diretores', 'filmes_diretores', 'diretor_id', valor_novo)
        
        else:
            query_update = f"UPDATE filmes SET {campo} = %s WHERE id = %s"
            cursor.execute(query_update, (valor_novo, filme_id))
        
        cursor.execute("UPDATE solicitacoes_edicao SET status = 'aprovado' WHERE id = %s", (solicitacao_id,))
        
        conn.commit() # Salva as duas alterações
        send_json_response(handler_instance, 200, {"mensagem": f"Alteração do campo '{campo}' aprovada com sucesso."})

    except (mysql.connector.Error, ValueError) as err:
        conn.rollback() # Desfaz tudo se der erro
        send_error_response(handler_instance, 500, f"Erro ao aprovar edição: {err}")
    finally:
        conn.autocommit = True
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()

def handle_reject_edit(handler_instance, solicitacao_id):
    """
    Lida com [PUT] /admin/rejeitar-edicao/<id>
    Rejeita (não autoriza) uma solicitação de edição.
    """
    
    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return
        
    cursor = conn.cursor()
    
    try:
        # Apenas muda o status da solicitação para 'rejeitado'
        query = "UPDATE solicitacoes_edicao SET status = 'rejeitado' WHERE id = %s AND status = 'pendente'"
        cursor.execute(query, (solicitacao_id,))
        
        if cursor.rowcount == 0:
            send_error_response(handler_instance, 404, "Solicitação de edição não encontrada ou já processada.")
        else:
            conn.commit() # Salva a alteração
            send_json_response(handler_instance, 200, {"mensagem": "Solicitação de edição rejeitada com sucesso."})
            
    except mysql.connector.Error as err:
        conn.rollback()
        send_error_response(handler_instance, 500, f"Erro ao rejeitar edição: {err}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()

def handle_get_pending_edits(handler_instance):
    """
    Lida com [GET] /admin/solicitacoes-edicao
    Busca todas as solicitações de EDIÇÃO com status 'pendente'.
    """
    
    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return

    cursor = conn.cursor(dictionary=True)
    
    # Busca na tabela 'solicitacoes_edicao' e junta com 'filmes' e 'usuarios'
    query = """
        SELECT 
            s.*, 
            f.titulo AS filme_titulo, 
            f.poster_url,
            u.nome AS usuario_nome
        FROM solicitacoes_edicao s
        JOIN filmes f ON s.filme_id = f.id
        JOIN usuarios u ON s.solicitado_por_id = u.id
        WHERE s.status = 'pendente'
        ORDER BY s.data_solicitacao ASC;
    """
    
    try:
        cursor.execute(query)
        solicitacoes = cursor.fetchall()
        send_json_response(handler_instance, 200, solicitacoes)
        
    except mysql.connector.Error as err:
        send_error_response(handler_instance, 500, f"Erro no banco de dados: {err}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()

# ... (Cole isso depois da função handle_reject_edit) ...

def handle_get_pending_edits(handler_instance):
    """
    Lida com [GET] /admin/solicitacoes-edicao
    Busca todas as solicitações de EDIÇÃO com status 'pendente'.
    """
    
    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return

    cursor = conn.cursor(dictionary=True)
    
    # Busca na tabela 'solicitacoes_edicao' e junta com 'filmes' e 'usuarios'
    query = """
        SELECT 
            s.*, 
            f.titulo AS filme_titulo, 
            f.poster_url,
            u.nome AS usuario_nome
        FROM solicitacoes_edicao s
        JOIN filmes f ON s.filme_id = f.id
        JOIN usuarios u ON s.solicitado_por_id = u.id
        WHERE s.status = 'pendente'
        ORDER BY s.data_solicitacao ASC;
    """
    
    try:
        cursor.execute(query)
        solicitacoes = cursor.fetchall()
        send_json_response(handler_instance, 200, solicitacoes)
        
    except mysql.connector.Error as err:
        send_error_response(handler_instance, 500, f"Erro no banco de dados: {err}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()


def handle_admin_edit_filme(handler_instance, filme_id):
    """
    Lida com [PUT] /admin/filmes/<id>
    Rota especial para o Admin editar um filme DIRETAMENTE.
    """
    
    body = parse_json_body(handler_instance)
    if not body:
        send_error_response(handler_instance, 400, "Corpo da requisição inválido.")
        return

    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return
        
    cursor = conn.cursor()
    
    try:
        # Pega os dados do formulário
        # (Nota: Esta é uma edição SIMPLES. Gêneros e Atores ainda
        # são tratados como texto aqui, o que é um débito técnico)
        dados = (
            body.get('titulo'),
            body.get('ano'),
            body.get('duracao'),
            body.get('poster_url'),
            body.get('sinopse'),
            body.get('id_linguagem'),
            filme_id # Para o "WHERE id = %s"
        )

        # Atualiza o filme direto na tabela 'filmes'
        query = """
            UPDATE filmes SET 
                titulo = %s, ano = %s, duracao = %s, 
                poster_url = %s, sinopse = %s, id_linguagem = %s
            WHERE id = %s
        """
        
        cursor.execute(query, dados)
        
        # (Lógica de Gêneros/Atores/Diretores)
        # Primeiro, limpa as ligações antigas
        cursor.execute("DELETE FROM filmes_generos WHERE filme_id = %s", (filme_id,))
        # (Poderíamos limpar atores/diretores também se quiséssemos)

        # Segundo, insere as novas ligações de Gênero
        generos_texto = body.get('generos_texto')
        if generos_texto:
            _processar_e_linkar_dados(cursor, filme_id, 'generos', 'filmes_generos', 'genero_id', generos_texto)

        conn.commit()
        send_json_response(handler_instance, 200, {"mensagem": "Filme atualizado com sucesso pelo Admin."})

    except mysql.connector.Error as err:
        conn.rollback() 
        send_error_response(handler_instance, 500, f"Erro ao atualizar filme: {err}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()