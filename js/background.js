/**
 * Background processing
 *
 * implement this to retrieve images
 *
 * @version 1.2
 *
 * @author Noah Laux (noahlaux@gmail.com)
 */
( function(){

    // Declare paths from localStorage
    // This implies that the main application has already been initiated
    var xslPath     = localStorage.getItem('xslPath'),
        xmlPath     = localStorage.getItem('xmlPath'),
        options     = getOptions();

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

        if ( xmlPath ) {

            lib.loadXMLDoc( xmlPath, true, function( response ) {

                var previousXml         = lib.parseXML( localStorage.getItem( xmlPath ) ),
                    originalItemsNode   = response.getElementsByTagName('channel')[0],
                    items               = response.getElementsByTagName('item'),
                    newItems            = getNewItems( previousXml, items );

                if ( newItems.length > 0 ) {

                    // Set number of new items on icon
                    lib.setBadge( newItems.length, newItems.length + ' new items', 'message' );

                    // Get and cache new images from feeds
                    getImages( newItems );

                    var clonedResponse  = ( new XMLSerializer() ).serializeToString( response );

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

                    if ( options.showNotifications ) {
                        // Show notification
                        showNotification();
                    }
                }

            });

        }
    }

    function getImages( items ) {

        var feedImages  = {};

        // Fetch links
        items.forEach( function( item, i ) {

            var url = item.getElementsByTagName('link')[0].childNodes[0].nodeValue;

            get( url, function( html ) {

                var root = document.createElement("div");

                root.innerHTML = html;

                var images = Array.prototype.filter.call( root.querySelectorAll( 'img' ), function( image, index, nodeList ) {
                    // Only get th
                    return ( image.width > 200 );
                });

                // TODO make further investigation to pick the right image
                if ( images[0] ) {

                    var image = images[0];

                    // Ensure that we have an absolute URL
                    if ( (/^https?:\/\//).test( image.src ) ) {

                        // temporary store first feed image
                        feedImages[ url ] = image.src;

                    } else {

                        // Make dummy anchor, to extract hostname
                        var baseUrl = document.createElement( 'a' );
                        baseUrl.href = url;

                        var imageUrl = document.createElement( 'a' );
                        imageUrl.href = image.src;

                        feedImages[ url ] = baseUrl.protocol + '//' + baseUrl.hostname + imageUrl.pathname;
                    }
                }

                // We reached last item, so store our image urls
                if ( i === items.length - 1 ) {
                    extend( feedImages, JSON.parse( localStorage.getItem( 'feedImages' ) ) );
                    localStorage.setItem( 'feedImages', JSON.stringify( feedImages ) );
                }

            });

        });

    }

    function extend( destination, source ) {
          for ( var property in source ) {
            destination[ property ] = source[ property ];
          }
          return destination;
    }

    function get( url, callback ) {

        // Initiate new request
        var xhttp = new XMLHttpRequest();

        xhttp.open( "GET", url, true );
        xhttp.send("");

        xhttp.onload = function( e ) {
            callback( e.currentTarget.response );
        };

        xhttp.onerror = function( e ) {
            var message = 'Can not load: ' + url + '\n Trying again in a while';
            callback();
            console.log( message, e );
        };
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
            newItems    = [],
            feedImages  = JSON.parse( localStorage.getItem( 'feedImages' ) );

        for ( var x = 0; x < itemsLength; x++ ) {

            var link = items[x].getElementsByTagName('link')[0].childNodes[0].nodeValue;

            // Check if we have an image to the link
            if ( feedImages[ link ] ) {

                var imageUrl = lib.parseXML( '<imageurl>' + encodeURI( feedImages[ link ] ) + '</imageurl>' ).querySelector('imageurl');

                // Add if everything is a-ok
                if ( !imageUrl.querySelector('parsererror') ) {
                    items[x].appendChild( imageUrl );
                }

            }

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