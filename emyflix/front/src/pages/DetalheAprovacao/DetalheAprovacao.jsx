import { useState, useEffect } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react'; // Ícones de Aprovar/Rejeitar
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
// Vamos reutilizar o CSS da página de Detalhes
import '../../pages/DetalheFilme/DetalheFilme.css'; 

function DetalheAprovacao({ solicitacaoId, onNavegar }) {
  const { user, token } = useAuth();
  
  const [filme, setFilme] = useState(null); // 'filme' aqui é a solicitação
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [processando, setProcessando] = useState(false); // Para os botões

  useEffect(() => {
    // Busca os dados da SOLICITAÇÃO (não do filme aprovado)
    const carregarSolicitacao = async () => {
      setCarregando(true);
      try {
        const response = await fetch(`http://localhost:8000/admin/solicitacao/${solicitacaoId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao carregar solicitação');
        const data = await response.json();
        setFilme(data);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };
    
    // Se não for admin, chuta pra home
    if (!user || user.role !== 'adm') {
      onNavegar('home');
      return;
    }
    carregarSolicitacao();
  }, [solicitacaoId, token, user, onNavegar]);

  // Função para APROVAR
  const handleAprovar = async () => {
    setProcessando(true);
    try {
      const response = await fetch(`http://localhost:8000/admin/aprovar/${filme.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao aprovar filme');
      alert('Filme aprovado e publicado com sucesso!');
      onNavegar('admin'); // Volta para o Painel Admin
    } catch (error) {
      alert(error.message);
      setProcessando(false);
    }
  };

  // Função para REJEITAR
  const handleRejeitar = async () => {
    if (!window.confirm('Tem certeza que deseja rejeitar esta submissão?')) return;
    setProcessando(true);
    try {
      const response = await fetch(`http://localhost:8000/admin/rejeitar/${filme.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao rejeitar filme');
      alert('Solicitação rejeitada com sucesso.');
      onNavegar('admin'); // Volta para o Painel Admin
    } catch (error) {
      alert(error.message);
      setProcessando(false);
    }
  };


  if (carregando) { /* ... (tela de loading) ... */ }
  if (erro) { /* ... (tela de erro) ... */ }
  if (!filme) return null;

  // --- Renderização da Página (igual ao DetalheFilme) ---
  return (
    <div className="detalhe">
      <Navbar onNavegar={onNavegar} />
      
      <div className="detalheContainer">
        <button className="detalheBotaoVoltar" onClick={() => onNavegar('admin')}>
          <ArrowLeft size={20} />
          <span>Voltar ao Painel</span>
        </button>

        <div className="detalheConteudo">
          {/* Coluna da Esquerda (Poster) */}
          <div className="detalhePoster">
            <img src={filme.poster_url} alt={filme.titulo} />
          </div>

          {/* Coluna da Direita (Informações) */}
          <div className="detalheInfo">
            <h1 className="detalheTitulo">{filme.titulo}</h1>
            
            <div className="detalheMetadata">
              <span className="detalheAno">{filme.ano}</span>
              <span className="detalheDuracao">{filme.duracao}</span>
              <div className="detalheCategorias">
                {/* Mostra o TEXTO que o usuário enviou */}
                {filme.generos_texto.split(',').map((genero) => (
                  <span key={genero} className="detalheCategoria">
                    {genero.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="detalheSecao">
              <h2 className="detalheSecaoTitulo">Sinopse</h2>
              <p className="detalheSinopse">{filme.sinopse}</p>
            </div>
            
            <div className="detalheGridInfo"> 
              {/* Coluna da ESQUERDA */}
              <div className="detalheColunaInfo">
                <div className="detalheSecao">
                  <h2 className="detalheSecaoTitulo">Personagens</h2>
                  <p className="detalheLista">{filme.atores_texto || 'N/A'}</p>
                </div>
                <div className="detalheSecao">
                  <h2 className="detalheSecaoTitulo">Direção</h2>
                  <p className="detalheLista">{filme.diretores_texto || 'N/A'}</p>
                </div>
              </div>

              {/* Coluna da DIREITA */}
              <div className="detalheColunaInfo">
                <div className="detalheSecao">
                  <h2 className="detalheSecaoTitulo">Linguagem</h2>
                  <p className="detalheLista">{filme.id_linguagem === 1 ? 'Português' : 'Outra'}</p>
                </div>
                <div className="detalheSecao">
                  <h2 className="detalheSecaoTitulo">Enviado por:</h2>
                  <p className="detalheLista">{filme.usuario_nome}</p>
                </div>
              </div>
            </div>

            {/* === BOTÕES DE APROVAÇÃO === */}
            <div className="detalheAcoes">
              <button
                className="detalheBotao detalheBotaoDeletar" // Reutiliza o CSS
                onClick={handleRejeitar}
                disabled={processando}
              >
                <X size={18} />
                <span>Rejeitar</span>
              </button>
              <button
                className="detalheBotao detalheBotaoAprovar" // Reutiliza o CSS 'detalheBotao'
                onClick={handleAprovar}
                disabled={processando}
              >
                <Check size={18} />
                <span>Aprovar Filme</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalheAprovacao;