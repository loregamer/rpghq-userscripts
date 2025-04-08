// Import metadata for rollup-plugin-userscript
import './meta.js?userscript-metadata';

// Import the new core initialization function
import { initCore } from './shared/initialization/initCore.js';

(function() {
    'use strict';

    // Run core initialization
    // This will handle loading the manifest and running enabled scripts
    initCore();

})();
