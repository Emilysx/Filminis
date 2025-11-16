import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Carrossel from '../../components/Carrossel/Carrossel';
import FilmeCarrossel from '../../components/FilmeCarrossel/FilmeCarrossel';
import Footer from '../../components/Footer/Footer';
import './Home.css';

// IDs dos filmes que você quer no carrossel principal
const IDS_DESTAQUE_CARROSSEL = [1, 5, 9, 3, 2];

function Home({ onNavegar }) {
  const { token } = useAuth();

  const [filmesRecentes, setFilmesRecentes] = useState([]);
  const [filmesDestaque, setFilmesDestaque] = useState([]);
  const [filmesVistos, setFilmesVistos] = useState([]); // <-- NOVO ESTADO

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

        // Lógica dos Destaques
        const filmesParaDestaque = IDS_DESTAQUE_CARROSSEL
          .map(id => filmesData.find(filme => filme.id === id))
          .filter(Boolean);
        setFilmesDestaque(filmesParaDestaque);

        // Lógica dos Recentes (back-end já ordena por ID DESC)
        setFilmesRecentes(filmesData);

        const historicoIds = JSON.parse(localStorage.getItem('historico_filmes')) || [];
        if (historicoIds.length > 0) {
          // Filtra a lista completa de filmes para encontrar os do histórico
          const filmesDoHistorico = historicoIds
            .map(id => filmesData.find(filme => filme.id === id))
            .filter(Boolean); // Remove filmes que possam ter sido deletados
          setFilmesVistos(filmesDoHistorico);
        }

      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };
    carregarDados();
  }, [token]);

  const handleBuscar = (termo) => {
    // Manda para a página de Listar Filmes com o termo
    onNavegar('listar-filmes', { busca: termo });
  };

  const handleVerFilme = (filmeId) => {
    onNavegar('filme', { id: filmeId });
  };

  if (carregando)
    if (erro)

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

            {filmesVistos.length > 0 && (
              <FilmeCarrossel
                titulo="Visto Recentemente"
                filmes={filmesVistos}
                onFilmeClick={handleVerFilme}
              />
            )}

          </main>
          <Footer />
        </div>
      );
}

export default Home;  