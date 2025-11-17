import { useState, useEffect } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import '../../pages/DetalheFilme/DetalheFilme.css'; 

function DetalheAprovacao({ solicitacaoId, onNavegar }) {
  const { user, token } = useAuth();
  const [filme, setFilme] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
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
    
    if (!user || user.role !== 'adm') {
      onNavegar('home');
      return;
    }

    carregarSolicitacao();
  }, [solicitacaoId, token, user, onNavegar]);

  // === VALIDAÇÕES CORRETAS ===
  if (carregando) {
    return <div className="detalheCarregando">Carregando...</div>;
  }

  if (erro) {
    return <div className="detalheErro">{erro}</div>;
  }

  if (!filme) {
    return <div className="detalheErro">Solicitação não encontrada.</div>;
  }

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
      onNavegar('admin');
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
      onNavegar('admin');
    } catch (error) {
      alert(error.message);
      setProcessando(false);
    }
  };


  return (
    <div className="detalhe">
      <Navbar onNavegar={onNavegar} />
      
      <div className="detalheContainer">
        <button className="detalheBotaoVoltar" onClick={() => onNavegar('admin')}>
          <ArrowLeft size={20} />
          <span>Voltar ao Painel</span>
        </button>

        <div className="detalheConteudo">
          <div className="detalhePoster">
            <img src={filme.poster_url} alt={filme.titulo} />
          </div>

          <div className="detalheInfo">
            <h1 className="detalheTitulo">{filme.titulo}</h1>

            <div className="detalheMetadata">
              <span className="detalheAno">{filme.ano}</span>
              <span className="detalheDuracao">{filme.duracao}</span>
              <div className="detalheCategorias">
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

            <div className="detalheAcoes">
              <button
                className="detalheBotao detalheBotaoDeletar"
                onClick={handleRejeitar}
                disabled={processando}
              >
                <X size={18} />
                <span>Rejeitar</span>
              </button>

              <button
                className="detalheBotao detalheBotaoAprovar"
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