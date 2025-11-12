import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Intro from './components/Intro/Intro';
import Home from './pages/Home/Home';
import Footer from './components/Footer/Footer';

// 1. IMPORTE A NOVA PÁGINA
import DetalheFilme from './pages/DetalheFilme/DetalheFilme';

// (Vamos importar o resto depois)
// import FormularioFilme from './pages/FormularioFilme/FormularioFilme';
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
  
  // 2. ATIVE A ROTA DO FILME
  if (rota === 'filme' && params.id) {
    return <DetalheFilme filmeId={params.id} onNavegar={navegar} />;
  }

  // (Vamos descomentar isso nos próximos passos)
  // if (rota === 'adicionar') {
  //   return <FormularioFilme onNavegar={navegar} />;
  // }
  // if (rota === 'editar' && params.id) {
  //   return <FormularioFilme filmeId={params.id} onNavegar={navegar} />;
  // }
  // if (rota === 'admin') {
  //   return <PainelAdmin onNavegar={navegar} />;
  // }

  // A rota padrão para um usuário logado é a 'home'
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