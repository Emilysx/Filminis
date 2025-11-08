# Este é o arquivo é o que liga o back-end.

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import re

# Importa os nossos "Gerentes" (Handlers/Controladores)
from handlers import auth_handler
from handlers import filmes_handler
from handlers import admin_handler   

# Importa as "Ferramentas" (Utils/Auxiliares)
from utils.auth_seguranca import verify_token
from utils.respostas import send_json_response, send_error_response

class SimpleAPIHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        # Envia os headers CORS necessários para o React/Vite.
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization') 

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def _get_user_data_from_token(self):
        # Verifica o header 'Authorization' (o "crachá") e decodifica. Usa a nossa ferramenta de segurança.
        auth_header = self.headers.get('Authorization')
        if not auth_header:
            return None
        try:
            # Espera "Bearer <token>"
            token_type, token = auth_header.split(' ')
            if token_type.lower() != 'bearer':
                return None
            
            # CHAMA A FERRAMENTA do auth_seguranca.py
            return verify_token(token)
        except Exception as e:
            print(f"Erro ao validar token: {e}")
            return None

    # Roteador GET
    def do_GET(self):
        
        # Rota: /filmes/buscar?...
        if self.path.startswith('/filmes/buscar'):
            # CHAMA O GERENTE: filmes_handler
            filmes_handler.handle_search_filmes(self) 
            
        # Rota: /filmes/1 (ou qualquer número)
        elif re.match(r'/filmes/(\d+)', self.path):
            try:
                filme_id = int(re.match(r'/filmes/(\d+)', self.path).group(1))
                # CHAMA O GERENTE: filmes_handler
                filmes_handler.handle_get_filme_by_id(self, filme_id) 
            except ValueError:
                send_error_response(self, 400, "ID do filme inválido.")

        # Rota: /filmes (Listar todos)
        elif self.path == '/filmes':
            # CHAMA O GERENTE: filmes_handler
            filmes_handler.handle_get_all_filmes(self) 
            
        # Rota: /admin/solicitacoes (Rota de Admin)
        elif self.path == '/admin/solicitacoes':
            user_data = self._get_user_data_from_token() # Pega o "crachá"
            # Verifica se o crachá existe e se o "papel" é 'adm'
            if user_data and user_data['role'] == 'adm':
                # CHAMA O GERENTE: admin_handler
                admin_handler.handle_get_pending_filmes(self) 
            else:
                send_error_response(self, 403, "Acesso negado. Rota exclusiva para administradores.")
        
        else:
            send_error_response(self, 404, "Rota não encontrada.")

    # Roteador POST
    def do_POST(self):
        if self.path == '/login':
            # CHAMA O GERENTE: auth_handler
            auth_handler.handle_login(self)

        elif self.path == '/register':
            # CHAMA O GERENTE: auth_handler
            auth_handler.handle_register(self)
        
        # Rota: /filmes (Adicionar filme)
        elif self.path == '/filmes':
            user_data = self._get_user_data_from_token() # Pega o "crachá"
            if user_data: # Só precisa estar logado (qualquer usuário)
                # CHAMA O GERENTE: filmes_handler
                filmes_handler.handle_create_filme(self, user_data) 
            else:
                send_error_response(self, 401, "Não autorizado. Token inválido ou ausente.")
        
        else:
            send_error_response(self, 404, "Rota não encontrada.")
            
    # Roteador PUT (para aprovações e edições)
    def do_PUT(self):
        # Tenta "casar" com as várias rotas de admin
        match_approve_add = re.match(r'/admin/aprovar/(\d+)', self.path)
        match_approve_edit = re.match(r'/admin/aprovar-edicao/(\d+)', self.path) 
        match_reject_edit = re.match(r'/admin/rejeitar-edicao/(\d+)', self.path) 
        match_edit_filme = re.match(r'/filmes/(\d+)', self.path) # Submeter edição

        user_data = self._get_user_data_from_token() # Pega o "crachá"

        # Rota: [PUT] /admin/aprovar/<id> (Aprovar ADIÇÃO)
        if match_approve_add:
            solicitacao_id = int(match_approve_add.group(1)) 
            if user_data and user_data['role'] == 'adm': # Precisa ser ADM
                admin_handler.handle_approve_filme(self, solicitacao_id) 
            else:
                send_error_response(self, 403, "Acesso negado. Rota exclusiva para administradores.")
            return

        # Rota: [PUT] /admin/aprovar-edicao/<id> (Aprovar EDIÇÃO)
        elif match_approve_edit:
            solicitacao_id = int(match_approve_edit.group(1))
            if user_data and user_data['role'] == 'adm': # Precisa ser ADM
                admin_handler.handle_approve_edit(self, solicitacao_id) 
            else:
                send_error_response(self, 403, "Acesso negado. Rota exclusiva para administradores.")
            return
            
        # Rota: [PUT] /admin/rejeitar-edicao/<id> (Rejeitar EDIÇÃO)
        elif match_reject_edit:
            solicitacao_id = int(match_reject_edit.group(1))
            if user_data and user_data['role'] == 'adm': # Precisa ser ADM
                admin_handler.handle_reject_edit(self, solicitacao_id) 
            else:
                send_error_response(self, 403, "Acesso negado. Rota exclusiva para administradores.")
            return

        # Rota: [PUT] /filmes/<id> (Submeter Edição de filme)
        elif match_edit_filme:
            filme_id = int(match_edit_filme.group(1))
            if user_data: # Só precisa estar logado
                filmes_handler.handle_edit_filme(self, filme_id, user_data) 
            else:
                send_error_response(self, 401, "Não autorizado. Token inválido ou ausente.")
            return
            
        else:
            send_error_response(self, 404, "Rota não encontrada.")
    
    # Roteador DELETE
    def do_DELETE(self):
        match = re.match(r'/filmes/(\d+)', self.path)
        if match:
            user_data = self._get_user_data_from_token()
            if user_data and user_data['role'] == 'adm': # Precisa ser ADM
                try:
                    filme_id = int(match.group(1))
                    admin_handler.handle_delete_filme(self, filme_id) 
                except ValueError:
                    send_error_response(self, 400, "ID do filme inválido.")
            else:
                send_error_response(self, 403, "Acesso negado. Rota exclusiva para administradores.")
            return

        else:
            send_error_response(self, 404, "Rota não encontrada.")
            
# Função para Iniciar o Servido
def run(server_class=HTTPServer, handler_class=SimpleAPIHandler, port=8000):
    """ Configura e inicia o servidor HTTP. """
    server_address = ('', port) 
    httpd = server_class(server_address, handler_class)
    print(f"🎀 - Iniciando API pura Python em http://localhost:{port}/ ...")
    try:
        httpd.serve_forever() # Deixa o servidor rodando
    except KeyboardInterrupt:
        print("\nServidor interrompido. Desligando...")
        httpd.server_close()

if __name__ == '__main__':
    run()