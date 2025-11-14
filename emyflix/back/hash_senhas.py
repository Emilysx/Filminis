import bcrypt

# Senha para o usuário 'user'
senha_user = "123"
salt_user = bcrypt.gensalt()
hash_user = bcrypt.hashpw(senha_user.encode('utf-8'), salt_user)

# Senha para o usuário 'adm'
senha_adm = "12345"
salt_adm = bcrypt.gensalt()
hash_adm = bcrypt.hashpw(senha_adm.encode('utf-8'), salt_adm)

print("\n--- Hashes Gerados ---")
print(f"Para o 'user@gmail.com' (senha 123), use este hash:")
print(f"'{hash_user.decode('utf-8')}'")

print(f"\nPara o 'adm@gmail.com' (senha 12345), use este hash:")
print(f"'{hash_adm.decode('utf-8')}'")