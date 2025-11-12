import React from 'react';
import './Footer.css';
import logoEmyflix from '../../assets/logo.png';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react'; // Ícones para redes sociais

function Footer() {
  return (
    <footer className="footer">
      <div className="footerContentWrapper"> {/* Novo container para o conteúdo principal */}

        {/* Coluna 1: Logo e Descrição */}
        <div className="footerSection footerAbout">
          <div className="footerLogo">
            <img src={logoEmyflix} alt="EmyFlix Logo" className="footerLogoImg" />
            <span className="footerTitulo">EmyFlix</span>
          </div>
          <p className="footerDescription">
            EmyFlix oferece um mundo encantado e divertido para descobrir filmes
            cheios de magia, onde cada história é uma nova aventura para toda a família.
          </p>
          <div className="footerSocials">
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <Twitter size={20} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <Youtube size={20} />
            </a>
          </div>
        </div>

        {/* Coluna 2: Navegação Principal */}
        <div className="footerSection footerLinksGroup">
          <h4 className="footerSectionTitle">Navegação</h4>
          <a href="#" className="footerLink">Início</a>
          <a href="#" className="footerLink">Listar Filmes</a>
          <a href="#" className="footerLink">Adicionar Filme</a>
          <a href="#" className="footerLink">Minha Conta</a>
        </div>

        {/* Coluna 3: Recursos e Ajuda */}
        <div className="footerSection footerLinksGroup">
          <h4 className="footerSectionTitle">Recursos</h4>
          <a href="#" className="footerLink">Ajuda</a>
          <a href="#" className="footerLink">Perguntas Frequentes</a>
          <a href="#" className="footerLink">Contato</a>
          <a href="#" className="footerLink">Termos de Serviço</a>
        </div>

        {/* Coluna 4: Sobre o EmyFlix */}
        <div className="footerSection footerLinksGroup">
          <h4 className="footerSectionTitle">EmyFlix</h4>
          <a href="#" className="footerLink">Sobre Nós</a>
          <a href="#" className="footerLink">Carreiras</a>
          <a href="#" className="footerLink">Notícias</a>
          <a href="#" className="footerLink">Privacidade</a>
        </div>

      </div> {/* Fim do footerContentWrapper */}

      {/* Seção de Copyright e Políticas (Fica abaixo das colunas) */}
      <div className="footerBottom">
        <p className="footerCopyright">
          © {new Date().getFullYear()} EmyFlix. Todos os direitos reservados.
        </p>
        <div className="footerPolicyLinks">
          <a href="#" className="footerPolicyLink">Política de Privacidade</a>
          <a href="#" className="footerPolicyLink">Configurações de Cookies</a>
        </div>
      </div>

    </footer>
  );
}

export default Footer;