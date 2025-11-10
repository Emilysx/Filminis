import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Carrossel from '../../components/Carrossel/Carrossel';
import FilmeCarrossel from '../../components/FilmeCarrossel/FilmeCarrossel'; 
import bannerHome from '../../assets/banner-home.png';
import './Home.css';

function Home({ onNavegar }) {
  const { token } = useAuth();
  const [todosOsFilmes, setTodosOsFilmes] = useState([]);
  const [filmesDestaque, setFilmesDestaque] = useState([]);
  
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');


  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        const response = await fetch('http://localhost:8000/filmes', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Falha ao buscar filmes.');

        const filmesData = await response.json();
        
        setTodosOsFilmes(filmesData);
        setFilmesDestaque(filmesData.slice(0, 5));

      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };
    carregarDados();
  }, [token]);

  const handleBuscar = (termo) => {
    console.log('Buscando por:', termo);
  };

  const handleVerFilme = (filmeId) => {
    onNavegar('filme', { id: filmeId }); 
  };

  if (carregando) {
    return (
      <div className="homeCarregando">
        <div className="homeSpinner" />
        <p>Carregando filmes...</p>
      </div>
    );
  }
  
  if (erro) {
     return <div className="homeCarregando"><p>Erro: {erro}</p></div>;
  }

  return (
    <div className="home">
      <Navbar onBuscar={handleBuscar} onNavegar={onNavegar} />
      
      <main className="homeContainer">
        <Carrossel 
          filmes={filmesDestaque} 
          onFilmeClick={handleVerFilme} 
        />

        <img src={bannerHome} alt="Bem-vindo ao EmyFlix" className="homeBannerImagem" />
        
        <FilmeCarrossel 
          titulo="Cadastrados Recentemente"
          filmes={todosOsFilmes} 
          onFilmeClick={handleVerFilme} 
        />
        
        {/*
          PRÓXIMOS PASSOS:
          <FilmeCarrossel titulo="Visto Recentemente" ... />
          <Footer />
        */}

      </main>
    </div>
  );
}

export default Home;