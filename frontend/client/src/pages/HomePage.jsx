import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>Добро пожаловать в приложение Банк</h1>
      <nav className="home-nav">
        <Link to="/calculator" className="nav-link">Калькулятор</Link>
        <Link to="/admin" className="nav-link">Админ-панель</Link>
      </nav>
    </div>
  );
};

export default HomePage;