

// Represents a way to display text in a box.
// In the box, it will be shown as (label: value) or label: value,
//     depending on the bWrap parameter.
//
// @param label - The significance of the value parameter
// @param value - The datum
// @param bWrap - Should the text be wrapped in parenthesis?
function BoxText(label, value, bWrap = true) {
	this.label = label;
	this.value = value;
	this.bWrap = bWrap;
	
	this.createHTML = function() {
		var label = jQuery('<span>').addClass('box-text boxtext-label').text(this.label + ': ');
		var value = jQuery('<span>').addClass('box-text boxtext-value').text(this.value);
		
		if (bWrap)
			return jQuery('<span>').append('(').append(label).append(value).append(')');
		else
			return jQuery('<span>').append(label).append(value);
	}
}






// Represents the UI of a box (html, text).
// @param boxName - The id of the box
function BoxUI(boxName) {

	// Creates the html of the box.
	var createDOMSkeleton = function() {
		var container = jQuery('<div>').addClass('box');
		
		var title = jQuery('<p>').addClass('box-title').text(boxName);
		var body = jQuery('<div>').addClass('box-body');
		
		container.append(title);		
		container.append(body);
		
		return container;
	}

	// Creates basic text output
	// @param data - The text to display
	var createTextDOM = function(data) {
		return jQuery('<span>').addClass('box-text').text(data);
	}
	
	// Returns the function used to create the html, based on the data's type.
	// @param data - The object to display
	var getDOMCreationFunc = function(data) {
		var type = typeof data;
		
		switch (type) {
		
			// We assume object is of type BoxText, as we don't support formatting any other user defined object.
			case 'object':
				return data.createHTML.bind(data);
				
			case 'string':
			case 'number':
				return createTextDOM;
				
			default:
				return createTextDOM;
		}
	}
	
	// Creates a line for display
	// @param data - The type of line to display, following the guideline of :line-_style_:
	//		Ex. :line-dashed: or :line-solid:
	var createLineDOM = function(data) {
		var split = data.split('-')[1];
		var lineStyle = split.substr(0, split.length - 1);
		return jQuery('<p>').addClass('box-line').css('border-bottom-style', lineStyle);
	}
	
	// Creates the html for the current line.
	// @param data - If data is an array, every element will be transformed and put on the same line,
	//			     else, the data will be transformed into text and put on its own line
	var createLineDOM = function(data) {
		var line = jQuery('<p>');
		
		if (Array.isArray(data)) {
			for (var i = 0; i < data.length; i++) {
				var curr = data[i];
				var dom = getDOMCreationFunc(curr)(curr);
				line.append(dom).append(' ');
			}
		}
		else if ((typeof data === 'string' || data instanceof String) && data.includes(':line')) {
			line.append(getStyleLineDOM(data));
			return line;
		}
		else {
			line.append(getDOMCreationFunc(data)(data));
		}
		
		return line.addClass('box-text-container');
	}
	
	// Sets the text in the box.
	// @param textArray - An array of objects for displaying.
	//						The possible types of objects are BoxText, string, or number.
	//						A string element can also be a special type, wrapped with colons (:).
	//							Possible special strings:
	//								line
	this.setText = function(textArray) {
		body.empty();
		
		if (!textArray)
			return;
	
		for (var i = 0; i < textArray.length; i++) {
			var line = createLineDOM(textArray[i]);
			body.append(line);
		}
	}
	
	// Clears the text in the box
	this.clear = function() {
		body.empty();
	}
	
	// Destroys the html
	this.destroy = function() {
		this.dom.remove();
	}
	
	// Minimizes the box. Shows only the title bar.
	this.minimize = function() {		
		// Title bar
		var titleBar = this.dom.children('.box-title');
		titleBar.removeClass('box-title');
		titleBar.addClass('box-title-mini');
		
		this.dom.css('min-width', '200px');
		this.dom.css('min-height', '0px');
		
		this.dom.children('.box-body').css('display', 'none');
	}
	
	// Restores the box.
	this.maximize = function() {		
		// Title bar
		var titleBar = this.dom.children('.box-title-mini');
		titleBar.removeClass('box-title-mini');
		titleBar.addClass('box-title');
		
		this.dom.css('min-width', '');
		this.dom.css('min-height', '');
		
		this.dom.children('.box-body').css('display', 'block');
	}
	
	
	
	
	
	
	/////////////////////////////////////////////////////////
	// INIT /////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	
	// A handle to the html of the box
	this.dom = createDOMSkeleton();
	// A handle to the body of the box
	var body = this.dom.children('.box-body');

	// Draggable settings
	this.dom.draggable( {
		distance : 10,
		handle : '.box-title',
		// When the user starts dragging the box, bring it into focus
		drag : onChangeFocus
	});
	this.dom.on('click', onChangeFocus);
	
	// Resizable settings
	this.dom.resizable( {
		handles : 'se'
	} );
}






// The main control for a box.
// @param boxName - The id of the box
function Box(boxName) {

	// Handles the UI elements of the box	
	var boxUI = new BoxUI(boxName);
	// A handle to the html of the box
	this.dom = boxUI.dom;
	// A handle to the body of the box
	var body = this.dom.children('.box-body');

	// Is the box minimized?
	var isMini = false;
	
	// The text array (untransformed) currently displayed in the box.
	var text = null;
	
	// Callbacks for when this.clear is called.
	var clearCallbacks = [];
	
	// Sets the text in the box.
	// @param textArray - An array of objects for displaying.
	//						The possible types of objects are BoxText, string, or number.
	//						A string element can also be a special type, wrapped with colons (:).
	//							Possible special strings:
	//								line
	this.setText = function(textArray) {
		text = textArray;
		
		boxUI.setText(textArray);
	}
	
	// Adds a one-time callback for when this.clear is called.
	// @param f - The callback function
	this.onClear = function(f) {
		clearCallbacks.push(f);
	}
	
	// Calls all clear callbacks, then clears the text from the box.
	this.clear = function() {
		// Call clear callbacks
		for (var i = 0; i < clearCallbacks.length; i++) {
			clearCallbacks[i]();
		}
		
		// Clear the text
		boxUI.clear();		
		text = null;
		
		// Delete clear callbacks
		clearCallbacks = [];
	}
	
	// Destroys this box
	this.destroy = function() {
		this.clear();
		boxUI.destroy();
	}
	
	// Minimizes the box. Shows only the title bar.
	this.minimize = function() {		
		boxUI.minimize();
		
		isMini = true;
	}
	
	// Restores the box from a minimized state.
	this.maximize = function() {
		boxUI.maximize();
		
		isMini = false;
	}
	
	// Serializes this box.
	// @return The serialized byte stream.
	this.serialize = function() {
		var stream = {
			name : boxName,
			bMini : isMini,
			textArray : text
		};
		
		return JSON.stringify(stream);
	}
	
	// Deserializes a byte stream.
	// @param s - A byte stream returned by this.serialize
	this.deserialize = function(s) {
		var data = JSON.parse(s);
		
		boxName = data.name;
		isMini = data.bMini;
		
		this.setText(data.textArray);
	}
	
	
	
	
	/////////////////////////////////////////////////////////
	// INIT /////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	
	// Appends this box the HTML body.
	jQuery('body').append(this.dom);
}


















