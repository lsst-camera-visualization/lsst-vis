
LSST.state = {
	// A list of boxes
	boxes : new LSST.UI.UIElementList(),

	// A list of viewers
	viewers : new LSST.UI.UIElementList(),

	// A handle to the terminal
	term : null,
};

var onFireflyLoaded = function() {
	// Create default viewer called 'ffview'
	cmds.create_viewer( { 'viewer_id' : 'ffview' } );
	cmds.create_box({'box_id' : 'ffbox'});
};

