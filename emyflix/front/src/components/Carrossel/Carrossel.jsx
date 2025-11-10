import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; 
import './Carrossel.css';

function Carrossel({ filmes, onFilmeClick }) {
  const [indiceAtual, setIndiceAtual] = useState(0);

  // Efeito para trocar o slide automaticamente a cada 5 segundos
  useEffect(() => {
    if (filmes.length === 0) return;
    const intervalo = setInterval(() => {
      setIndiceAtual((prev) => (prev + 1) % filmes.length);
    }, 5000);
    return () => clearInterval(intervalo);
  }, [filmes.length]);

  // Funções para os botões de seta
  const anterior = () => setIndiceAtual((prev) => (prev - 1 + filmes.length) % filmes.length);
  const proximo = () => setIndiceAtual((prev) => (prev + 1) % filmes.length);

  if (filmes.length === 0) return null; // Não mostra nada se a lista de filmes estiver vazia

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
          {filmeAtual.generos && filmeAtual.generos.length > 0 && (
            <div className="carrosselCategorias">
              {filmeAtual.generos.map((genero) => (
                // A 'key' agora é o próprio nome do gênero
                <span key={genero} className="carrosselCategoria">
                  {genero}
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

        {/* Botões de Controle (Setas) */}
        <button type="button" className="carrosselControle carrosselControleEsquerda" onClick={anterior}>
          <ChevronLeft size={32} />
        </button>
        <button type="button" className="carrosselControle carrosselControleDireita" onClick={proximo}>
          <ChevronRight size={32} />
        </button>

        {/* Indicadores (Bolinhas) */}
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