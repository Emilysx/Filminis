import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Intro from './components/Intro/Intro';
import Home from './pages/Home/Home';
import Footer from './components/Footer/Footer'; // <-- 1. IMPORTE O FOOTER

// ... (Componente LoadingScreen fica aqui, sem mudanças) ...
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
// --- Fim do LoadingScreen ---

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
    // O padrão é Login
    return <Login onNavigate={navegar} />;
  }

  // --- FLUXO DE LOGADO ---
  // (Aqui vamos adicionar as outras páginas depois)
  
  // A rota padrão é a 'home'
  return <Home onNavegar={navegar} />;
}

function App() {
  return (
    // 2. O App agora é um 'Fragmento' que envolve o conteúdo e o footer
    <>
      <AppContent />
      <Footer />
    </>
  );
}

// CSS da animação (pode manter)
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = "@keyframes spin { to { transform: rotate(360deg); } }";
document.head.appendChild(styleSheet);

export default App;