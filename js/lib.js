/**
 * Library functions
 *
 * @version 1.2
 *
 * @author Noah Laux (noahlaux@gmail.com)
 */
( function( namespace, undefined ) {

    namespace.lib = {
        /**
         * Intialize
         *
         * @return N/A
         */
        init: function( options ) {

            var self        = this;
            
            // Declare elements
            this.container  = document.querySelector( options.container || "#container" );
            this.refresh    = document.querySelector( options.loaderIcon || "#refresh" );

            // Declare paths
            this.xslPath    = localStorage.xslPath = options.xslPath;
            this.xmlPath    = localStorage.xmlPath = options.xmlPath;

            // Load and cache XLS to use for tranformation
            this.loadXMLDoc( this.xslPath, false, function( response ) {
                self.xsl = response;
            });

            // Initiate feed images localstorage for initial use
            if ( !localStorage.getItem( 'feedImages' ) ) {
                localStorage.setItem( 'feedImages', JSON.stringify( {} ) );
            }

            // Trigger analytics
            this.analytics();

            // Setup events
            this.setupEvents();

            // Load contents
            this.loadContent();

        },
        /**
         * Load and output content
         *
         * @return N/A
         */
        loadContent: function() {

            var self = this;

            // Show loader icon
            this.loader('show');

            this.loadXMLDoc( this.xmlPath, true, function( response ) {
                
                // Transform response to HTML
                var resultDocument = self.transformXML( self.xsl, response );

                self.container.innerHTML = "";
                self.container.appendChild( resultDocument );

                // Hide loader icon
                self.loader('hide');
            });
      
        },
        /**
         * Loads XML document, cache and parses it
         *
         * @param {String} url
         * @param {Boolean} force Force update
         * @param {Function} callback
         *
         * @return N/A
         */
        loadXMLDoc: function( url, force, callback ) {
          
            var self = this;

            // Check if cache exits, and if we should force reload
            if ( !force && localStorage.getItem( url ) ) {

                // Return cached XML
                callback( this.parseXML( localStorage.getItem( url ) ) );

            } else {

                // Initiate new request
                var xhttp = new XMLHttpRequest();

                xhttp.open( "GET", url, true );
                xhttp.send("");

                xhttp.onload = function( e ) {
                  
                    // Cache request
                    if ( !force ) {
                        localStorage.setItem( url, e.currentTarget.response );
                    }
                    callback( self.parseXML( e.currentTarget.response ) );
                };

                xhttp.onerror = function( e ) {

                    var message = 'Can not load: ' + url + '\n Trying again in a while';
                    
                    // Set icon to alert
                    self.setBadge( '!', message, 'alert' );

                    console.log( message, e );
                };
            }
        },
        /**
         * Parses a string and outputs XML document
         *
         * @param {String} string String to parse
         *
         * @return {XML} parsed XML
         */
        parseXML: function ( string ) {

            var parser = new DOMParser(),
                xmlDoc = parser.parseFromString( string, "text/xml" );
            
            if ( xmlDoc.getElementsByTagName('item').length > 0 ) {
                xmlDoc = this.addImages( xmlDoc );
            }
            
            return xmlDoc;
        },
        /**
         * Transform XML with XLS
         *
         * @return {XML} Transformed XML document
         */
        transformXML: function( xsl, xml ) {
      
            var xsltProcessor = new XSLTProcessor();

            xsltProcessor.importStylesheet( xsl );

            return xsltProcessor.transformToFragment( xml, document );
        },
        addImages: function( xmlDoc ) {

            var items       = xmlDoc.getElementsByTagName('item');
                itemsLength = items.length,
                feedImages  = JSON.parse( localStorage.getItem( 'feedImages' ) );

            for ( var x = 0; x < itemsLength; x++ ) {
                                    
                var link = items[x].getElementsByTagName('link')[0].childNodes[0].nodeValue;

                // Check if we have an image to the link
                if ( feedImages[ link ] ) {

                    var imageUrl = lib.parseXML( '<imageurl>' + encodeURI( feedImages[ link ] ) + '</imageurl>' ).querySelector('imageurl');
                    
                    if ( !imageUrl.querySelector('parsererror') ) {
                        items[x].appendChild( imageUrl );
                    }

                }
            }
            console.log( xmlDoc );
            return xmlDoc;

        },
        /**
         * Setup events
         *
         * @return N/A
         */
        setupEvents: function() {

            var self = this;

            // Refresh content when clicked on the refresh icon
            document.getElementById('refresh').addEventListener( 'click', function( e ) {
                e.preventDefault();
                self.loadContent();
            });

            // Open options
            document.getElementById('options').addEventListener( 'click', function( e ) {
                chrome.tabs.create({
                    url: 'options.html'
                });
            });

        },
        /**
         * Shows and hides loader icon
         *
         * @param  {String} action 'show' | 'hide'
         *
         * @return N/A
         */
        loader: function( action ) {

            if ( action === 'hide' ) {
                this.refresh.className = '';
            } else {
                this.refresh.className = 'updating';
            }

        },
        setBadge: function( text, title, type ) {
            
            // Set text on badge
            chrome.browserAction.setBadgeText({
                text: text.toString()
            });

            // Set title on badge
            chrome.browserAction.setTitle({
                title: title.toString()
            });

            if ( type === 'alert' ) {
                color = { color: [255, 0, 0, 150] };
            } else {
                color = { color : [255, 100, 48, 150] };
            }

            // Set badge color
            chrome.browserAction.setBadgeBackgroundColor( color );
        },
        /**
         * Register google analytics
         *
         * @return N/A
         */
        analytics: function() {

            var _gaq = _gaq || [];
            _gaq.push(['_setAccount', 'UA-31623194-1']);
            _gaq.push(['_trackPageview']);

            (function() {
                var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
            })();
        }

    };
})( window );