import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// A importação 'FilmeComCategorias' foi removida (era um tipo)
import './Carrossel.css';

// A 'interface CarrosselProps' foi removida

function Carrossel({ filmes, onFilmeClick }) { // Remove a tipagem ': CarrosselProps'
  const [indiceAtual, setIndiceAtual] = useState(0);

  useEffect(() => {
    if (filmes.length === 0) return;

    const intervalo = setInterval(() => {
      setIndiceAtual((prev) => (prev + 1) % filmes.length);
    }, 5000);

    return () => clearInterval(intervalo);
  }, [filmes.length]);

  const anterior = () => {
    setIndiceAtual((prev) => (prev - 1 + filmes.length) % filmes.length);
  };

  const proximo = () => {
    setIndiceAtual((prev) => (prev + 1) % filmes.length);
  };

  if (filmes.length === 0) {
    return null;
  }

  const filmeAtual = filmes[indiceAtual];

  return (
    <section className="carrossel">
      <div className="carrosselContainer">
        <div className="carrosselImagem">
          {filmeAtual.poster_url ? (
            <img src={filmeAtual.poster_url} alt={filmeAtual.titulo} />
          ) : (
            <div className="carrosselPlaceholder">
              <span>{filmeAtual.titulo[0]}</span>
            </div>
          )}
          <div className="carrosselGradiente" />
        </div>

        <div className="carrosselInfo">
          <h2 className="carrosselTitulo">{filmeAtual.titulo}</h2>
          <p className="carrosselAno">{filmeAtual.ano}</p>
          {filmeAtual.categorias && filmeAtual.categorias.length > 0 && (
            <div className="carrosselCategorias">
              {filmeAtual.categorias.map((cat) => (
                <span key={cat.id} className="carrosselCategoria">
                  {cat.nome}
                </span>
              ))}
            </div>
          )}
          <p className="carrosselSinopse">{filmeAtual.sinopse}</p>
          <button
            type="button"
            className="carrosselBotao"
            onClick={() => onFilmeClick(filmeAtual.id)}
          >
            Ver Detalhes
          </button>
        </div>

        <button
          type="button"
          className="carrosselControle carrosselControleEsquerda"
          onClick={anterior}
        >
          <ChevronLeft size={32} />
        </button>

        <button
          type="button"
          className="carrosselControle carrosselControleDireita"
          onClick={proximo}
        >
          <ChevronRight size={32} />
        </button>

        <div className="carrosselIndicadores">
          {filmes.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`carrosselIndicador ${index === indiceAtual ? 'ativo' : ''}`}
              onClick={() => setIndiceAtual(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Carrossel;