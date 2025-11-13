import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Intro from './components/Intro/Intro';
import Home from './pages/Home/Home';
import Footer from './components/Footer/Footer';
import DetalheFilme from './pages/DetalheFilme/DetalheFilme';

// 1. IMPORTA O NOVO NOME (com o caminho novo)
import CadastroFilmes from './pages/CadastroFilmes/CadastroFilmes';

// (PainelAdmin vem depois)
// import PainelAdmin from './pages/PainelAdmin/PainelAdmin';

// ... (Componente LoadingScreen fica aqui, sem mudanças) ...
function LoadingScreen() { /* ...código... */ }

function AppContent() {
  const { user, loading } = useAuth();
  const [rota, setRota] = useState('intro');
  const [params, setParams] = useState({});

  const navegar = (novaRota, novosParams = {}) => {
    setRota(novaRota);
    setParams(novosParams);
  };

  const handleIntroComplete = () => {
    if (user) {
      setRota('home');
    } else {
      setRota('login');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }
  
  // --- FLUXO DE NÃO-LOGADO ---
  if (!user) {
    if (rota === 'intro') {
      return <Intro onComplete={handleIntroComplete} />;
    }
    if (rota === 'cadastro') {
      return <Cadastro onNavigate={navegar} />;
    }
    return <Login onNavigate={navegar} />;
  }

  // --- FLUXO DE LOGADO ---
  
  if (rota === 'filme' && params.id) {
    return <DetalheFilme filmeId={params.id} onNavegar={navegar} />;
  }

  // 2. USA O NOVO COMPONENTE
  if (rota === 'adicionar') {
    return <CadastroFilmes onNavegar={navegar} />;
  }

  // (Vamos descomentar isso nos próximos passos)
  // if (rota === 'editar' && params.id) {
  //   return <CadastroFilmes filmeId={params.id} onNavegar={navegar} />;
  // }
  // if (rota === 'admin') {
  //   return <PainelAdmin onNavegar={navegar} />;
  // }

  // A rota padrão é a 'home'
  return <Home onNavegar={navegar} />;
}

function App() {
  return (
    <>
      <AppContent />
    </>
  );
}

// CSS da animação (pode manter)
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = "@keyframes spin { to { transform: rotate(360deg); } }";
document.head.appendChild(styleSheet);


export default App;