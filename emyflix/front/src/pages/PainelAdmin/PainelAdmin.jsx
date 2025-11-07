import { useState, useEffect } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
// Removemos os tipos 'Filme' e 'SolicitacaoEdicao' da importação
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import './PainelAdmin.css';

// interface PainelAdminProps REMOVIDA
// interface FilmeComSolicitacao REMOVIDA

// Removemos a anotação de tipo ': PainelAdminProps'
function PainelAdmin({ onNavegar }) {
  const { perfil } = useAuth();
  // Removemos os tipos <...> dos useStates
  const [filmesAprovacao, setFilmesAprovacao] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    if (!perfil?.is_admin) {
      onNavegar('home');
      return;
    }
    carregarDados();
  }, [perfil]);

  const carregarDados = async () => {
    try {
      const { data: filmes } = await supabase
        .from('filmes')
        .select(`
          *,
          perfis (nome)
        `)
        .eq('aprovado', false)
        .order('created_at', { ascending: false });

      if (filmes) {
        // Removemos a anotação de tipo ': FilmeComSolicitacao[]'
        // e '(f: any)'
        const filmesFormatados = filmes.map((f) => ({
          ...f,
          usuario_nome: f.perfis?.nome || 'Usuário desconhecido',
        }));
        setFilmesAprovacao(filmesFormatados);
      }

      const { data: solic } = await supabase
        .from('solicitacoes_edicao')
        .select(`
          *,
          filmes (titulo),
          perfis (nome)
        `)
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });

      if (solic) {
        setSolicitacoes(solic);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setCarregando(false);
    }
  };

  // Removemos a anotação de tipo ': string'
  const aprovarFilme = async (filmeId) => {
    setProcessando(true);
    try {
      await supabase.from('filmes').update({ aprovado: true }).eq('id', filmeId);

      alert('Filme aprovado com sucesso!');
      await carregarDados();
    } catch (error) {
      console.error('Erro ao aprovar filme:', error);
      alert('Erro ao aprovar filme');
    } finally {
      setProcessando(false);
    }
  };

  // Removemos a anotação de tipo ': string'
  const rejeitarFilme = async (filmeId) => {
    if (!confirm('Tem certeza que deseja rejeitar este filme?')) return;

    setProcessando(true);
    try {
      await supabase.from('filmes').delete().eq('id', filmeId);

      alert('Filme rejeitado e removido');
      await carregarDados();
    } catch (error) {
      console.error('Erro ao rejeitar filme:', error);
      alert('Erro ao rejeitar filme');
    } finally {
      setProcessando(false);
    }
  };

  // Removemos as anotações de tipo dos parâmetros
  const processarSolicitacao = async (
    solicitacaoId,
    aprovar,
    solicitacao
  ) => {
    setProcessando(true);
    try {
      if (aprovar) {
        if (solicitacao.tipo === 'delecao') {
          await supabase.from('filmes').delete().eq('id', solicitacao.filme_id);
        } else if (solicitacao.tipo === 'edicao') {
          const { categorias, ...dadosFilme } = solicitacao.dados_novos;

          await supabase
            .from('filmes')
            .update(dadosFilme)
            .eq('id', solicitacao.filme_id);

          if (categorias) {
            await supabase
              .from('filmes_categorias')
              .delete()
              .eq('filme_id', solicitacao.filme_id);

            // Removemos a anotação de tipo ': string'
            await supabase.from('filmes_categorias').insert(
              categorias.map((catId) => ({
                filme_id: solicitacao.filme_id,
                categoria_id: catId,
              }))
            );
          }
        }
      }

      await supabase
        .from('solicitacoes_edicao')
        .update({
          status: aprovar ? 'aprovado' : 'rejeitado',
          reviewed_at: new Date().toISOString(),
          reviewed_by: perfil?.id,
        })
        .eq('id', solicitacaoId);

      alert(aprovar ? 'Solicitação aprovada!' : 'Solicitação rejeitada');
      await carregarDados();
    } catch (error) {
      console.error('Erro ao processar solicitação:', error);
      alert('Erro ao processar solicitação');
    } finally {
      setProcessando(false);
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

        <section className="adminSecao">
          <h2 className="adminSecaoTitulo">
            Filmes Aguardando Aprovação ({filmesAprovacao.length})
          </h2>

          {filmesAprovacao.length === 0 ? (
            <p className="adminVazio">Nenhum filme aguardando aprovação</p>
          ) : (
            <div className="adminGrid">
              {filmesAprovacao.map((filme) => (
                <article key={filme.id} className="adminCard">
                  <div className="adminCardImagem">
                    {filme.poster_url ? (
                      <img src={filme.poster_url} alt={filme.titulo} />
                    ) : (
                      <div className="adminCardPlaceholder">
                        <span>{filme.titulo[0]}</span>
                      </div>
                    )}
                  </div>

                  <div className="adminCardInfo">
                    <h3 className="adminCardTitulo">{filme.titulo}</h3>
                    <p className="adminCardAno">{filme.ano}</p>
                    <p className="adminCardUsuario">Por: {filme.usuario_nome}</p>

                    <div className="adminCardAcoes">
                      <button
                        className="adminBotao adminBotaoAprovar"
                        onClick={() => aprovarFilme(filme.id)}
                        disabled={processando}
                      >
                        <Check size={18} />
                        <span>Aprovar</span>
                      </button>

                      <button
                        className="adminBotao adminBotaoRejeitar"
                        onClick={() => rejeitarFilme(filme.id)}
                        disabled={processando}
                      >
                        <X size={18} />
                        <span>Rejeitar</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="adminSecao">
          <h2 className="adminSecaoTitulo">
            Solicitações de Edição/Deleção ({solicitacoes.length})
          </h2>

          {solicitacoes.length === 0 ? (
            <p className="adminVazio">Nenhuma solicitação pendente</p>
          ) : (
            <div className="adminLista">
              {/* Removemos a anotação de tipo (solic: any) */}
              {solicitacoes.map((solic) => (
                <article key={solic.id} className="adminSolicitacao">
                  <div className="adminSolicitacaoInfo">
                    <h3 className="adminSolicitacaoTitulo">
                      {solic.tipo === 'delecao' ? 'Deleção' : 'Edição'} -{' '}
                      {solic.filmes?.titulo}
                    </h3>
                    <p className="adminSolicitacaoUsuario">
                      Solicitado por: {solic.perfis?.nome}
                    </p>
                    {solic.tipo === 'edicao' && (
                      <div className="adminSolicitacaoDetalhes">
                        <p>Título: {solic.dados_novos.titulo}</p>
                        <p>Ano: {solic.dados_novos.ano}</p>
                      </div>
                    )}
                  </div>

                  <div className="adminSolicitacaoAcoes">
                    <button
                      className="adminBotao adminBotaoAprovar"
                      onClick={() => processarSolicitacao(solic.id, true, solic)}
                      disabled={processando}
                    >
                      <Check size={18} />
                      <span>Aprovar</span>
                    </button>

                    <button
                      className="adminBotao adminBotaoRejeitar"
                      onClick={() => processarSolicitacao(solic.id, false, solic)}
                      disabled={processando}
                    >
                      <X size={18} />
                      <span>Rejeitar</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default PainelAdmin;