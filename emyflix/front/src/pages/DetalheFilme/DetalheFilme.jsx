import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Verifique se o caminho está correto
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import './DetalheFilme.css'; // O CSS que você já tinha

// Removemos a 'interface'
function DetalheFilme({ filmeId, onNavegar }) {
  const { perfil } = useAuth();
  // Removemos os tipos <...>
  const [filme, setFilme] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [deletando, setDeletando] = useState(false);

  useEffect(() => {
    carregarFilme();
  }, [filmeId]);

  const carregarFilme = async () => {
    setCarregando(true);
    setErro('');
    try {
      const { data, error } = await supabase
        .from('filmes')
        .select(`
          *,
          filmes_categorias (
            categorias (
              id,
              nome
            )
          )
        `)
        .eq('id', filmeId)
        .eq('aprovado', true) // Ou remova se quiser ver os não aprovados
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Filme não encontrado');

      // Formata os dados para facilitar o uso
      const filmeFormatado = {
        ...data,
        categorias: data.filmes_categorias.map(fc => fc.categorias),
      };
      setFilme(filmeFormatado);

    } catch (err) {
      console.error('Erro ao carregar filme:', err);
      setErro(err.message || 'Não foi possível carregar o filme.');
    } finally {
      setCarregando(false);
    }
  };

  const handleDeletar = async () => {
    if (!filme || !perfil?.is_admin) return;

    setDeletando(true);
    try {
      // 1. Deletar da tabela 'filmes_categorias'
      await supabase.from('filmes_categorias').delete().eq('filme_id', filme.id);
      
      // 2. Deletar da tabela 'filmes'
      await supabase.from('filmes').delete().eq('id', filme.id);

      alert('Filme deletado com sucesso!');
      onNavegar('home');

    } catch (error) {
      console.error('Erro ao deletar filme:', error);
      alert('Erro ao deletar o filme.');
      setDeletando(false);
      setMostrarModal(false);
    }
  };

  if (carregando) {
    return (
      <div className="detalheCarregando">
        <div className="detalheSpinner" />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="detalheErro">
        <p>{erro}</p>
        <button onClick={() => onNavegar('home')} className="detalheBotaoVoltar">
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>
    );
  }

  if (!filme) return null; // Não deve acontecer se o 'erro' for tratado

  return (
    <div className="detalhe">
      <Navbar onNavegar={onNavegar} />
      
      <div className="detalheContainer">
        <button className="detalheBotaoVoltar" onClick={() => onNavegar('home')}>
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <div className="detalheConteudo">
          <div className="detalhePoster">
            {filme.poster_url ? (
              <img src={filme.poster_url} alt={filme.titulo} />
            ) : (
              <div className="detalhePlaceholder">
                <span>{filme.titulo[0]}</span>
              </div>
            )}
          </div>

          <div className="detalheInfo">
            <h1 className="detalheTitulo">{filme.titulo}</h1>
            
            <div className="detalheMetadata">
              <span className="detalheAno">{filme.ano}</span>
              <div className="detalheCategorias">
                {filme.categorias.map((cat) => (
                  <span key={cat.id} className="detalheCategoria">
                    {cat.nome}
                  </span>
                ))}
              </div>
            </div>

            <div className="detalheSecao">
              <h2 className="detalheSecaoTitulo">Sinopse</h2>
              <p className="detalheSinopse">{filme.sinopse}</p>
            </div>

            {/* (Opcional) Adicione Diretor e Elenco se quiser */}

            {perfil?.is_admin && (
              <div className="detalheAcoes">
                <button
                  className="detalheBotao detalheBotaoEditar"
                  onClick={() => onNavegar('editar', { id: filme.id })}
                >
                  <Edit size={18} />
                  <span>Editar</span>
                </button>
                <button
                  className="detalheBotao detalheBotaoDeletar"
                  onClick={() => setMostrarModal(true)}
                >
                  <Trash2 size={18} />
                  <span>Deletar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mostrarModal && (
        <div className="modal">
          <div className="modalConteudo">
            <h2 className="modalTitulo">Confirmar Exclusão</h2>
            <p className="modalTexto">
              Tem certeza que deseja deletar o filme "{filme.titulo}"? Esta ação não pode ser desfeita.
            </p>
            <div className="modalAcoes">
              <button
                className="modalBotao modalBotaoCancelar"
                onClick={() => setMostrarModal(false)}
                disabled={deletando}
              >
                Cancelar
              </button>
              <button
                className="modalBotao modalBotaoConfirmar"
                onClick={handleDeletar}
                disabled={deletando}
              >
                {deletando ? 'Deletando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalheFilme;