import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import './HamburgerStyles.css';

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="hamburger-menu-container">
      <button 
        className={`hamburger-button ${isOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {isOpen && (
        <nav className="menu-nav" aria-hidden={!isOpen}>
          <ul className="menu-list">
            <li className="menu-item">
              <button 
                onClick={() => handleNavigation('/clientes')} 
                className="menu-link"
              >
                Clientes
              </button>
            </li>
            <li className="menu-item">
              <button 
                onClick={() => handleNavigation('/servicos')} 
                className="menu-link"
              >
                Serviços
              </button>
            </li>
            <li className="menu-item">
              <button 
                onClick={handleLogout} 
                className="menu-link logout-link"
              >
                Sair
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}