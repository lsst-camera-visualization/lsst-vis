
var LSST = {

	UIElementList : function() {

		var elements = {};

		this.add = function(id, obj) {
			elements[id.toLowerCase()] = obj;
		}

		this.remove = function(id) {
			delete elements[id.toLowerCase()];
		}

		this.get = function(id) {
			return elements[id.toLowerCase()];
		}

		this.exists = function(id) {
			return (id.toLowerCase() in elements);
		}

	},

	state : {

		// A list of boxes
		boxes : null,

		// A list of viewers
		viewers : null,

		// A handle to the terminal
		term : null,

	},

};

var onFireflyLoaded = function() {

	// Create default viewer called 'ffview'
	cmds.create_viewer( { 'viewer_id' : 'ffview' } );
	cmds.create_box({'box_id' : 'ffbox'});
};



var currTopElement = null;
var onChangeFocus = function() {
	if (currTopElement)
		currTopElement.css('z-index', 0);

	var dom = jQuery(this);
	dom.css('z-index', 1);

	currTopElement = dom;
}
