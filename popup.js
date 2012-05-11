( function() {

  var app = {
    /**
     * [init description]
     * @return {[type]} [description]
     */
    init: function() {

      var self = this;

      this.xsl        = "hknews.xsl";
      this.xml        = "http://news.ycombinator.com/rss";

      this.analytics();

      document.addEventListener('DOMContentLoaded', function () {

        document.getElementById('refresh').addEventListener('click', function () {
          var xsl = self.loadXMLDoc( self.xsl );
          
          self.loadXMLDoc( self.xml, true, function( response ) {
            self.displayResult( xsl, response );
          });

        });

        self.container  = document.getElementById("container");
        self.loaderIcon = document.getElementById('refresh');

        var xsl = self.loadXMLDoc( self.xsl );
            
        self.loadXMLDoc( self.xml, true, function( response ) {
          self.displayResult( xsl, response );
        });

      });

    },
    /**
     * [analytics description]
     * @return {[type]} [description]
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
    },
    /**
     * [loadXMLDoc description]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    loadXMLDoc: function( name, force, callback ) {
      
      var self = this;

      this.loader('show');

      if ( localStorage[ name ] && !force ) {

        return this.parseXML( localStorage[ name ] );

      } else {

        var xhttp = new XMLHttpRequest();

        xhttp.open( "GET", name, true );
        xhttp.send("");

        xhttp.onload = function( e ) {
          // Cache request

          localStorage[ name ] = e.currentTarget.response;

          self.loader('hide');
          callback( self.parseXML( e.currentTarget.response ) );
        };
      }
    },
    /**
     * [parseXML description]
     * @param  {[type]} string [description]
     * @return {[type]}        [description]
     */
    parseXML: function ( string ) {

      var parser = new DOMParser(),
          xmlDoc = parser.parseFromString( string, "text/xml" );
          
      return xmlDoc;
    },
    /**
     * [displayResult description]
     * @return {[type]} [description]
     */
    displayResult: function( xsl, xml ) {
  
        // code for Mozilla, Firefox, Opera, etc.
        var xsltProcessor = new XSLTProcessor();
        
        xsltProcessor.importStylesheet( xsl );
        
        var resultDocument = xsltProcessor.transformToFragment( xml, document );

        this.container.innerHTML = "";
        this.container.appendChild( resultDocument );

    },
    /**
     * [loader description]
     * @param  {[type]} action [description]
     * @return {[type]}        [description]
     */
    loader: function( action ) {

      if ( action === 'hide' ) {
        this.loaderIcon.src = "refresh.png";
      } else {
        this.loaderIcon.src = "loader.gif";
      }

    }

  };

  app.init();

})();