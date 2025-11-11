# Este arquivo é o "cofre" do nosso site. Ele lida com criptografia de senhas e "crachás" de acesso (Tokens JWT).

import bcrypt
import jwt 
import datetime

JWT_SECRET = "banana-de-pijamas"

def hash_password(password):
    # Recebe uma senha (ex: "123456") e retorna ela criptografada (ex: "$2b$...")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed

def check_password(password, hashed):
    # Recebe a senha que o usuário digitou (ex: "123456") e a senha criptografada do banco (ex: "$2b$..."). Retorna True ou False.
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id, user_role, user_nome): # <-- 1. Adiciona user_nome aqui
    #Cria um "crachá" (Token JWT) para o usuário. O crachá contém o ID, o "papel" e o NOME do usuário.
    payload = {
        'user_id': user_id,
        'role': user_role,
        'nome': user_nome,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return token

def verify_token(token):
    # Tenta decodificar um "crachá". Se for válido, retorna os dados (payload).Se estiver vencido ou for inválido, retorna None.
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        print("Token expirado")
        return None
    except jwt.InvalidTokenError:
        print("Token inválido")
        return None