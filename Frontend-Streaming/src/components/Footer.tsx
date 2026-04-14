import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="border-t border-border bg-background px-4 py-12 md:px-8">
    <div className="mx-auto max-w-[1400px]">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        <div>
          <h3 className="mb-4 text-lg font-bold text-primary">STREAMIX</h3>
          <p className="text-sm text-muted-foreground">Tu plataforma de streaming favorita. Miles de películas y series en un solo lugar.</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Explorar</h4>
          <div className="flex flex-col gap-2">
            <Link to="/browse?type=MOVIE" className="text-sm text-muted-foreground hover:text-foreground">Películas</Link>
            <Link to="/browse?type=SERIES" className="text-sm text-muted-foreground hover:text-foreground">Series</Link>
            <Link to="/plans" className="text-sm text-muted-foreground hover:text-foreground">Planes</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Soporte</h4>
          <div className="flex flex-col gap-2">
            <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">Preguntas frecuentes</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contacto</Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Términos</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Legal</h4>
          <div className="flex flex-col gap-2">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacidad</Link>
            <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Streamix. Todos los derechos reservados.
      </div>
    </div>
  </footer>
);

export default Footer;
