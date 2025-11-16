import { useState } from 'react';
import { Search, User, LogOut, Plus, Settings, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';
import logoEmyflix from '../../assets/logo.png';
function Navbar({ onBuscar, onNavegar }) {
  const { user, signOut } = useAuth();

  const [termoBusca, setTermoBusca] = useState('');
  const [menuAberto, setMenuAberto] = useState(false);


  const handleBuscar = (e) => {
    e.preventDefault();
    if (termoBusca.trim()) {
      // Usa a chave 'busca' (que o App.jsx e ListarFilmes.jsx esperam)
      onNavegar('listar-filmes', { busca: termoBusca });
      setTermoBusca(''); // Limpa a barra
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onNavegar('login'); // Força a ida ao login ao sair
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbarContainer">

        {/* Logo */}
        <div className="navbarLado esquerdo">
          <div className="navbarLogo" onClick={() => onNavegar('home')}>
            <img src={logoEmyflix} alt="Logo" className="navbarLogoImg" />
            <span className="navbarTitulo">EmyFlix</span>
          </div>
        </div>

        {/* Busca */}
        <div className="navbarLado centro">
          <form className="navbarBusca" onSubmit={handleBuscar}>
            <input
              type="text"
              placeholder="Buscar filmes, gêneros..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="navbarBuscaInput"
            />
            <button type="submit" className="navbarBuscaBotao">
              <Search size={20} />
            </button>
          </form>
        </div>


        <div className="navbarLado direito">
          {/* Botão Home (Ícone) */}
          <button
            type="button"
            className="navbarBotaoIcone"
            onClick={() => onNavegar('home')}
            title="Início"
          >
            <Home size={22} />
          </button>

          {/* Botão Listar Filmes (Texto) */}
          <button
            type="button"
            className="navbarBotaoTexto"
            onClick={() => onNavegar('listar-filmes')}
          >
            Listar Filmes
          </button>

          {/* Botão Adicionar Filme (Texto) */}
          {user.role !== 'adm' && (
            <button
              type="button"
              className="navbarBotaoTexto"
              onClick={() => onNavegar('adicionar')}
            >
              Adicionar Filme
            </button>
          )}

          {/* --- Menu do Usuário (Ícone) --- */}
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
                  <div className="navbarMenuAvatar">
                    <User size={20} />
                  </div>
                  <div className="navbarMenuInfo">
                    <p className="navbarMenuNome">{user?.nome}</p>
                    {user?.role && (
                      <span className={user.role === 'adm' ? 'navbarMenuAdmin' : 'navbarMenuRole'}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    )}

                  </div>
                </div>

                {/* Link do Painel Admin (só para admins) */}
                {user?.role === 'adm' && (
                  <button
                    type="button"
                    className="navbarMenuItem"
                    onClick={() => {
                      onNavegar('admin');
                      setMenuAberto(false);
                    }}
                  >
                    <Settings size={18} />
                    <span>Painel Admin</span>
                  </button>
                )}

                {/* Botão de Sair (agora fica embaixo do nome) */}
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