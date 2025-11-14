import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; // Pega o usuário e o token
import Navbar from '../../components/Navbar/Navbar'; // Reutiliza a Navbar
import './DetalheFilme.css'; // O CSS que vamos criar a seguir

// Recebe 'filmeId' e 'onNavegar' do App.jsx
function DetalheFilme({ filmeId, onNavegar }) {
  const { user, token } = useAuth(); // Pega o usuário (para saber se é admin) e o token
  
  const [filme, setFilme] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  
  // Lógica do Modal de Deletar (do seu arquivo original)
  const [mostrarModal, setMostrarModal] = useState(false);
  const [deletando, setDeletando] = useState(false);

  // Efeito para buscar os dados do filme no back-end
  useEffect(() => {
    const carregarFilme = async () => {
      setCarregando(true);
      setErro('');
      try {
        // 1. CHAMA O NOSSO BACK-END PYTHON
        const response = await fetch(`http://localhost:8000/filmes/${filmeId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}` // Envia o "crachá"
          }
        });

        if (!response.ok) {
          const dataErro = await response.json();
          throw new Error(dataErro.erro || 'Filme não encontrado');
        }

        const data = await response.json();
        
        // 2. O back-end já manda os dados prontos!
        // (generos, diretores, atores já são listas)
        setFilme(data);

      } catch (err) {
        console.error('Erro ao carregar filme:', err);
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };

    carregarFilme();
  }, [filmeId, token]); // Roda de novo se o ID do filme ou o token mudar

  // Função para deletar (só para admins)
  const handleDeletar = async () => {
    if (!filme || user.role !== 'adm') return;

    setDeletando(true);
    try {
      // 3. CHAMA O ENDPOINT DE DELETE DO NOSSO BACK-END
      const response = await fetch(`http://localhost:8000/filmes/${filme.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao deletar filme');
      }

      alert('Filme deletado com sucesso!');
      onNavegar('home'); // Volta para a Home

    } catch (error) {
      console.error('Erro ao deletar filme:', error);
      alert(error.message);
      setDeletando(false);
      setMostrarModal(false);
    }
  };

  // --- Telas de Carregando e Erro ---
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
          <span>Voltar para Home</span>
        </button>
      </div>
    );
  }

  if (!filme) return null; 

  // --- Renderização da Página Principal ---
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

          {/* Coluna da Direita (Informações) */}
          <div className="detalheInfo">
            <h1 className="detalheTitulo">{filme.titulo}</h1>
            
            <div className="detalheMetadata">
              <span className="detalheAno">{filme.ano}</span>
              {/* CAMPO NOVO: DURAÇÃO */}
              <span className="detalheDuracao">{filme.duracao}</span>
              
              <div className="detalheCategorias">
                {filme.generos.map((genero) => (
                  <span key={genero} className="detalheCategoria">
                    {genero}
                  </span>
                ))}
              </div>
            </div>

            <div className="detalheSecao">
              <h2 className="detalheSecaoTitulo">Sinopse</h2>
              <p className="detalheSinopse">{filme.sinopse}</p>
            </div>

            {/* CAMPO NOVO: PERSONAGENS (atores) */}
            <div className="detalheSecao">
              <h2 className="detalheSecaoTitulo">Personagens Principais</h2>
              <p className="detalheLista">{filme.atores.join(', ')}</p>
            </div>
            
            {/* CAMPO NOVO: DIRETORES */}
            <div className="detalheSecao">
              <h2 className="detalheSecaoTitulo">Direção</h2>
              <p className="detalheLista">{filme.diretores.join(', ')}</p>
            </div>


            {/* Botões de Admin (só aparecem se user.role === 'adm') */}
            {user?.role === 'adm' && (
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

      {/* Modal de Confirmação (do seu arquivo original) */}
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