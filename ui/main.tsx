import { h, render } from 'preact';
import { App } from './App.js';
import './styles.css';

render(h(App, {}), document.getElementById('app')!);
