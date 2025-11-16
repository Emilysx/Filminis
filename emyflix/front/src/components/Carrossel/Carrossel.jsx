import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Carrossel.css';
import bannerHome from '../../assets/banner-home.png';

function Carrossel({ filmes, onFilmeClick }) {
  const [indiceAtual, setIndiceAtual] = useState(0);

  const bannerSlide = {
    id: 'banner-01',
    isBanner: true
  };

  const slides = [bannerSlide, ...filmes];

  useEffect(() => {
    if (slides.length === 0) return;
    const intervalo = setInterval(() => {
      setIndiceAtual((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 segundos por slide
    return () => clearInterval(intervalo);
  }, [slides.length]);

  const anterior = () => setIndiceAtual((prev) => (prev - 1 + slides.length) % slides.length);
  const proximo = () => setIndiceAtual((prev) => (prev + 1) % slides.length);

  if (slides.length === 0) return null;
  const slideAtual = slides[indiceAtual];

  return (
    <section className="carrossel">
      <div className="carrosselContainer">
        {slideAtual.isBanner ? (
          <div className="carrosselImagem">
            <img src={bannerHome} alt="Bem-vindo ao EmyFlix" className="carrosselBanner" />
          </div>
        ) : (
          <>
            <div className="carrosselImagem">
              {slideAtual.poster_url ? (
                <img src={slideAtual.poster_url} alt={slideAtual.titulo} />
              ) : (
                <div className="carrosselPlaceholder">
                  <span>{slideAtual.titulo[0]}</span>
                </div>
              )}
              <div className="carrosselGradiente" />
            </div>

            <div className="carrosselInfo">
              <h2 className="carrosselTitulo">{slideAtual.titulo}</h2>
              <p className="carrosselAno">{slideAtual.ano}</p>
              {slideAtual.generos && slideAtual.generos.length > 0 && (
                <div className="carrosselCategorias">
                  {slideAtual.generos.map((genero) => (
                    <span key={genero} className="carrosselCategoria">
                      {genero}
                    </span>
                  ))}
                </div>
              )}
              <p className="carrosselSinopse">{slideAtual.sinopse}</p>
              <button
                type="button"
                className="carrosselBotao"
                onClick={() => onFilmeClick(slideAtual.id)}
              >
                Ver Detalhes
              </button>
            </div>
          </>
        )}


        {/* Botões de Controle (Setas) */}
        <button type="button" className="carrosselControle carrosselControleEsquerda" onClick={anterior}>
          <ChevronLeft size={32} />
        </button>
        <button type="button" className="carrosselControle carrosselControleDireita" onClick={proximo}>
          <ChevronRight size={32} />
        </button>

        <div className="carrosselIndicadores">
          {slides.map((_, index) => (
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