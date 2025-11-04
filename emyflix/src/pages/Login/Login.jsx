import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

// interface LoginProps REMOVIDA

function Login({ onLoginSuccess }) { // Argumentos sem tipo
  const { signIn, signUp } = useAuth();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Tipo :React.FormEvent REMOVIDO do parâmetro 'e'
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      if (modoRegistro) {
        if (!nome.trim()) {
          throw new Error('Por favor, insira seu nome');
        }
        await signUp(email, senha, nome);
        alert('Conta criada com sucesso! Faça login para continuar.');
        setModoRegistro(false);
        setNome('');
      } else {
        await signIn(email, senha);
        onLoginSuccess();
      }
    // Tipo :any REMOVIDO do 'error'
    } catch (error) {
      setErro(error.message || 'Erro ao processar solicitação');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="loginContainer">
      {/* ... (Todo o seu JSX restante) ... */}
    </div>
  );
}

export default Login;