import css from './styles.css'; // Import CSS using rollup-plugin-string

// Replace literal \n with actual newlines before injecting
GM_addStyle(css.replace(/\\n/g, '\n'));
console.log(
  "RPGHQ Manager: Styles injected via GM_addStyle from injectStyles.js."
);
