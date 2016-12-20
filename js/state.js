
LSST.state = {
	// A list of boxes
	boxes : new LSST.UI.UIElementList(),

	// A list of viewers
	viewers : new LSST.UI.UIElementList(),
	
	// A list of uv controls
	uvControls : new LSST.UI.UIElementList(),

	// A handle to the terminal
	term : null,
	
	// Defaults for terminal
	defaults : {
	    viewer : null,
	    box : null,
	}
};

var onFireflyLoaded = function() {
  // Create default viewer and box
  console.log("Creating ffview");
	cmds.create_viewer( { 'viewer_id' : 'ffview' } );
	console.log("Finished creating ffview");
	console.log("Creating ffbox");
	cmds.create_box({'box_id' : 'ffbox'});
	console.log("Finished creating ffbox");
};

