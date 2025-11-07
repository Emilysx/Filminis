import { useState } from 'react';
import { Search, User, LogOut, Plus, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';


function Navbar({ onBuscar, onNavegar }) { 
  const { perfil, signOut } = useAuth();
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
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbarContainer">
        <div className="navbarLogo" onClick={() => onNavegar?.('home')}>
          <img src="/logo.png" alt="Logo" className="navbarLogoImg" />
          <span className="navbarTitulo">EmyFlix</span>
        </div>

        <div className="navbarAcoes">
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

          <button
            type="button"
            className="navbarBotaoIcone"
            onClick={() => onNavegar?.('adicionar')}
            title="Adicionar filme"
          >
            <Plus size={22} />
          </button>

          <div className="navbarUsuario">
            <button
              type="button"
              className="navbarBotaoUsuario"
              onClick={() => setMenuAberto(!menuAberto)}
            >
              <User size={22} />
            </button>

            {menuAberto && (
              <div className="navbarMenu">
                <div className="navbarMenuHeader">
                  <p className="navbarMenuNome">{perfil?.nome}</p>
                  {perfil?.is_admin && (
                    <span className="navbarMenuAdmin">Admin</span>
                  )}
                </div>

                {perfil?.is_admin && (
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