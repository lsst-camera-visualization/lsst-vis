state = {
	// 
	boxes: {}, // this stores necessary command the box could do.
	// operations {select, clear}
	
	// An object containing a list Viewers. Each viewer is referenced by its id.
	viewers: {},
	
	// A handle to the terminal
	term: null,
};

var onFireflyLoaded = function() {

	// Create default viewer called 'ffview'
	cmds.create_viewer( { 'viewer_id' : 'ffview' } );
};



var currTopElement = null;
var onChangeFocus = function() {
	if (currTopElement)
		currTopElement.css('z-index', 0);

	var dom = jQuery(this);
	dom.css('z-index', 1);
	
	currTopElement = dom;
}
