import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // Verifique se este caminho está correto
import Navbar from '../../components/Navbar/Navbar';
import Carrossel from '../../components/Carrossel/Carrossel';
import CardFilme from '../../components/CardFilme/CardFilme';
import './Home.css';

// interface HomeProps REMOVIDA

function Home({ onNavegar }) { // Argumentos sem tipo
  // Tipos <...> REMOVIDOS dos useStates
  const [filmesDestaque, setFilmesDestaque] = useState([]);
  const [filmesPorCategoria, setFilmesPorCategoria] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const { data: cats } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');

      if (cats) {
        setCategorias(cats);
      }

      const { data: filmesData } = await supabase
        .from('filmes')
        .select(`
          *,
          filmes_categorias (
            categoria_id,
            categorias (*)
          )
        `)
        .eq('aprovado', true)
        .order('created_at', { ascending: false });

      if (filmesData) {
        // Tipo :FilmeComCategorias[] REMOVIDO
        const filmesComCategorias = filmesData.map((filme) => ({
          ...filme,
          categorias: filme.filmes_categorias?.map((fc) => fc.categorias) || [],
        }));

        setFilmesDestaque(filmesComCategorias.slice(0, 3));

        // Tipo Record<...> REMOVIDO
        const filmesPorCat = {};
        cats?.forEach((cat) => {
          filmesPorCat[cat.nome] = filmesComCategorias.filter((filme) =>
            filme.categorias?.some((c) => c.id === cat.id)
          );
        });
        setFilmesPorCategoria(filmesPorCat);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setCarregando(false);
    }
  };

  // Tipo :string REMOVIDO do parâmetro
  const handleBuscar = (termo) => {
    setTermoBusca(termo);
  };

  // Tipo :string REMOVIDO do parâmetro
  const handleVerFilme = (filmeId) => {
    onNavegar('filme', { id: filmeId });
  };

  if (carregando) {
    // ... (seu JSX de loading)
  }

  return (
    <div className="home">
      <Navbar onBuscar={handleBuscar} onNavegar={onNavegar} />
      <main className="homeContainer">
        {/* ... (Todo o seu JSX restante) ... */}
      </main>
    </div>
  );
}

export default Home;