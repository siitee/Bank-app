import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import CalculatorPage from "./pages/CalculatorPage";
import AdminPage from "./pages/AdminPage";
import Footer from "./components/Footer";

export default function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}