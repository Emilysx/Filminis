import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Intro from './components/Intro/Intro';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import DetalheFilme from './pages/DetalheFilme/DetalheFilme';
import FormularioFilme from './pages/FormularioFilme/FormularioFilme';
import PainelAdmin from './pages/PainelAdmin/PainelAdmin';

function AppContent() {
  const { user, loading } = useAuth();
  const [rota, setRota] = useState('intro');
  const [params, setParams] = useState({});

  const navegar = (novaRota, novosParams) => {
    setRota(novaRota);
    if (novosParams) {
      setParams(novosParams);
    } else {
      setParams({});
    }
  };

  const handleIntroComplete = () => {
    if (user) {
      navegar('home');
    } else {
      navegar('login');
    }
  };

  const handleLoginSuccess = () => {
    navegar('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Carregando...</p>
        </div>
      </div>
    );
  }

  if (rota === 'intro') {
    return <Intro onComplete={handleIntroComplete} />;
  }

  if (!user && rota !== 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (rota === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (rota === 'home') {
    return <Home onNavegar={navegar} />;
  }

  if (rota === 'filme' && params.id) {
    return <DetalheFilme filmeId={params.id} onNavegar={navegar} />;
  }

  if (rota === 'adicionar') {
    return <FormularioFilme onNavegar={navegar} />;
  }

  if (rota === 'editar' && params.id) {
    return <FormularioFilme filmeId={params.id} onNavegar={navegar} />;
  }

  if (rota === 'admin') {
    return <PainelAdmin onNavegar={navegar} />;
  }

  return <Home onNavegar={navegar} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;