import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Intro from './components/Intro/Intro';
import Footer from './components/Footer/Footer';

import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Home from './pages/Home/Home';
import DetalheFilme from './pages/DetalheFilme/DetalheFilme';
import CadastroFilmes from './pages/CadastroFilmes/CadastroFilmes';
import PainelAdmin from './pages/PainelAdmin/PainelAdmin';
import DetalheAprovacao from './pages/DetalheAprovacao/DetalheAprovacao';
import DetalheEdicao from './pages/DetalheEdicao/DetalheEdicao';
import ListarFilmes from './pages/ListarFilmes/ListarFilmes';

// --- Componente de Tela de Carregamento (LIMPO, sem CSS) ---
// (Os estilos CSS estão no index.css)
function LoadingScreen() {
  return (
    <div className="loadingScreen">
      <div className="loadingScreenContent">
        <div className="loadingSpinner" />
        <p className="loadingText">
          Carregando EmyFlix...
        </p>
      </div>
    </div>
  );
}

/**
 * Roteador principal
 */
function AppContent() {
  const { user, loading } = useAuth();
  const [rota, setRota] = useState('intro'); 
  const [params, setParams] = useState({});

  const navegar = (novaRota, novosParams = {}) => {
    setRota(novaRota);
    setParams(novosParams);
    window.scrollTo(0, 0); 
  };

  const handleIntroComplete = () => {
    if (user) {
      setRota('home');
    } else {
      setRota('login');
    }
  };

  // 1. Se o AuthContext (novo) ainda estiver "Carregando"
  if (loading) {
    return <LoadingScreen />;
  }
  
  // 2. Se NÃO tiver 'user' (não-logado)
  if (!user) {
    if (rota === 'intro') {
      return <Intro onComplete={handleIntroComplete} />;
    }
    if (rota === 'cadastro') {
      return <Cadastro onNavigate={navegar} />;
    }
    return <Login onNavigate={navegar} />;
  }

  // 3. Se 'user' EXISTE (logado)
  
  if (rota === 'filme' && params.id) {
    return <DetalheFilme filmeId={params.id} onNavegar={navegar} />;
  }
  if (rota === 'adicionar') {
    return <CadastroFilmes onNavegar={navegar} />;
  }
  if (rota === 'editar' && params.filmeId) { // Mudado para 'filmeId'
    return <CadastroFilmes filmeId={params.filmeId} onNavegar={navegar} />;
  }
  if (rota === 'admin' && user.role === 'adm') {
    return <PainelAdmin onNavegar={navegar} />;
  }
  if (rota === 'detalhe-aprovacao' && params.id && user.role === 'adm') {
    return <DetalheAprovacao solicitacaoId={params.id} onNavegar={navegar} />;
  }

  // --- AQUI ESTÁ A CORREÇÃO DO BUG ---
  // O PainelAdmin envia 'params.solicitacao', então checamos por 'solicitacao'
  if (rota === 'detalhe-edicao' && params.solicitacao && user.role === 'adm') {
    return <DetalheEdicao solicitacao={params.solicitacao} onNavegar={navegar} />;
  }

  // Rota de Listar Filmes (Filtros)
 if (rota === 'listar-filmes') {
    // Passa os 'params' para que a busca da Navbar funcione
    return <ListarFilmes onNavegar={navegar} params={params} />;
  }

  // Rota Padrão (Home)
  return <Home onNavegar={navegar} />;
}


function App() {
  return (
    <>
      <AppContent />
    </>
  );
}

export default App;