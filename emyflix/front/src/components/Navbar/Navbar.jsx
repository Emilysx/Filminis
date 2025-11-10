import { useState } from 'react';
import { Search, User, LogOut, Plus, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';
import logoEmyflix2 from '../../assets/logo2.png';

function Navbar({ onBuscar, onNavegar }) { 
  // Pega os dados do usuário e a função signOut
  const { user, signOut } = useAuth();
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [menuAberto, setMenuAberto] = useState(false);

  const handleBuscar = (e) => {
    e.preventDefault();
    if (onBuscar && termoBusca.trim()) {
      onBuscar(termoBusca);
      setBuscaAberta(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // O App.jsx vai detectar a mudança e nos levará para o Login.
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbarContainer">
        <div className="navbarLogo" onClick={() => onNavegar?.('home')}>
          <img src={logoEmyflix2} alt="Logo" className="navbarLogoImg" />
          <span className="navbarTitulo">EmyFlix</span>
        </div>

        <div className="navbarAcoes">
          {/* --- Formulário de Busca --- */}
          <form onSubmit={handleBuscar} className={`navbarBusca ${buscaAberta ? 'aberta' : ''}`}>
            <button
              type="button"
              className="navbarBotaoIcone"
              onClick={() => setBuscaAberta(!buscaAberta)}
            >
              <Search size={22} />
            </button>
            {buscaAberta && (
              <input
                type="text"
                placeholder="Buscar filmes..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="navbarBuscaInput"
                autoFocus
              />
            )}
          </form>

          {/* --- Botão de Adicionar Filme --- */}
          <button
            type="button"
            className="navbarBotaoIcone"
            onClick={() => onNavegar?.('adicionar')}
            title="Adicionar filme"
          >
            <Plus size={22} />
          </button>

          {/* --- Menu do Usuário --- */}
          <div className="navbarUsuario">
            <button
              type="button"
              className="navbarBotaoUsuario"
              onClick={() => setMenuAberto(!menuAberto)}
            >
              <User size={22} />
            </button>

            {/* O Menu Dropdown */}
            {menuAberto && (
              <div className="navbarMenu">
                <div className="navbarMenuHeader">
                  <p className="navbarMenuNome">{user?.nome}</p>
                  {user?.role === 'adm' && (
                    <span className="navbarMenuAdmin">Admin</span>
                  )}
                </div>

                {/* Só mostra o link do Painel Admin se for 'adm' */}
                {user?.role === 'adm' && (
                  <button
                    type="button"
                    className="navbarMenuItem"
                    onClick={() => {
                      onNavegar?.('admin');
                      setMenuAberto(false);
                    }}
                  >
                    <Settings size={18} />
                    <span>Painel Admin</span>
                  </button>
                )}

                {/* Botão de Sair */}
                <button
                  type="button"
                  className="navbarMenuItem"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;