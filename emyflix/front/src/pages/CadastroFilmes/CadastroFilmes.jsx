import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import { ArrowLeft } from 'lucide-react';
import './CadastroFilmes.css'

function CadastroFilmes({ onNavegar }) {
  const { token } = useAuth(); 
  
  const [formData, setFormData] = useState({
    titulo: '',
    ano: '',
    duracao: '',
    poster_url: '',
    sinopse: '',
    generos_texto: '',
    diretores_texto: '',
    atores_texto: ''
  });
  
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      const response = await fetch('http://localhost:8000/filmes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Não foi possível enviar o filme.');
      }

      alert('Filme enviado para aprovação do administrador!');
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
          <span>Voltar para Home</span>
        </button>

        <div className="formularioCard">
          <h1 className="formularioTitulo">Adicionar Novo Filme</h1>
          <p className="modalTexto" style={{textAlign: 'center', marginTop: '-1.5rem', marginBottom: '2rem'}}>
            O filme que você adicionar será enviado para um administrador aprovar.
          </p>

          <form className="formularioForm" onSubmit={handleSubmit}>
            
            <div className="inputGroup">
              <label htmlFor="titulo">Título *</label>
              <input 
                id="titulo" name="titulo" type="text"
                placeholder="Ex: Divertida Mente 2"
                value={formData.titulo} onChange={handleChange} required
              />
            </div>

            <div className="formularioGrid">
              <div className="inputGroup">
                <label htmlFor="ano">Ano *</label>
                <input 
                  id="ano" name="ano" type="number"
                  placeholder="Ex: 2024"
                  value={formData.ano} onChange={handleChange} required
                />
              </div>
              <div className="inputGroup">
                <label htmlFor="duracao">Duração *</label>
                <input 
                  id="duracao" name="duracao" type="text"
                  placeholder="Ex: 1h 36m"
                  value={formData.duracao} onChange={handleChange} required
                />
              </div>
            </div>

            <div className="inputGroup">
              <label htmlFor="poster_url">URL do Pôster *</label>
              <input 
                id="poster_url" name="poster_url" type="text"
                placeholder="Ex: https://.../imagem.jpg"
                value={formData.poster_url} onChange={handleChange} required
              />
            </div>

            <div className="inputGroup">
              <label htmlFor="sinopse">Sinopse *</label>
              <textarea 
                id="sinopse" name="sinopse"
                placeholder="Descreva o filme..."
                rows={4}
                value={formData.sinopse} onChange={handleChange} required
              />
            </div>

            <div className="inputGroup">
              <label htmlFor="generos_texto">Gêneros</label>
              <input 
                id="generos_texto" name="generos_texto" type="text"
                placeholder="Ex: Animação, Comédia, Família"
                value={formData.generos_texto} onChange={handleChange}
              />
              <span className="inputDica">Separe os gêneros por vírgula</span>
            </div>
            
            <div className="inputGroup">
              <label htmlFor="atores_texto">Personagens Principais</label>
              <input 
                id="atores_texto" name="atores_texto" type="text"
                placeholder="Ex: Alegria, Ansiedade, Tristeza"
                value={formData.atores_texto} onChange={handleChange}
              />
              <span className="inputDica">Separe os personagens por vírgula</span>
            </div>

            <div className="inputGroup">
              <label htmlFor="diretores_texto">Direção</label>
              <input 
                id="diretores_texto" name="diretores_texto" type="text"
                placeholder="Ex: Kelsey Mann"
                value={formData.diretores_texto} onChange={handleChange}
              />
              <span className="inputDica">Separe os diretores por vírgula</span>
            </div>

            {erro && <div className="formularioErro">{erro}</div>}

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