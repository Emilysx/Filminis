import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import { ArrowLeft } from 'lucide-react';
import './CadastroFilmes.css';

// Lista de linguagens (baseada no seu SQL)
const linguagensDisponiveis = [
  { id: 1, nome: 'Português' }, { id: 2, nome: 'Inglês' },
  { id: 3, nome: 'Espanhol' }, { id: 4, nome: 'Francês' },
  { id: 5, nome: 'Alemão' }, { id: 6, nome: 'Italiano' },
  { id: 7, nome: 'Japonês' }, { id: 8, nome: 'Coreano' },
  { id: 9, nome: 'Mandarim' }, { id: 10, nome: 'Hindi' },
];

function CadastroFilmes({ onNavegar }) {
  const { token } = useAuth();
  
  // States (lógica não muda)
  const [formData, setFormData] = useState({
    titulo: '', ano: '', duracao: '',
    poster_url: '', sinopse: '', id_linguagem: '1',
    diretores_texto: '', atores_texto: ''
  });
  const [generosDisponiveis, setGenerosDisponiveis] = useState([]);
  const [generosSelecionados, setGenerosSelecionados] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  // useEffect para buscar gêneros (lógica não muda)
  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        const response = await fetch('http://localhost:8000/generos', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao buscar gêneros');
        const data = await response.json();
        setGenerosDisponiveis(data);
        const estadoInicial = {};
        data.forEach(genero => { estadoInicial[genero.nome] = false; });
        setGenerosSelecionados(estadoInicial);
      } catch (err) {
        setErro('Erro ao carregar gêneros: ' + err.message);
      }
    };
    fetchGeneros();
  }, [token]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setGenerosSelecionados(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    const nomesGeneros = Object.keys(generosSelecionados).filter(
      nome => generosSelecionados[nome]
    );
    
    if (nomesGeneros.length === 0) {
      setErro("Por favor, selecione pelo menos um gênero.");
      setCarregando(false);
      return;
    }
    
    const generos_texto_final = nomesGeneros.join(', ');
    const dadosCompletos = { ...formData, generos_texto: generos_texto_final };

    try {
      const response = await fetch('http://localhost:8000/filmes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosCompletos)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.erro);
      alert('Filme enviado para aprovação!');
      onNavegar('home'); 
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="formularioFilme"> 
      <Navbar onNavegar={onNavegar} />
      <div className="formularioContainer">
        
        <button className="formularioBotaoVoltar" onClick={() => onNavegar('home')}>
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <div className="formularioCard">
          <h1 className="formularioTitulo">Adicionar Novo Filme</h1>
          <p className="formularioSubtitulo">
            O filme que você adicionar será enviado para um administrador aprovar.
          </p>

          <form className="formularioForm" onSubmit={handleSubmit}>
            
            {/* === INÍCIO DA ESTRUTURA DE 2 COLUNAS === */}
            <div className="formLayoutGrid">
              
              {/* --- COLUNA DA ESQUERDA --- */}
              <div className="colunaEsquerda">
                <div className="inputGroup">
                  <label htmlFor="titulo">Título *</label>
                  <input id="titulo" name="titulo" type="text"  placeholder="Ex: Enrolados"
                    value={formData.titulo} onChange={handleChange} required
                  />
                </div>

                <div className="formularioGrid">
                  <div className="inputGroup">
                    <label htmlFor="ano">Ano *</label>
                    <input id="ano" name="ano" type="number" placeholder="Ex: 2010"
                      value={formData.ano} onChange={handleChange} required
                    />
                  </div>
                  <div className="inputGroup">
                    <label htmlFor="duracao">Duração *</label>
                    <input id="duracao" name="duracao" type="text"
                      placeholder="Ex: 1h 40m"
                      value={formData.duracao} onChange={handleChange} required
                    />
                  </div>
                </div>
                
                <div className="inputGroup">
                  <label htmlFor="id_linguagem">Linguagem *</label>
                  <select id="id_linguagem" name="id_linguagem"
                    value={formData.id_linguagem} onChange={handleChange} required
                  >
                    {linguagensDisponiveis.map((lang) => (
                      <option key={lang.id} value={lang.id}>{lang.nome}</option>
                    ))}
                  </select>
                </div>
                
                <div className="inputGroup">
                  <label htmlFor="poster_url">URL do Pôster *</label>
                  <input id="poster_url" name="poster_url" type="text" placeholder="Ex: https://linkdaimagem"
                    value={formData.poster_url} onChange={handleChange} required
                  />
                </div>

                <div className="inputGroup">
                  <label htmlFor="atores_texto">Personagens (separados por vírgula)</label>
                  <input id="atores_texto" name="atores_texto" type="text" placeholder="Ex: Rapunzel, Flynn Rider, Mãe Gothel"
                    value={formData.atores_texto} onChange={handleChange}
                  />
                </div>

              </div>

              {/* --- COLUNA DA DIREITA --- */}
              <div className="colunaDireita">

                <div className="inputGroup">
                  <label htmlFor="diretores_texto">Direção (separados por vírgula)</label>
                  <input id="diretores_texto" name="diretores_texto" type="text" placeholder="Ex: Nathan Greno, Byron Howard"
                    value={formData.diretores_texto} onChange={handleChange}
                  />
                </div>

                <div className="inputGroup">
                  <label htmlFor="sinopse">Sinopse *</label>
                  <textarea id="sinopse" name="sinopse" rows={8} placeholder="Ex: O bandido mais procurado do reino, Flynn Rider, se esconde em uma torre e acaba prisioneiro de Rapunzel, residente de longa data do local. Dona de cabelos dourados e mágicos com 21 metros de comprimento, ela está trancada há anos e deseja desesperadamente a liberdade."
                    value={formData.sinopse} onChange={handleChange} required
                  />
                </div>
                
                <div className="inputGroup">
                  <label>Gêneros *</label>
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

              {erro && <div className="formularioErro">{erro}</div>}

            </div>
            <button type="submit" className="formularioBotaoSubmit" disabled={carregando}>
              {carregando ? 'Enviando...' : 'Enviar para Aprovação'}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
}

export default CadastroFilmes;