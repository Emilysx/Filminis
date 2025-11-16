import './CardFilme.css';

function CardFilme({ filme, onClick }) {
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
        
      </div>
      <div className="cardFilmeInfo">
        <h3 className="cardFilmeTitulo">{filme.titulo}</h3>
        <p className="cardFilmeAno">{filme.ano}</p>

        {/* Pega os gêneros que vêm do back-end */}
        {filme.generos && filme.generos.length > 0 && (
          <div className="cardFilmeCategorias">
            {/* Mostra no máximo 2 gêneros */}
            {filme.generos.slice(0, 2).map((genero) => (
              <span key={genero} className="cardFilmeCategoria">
                {genero}
              </span>
            ))}
            {filme.generos.length > 2 && (
              <span className="cardFilmeCategoria">+{filme.generos.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default CardFilme;