require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: ['@babel/plugin-transform-modules-commonjs']
});

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { StaticRouter } = require('react-router-dom/server');

// Mock browser APIs
global.window = {
  matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
  localStorage: { getItem: () => null, setItem: () => {} },
  location: { pathname: '/home', search: '', hash: '' }
};
global.localStorage = global.window.localStorage;
global.document = { documentElement: { setAttribute: () => {}, removeAttribute: () => {}, style: { setProperty: () => {} } }, body: { style: {} } };

try {
  const App = require('./src/App').default;
  const html = ReactDOMServer.renderToString(
    React.createElement(StaticRouter, { location: '/home' }, React.createElement(App))
  );
  console.log("Rendered successfully. Length:", html.length);
} catch (e) {
  console.error("REACT RUNTIME ERROR:", e);
}
