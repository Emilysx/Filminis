// import { FilmeComCategorias } from '../../lib/supabase'; // REMOVIDO
import './CardFilme.css';

// interface CardFilmeProps REMOVIDA

function CardFilme({ filme, onClick }) { // Argumentos sem tipo
  return (
    <article className="cardFilme" onClick={onClick}>
      <div className="cardFilmeImagem">
        {filme.poster_url ? (
          <img src={filme.poster_url} alt={filme.titulo} />
        ) : (
          <div className="cardFilmePlaceholder">
            <span>{filme.titulo[0]}</span>
          </div>
        )}
        {!filme.aprovado && (
          <div className="cardFilmePendente">Pendente</div>
        )}
      </div>
      <div className="cardFilmeInfo">
        <h3 className="cardFilmeTitulo">{filme.titulo}</h3>
        <p className="cardFilmeAno">{filme.ano}</p>
        {filme.categorias && filme.categorias.length > 0 && (
          <div className="cardFilmeCategorias">
            {filme.categorias.slice(0, 2).map((cat) => (
              <span key={cat.id} className="cardFilmeCategoria">
                {cat.nome}
              </span>
            ))}
            {filme.categorias.length > 2 && (
              <span className="cardFilmeCategoria">+{filme.categorias.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default CardFilme;