/**
 * Library functions
 *
 * @version 1.1
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

            // Declare elements
            this.container  = document.querySelector( options.container || "#container" );
            this.refresh = document.querySelector( options.loaderIcon || "#refresh" );

            // Declare paths
            this.xslPath    = localStorage.xslPath = options.xslPath;
            this.xmlPath    = localStorage.xmlPath = options.xmlPath;

            // Load and cache XLS to use for tranformation
            this.xsl        = this.loadXMLDoc( this.xslPath );

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
                return this.parseXML( localStorage.getItem( url ) );

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

                    // Parse and return response
                    callback( self.parseXML( e.currentTarget.response ) );
                };

                xhttp.onerror = function( e ) {
                    console.log('could not load: ' + url, e);
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