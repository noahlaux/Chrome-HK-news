/**
 * Script file for options page
 *
 * @version 1.11
 *
 * @author Noah Laux (noahlaux@gmail.com)
 */
document.addEventListener('DOMContentLoaded', function () {

    var options = JSON.parse( localStorage.getItem( 'options' ) );

    // Initiate option elements
    initiateElements( document.querySelectorAll('select'), 'value' );
    initiateElements( document.querySelectorAll('input[type="checkbox"]'), 'checked' );

     /**
     * Initiate items with current options and set up listeners
     *
     * @param {Array} Array of HTML elements to be intiated
     * @param {String} method Method (e.g. value | checked) to check and recieve element value from
     *
     * @return N/A
     */
    function initiateElements( elements, method ) {

        var elementsLength = elements.length;

        for ( var x = 0; x < elementsLength; x++ ) {
            
            var element = elements[ x ];

            element.onchange = onChange;
            
            // Update element value with the matching one from localstorage
            element[ method ] = options[ element.id ];
        }

        /**
         * Fires when an element changes, retrieves current value and save to localstorage
         *
         * @param {Event} e
         *
         * @return N/A
         */
        function onChange( e ) {

            var element = e.target;

            // Populate options with changed value from element
            options[ element.id ] = element[ method ];

            saveOptions( options );

        }

    }

    /**
     * Save options to localstorage
     *
     * @param {Object} options
     *
     * @return N/A
     */
    function saveOptions( options ) {
        
        // Save options
        localStorage.setItem( 'options', JSON.stringify( options ));

        // Reinitiate background page to make changes take effect imediately
        chrome.extension.getBackgroundPage().initiate();
    }

});