import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Store from './undux/Store';

ReactDOM.render(
  <Store.Container>
    <App />
  </Store.Container>,
  document.getElementById('root')
);
