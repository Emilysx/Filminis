# Este é o arquivo é o que liga o back-end.
from http.server import HTTPServer, BaseHTTPRequestHandler
import re
from handlers import auth_handler
from handlers import filmes_handler
from handlers import admin_handler   
from utils.auth_seguranca import verify_token
from utils.respostas import send_json_response, send_error_response

class SimpleAPIHandler(BaseHTTPRequestHandler):
    
    # CORS 
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    # TOKEN / AUTENTICAÇÃO 
    def _get_user_data_from_token(self):
        auth_header = self.headers.get('Authorization')
        if not auth_header:
            return None
        try:
            token_type, token = auth_header.split(' ')
            if token_type.lower() != 'bearer':
                return None
            return verify_token(token)
        except:
            return None

    # GET 
    def do_GET(self):

        # /filmes/buscar?... (filtros)
        if self.path.startswith('/filmes/buscar'):
            filmes_handler.handle_search_filmes(self)
            return
        
        # /filmes/<id>
        match_filme_id = re.match(r'/filmes/(\d+)', self.path)
        if match_filme_id:
            filme_id = int(match_filme_id.group(1))
            filmes_handler.handle_get_filme_by_id(self, filme_id)
            return

        # /filmes (listar todos)
        if self.path == '/filmes':
            filmes_handler.handle_get_all_filmes(self)
            return
        
        # /admin/solicitacoes (adição)
        if self.path == '/admin/solicitacoes':
            user_data = self._get_user_data_from_token()
            if user_data and user_data['role'] == 'adm':
                admin_handler.handle_get_pending_filmes(self)
            else:
                send_error_response(self, 403, "Acesso negado.")
            return
        
        # /admin/solicitacao/<id>
        match_solicitacao = re.match(r'/admin/solicitacao/(\d+)', self.path)
        if match_solicitacao:
            solicitacao_id = int(match_solicitacao.group(1))
            user_data = self._get_user_data_from_token()

            if user_data and user_data['role'] == 'adm':
                admin_handler.handle_get_solicitacao_by_id(self, solicitacao_id)
            else:
                send_error_response(self, 403, "Acesso negado.")
            return
        
        # /admin/solicitacoes-edicao
        if self.path == '/admin/solicitacoes-edicao':
            user_data = self._get_user_data_from_token()
            if user_data and user_data['role'] == 'adm':
                admin_handler.handle_get_pending_edits(self)
            else:
                send_error_response(self, 403, "Acesso negado.")
            return
        
        # /generos
        if self.path == '/generos':
            filmes_handler.handle_get_all_generos(self)
            return
        
        send_error_response(self, 404, "Rota não encontrada.")

    # POST 
    def do_POST(self):

        if self.path == '/login':
            auth_handler.handle_login(self)
            return

        if self.path == '/register':
            auth_handler.handle_register(self)
            return

        if self.path == '/filmes':
            user_data = self._get_user_data_from_token()
            if not user_data:
                send_error_response(self, 401, "Token inválido.")
                return
            filmes_handler.handle_create_filme(self, user_data)
            return
        
        send_error_response(self, 404, "Rota não encontrada.")

    # PUT 
    def do_PUT(self):

        user_data = self._get_user_data_from_token()

        match_reject_add = re.match(r'/admin/rejeitar/(\d+)', self.path)
        match_admin_edit = re.match(r'/admin/filmes/(\d+)', self.path)
        match_approve_add = re.match(r'/admin/aprovar/(\d+)', self.path)
        match_approve_edit = re.match(r'/admin/aprovar-edicao/(\d+)', self.path)
        match_reject_edit = re.match(r'/admin/rejeitar-edicao/(\d+)', self.path)
        match_edit_filme = re.match(r'/filmes/(\d+)', self.path)

        # Rejeitar ADIÇÃO
        if match_reject_add:
            solicitacao_id = int(match_reject_add.group(1))
            if user_data and user_data['role'] == 'adm':
                admin_handler.handle_reject_submission(self, solicitacao_id)
            else:
                send_error_response(self, 403, "Acesso negado.")
            return
        
        # Aprovar ADIÇÃO
        if match_approve_add:
            solicitacao_id = int(match_approve_add.group(1))
            if user_data and user_data['role'] == 'adm':
                admin_handler.handle_approve_filme(self, solicitacao_id)
            else:
                send_error_response(self, 403, "Acesso negado.")
            return

        # Aprovar EDIÇÃO
        if match_approve_edit:
            solicitacao_id = int(match_approve_edit.group(1))
            if user_data and user_data['role'] == 'adm':
                admin_handler.handle_approve_edit(self, solicitacao_id)
            else:
                send_error_response(self, 403, "Acesso negado.")
            return
        
        # Rejeitar EDIÇÃO
        if match_reject_edit:
            solicitacao_id = int(match_reject_edit.group(1))
            if user_data and user_data['role'] == 'adm':
                admin_handler.handle_reject_edit(self, solicitacao_id)
            else:
                send_error_response(self, 403, "Acesso negado.")
            return

        # Edição direta do ADM
        if match_admin_edit:
            filme_id = int(match_admin_edit.group(1))
            if user_data and user_data['role'] == 'adm':
                admin_handler.handle_admin_edit_filme(self, filme_id)
            else:
                send_error_response(self, 403, "Acesso negado.")
            return

        # Solicitar edição de filme
        if match_edit_filme:
            filme_id = int(match_edit_filme.group(1))
            if not user_data:
                send_error_response(self, 401, "Token inválido.")
                return
            filmes_handler.handle_edit_filme(self, filme_id, user_data)
            return
        
        send_error_response(self, 404, "Rota não encontrada.")

    # DELETE 
    def do_DELETE(self):
        match = re.match(r'/filmes/(\d+)', self.path)
        if match:
            filme_id = int(match.group(1))
            user_data = self._get_user_data_from_token()

            if user_data and user_data['role'] == 'adm':
                admin_handler.handle_delete_filme(self, filme_id)
            else:
                send_error_response(self, 403, "Acesso negado.")
            return

        send_error_response(self, 404, "Rota não encontrada.")

# RUN SERVER
def run(server_class=HTTPServer, handler_class=SimpleAPIHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"🎀  - Iniciando API em http://localhost:{port}/ ...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor interrompido. Desligando...")
        httpd.server_close()

if __name__ == '__main__':
    run()