import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'; // (Verifique se instalou: npm install jwt-decode)

// A URL do seu back-end em Python
const API_URL = 'http://localhost:8000';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // O usuário (ex: {nome: "Emily", role: "adm"})
  const [token, setToken] = useState(() => localStorage.getItem('token')); // O "crachá"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Roda quando o app carrega
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        
        // Checa se o "crachá" expirou
        if (decodedUser.exp * 1000 < Date.now()) {
          throw new Error("Token expirado");
        }
        setUser(decodedUser); // Define o usuário
      } catch (e) {
        // Se o "crachá" for inválido, limpa tudo
        console.error('Token inválido ou expirado:', e);
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
    }
    setLoading(false); // Termina de carregar
  }, [token]);

  // Função de Login (para o back-end Python)
  const signIn = async (email, senha) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao fazer login');
    }

    // Sucesso! Salva o "crachá"
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(jwtDecode(data.token)); // Decodifica e salva o usuário
  };

  // Função de Registro (para o back-end Python)
  const signUp = async (email, password, nome) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // (Corrigido para 'senha', como fizemos antes)
      body: JSON.stringify({ email: email, senha: password, nome: nome, role: 'comum' }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao registrar');
    }
    return data;
  };

  // Função de Logout
  const signOut = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut }}>
      {/* Só mostra o app quando o 'loading' terminar */}
      {!loading && children} 
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}