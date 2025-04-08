import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="container header__container">
        <ul className='header-list'>
          <li className="header-list__item">
            <Link to="/" className="header-link">Главная</Link>
          </li>
        </ul>
      </div>
    </header>
  );
}