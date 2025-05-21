import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { FiHome, FiUsers, FiLogOut } from 'react-icons/fi';
import { FaTools } from "react-icons/fa";

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
                onClick={() => handleNavigation('/home')} 
                className="menu-link flex items-center gap-2"
              >
                <FiHome />
                Início
              </button>
            </li>

            <li className="menu-item">
              <button 
                onClick={() => handleNavigation('/clientes')} 
                className="menu-link flex items-center gap-2"
              >
                <FiUsers />
                Clientes
              </button>
            </li>

            <li className="menu-item">
              <button 
                onClick={() => handleNavigation('/servicos')} 
                className="menu-link flex items-center gap-2"
              >
                <FaTools />
                Atendimentos
              </button>
            </li>

            <li className="menu-item">
              <button 
                onClick={handleLogout} 
                className="menu-link logout-link"
              >
                <FiLogOut />
                Sair
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}