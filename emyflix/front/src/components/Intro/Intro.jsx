import { useEffect, useState } from 'react';
import './Intro.css';
import logoEmyflix from '../../assets/logo.png';

function Intro({ onComplete }) {
  const [mostrarTexto, setMostrarTexto] = useState(false);

  useEffect(() => {
    setTimeout(() => setMostrarTexto(true), 300);
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="introContainer">
      <div className="introFundo">
        <img
          src={logoEmyflix}
          alt="Logo EmyFlix"
          className={`introLogo ${mostrarTexto ? 'mostrar' : ''}`}
        />
        <h1 className={`introTexto ${mostrarTexto ? 'mostrar' : ''}`}>
          EmyFlix
        </h1>
      </div>
    </div>
  );
}

export default Intro;