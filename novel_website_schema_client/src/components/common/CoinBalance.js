import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CoinBalance.css';

const CoinBalance = ({ isAuthenticated, coins = 0, loading = false }) => {

  return (
    <div className="coin-balance">
      <div className="coin-icon">
        <i className="bi bi-coin"></i>
      </div>
      <div className="coin-info">
        <span className="coin-label"></span>
        <span className="coin-amount">
          {loading ? (
            <span className="loading">...</span>
          ) : (
            coins.toLocaleString()
          )}
        </span>
      </div>
    </div>
  );
};

export default CoinBalance; 