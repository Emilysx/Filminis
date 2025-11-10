import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CardFilme from '../CardFilme/CardFilme';
import './FilmeCarrossel.css';

function FilmeCarrossel({ titulo, filmes, onFilmeClick }) {
  const [scrollX, setScrollX] = useState(0);
  const LARGURA_ITEM = 200 + 24;

  const handleScrollLeft = () => {
    let newScrollX = scrollX + Math.round(window.innerWidth / 2);
    if (newScrollX > 0) {
      newScrollX = 0;
    }
    setScrollX(newScrollX);
  };

  const handleScrollRight = () => {
    let newScrollX = scrollX - Math.round(window.innerWidth / 2);
    
    const maxScroll = (filmes.length * LARGURA_ITEM) - window.innerWidth + 48; // +48px de padding
    if (Math.abs(newScrollX) > maxScroll) {
      newScrollX = -maxScroll;
    }
    setScrollX(newScrollX);
  };

  return (
    <section className="filmeCarrossel">
      <h2 className="filmeCarrosselTitulo">{titulo}</h2>
      
      {/* Seta da Esquerda */}
      <div className="filmeCarrosselSeta setaEsquerda" onClick={handleScrollLeft}>
        <ChevronLeft size={40} />
      </div>
      {/* Seta da Direita */}
      <div className="filmeCarrosselSeta setaDireita" onClick={handleScrollRight}>
        <ChevronRight size={40} />
      </div>

      <div className="filmeCarrosselListaArea">
        <div 
          className="filmeCarrosselLista" 
          style={{ 
            marginLeft: scrollX, 
            width: filmes.length * LARGURA_ITEM 
          }}
        >
          {filmes.map((filme) => (
            <CardFilme
              key={filme.id}
              filme={filme}
              onClick={() => onFilmeClick(filme.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FilmeCarrossel;