import { Link } from 'react-router-dom';

export function NavBar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        Photos APP
      </Link>
      <nav className="navbar__links">
        <Link to="/">Inicio</Link>
        <Link to="/login">Iniciar sesion</Link>
      </nav>
    </header>
  );
}
