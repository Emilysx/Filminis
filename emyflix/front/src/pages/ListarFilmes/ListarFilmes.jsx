import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import CardFilme from '../../components/CardFilme/CardFilme';
import FilmeCarrossel from '../../components/FilmeCarrossel/FilmeCarrossel';
import { ArrowLeft, Search, X } from 'lucide-react';
import './ListarFilmes.css';
import Footer from '../../components/Footer/Footer';

function ListarFilmes({ onNavegar, params = {} }) {
    const { token } = useAuth();

    // Estados dos Filtros
    const [termoBusca, setTermoBusca] = useState(params.busca || '');
    const [generoFiltro, setGeneroFiltro] = useState('');
    const [anoFiltro, setAnoFiltro] = useState('');

    // Estados de Dados
    const [filmesAgrupados, setFilmesAgrupados] = useState({}); // Para o "Modo Explorar"
    const [generos, setGeneros] = useState([]);
    const [resultadosFiltrados, setResultadosFiltrados] = useState([]); // Para o "Modo Busca"

    // Estados de Controle
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    // Decide qual modo mostrar: 'explorar' (padrão) ou 'busca'
    const [modo, setModo] = useState(params.busca ? 'busca' : 'explorar');

    // --- EFEITOS ---

    // 1. Busca os dados da página (Gêneros e TODOS os filmes)
    useEffect(() => {
        const carregarDadosIniciais = async () => {
            setCarregando(true);
            try {
                // Busca TODOS os gêneros
                const resGeneros = await fetch('http://localhost:8000/generos', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const generosData = await resGeneros.json();
                setGeneros(generosData);

                // Busca TODOS os filmes
                const resFilmes = await fetch('http://localhost:8000/filmes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const filmesData = await resFilmes.json();

                // Agrupa os filmes por gênero (para o modo 'explorar')
                const filmesAgrupados = {};
                for (const genero of generosData) {
                    filmesAgrupados[genero.nome] = filmesData.filter(filme =>
                        filme.generos.includes(genero.nome)
                    );
                }
                setFilmesAgrupados(filmesAgrupados);

            } catch (err) {
                setErro('Falha ao carregar dados. ' + err.message);
            } finally {
                setCarregando(false);
            }
        };

        carregarDadosIniciais();
    }, [token]);

    // 2. Efeito que RODA A BUSCA toda vez que um filtro (Gênero/Ano) muda
    useEffect(() => {
        if (!termoBusca && !generoFiltro && !anoFiltro) {
            setModo('explorar');
            setResultadosFiltrados([]);
            return;
        }
        setModo('busca');
        buscarFilmesFiltrados();

    }, [generoFiltro, anoFiltro, token]);

    // --- FUNÇÕES ---

    // Função que realmente busca os dados filtrados no back-end
    const buscarFilmesFiltrados = async () => {
        setCarregando(true);
        setErro('');
        try {
            const query = new URLSearchParams();
            if (termoBusca) query.append('q', termoBusca); // 'q' = busca geral
            if (generoFiltro) query.append('genero', generoFiltro);
            if (anoFiltro) query.append('ano', anoFiltro);

            const url = `http://localhost:8000/filmes/buscar?${query.toString()}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const dataErro = await response.json();
                throw new Error(dataErro.erro || 'Nenhum filme encontrado.');
            }
            const data = await response.json();
            setResultadosFiltrados(data);

        } catch (err) {
            setErro(err.message);
            setResultadosFiltrados([]);
        } finally {
            setCarregando(false);
        }
    };

    // Limpa todos os filtros e volta ao modo 'explorar'
    const limparFiltros = () => {
        setTermoBusca('');
        setGeneroFiltro('');
        setAnoFiltro('');
        setModo('explorar');
    };


    return (
        <div className="listarFilmes">
            <Navbar onNavegar={onNavegar} />

            <div className="listarContainer">
                <button className="listarBotaoVoltar" onClick={() => onNavegar('home')}>
                    <ArrowLeft size={20} />
                    <span>Voltar para Home</span>
                </button>

                <h1 className="listarTitulo">Explore o Catálogo</h1>

                {/* --- PAINEL DE FILTROS (SEMPRE APARECE) --- */}
                <form className="filtrosPainel">
                    <div className="filtroInputBusca">
                        <Search size={20} className="filtroIconeBusca" />
                        <input
                            type="text"
                            placeholder="Buscar por Título, Personagem ou Diretor..."
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                        />
                    </div>
                    <div className="filtroSelect">
                        <select value={generoFiltro} onChange={(e) => setGeneroFiltro(e.target.value)}>
                            <option value="">Todos os Gêneros</option>
                            {generos.map(g => <option key={g.id} value={g.nome}>{g.nome}</option>)}
                        </select>
                    </div>
                    <div className="filtroInputAno">
                        <input
                            type="number"
                            placeholder="Buscar por ano..."
                            value={anoFiltro}
                            onChange={(e) => setAnoFiltro(e.target.value)}
                        />
                    </div>

                    <div className="filtroBotaoContainer">
                        <button type="button" className="filtrosBotao" onClick={() => buscarFilmesFiltrados()}>
                            <Search size={20} />
                            <span>Filtrar</span>
                        </button>
                    </div>
                </form>

                {/* --- ÁREA DE CONTEÚDO (GRID ou CARROSSÉIS) --- */}
                {carregando ? (
                    <div className="listarCarregando">
                        <div className="listarSpinner" />
                    </div>
                ) : erro ? (
                    <div className="listarErro">{erro}</div>
                ) : (
                    // Decide qual modo mostrar
                    modo === 'busca' ? (
                        // --- MODO BUSCA (Grid) ---
                        <section className="listarResultados">
                            <div className="listarResultadoHeader">
                                <h2>Resultados da Busca ({resultadosFiltrados.length})</h2>
                                <button onClick={limparFiltros} className="listarBotaoLimpar">
                                    <X size={16} /> Limpar Filtros
                                </button>
                            </div>
                            {resultadosFiltrados.length === 0 ? (
                                <div className="listarErro">Nenhum filme encontrado.</div>
                            ) : (
                                <div className="listarGrid">
                                    {resultadosFiltrados.map(filme => (
                                        <CardFilme
                                            key={filme.id}
                                            filme={filme}
                                            onClick={() => onNavegar('filme', { id: filme.id })}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    ) : (
                        // --- MODO EXPLORAR (Carrosséis) ---
                        <div className="listarCarrosseis">
                            {generos.map(genero => {
                                if (filmesAgrupados[genero.nome]?.length > 0) {
                                    return (
                                        <FilmeCarrossel
                                            key={genero.id}
                                            titulo={genero.nome}
                                            filmes={filmesAgrupados[genero.nome]}
                                            onFilmeClick={(id) => onNavegar('filme', { id })}
                                        />
                                    );
                                }
                                return null;
                            })}
                        </div>
                    )
                )}
            </div>
            <Footer />
        </div>
    );
}

export default ListarFilmes;