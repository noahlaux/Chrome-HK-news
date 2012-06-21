/**
 * Background processing
 *
 * @version 1.1
 *
 * @author Noah Laux (noahlaux@gmail.com)
 */
( function(){

    // Declare paths from localStorage
    // This implies that the main application has already been initiated
    var xslPath = localStorage.getItem('xslPath'),
        xmlPath = localStorage.getItem('xmlPath'),
        options = getOptions();
    
    initiate();
    
    /**
     * Initiate background processing with timer
     *
     * @return N/A
     */
    function initiate() {

        // Clear old timer
        clearInterval( interval );

        // Setup timed check
        var interval = setInterval( checkForNew, options.updateInterval );
    }

    // Make public initiate function so we can target it from options page
    window.initiate = initiate;
    
    /**
     * Loads new feed and check if there is new items
     * @return N/A
     */
    function checkForNew() {

        if ( options.showNotifications && xmlPath ) {

            lib.loadXMLDoc( xmlPath, true, function( response ) {

                var previousXml         = lib.parseXML( localStorage.getItem( xmlPath ) ),
                    clonedResponse      = ( new XMLSerializer() ).serializeToString( response ),
                    originalItemsNode   = response.getElementsByTagName('channel')[0],
                    items               = response.getElementsByTagName('item'),
                    newItems            = getNewItems( previousXml, items );

                if ( newItems.length > 0 ) {

                    // Remove all original items from feed
                    removeNodes( originalItemsNode, items );

                    // Add all new items
                    addNodes( originalItemsNode, newItems );

                    // Make feed to string
                    var XMLstring = ( new XMLSerializer() ).serializeToString( response );

                    // Insert serialized feed into localStorage
                    localStorage.setItem( 'notifications', XMLstring );

                    // Update feed cache
                    localStorage.setItem( xmlPath, clonedResponse );

                    // Show notification
                    showNotification();
                }

            });

        }
    }

    /**
     * Get new items compared from previous xml based on their link value
     *
     * @param {XML} previousXML
     * @param {Array} items Items to check
     *
     * @return {Array} New items
     */
    function getNewItems( previousXml, items ) {

        var itemsLength = items.length,
            newItems    = [];

        for ( var x = 0; x < itemsLength; x++ ) {
                    
            var link = items[x].getElementsByTagName('link')[0].childNodes[0].nodeValue;
            
            if ( !contains( previousXml, 'link', link ) ) {
                newItems.push( items[x].cloneNode( true ) );
            }

        }

        return newItems;
    }

    /**
     * Adds items to a node
     *
     * @param {XML node} root The node which to add to
     * @param {Array} nodes Array of nodes to add
     *
     * @return N/A
     */
    function addNodes( root, nodes ) {

        var nodesLength = nodes.length;

        for ( var x = 0; x < nodesLength; x++) {
            root.appendChild( nodes[ x ] );
        }
    }

    /**
     * Removes items from a node
     *
     * @param {XML node} root The nodes which to remove from
     * @param {Array} items Array of nodes
     *
     * @return N/A
     */
    function removeNodes( root, nodes ) {

        var nodesLength = nodes.length;

        for ( var x = 0; x < nodesLength; x++ ) {
            if ( root.lastChild.tagName === nodes[0].tagName ) {
                root.removeChild( root.lastChild );
            }
        }
    }

    /**
     * Check if collection contains attribute with value
     *
     * @param {XML document} collection XMLnode to check
     * @param {String} attribute Attribute type
     * @param {String} value Value to evaluate
     *
     * @return {Boolean}
     */
    function contains( collection, attribute, value ) {

        var xPath   = 'count(//item[' + attribute + '="' + value + '"])',
            result  = collection.evaluate( xPath, collection, null, XPathResult.ANY_TYPE, null );

        return ( result.numberValue > 0 ) ? true : false;
    }

    /**
     * Get options and declares defaults
     *
     * @return {Object} options
     */
    function getOptions() {

        if ( !localStorage.getItem('options') ) {

            // Declare defaults
            localStorage.setItem('options', JSON.stringify(
                {
                    updateInterval: 60000,
                    showNotifications: true,
                    notificationDisplayTime: 10000
                }
            ));

        }

        return JSON.parse( localStorage.getItem('options') );
    }

    /**
     * Shows desktop notification
     *
     * @return N/A
     */
    function showNotification(){
        
        var notification = webkitNotifications.createHTMLNotification( 'notification.html' );
        
        notification.show();

        if ( options.notificationDisplayTime > 0 ) {
            // Hide the notification after the configured duration.
            setTimeout( function(){
                notification.cancel();
            }, options.notificationDisplayTime );
        }
    }

})();