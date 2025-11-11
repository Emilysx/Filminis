import React from 'react';
import './Footer.css';
// Importa o logo (como fizemos na Navbar e Intro)
import logoEmyflix from '../../assets/logo.png';

function Footer() {
  return (
    <footer className="footer">
      <div className="footerContainer">
        
        <div className="footerLogo">
          <img src={logoEmyflix} alt="EmyFlix Logo" className="footerLogoImg" />
          <span className="footerTitulo">EmyFlix</span>
        </div>

        <div className="footerLinks">
          <a href="#" className="footerLink">Sobre Nós</a>
          <a href="#" className="footerLink">Privacidade</a>
          <a href="#" className="footerLink">Termos de Uso</a>
          <a href="#" className="footerLink">Ajuda</a>
        </div>

        <div className="footerCopyright">
          © {new Date().getFullYear()} EmyFlix. Todos os direitos reservados.
        </div>

      </div>
    </footer>
  );
}

export default Footer;