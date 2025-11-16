import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import './DetalheFilme.css'; 
import Footer from '../../components/Footer/Footer';

// --- LISTAS (para preencher o formulário) 
const linguagensDisponiveis = [
  { id: 1, nome: 'Português' }, { id: 2, nome: 'Inglês' },
  { id: 3, nome: 'Espanhol' }, { id: 4, nome: 'Francês' },
  { id: 5, nome: 'Alemão' }, { id: 6, nome: 'Italiano' },
  { id: 7, nome: 'Japonês' }, { id: 8, nome: 'Coreano' },
  { id: 9, nome: 'Mandarim' }, { id: 10, nome: 'Hindi' },
];

// FUNÇÃO AUXILIAR DE HISTÓRICO 
const adicionarAoHistorico = (filmeId) => {
  let historico = JSON.parse(localStorage.getItem('historico_filmes')) || [];
  historico = historico.filter(id => id !== filmeId);
  historico.unshift(filmeId);
  historico = historico.slice(0, 10);
  localStorage.setItem('historico_filmes', JSON.stringify(historico));
};


function DetalheFilme({ filmeId, onNavegar }) {
  const { user, token } = useAuth();
  
  const [filme, setFilme] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  
  const [mostrarModalDelete, setMostrarModalDelete] = useState(false);
  const [deletando, setDeletando] = useState(false);

  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  const [editCarregando, setEditCarregando] = useState(false);
  const [editErro, setEditErro] = useState('');
  
  const [editFormData, setEditFormData] = useState({
    titulo: '', ano: '', duracao: '', poster_url: '', sinopse: '',
    id_linguagem: '1', diretores_texto: '', atores_texto: ''
  });
  const [generosDisponiveis, setGenerosDisponiveis] = useState([]);
  const [generosSelecionados, setGenerosSelecionados] = useState({});
  
  // Efeito que busca os dados do filme
  useEffect(() => {
    const carregarFilme = async () => {
      setCarregando(true);
      setErro('');
      try {
        const response = await fetch(`http://localhost:8000/filmes/${filmeId}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          const dataErro = await response.json();
          throw new Error(dataErro.erro || 'Filme não encontrado');
        }
        const data = await response.json();
        setFilme(data);
        adicionarAoHistorico(data.id);

        setEditFormData({
          titulo: data.titulo,
          ano: data.ano,
          duracao: data.duracao,
          poster_url: data.poster_url,
          sinopse: data.sinopse,
          id_linguagem: linguagensDisponiveis.find(l => l.nome === data.linguagem)?.id || '1',
          diretores_texto: data.diretores.join(', '),
          atores_texto: data.atores.join(', ')
        });
        
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };
    carregarFilme();
  }, [filmeId, token]);
  
  // Efeito para carregar os Gêneros (para o modal)
  useEffect(() => {
    if (mostrarModalEdicao && generosDisponiveis.length === 0) {
      const fetchGeneros = async () => {
        try {
          const response = await fetch('http://localhost:8000/generos', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) throw new Error('Falha ao buscar gêneros');
          const data = await response.json();
          setGenerosDisponiveis(data);
          
          const estadoInicial = {};
          data.forEach(genero => {
            estadoInicial[genero.nome] = filme.generos.includes(genero.nome);
          });
          setGenerosSelecionados(estadoInicial);
          
        } catch (err) {
          setEditErro('Erro ao carregar gêneros: ' + err.message);
        }
      };
      fetchGeneros();
    }
  }, [mostrarModalEdicao, token, generosDisponiveis.length, filme]);
  
  // Função para Deletar (SÓ ADMIN)
  const handleDeletar = async () => {
    if (!filme || user.role !== 'adm') return;
    setDeletando(true);
    try {
      const response = await fetch(`http://localhost:8000/filmes/${filme.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.erro || 'Erro ao deletar');
      
      alert('Filme deletado com sucesso!');
      onNavegar('home');
    } catch (error) {
      alert(error.message);
      setDeletando(false);
      setMostrarModalDelete(false);
    }
  };

  // Funções do Modal de Edição
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setGenerosSelecionados(prev => ({ ...prev, [name]: checked }));
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    setEditCarregando(true);
    setEditErro('');

    // Converte os checkboxes em string (lógica atual)
    const nomesGeneros = Object.keys(generosSelecionados).filter(
      nome => generosSelecionados[nome]
    );
    if (nomesGeneros.length === 0) {
      setEditErro("Selecione pelo menos um gênero.");
      setEditCarregando(false);
      return;
    }
    const generos_texto_final = nomesGeneros.join(', ');
    
    // Junta os dados completos
    const dadosCompletos = {
      ...editFormData,
      generos_texto: generos_texto_final
    };

   
    let url = '';
    let alertMessage = '';

    if (user.role === 'adm') {
      // ADMIN: Edita o filme DIRETAMENTE
      url = `http://localhost:8000/admin/filmes/${filme.id}`;
      alertMessage = 'Filme atualizado com sucesso!';
    } else {
      // USUÁRIO COMUM: Envia para aprovação
      url = `http://localhost:8000/filmes/${filme.id}`;
      alertMessage = 'Sua solicitação de edição foi enviada para aprovação!';
    }
  
    try {
      const response = await fetch(url, { // <-- Usa a URL dinâmica
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosCompletos)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.erro || 'Erro ao enviar edição');
      
      alert(alertMessage); // <-- Usa a mensagem dinâmica
      setMostrarModalEdicao(false);
      window.location.reload(); 
      
    } catch (err) {
      setEditErro(err.message);
    } finally {
      setEditCarregando(false);
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
          
          <div className="detalheInfo">
            <h1 className="detalheTitulo">{filme.titulo}</h1>
            
            <div className="detalheMetadata">
              <span className="detalheAno">{filme.ano}</span>
              <span className="detalheDuracao">{filme.duracao}</span>
              <div className="detalheCategorias">
                {filme.generos.map((genero) => (
                  <span key={genero} className="detalheCategoria">{genero}</span>
                ))}
              </div>
            </div>

            <div className="detalheSecao">
              <h2 className="detalheSecaoTitulo">Sinopse</h2>
              <p className="detalheSinopse">{filme.sinopse}</p>
            </div>
            
            <div className="detalheSecao">
              <h2 className="detalheSecaoTitulo">Personagens Principais</h2>
              <p className="detalheLista">{filme.atores.join(', ')}</p>
            </div>
            
            <div className="detalheGridInfo">
              <div className="detalheColunaInfo">
                <div className="detalheSecao">
                  <h2 className="detalheSecaoTitulo">Direção</h2>
                  <p className="detalheLista">{filme.diretores.join(', ')}</p>
                </div>
              </div>
              <div className="detalheColunaInfo">
                <div className="detalheSecao">
                  <h2 className="detalheSecaoTitulo">Linguagem</h2>
                  <p className="detalheLista">{filme.linguagem}</p>
                </div>
              </div>
            </div>

            <div className="detalheAcoes">
              <button
                className="detalheBotao detalheBotaoEditar"
                onClick={() => setMostrarModalEdicao(true)}
              >
                <Edit size={18} />
                <span>Sugerir Edição</span>
              </button>
              
              {user?.role === 'adm' && (
                <button
                  className="detalheBotao detalheBotaoDeletar"
                  onClick={() => setMostrarModalDelete(true)}
                >
                  <Trash2 size={18} />
                  <span>Deletar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Deletar */}
      {mostrarModalDelete && (
        <div className="modal">
          <div className="modalConteudo">
            <h2 className="modalTitulo">Confirmar Exclusão</h2>
            <p className="modalTexto">
              Tem certeza que deseja deletar o filme "{filme.titulo}"? Esta ação não pode ser desfeita.
            </p>
            <div className="modalAcoes">
              <button
                type="button"
                className="modalBotao modalBotaoCancelar"
                onClick={() => setMostrarModalDelete(false)}
                disabled={deletando}
              >
                Cancelar
              </button>
              <button
                type="button"
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

      {/* MODAL DE EDIÇÃO */}
      {mostrarModalEdicao && (
        <div className="modal">
          <form className="modalConteudo modalForm" onSubmit={handleSalvarEdicao}>
            <h2 className="modalTitulo">Sugerir Edição</h2>
            <p className="modalTexto">
              Suas alterações serão enviadas para um administrador aprovar.
            </p>

            {/* --- Linha 1: Título --- */}
            <div className="modalInputGroup">
              <label htmlFor="titulo">Título</label>
              <input id="titulo" name="titulo" type="text" className="modalInput"
                value={editFormData.titulo} onChange={handleEditFormChange}
              />
            </div>
            
            {/* --- Linha 2: Ano, Duração, Linguagem (Sua sugestão) --- */}
            <div className="modalInputGridLinha">
              <div className="modalInputGroup">
                <label htmlFor="ano">Ano</label>
                <input id="ano" name="ano" type="number" className="modalInput"
                  value={editFormData.ano} onChange={handleEditFormChange}
                />
              </div>
              <div className="modalInputGroup">
                <label htmlFor="duracao">Duração</label>
                <input id="duracao" name="duracao" type="text" className="modalInput"
                  value={editFormData.duracao} onChange={handleEditFormChange}
                />
              </div>
              <div className="modalInputGroup">
                <label htmlFor="id_linguagem">Linguagem</label>
                <select id="id_linguagem" name="id_linguagem" className="modalInput"
                  value={editFormData.id_linguagem} onChange={handleEditFormChange}
                >
                  {linguagensDisponiveis.map((lang) => (
                    <option key={lang.id} value={lang.id}>{lang.nome}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* --- Linha 3: URL do Pôster --- */}
            <div className="modalInputGroup">
              <label htmlFor="poster_url">URL do Pôster</label>
              <input id="poster_url" name="poster_url" type="text" className="modalInput"
                value={editFormData.poster_url} onChange={handleEditFormChange}
              />
            </div>

            {/* --- Linha 4: Personagens e Direção (Sua sugestão) --- */}
            <div className="modalFormGrid">
              <div className="modalInputGroup">
                <label htmlFor="atores_texto">Personagens (separados por vírgula)</label>
                <input id="atores_texto" name="atores_texto" type="text" className="modalInput"
                  value={editFormData.atores_texto} onChange={handleEditFormChange}
                />
              </div>
              <div className="modalInputGroup">
                <label htmlFor="diretores_texto">Direção (separados por vírgula)</label>
                <input id="diretores_texto" name="diretores_texto" type="text" className="modalInput"
                  value={editFormData.diretores_texto} onChange={handleEditFormChange}
                />
              </div>
            </div>

            {/* --- Linha 5: Sinopse e Gêneros (Sua sugestão) --- */}
            <div className="modalFormGrid">
              <div className="modalInputGroup modalInputGroupStretched">
                <label htmlFor="sinopse">Sinopse</label>
                <textarea id="sinopse" name="sinopse" className="modalTextarea"
                  value={editFormData.sinopse} onChange={handleEditFormChange}
                />
              </div>
              <div className="modalInputGroup">
                <label>Gêneros</label>
                <div className="checkboxGrid">
                  {generosDisponiveis.map((genero) => (
                    <label key={genero.id} className="checkboxLabel">
                      <input 
                        type="checkbox"
                        name={genero.nome}
                        checked={generosSelecionados[genero.nome] || false}
                        onChange={handleCheckboxChange}
                      />
                      {genero.nome}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {/* --- FIM DO LAYOUT --- */}

            
            {editErro && <div className="modalErro">{editErro}</div>}

            <div className="modalAcoes">
              <button
                type="button"
                className="modalBotao modalBotaoCancelar"
                onClick={() => setMostrarModalEdicao(false)}
                disabled={editCarregando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="modalBotao modalBotaoConfirmar confirmarEditar"
                disabled={editCarregando}
              >
                {editCarregando ? 'Enviando...' : 'Enviar para Aprovação'}
              </button>
            </div>
          </form>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default DetalheFilme;