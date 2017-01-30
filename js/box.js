
LSST.extend('LSST.UI');

// Represents a way to display text in a box.
// In the box, it will be shown as (label: value) or label: value,
//     depending on the bWrap parameter.
//
// @param label - The significance of the value parameter
// @param value - The datum
// @param bWrap - Should the text be wrapped in parenthesis?
LSST.UI.BoxText = function(label, value, bWrap = true) {
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
LSST.UI.BoxUI = function(boxName) {

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
	var createLineStyleDOM = function(data) {
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
			line.append(createLineStyleDOM(data));
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
		this.html.remove();
	}
	
	// Minimizes the box. Shows only the title bar.
	this.minimize = function() {		
		// Title bar
		var titleBar = this.html.children('.box-title');
		titleBar.removeClass('box-title');
		titleBar.addClass('box-title-mini');
		
		this.html.css('min-width', '200px');
		this.html.css('min-height', '0px');
		
		this.html.children('.box-body').css('display', 'none');
	}
	
	// Restores the box.
	this.maximize = function() {		
		// Title bar
		var titleBar = this.html.children('.box-title-mini');
		titleBar.removeClass('box-title-mini');
		titleBar.addClass('box-title');
		
		this.html.css('min-width', '');
		this.html.css('min-height', '');
		
		this.html.children('.box-body').css('display', 'block');
	}
	
	
	
	
	
	
	/////////////////////////////////////////////////////////
	// INIT /////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	
	// A handle to the html of the box
	this.html = createDOMSkeleton();
	// A handle to the body of the box
	var body = this.html.children('.box-body');
	
	setTimeout(
	    function() {
	        // Offset the box location
	        var o = this.html.offset();
	        o.top += (LSST.UI.BoxUI.offset.dY * LSST.UI.BoxUI.offset.index);
	        o.left += (LSST.UI.BoxUI.offset.dX * LSST.UI.BoxUI.offset.index);
	        this.html.offset(o);
        	LSST.UI.BoxUI.offset.index = (LSST.UI.BoxUI.offset.index + 1) % LSST.UI.BoxUI.offset.max;
	    }.bind(this),
	    500
	);
}


// Offset index when a new box is created
LSST.UI.BoxUI.offset = {
    // Current index
    index : 0,
    // Max index value
    max : 3,
    // delta-x offset
    dX : 50,
    // delta-y offset
    dY : 75
};





// The main control for a box.
// @param boxName - The id of the box
LSST.UI.Box = function(options) {
	// Handles the UI elements of the box	
	this._boxUI = new LSST.UI.BoxUI(options.name);
	// A handle to the html of the box
	this.html = this._boxUI.html;
	// A handle to the body of the box
	this._body = this.html.children('.box-body');

	// Is the box minimized?
	this._bMini = false;
	
	// The text array (untransformed) currently displayed in the box.
	this._text = null;
	
	// Callbacks for when this.clear is called.
	this._clearCallbacks = [];
	
	
	
	// Appends this box the HTML body.
	jQuery('body').append(this.html);
	
	// Draggable settings
	options.draggable = {
		handle : '.box-title'
	};
	
	// Resizable settings
	options.resizable = {
		handles : 'se'
	};
	
	var toolbarDesc = [
		new LSST_TB.ToolbarElement(
			'close', 
			{
				onClick : cmds.delete_box,
				parameters : { box_id : options.name },
			}
		),
		new LSST_TB.ToolbarElement(
			'mini',
			 {
				onClick : cmds.hide_box,
				parameters : { box_id : options.name },
			}
		),
	];
	var toolbarOptions = {
		// Only show toolbar when the user hovers over the box.
		bShowOnHover : true,
	};
	options.toolbar = {
		desc : toolbarDesc,
		options : toolbarOptions
	};
	
	// Init from UIElement
	LSST.UI.UIElement.prototype._init.call(this, options);
}

// Inherit from LSST.UI.UIElement
LSST.inherits(LSST.UI.Box, LSST.UI.UIElement);

// Sets the text in the box.
// @param textArray - An array of objects for displaying.
//						The possible types of objects are BoxText, string, or number.
//						A string element can also be a special type, wrapped with colons (:).
//							Possible special strings:
//								line
LSST.UI.Box.prototype.setText = function(textArray) {
	this._text = textArray;
	
	this._boxUI.setText(textArray);
}
	
// Adds a one-time callback for when this.clear is called.
// @param f - The callback function
LSST.UI.Box.prototype.onClear = function(f) {
	this._clearCallbacks.push(f);
}
	
// Calls all clear callbacks, then clears the text from the box.
LSST.UI.Box.prototype.clear = function() {
	// Call clear callbacks
	for (var i = 0; i < this._clearCallbacks.length; i++) {
		this._clearCallbacks[i]();
	}
	
	// Clear the text
	this._boxUI.clear();		
	this._text = null;
	
	// Delete clear callbacks
	this._clearCallbacks = [];
}
	
// Destroys this box
LSST.UI.Box.prototype.destroy = function() {
	this.clear();
	this._boxUI.destroy();
}
	
// Minimizes the box. Shows only the title bar.
LSST.UI.Box.prototype.minimize = function() {		
	this._boxUI.minimize();
	
	this._bMini = true;
}
	
// Restores the box from a minimized state.
LSST.UI.Box.prototype.maximize = function() {
	this._boxUI.maximize();
	
	this._bMini = false;
}

// Serializes this box.
// @param box - The box to serialize.
// @return The serialized byte stream.
LSST.UI.Box.Serialize = function(box) {
	var stream = {
		name : box._name,
		bMini : box._bMini,
		textArray : box._text,
	};
	
	return JSON.stringify(stream);
}

// Deserializes a byte stream.
// @param s - A byte stream returned by this.serialize
// @return A new box described by the byte stream
LSST.UI.Box.Deserialize = function(s) {
	var data = JSON.parse(s);
	var box = new LSST.UI.Box(data.name);
	
	if (data.bMini)
		box.minimize();
	
	box.setText(data.textArray);
}













