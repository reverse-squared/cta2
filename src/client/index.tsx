import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import env from '../shared/env';

ReactDOM.render(<App />, document.getElementById('root'));

console.log(process.versions);
console.log(env);
