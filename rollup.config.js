import userscript from 'rollup-plugin-userscript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

// Optional: Import package.json to potentially reuse values like author
// import pkg from './package.json' assert { type: 'json' };

export default {
  input: 'src/main.js', // Entry point
  output: {
    file: 'rpghq-userscript-manager.user.js', // Output file name
    format: 'iife', // Immediately Invoked Function Expression
    // If your userscript needs access to globals from the page scope:
    // globals: {
    //   'jquery': '$', // Example: Map jquery to global $
    // },
    // external: ['jquery'] // Example: Treat jquery as external
  },
  plugins: [
    resolve(), // Resolves node_modules imports
    commonjs(), // Converts CommonJS modules to ES6
    userscript()
    // If you need to modify the metadata dynamically, you can pass a function:
    // userscript(meta => meta.replace('process.env.AUTHOR', pkg.author))
  ]
};
