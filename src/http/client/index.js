import React from 'react';
import { render } from 'react-dom';
import App from './components/app';

render(
  <App
    message = {'Beep Boop'}
  />,
  document.getElementById('root')
);