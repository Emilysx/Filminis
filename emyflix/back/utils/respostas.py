# Este arquivo padroniza toda a comunicação (respostas) do nosso servidor com o front-end (React).
import json
import datetime 

def send_response_base(handler_instance, status_code, content_type='text/plain'):
    #Função base para enviar uma resposta HTTP (cabeçalhos).
    handler_instance.send_response(status_code)
    handler_instance.send_header('Content-type', content_type)
    handler_instance.send_header('Access-Control-Allow-Origin', '*') 
    
    # Permite que o React envie métodos (PUT, DELETE) e cabeçalhos (Authorization)
    handler_instance.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    handler_instance.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    handler_instance.end_headers()

def send_error_response(handler_instance, status_code, message):
    send_response_base(handler_instance, status_code, 'application/json')
    error_payload = {"erro": message}
    
    try:
        handler_instance.wfile.write(json.dumps(error_payload).encode('utf-8'))
    except ConnectionAbortedError:
        pass


def parse_json_body(handler_instance):
    # Lê o "corpo" (body) de uma requisição (ex: dados de login) e converte o JSON para um dicionário Python.
    try:
        content_length = int(handler_instance.headers['Content-Length'])
        if content_length == 0:
            return None
        body = handler_instance.rfile.read(content_length)
        return json.loads(body.decode('utf-8'))
    except (json.JSONDecodeError, TypeError, KeyError):
        # Se o corpo não for um JSON válido ou estiver vazio
        return None

class CustomJSONEncoder(json.JSONEncoder):
    # Para ensinar o JSON a lidar com datas do banco, convertendo-as para texto.
    def default(self, obj):
        if isinstance(obj, (datetime.datetime, datetime.date)):
            return obj.isoformat()
        return super().default(obj)

def send_json_response(handler_instance, status_code, payload):
    send_response_base(handler_instance, status_code, 'application/json')
    
    try:
        json_bytes = json.dumps(payload, cls=CustomJSONEncoder).encode('utf-8')
        handler_instance.wfile.write(json_bytes)
    except ConnectionAbortedError:
        # Navegador cancelou a conexão antes da resposta
        pass
