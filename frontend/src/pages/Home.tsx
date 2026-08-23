import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import './Home.css';

function CoverLinks() {
  return (
    <>
      <Link
        aria-label="Entrar no Portal Hormezinda"
        className="portal-cover-v26__link portal-cover-v26__link--login"
        to="/login"
      >
        <span>Entrar</span>
      </Link>

      <Link
        aria-label="Criar conta no Portal Hormezinda"
        className="portal-cover-v26__link portal-cover-v26__link--register"
        to="/cadastro"
      >
        <span>Criar conta</span>
      </Link>
    </>
  );
}

export function Home() {
  useEffect(() => {
    document.documentElement.classList.add('portal-cover-v26-lock');
    document.body.classList.add('portal-cover-v26-lock');

    return () => {
      document.documentElement.classList.remove('portal-cover-v26-lock');
      document.body.classList.remove('portal-cover-v26-lock');
    };
  }, []);

  return (
    <main className="portal-cover-v26">
      <div className="portal-cover-v26__stage portal-cover-v26__stage--desktop">
        <img
          alt=""
          className="portal-cover-v26__art"
          decoding="sync"
          draggable={false}
          fetchPriority="high"
          src="/portal-hormezinda/capa-home-desktop-2x.png"
        />
        <CoverLinks />
      </div>

      <div className="portal-cover-v26__stage portal-cover-v26__stage--mobile">
        <img
          alt=""
          className="portal-cover-v26__art"
          decoding="sync"
          draggable={false}
          fetchPriority="high"
          src="/portal-hormezinda/capa-home-mobile-2x.png"
        />
        <CoverLinks />
      </div>
    </main>
  );
}
