import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

import Navbar from '../../components/Navbar/Navbar';
import Carrossel from '../../components/Carrossel/Carrossel';
import FilmeCarrossel from '../../components/FilmeCarrossel/FilmeCarrossel';
import bannerHome from '../../assets/banner-home.png';
import './Home.css';

const IDS_DESTAQUE_CARROSSEL = [1, 5, 11, 9, 6];


function Home({ onNavegar }) {
  const { token } = useAuth();
  
  const [filmesRecentes, setFilmesRecentes] = useState([]);
  const [filmesDestaque, setFilmesDestaque] = useState([]);
  const [filmesVistos, setFilmesVistos] = useState([]); 
  
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

        const filmesData = await response.json(); // Pega TODOS os filmes
        
        const filmesParaDestaque = IDS_DESTAQUE_CARROSSEL
          .map(id => filmesData.find(filme => filme.id === id))
          .filter(Boolean);
        
        setFilmesDestaque(filmesParaDestaque);
        setFilmesRecentes(filmesData); 

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

        <FilmeCarrossel 
          titulo="Cadastrados Recentemente"
          filmes={filmesRecentes} 
          onFilmeClick={handleVerFilme} 
        />
        
        {/* (Visto Recentemente e Footer) */}

      </main>
    </div>
  );
}

export default Home;