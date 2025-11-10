import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Intro from './components/Intro/Intro';
import Home from './pages/Home/Home';

// import DetalheFilme from './pages/DetalheFilme/DetalheFilme';
// import FormularioFilme from './pages/FormularioFilme/FormularioFilme';
// import PainelAdmin from './pages/PainelAdmin/PainelAdmin';

// Componente "Loading" 
function LoadingScreen() {
  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', 
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#D9ECE3' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '60px', height: '60px',
          border: '4px solid rgba(54, 157, 161, 0.2)',
          borderTopColor: '#369DA1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    </div>
  );
}


function AppContent() {
  const { user, loading } = useAuth();
  
  // Agora o 'params' para guardar o ID do filme (ex: { id: 5 })
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
  
  if (!user) {
    if (rota === 'intro') {
      return <Intro onComplete={handleIntroComplete} />;
    }
    if (rota === 'cadastro') {
      return <Cadastro onNavigate={navegar} />;
    }
    return <Login onNavigate={navegar} />;
  }

  // 5. FLUXO DE LOGADO (AQUI ESTÁ A MUDANÇA)
  
  // (Vamos descomentar isso nos próximos passos)
  // if (rota === 'filme' && params.id) {
  //   return <DetalheFilme filmeId={params.id} onNavegar={navegar} />;
  // }
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
  // Substituímos o 'HomePlaceholder' pela 'Home' real
  return <Home onNavegar={navegar} />;
}

function App() {
  return <AppContent />;
}

// CSS da animação (pode manter)
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = "@keyframes spin { to { transform: rotate(360deg); } }";
document.head.appendChild(styleSheet);


export default App;