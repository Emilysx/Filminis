import { useState, useEffect } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import FilmeCarrossel from '../../components/FilmeCarrossel/FilmeCarrossel';
import './PainelAdmin.css';
import Footer from '../../components/Footer/Footer';

function PainelAdmin({ onNavegar }) {
  const { user, token } = useAuth();
  const [filmesAprovacao, setFilmesAprovacao] = useState([]);
  const [edicoesAprovacao, setEdicoesAprovacao] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(null); // ID do item sendo processado

  useEffect(() => {
    if (!user || user.role !== 'adm') {
      onNavegar('home');
      return;
    }
    carregarDados();
  }, [user, onNavegar]);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      // Busca Novas Submissões
      const resFilmes = await fetch('http://localhost:8000/admin/solicitacoes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataFilmes = await resFilmes.json();
      if (resFilmes.ok) setFilmesAprovacao(dataFilmes);

      // Busca Edições Pendentes (com poster_url e ano)
      const resEdicoes = await fetch('http://localhost:8000/admin/solicitacoes-edicao', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataEdicoes = await resEdicoes.json();
      if (resEdicoes.ok) setEdicoesAprovacao(dataEdicoes);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setCarregando(false);
    }
  };

  // Funções de aprovar/rejeitar NOVOS filmes
  const aprovarFilme = async (solicitacaoId) => {
    setProcessando(solicitacaoId);
    try {
      await fetch(`http://localhost:8000/admin/aprovar/${solicitacaoId}`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Filme aprovado!');
      await carregarDados(); 
    } catch (error) {
      alert('Erro ao aprovar filme');
    } finally {
      setProcessando(null);
    }
  };
  const rejeitarFilme = async (solicitacaoId) => {
    if (!window.confirm('Tem certeza que deseja rejeitar esta submissão?')) return;
    setProcessando(solicitacaoId);
    try {
      await fetch(`http://localhost:8000/admin/rejeitar/${solicitacaoId}`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Solicitação rejeitada.');
      await carregarDados();
    } catch (error) {
      alert('Erro ao rejeitar filme');
    } finally {
      setProcessando(null);
    }
  };


  if (carregando) {
    return (
      <div className="adminCarregando">
        <div className="adminSpinner" />
        <p>Carregando painel...</p>
      </div>
    );
  }

  return (
    <div className="admin">
      <Navbar onNavegar={onNavegar} />
      <div className="adminContainer">
        <button className="adminBotaoVoltar" onClick={() => onNavegar('home')}>
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <h1 className="adminTitulo">Painel do Administrador</h1>

        {/* --- Seção de NOVOS Filmes (com Carrossel) --- */}
        <section className="adminSecao">
          <h2 className="adminSecaoTitulo">
            Novos Filmes ({filmesAprovacao.length})
          </h2>
          {filmesAprovacao.length === 0 ? (
            <p className="adminVazio">Nenhum filme novo</p>
          ) : (
            <FilmeCarrossel
              titulo=""
              filmes={filmesAprovacao} 
              onFilmeClick={(id) => onNavegar('detalhe-aprovacao', { id })}
            />
          )}
        </section>

        {/* --- Seção de EDIÇÕES Pendentes (com Carrossel) --- */}
        <section className="adminSecao">
          <h2 className="adminSecaoTitulo">
            Edições Pendentes ({edicoesAprovacao.length})
          </h2>
          {edicoesAprovacao.length === 0 ? (
            <p className="adminVazio">Nenhuma edição pendente</p>
          ) : (
            <FilmeCarrossel
              titulo=""
              filmes={edicoesAprovacao.map(solic => ({
                id: solic.id, 
                titulo: solic.filme_titulo,
                poster_url: solic.poster_url, 
                ano: solic.ano,
                generos: [`Campo: ${solic.campo_alterado}`, `Por: ${solic.usuario_nome}`]
              }))}
              // --- AQUI ESTÁ A CORREÇÃO ---
              onFilmeClick={(id) => {
                // Encontra a solicitação completa para enviar
                const solicitacaoCompleta = edicoesAprovacao.find(s => s.id === id);
                onNavegar('detalhe-edicao', { solicitacao: solicitacaoCompleta });
              }}
            />
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default PainelAdmin;