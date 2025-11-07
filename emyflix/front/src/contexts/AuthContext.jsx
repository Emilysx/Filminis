import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// A interface AuthContextType é removida
// A importação de User, Perfil e ReactNode é removida

const AuthContext = createContext(undefined); // Remove <AuthContextType | undefined>

export function AuthProvider({ children }) { // Remove a tipagem de 'children'
  const [user, setUser] = useState(null); // Remove <User | null>
  const [perfil, setPerfil] = useState(null); // Remove <Perfil | null>
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        carregarPerfil(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await carregarPerfil(session.user.id);
        } else {
          setPerfil(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const carregarPerfil = async (userId) => { // Remove 'userId: string'
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setPerfil(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => { // Remove 'email: string, password: string'
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (email, password, nome) => { // Remove 'email: string, password: string, nome: string'
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { error: perfilError } = await supabase
        .from('perfis')
        .insert([{ id: data.user.id, nome, is_admin: false }]);

      if (perfilError) throw perfilError;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, perfil, loading, signIn, signUp, signOut }}>
      {children}
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