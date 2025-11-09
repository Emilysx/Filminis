import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'; // Vamos ter que instalar isso

// 1. Definimos a URL do nosso back-end em Python
const API_URL = 'http://localhost:8000';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // O usuário (ex: {nome: "Emily", role: "adm"})
  const [token, setToken] = useState(() => localStorage.getItem('token')); // O "crachá"
  const [loading, setLoading] = useState(true); // Começa carregando

  useEffect(() => {
    // Esta função roda toda vez que o app carrega
    // Ela verifica se já existe um "crachá" salvo no navegador
    if (token) {
      try {
        // Decodifica o "crachá" para pegar os dados do usuário
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
      } catch (e) {
        // Se o "crachá" for inválido ou expirado, limpa tudo
        console.error('Token inválido ou expirado:', e);
        setToken(null);
        localStorage.removeItem('token');
      }
    }
    setLoading(false); // Termina de carregar
  }, [token]); // Roda de novo se o token mudar

  // Função de Login (ATUALIZADA)
  const signIn = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao fazer login');
    }

    // Sucesso! Salva o "crachá" no localStorage e no estado
    localStorage.setItem('token', data.token);
    setToken(data.token);
  };

  // Função de Registro (ATUALIZADA)
  const signUp = async (email, password, nome) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nome, role: 'comum' }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao registrar');
    }
    // Não faz login automático, só avisa que deu certo
    return data;
  };

  // Função de Logout (ATUALIZADA)
  const signOut = async () => {
    // Simplesmente apaga o "crachá"
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // Exporta as funções e variáveis para o resto do app
  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut }}>
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