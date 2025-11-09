import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Intro from './components/Intro/Intro'; // Do seu código original

function LoadingScreen() {
  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', 
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#D9ECE3' // Cor de fundo do seu site
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '60px', height: '60px',
          border: '4px solid rgba(54, 157, 161, 0.2)',
          borderTopColor: '#369DA1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#21618D', marginTop: '1rem' }}>
          Carregando EmyFlix...
        </p>
      </div>
    </div>
  );
}

// Página Home "Falsa" (só para testar o login)
function HomePlaceholder({ user }) {
  const { signOut } = useAuth();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Olá, {user.nome}! Você está logado.</h1>
      <p>Seu papel é: <strong>{user.role}</strong></p>
      <button 
        onClick={signOut} 
        style={{ padding: '0.5rem 1rem', background: '#F498AE', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        Sair
      </button>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [rota, setRota] = useState('intro'); // Começa na 'intro'
  const navegar = (novaRota) => {
    setRota(novaRota);
  };

  const handleIntroComplete = () => {
    if (user) {
      setRota('home'); // Se já estava logado, vai pra home
    } else {
      setRota('login'); // Se não, vai pro login
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }
  
  if (rota === 'intro') {
    return <Intro onComplete={handleIntroComplete} />;
  }

  if (!user) {
    if (rota === 'cadastro') {
      return <Cadastro onNavigate={navegar} />;
    }
    // O padrão para usuários não logados é a tela de Login
    return <Login onNavigate={navegar} />;
  }
  return <HomePlaceholder user={user} />;
}


function App() {
  return <AppContent />;
}

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = "@keyframes spin { to { transform: rotate(360deg); } }";
document.head.appendChild(styleSheet);


export default App;