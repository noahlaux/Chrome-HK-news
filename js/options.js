document.addEventListener('DOMContentLoaded', function () {

    var options = JSON.parse( localStorage.getItem( 'options' ) );

    // Initiate option items
    initiateItems( document.querySelectorAll('select'), 'value' );
    initiateItems( document.querySelectorAll('input[type="checkbox"]'), 'checked' );

    /**
     * Save options into localstorage
     *
     * @return N/A
     */
    function saveOptions( options ) {
        
        // Save options
        localStorage.setItem( 'options', JSON.stringify( options ));

        // Reinitiate background page
        chrome.extension.getBackgroundPage().initiate();
    }

     /**
     * Initiate items with current options and set up listeners
     *
     * @return N/A
     */
    function initiateItems( items, method ) {
        
        for ( var x = 0; x < items.length; x++) {
            
            var item = items[ x ];

            item.onchange = change;
            
            // Selected current option value
            item[ method ] = options[ item.id ];
        }

        function change( e ) {

            var item = e.target;

            options[ item.id ] = item[ method ];

            saveOptions( options );

        }

    }

});