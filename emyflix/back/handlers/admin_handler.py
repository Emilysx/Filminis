# Este é o Controlador do Administrador, ele lida com a LÓGICA de aprovar, rejeitar e deletar conteúdo.

import json
from database.db_utils import get_db_connection
from utils.respostas import send_json_response, send_error_response 
import mysql.connector

# Só colunas nesta lista podem ser editadas, para evitar SQL Injection
EDIT_COLUMNS_WHITELIST = ['titulo', 'ano', 'sinopse', 'poster_url', 'duracao', 'id_linguagem']

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


def handle_approve_edit(handler_instance, solicitacao_id):
    """
    Lida com [PUT] /admin/aprovar-edicao/<id>
    Aprova uma solicitação de EDIÇÃO e aplica a mudança no filme.
    """
    
    conn = get_db_connection()
    if not conn:
        send_error_response(handler_instance, 500, "Erro interno do servidor (DB).")
        return
        
    conn.autocommit = False # Inicia transação
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Busca a solicitação de edição pendente
        cursor.execute("SELECT * FROM solicitacoes_edicao WHERE id = %s AND status = 'pendente'", (solicitacao_id,))
        solicitacao = cursor.fetchone()
        
        if not solicitacao:
            send_error_response(handler_instance, 404, "Solicitação de edição não encontrada ou já processada.")
            return

        # Pega os dados da solicitação
        filme_id = solicitacao['filme_id']
        campo = solicitacao['campo_alterado']
        valor_novo = solicitacao['valor_novo']
        
        # Verificação de segurança
        # Só permite a edição de campos que estão na nossa "lista branca"
        if campo not in EDIT_COLUMNS_WHITELIST:
            raise ValueError(f"A edição do campo '{campo}' não é permitida por razões de segurança.")
        
        # Constrói e executa a query de atualização de forma segura
        # (A f-string é segura aqui, pois 'campo' foi validado pela whitelist)
        query_update = f"UPDATE filmes SET {campo} = %s WHERE id = %s"
        cursor.execute(query_update, (valor_novo, filme_id))
        
        # Atualiza o status da solicitação para 'aprovado'
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