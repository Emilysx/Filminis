import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Cadastro.css';

function Cadastro({ onNavigate }) { 
  const { signUp } = useAuth(); // Pega só a função de registro
  
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState(''); // Campo novo
  
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    // Lógica do "Confirma Senha"
    if (senha !== confirmaSenha) {
      setErro('As senhas não são iguais!');
      return; // Para a execução
    }

    setCarregando(true);
    try {
      // Chama o back-end (só com os campos que ele espera)
      await signUp(email, senha, nome);
      
      alert('Conta criada com sucesso! Faça login para continuar.');
      onNavigate('login'); // Pede ao App.jsx para voltar à tela de login
      
    } catch (error) {
      // Se o back-end der erro (ex: email já existe)
      setErro(error.message || 'Erro ao registrar');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="cadastroContainer">
      <div className="cadastroCard">
        
        <h2 className="cadastroTitulo">Cadastro</h2>
        <p className="cadastroSubtitulo">Faça seu cadastro para continuar</p>

        <form className="cadastroForm" onSubmit={handleSubmit}>
          <div className="formGrid">
            
            <div className="inputGroup">
              <label htmlFor="nome">Nome Completo *</label>
              <input
                id="nome"
                type="text"
                placeholder="Entre com seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

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
                placeholder="Crie uma senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <div className="inputGroup">
              <label htmlFor="confirmaSenha">Confirma a Senha *</label>
              <input
                id="confirmaSenha"
                type="password"
                placeholder="Confirme a senha"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                required
              />
            </div>
            
          </div>

          {erro && <div className="cadastroErro">{erro}</div>}

          <button type="submit" className="cadastroBotao" disabled={carregando}>
            {carregando ? 'Aguarde...' : 'Cadastrar'}
          </button>
            
        </form>

        <button className="cadastroAlternar" onClick={() => onNavigate('login')}>
          Já tem uma conta? <span>Entrar</span>
        </button>

      </div>
    </div>
  );
}

export default Cadastro;