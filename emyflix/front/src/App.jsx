import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Intro from './components/Intro/Intro';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Home from './pages/Home/Home';
import DetalheFilme from './pages/DetalheFilme/DetalheFilme';
import CadastroFilmes from './pages/CadastroFilmes/CadastroFilmes'; 
import PainelAdmin from './pages/PainelAdmin/PainelAdmin';
import DetalheAprovacao from './pages/DetalheAprovacao/DetalheAprovacao';


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
      setRota('home'); // Se já tem usuário, vai pra Home
    } else {
      setRota('login'); // Se não, vai pro Login
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    if (rota === 'intro') {
      return <Intro onComplete={handleIntroComplete} />;
    }
    if (rota === 'cadastro') {
      return <Cadastro onNavigate={navegar} />;
    }
    // Rota Padrão (Login)
    return <Login onNavigate={navegar} />;
  }


  // Rota de Detalhe do Filme
  if (rota === 'filme' && params.id) {
    return <DetalheFilme filmeId={params.id} onNavegar={navegar} />;
  }

  // Rota de Adicionar Filme
  if (rota === 'adicionar') {
    return <CadastroFilmes onNavegar={navegar} />;
  }
  
  // Rota de Edição (que adiamos, mas já podemos deixar)
  if (rota === 'editar' && params.id) {
    return <CadastroFilmes filmeId={params.id} onNavegar={navegar} />;
  }

  // Rota do Painel Admin (só para admins)
  if (rota === 'admin' && user.role === 'adm') {
    return <PainelAdmin onNavegar={navegar} />;
  }
  
  if (rota === 'detalhe-aprovacao' && params.id && user.role === 'adm') {
    return <DetalheAprovacao solicitacaoId={params.id} onNavegar={navegar} />;
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