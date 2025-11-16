import { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
// Importa o CSS da página de Detalhes (para reutilizar o layout)
import '../../pages/DetalheFilme/DetalheFilme.css';
// Importa o CSS DESTA PÁGINA (para as mudanças)
import './DetalheEdicao.css';
// Importa o CSS DO ADMIN (para os botões)
import '../../pages/PainelAdmin/PainelAdmin.css'; 

// Lista de linguagens (para converter ID em Nome)
const linguagensDisponiveis = [
  { id: 1, nome: 'Português' }, { id: 2, nome: 'Inglês' },
  { id: 3, nome: 'Espanhol' }, { id: 4, nome: 'Francês' },
  { id: 5, nome: 'Alemão' }, { id: 6, nome: 'Italiano' },
  { id: 7, nome: 'Japonês' }, { id: 8, nome: 'Coreano' },
  { id: 9, nome: 'Mandarim' }, { id: 10, nome: 'Hindi' },
];

function DetalheEdicao({ solicitacao, onNavegar }) {
  const { user, token } = useAuth();
  
  const [filme, setFilme] = useState(null); 
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'adm' || !solicitacao) {
      onNavegar('home');
      return;
    }

    const carregarFilmeOriginal = async () => {
      setCarregando(true);
      try {
        // Busca o FILME ORIGINAL (para mostrar a foto e dados)
        const resFilme = await fetch(`http://localhost:8000/filmes/${solicitacao.filme_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resFilme.ok) throw new Error('Falha ao carregar filme original');
        const dataFilme = await resFilme.json();
        setFilme(dataFilme);
        
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };
    
    carregarFilmeOriginal();
  }, [solicitacao, token, user, onNavegar]);

  // Funções de Aprovar/Rejeitar
  const aprovarEdicao = async () => {
    setProcessando(true);
    try {
      await fetch(`http://localhost:8000/admin/aprovar-edicao/${solicitacao.id}`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Edição aprovada com sucesso!');
      onNavegar('admin');
    } catch (error) {
      alert('Erro ao aprovar edição: ' + error.message);
      setProcessando(false);
    }
  };
  const rejeitarEdicao = async () => {
    if (!window.confirm('Tem certeza?')) return;
    setProcessando(true);
    try {
      await fetch(`http://localhost:8000/admin/rejeitar-edicao/${solicitacao.id}`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Edição rejeitada com sucesso.');
      onNavegar('admin');
    } catch (error) {
      alert('Erro ao rejeitar edição: ' + error.message);
      setProcessando(false);
    }
  };
  
  if (carregando) {
    return (
      <div className="detalheEdicao">
        <Navbar onNavegar={onNavegar} />
        <div className="detalheCarregando">
          <div className="detalheSpinner" />
        </div>
      </div>
    );
  }
  
  if (erro || !filme) {
    return (
      <div className="detalheEdicao">
        <Navbar onNavegar={onNavegar} />
        <div className="detalheErro">
          <p>{erro || "Não foi possível carregar os dados."}</p>
          <button onClick={() => onNavegar('admin')} className="detalheBotaoVoltar">
            <ArrowLeft size={20} />
            <span>Voltar ao Painel</span>
          </button>
        </div>
      </div>
    );
  }

  // --- Função Helper: Decide qual valor mostrar ---
  const getValor = (campo) => {
    if (solicitacao.campo_alterado === campo) {
      if (campo === 'id_linguagem') {
        return linguagensDisponiveis.find(l => l.id == solicitacao.valor_novo)?.nome || 'Desconhecido';
      }
      return solicitacao.valor_novo;
    }
    if (campo === 'atores') return filme.atores.join(', ');
    if (campo === 'diretores') return filme.diretores.join(', ');
    if (campo === 'linguagem') return filme.linguagem;
    return filme[campo];
  };
  
  const generosValor = solicitacao.campo_alterado === 'generos_texto'
    ? solicitacao.valor_novo.split(',').map(g => g.trim())
    : filme.generos;

  return (
    <div className="detalheEdicao">
      <Navbar onNavegar={onNavegar} />
      
      <div className="detalheEdicaoContainer">
        
        <button className="detalheBotaoVoltar" onClick={() => onNavegar('admin')}>
          <ArrowLeft size={20} />
          <span>Voltar ao Painel</span>
        </button>

        <div className="detalheConteudo">
          <div className="detalhePoster">
            <img src={getValor('poster_url')} alt={getValor('titulo')} />
          </div>
          
          <div className="detalheInfo">
            <h1 className="detalheTitulo">{getValor('titulo')}</h1>
            
            <div className="detalheMetadata">
              <span className="detalheAno">{getValor('ano')}</span>
              <span className="detalheDuracao">{getValor('duracao')}</span>
              <div className="detalheCategorias">
                {generosValor.map((genero) => (
                  <span key={genero} className="detalheCategoria">{genero}</span>
                ))}
              </div>
            </div>

            <div className="detalheSecao">
              <h2 className="detalheSecaoTitulo">Sinopse</h2>
              <p className="detalheSinopse">{getValor('sinopse')}</p>
            </div>
            
            <div className="detalheSecao">
              <h2 className="detalheSecaoTitulo">Personagens Principais</h2>
              <p className="detalheLista">{getValor('atores_texto') || filme.atores.join(', ')}</p>
            </div>
            
            <div className="detalheGridInfo">
              <div className="detalheColunaInfo">
                <div className="detalheSecao">
                  <h2 className="detalheSecaoTitulo">Direção</h2>
                  <p className="detalheLista">{getValor('diretores_texto') || filme.diretores.join(', ')}</p>
                </div>
              </div>
              <div className="detalheColunaInfo">
                <div className="detalheSecao">
                  <h2 className="detalheSecaoTitulo">Linguagem</h2>
                  <p className="detalheLista">{getValor('id_linguagem') || filme.linguagem}</p>
                </div>
              </div>
            </div>
            
            {/* --- SEÇÃO DE REVISÃO (De/Para) --- */}
            <div className="secaoMudancas">
              {/* O 'style' foi substituído pela classe 'tituloMudanca' */}
              <div className="detalheSecaoTitulo tituloMudanca">
                <Edit size={18} /> Mudança Proposta por: {solicitacao.usuario_nome}
              </div>
              <div className="mudancaBox">
                <div className="mudancaCampo de">
                  <h4>De ({solicitacao.campo_alterado}):</h4>
                  <div className="mudancaValor">{solicitacao.valor_antigo}</div>
                </div>
                <div className="mudancaCampo para">
                  <h4>Para ({solicitacao.campo_alterado}):</h4>
                  <div className="mudancaValor">{solicitacao.valor_novo}</div>
                </div>
              </div>
            </div>

            {/* Botões de Ação do Admin */}
            <div className="detalheAcoesAprovacao">
              <button
                className="adminBotao adminBotaoAprovar"
                onClick={aprovarEdicao}
                disabled={processando}
              >
                <Check size={18} />
                <span>Aprovar Edição</span>
              </button>
              <button
                className="adminBotao adminBotaoRejeitar"
                onClick={rejeitarEdicao}
                disabled={processando}
              >
                <X size={18} />
                <span>Rejeitar Edição</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalheEdicao;