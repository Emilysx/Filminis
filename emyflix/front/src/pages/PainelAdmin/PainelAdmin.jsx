import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import FilmeCarrossel from '../../components/FilmeCarrossel/FilmeCarrossel'; 
import CardFilme from '../../components/CardFilme/CardFilme';
import './PainelAdmin.css';

function PainelAdmin({ onNavegar }) {
  const { user, token } = useAuth();
  const [filmesAprovacao, setFilmesAprovacao] = useState([]);
  const [carregando, setCarregando] = useState(true);

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
      const response = await fetch('http://localhost:8000/admin/solicitacoes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao buscar solicitações');
      
      const data = await response.json();
      setFilmesAprovacao(data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setCarregando(false);
    }
  };

  // 3. NOVA FUNÇÃO DE NAVEGAÇÃO
  // Manda o admin para a página de detalhes da solicitação
  const handleVerDetalhe = (solicitacaoId) => {
    onNavegar('detalhe-aprovacao', { id: solicitacaoId });
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
            // 4. SUBSTITUI O .adminGrid PELO NOVO CARROSSEL
            <FilmeCarrossel
              titulo="" // Não precisamos de título aqui
              filmes={filmesAprovacao}
              onFilmeClick={handleVerDetalhe} // Chama a nova função
            />
          )}
        </section>

        {/* (Aqui virá a seção de 'Solicitações de Edição') */}
        
      </div>
    </div>
  );
}

export default PainelAdmin;