document.addEventListener('DOMContentLoaded', function () {
  
  var app = {
    /**
     * Intialize
     *
     * @return N/A
     */
    init: function() {

      var self = this;

      // Declare elements
      this.container  = document.getElementById("container");
      this.loaderIcon = document.getElementById('refresh');
      
      // Declare paths
      this.xslPath    = "hknews.xsl";
      this.xmlPath    = "http://news.ycombinator.com/rss";

      // Load and cache XLS to use for tranformation
      this.xsl        = self.loadXMLDoc( self.xslPath );

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

      this.loadXMLDoc( this.xmlPath, true, function( response ) {
        // Transform response to HTML
        var resultDocument = self.transformXML( self.xsl, response );
        
        self.container.innerHTML = "";
        self.container.appendChild( resultDocument );
      });

    },
    /**
     * Loads XML document, cache and parses it
     *
     * @param  {String}   url
     * @param  {Boolean}  force    Force update
     * @param  {Function} callback
     * @return N/A
     */
    loadXMLDoc: function( url, force, callback ) {
      
      var self = this;

      // Show loader icon
      this.loader('show');

      // Check if cache exits, and if we should force reload
      if ( localStorage[ url ] && !force ) {

        // Return cached XML
        return this.parseXML( localStorage[ url ] );

      } else {

        // Initiate new request
        var xhttp = new XMLHttpRequest();

        xhttp.open( "GET", url, true );
        xhttp.send("");

        xhttp.onload = function( e ) {
          // Cache request
          localStorage[ url ] = e.currentTarget.response;

          // Hide loader icon
          self.loader('hide');

          // Parse and return response
          callback( self.parseXML( e.currentTarget.response ) );
        };
      }
    },
    /**
     * Parses a string and outputs XML document
     *
     * @param  {String} string [description]
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
     * @return {XML} Transformed XML
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
      document.getElementById('refresh').addEventListener( 'click', function() {
        self.loadContent();
      });

    },
    /**
     * Shows and hides loader icon
     *
     * @param  {[type]} action [description]
     * @return N/A
     */
    loader: function( action ) {

      if ( action === 'hide' ) {
        this.loaderIcon.src = "refresh.png";
      } else {
        this.loaderIcon.src = "loader.gif";
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

  app.init();

});