import React from 'react';
import ReactDOM from 'react-dom';
import AppWrapper from './AppWrapper';
import { HashRouter } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'prismjs/themes/prism-coy.css';

// sessionStorage.clear();

ReactDOM.render(
  <HashRouter>
    <AppWrapper></AppWrapper>
  </HashRouter>,
  document.getElementById('root')
);

serviceWorker.unregister();