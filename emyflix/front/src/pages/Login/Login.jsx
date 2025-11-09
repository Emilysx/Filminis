import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css'; // O CSS do "Up" que já fizemos

// Importa os ícones da sua pasta assets
import googleIcon from '../../assets/google.png';
import facebookIcon from '../../assets/facebook.png';

function Login({ onNavigate }) { 
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // Tenta fazer o login
      await signIn(email, senha);
      // Se der certo, o App.jsx vai perceber a mudança no 'user'
      // e vai nos levar para a Home.
    } catch (error) {
      setErro(error.message || 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="loginContainer">
      <div className="loginCard">
        
        <h2 className="loginTitulo">Seja bem-vindo(a) de volta</h2>
        <p className="loginSubtitulo">Faça seu login para continuar</p>

        <form className="loginForm" onSubmit={handleSubmit}>
          
          <div className="inputGroup">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              placeholder="Entre com seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="inputGroup">
            <label htmlFor="senha">Senha *</label>
            <input
              id="senha"
              type="password"
              placeholder="Entre com sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <div className="loginOpcoes">
            <a href="#" className="loginLinkEsqueceu">Esqueceu sua senha?</a>
          </div>

          {erro && <div className="loginErro">{erro}</div>}

          <button type="submit" className="loginBotao" disabled={carregando}>
            {carregando ? 'Aguarde...' : 'Entrar'}
          </button>
        </form>

        <div className="loginDivisor">ou continue com</div>
        <div className="loginBotoesSociais">
          <button type="button" className="loginBotaoSocial">
            <img src={googleIcon} alt="Google" />
            <span>Google</span>
          </button>
          <button type="button" className="loginBotaoSocial">
            <img src={facebookIcon} alt="Facebook" />
            <span>Facebook</span>
          </button>
        </div>

        {/* Botão para NAVEGAR para a tela de cadastro */}
        <button className="loginAlternar" onClick={() => onNavigate('cadastro')}>
          Não tem uma conta? <span>Cadastre-se</span>
        </button>

      </div>
    </div>
  );
}

export default Login;