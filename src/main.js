// Import metadata for rollup-plugin-userscript
import './meta.js?userscript-metadata';

// Import the main initialization function
// Assuming init is exported from a file within ./initialization
// We will need to update this path and ensure init is exported correctly
import { init } from './initialization/init.js'; // Adjust path if needed

(function() {
    'use strict';

    // Run initialization
    init();
})();
