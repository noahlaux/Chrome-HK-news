document.addEventListener('DOMContentLoaded', function () {

	var xlsPath			= localStorage.getItem('xslPath'),
		xls				= lib.parseXML( localStorage.getItem( xlsPath ) ),
		notifications	= lib.parseXML( localStorage.getItem( 'notifications' ) ),
		html			= lib.transformXML( xls, notifications );

	document.getElementById('container').appendChild( html );

	// Open options
    document.getElementById('options').addEventListener( 'click', function( e ) {
        chrome.tabs.create({
            url: 'options.html'
        });
    });
	
});