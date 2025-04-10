// Rollup configuration file
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-import-css';
import metablock from 'rollup-plugin-userscript-metablock';
import fs from 'fs';
import path from 'path';
const pkg = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf-8'));

// Define the metablock options
const metablockOptions = {
  file: null, // Explicitly disable reading from a file
  override: {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
    namespace: 'rpghq-userscripts', // Define a namespace
    match: ['*://*.rpghq.org/*'],
    grant: [
      'GM_getValue',
      'GM_setValue',
      'GM_registerMenuCommand' // Add as per roadmap Phase 3
      // Add other GM_* functions as needed
    ],
    'run-at': 'document-end',
    // Add other overrides like homepageURL, supportURL, etc. if desired
  },
};

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/rpghq-userscript-manager.user.js',
    format: 'iife', // Immediately Invoked Function Expression, suitable for userscripts
    // sourcemap: true, // Optional: Enable sourcemaps for easier debugging
  },
  plugins: [
    resolve(), // Resolves node modules
    commonjs(), // Converts CommonJS modules to ES6
    css({ 
      // Configuration for CSS handling
      // Inject CSS into the head of the document
      inject: true, 
      // Minify CSS output
      minify: true, 
    }),
    // terser(), // Uncomment to enable minification (requires rollup-plugin-terser or @rollup/plugin-terser)
    metablock(metablockOptions) // Generate the userscript metablock
  ],
};
