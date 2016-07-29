

function BoxText(label, value, bWrap = true) {
	this.label = label;
	this.value = value;
	this.bWrap = bWrap;
}

function Box(boxName) {

	var isMini = false;

	var createDOMSkeleton = function() {
		var container = jQuery('<div>').addClass('box');
		
		var title = jQuery('<p>').addClass('box-title').text(boxName);
		var body = jQuery('<div>').addClass('box-body');
		
		var close = jQuery('<img>').addClass('box-image-close').attr('src', 'images/close_40x40.png');
		var mini = jQuery('<img>').addClass('box-image-minimax').attr('src', 'images/minimize_40x40.png');
		
		container.append(title);
		title.append(close);
		title.append(mini);
		
		container.append(body);
		
		close.on('click', 
			function() {
				cmds.delete_box( { 'box_id' : boxName } );
			}
		);
		mini.on('click', 
			function() {
				if (!isMini)
					cmds.hide_box( { 'box_id' : boxName } );
				else
					cmds.show_box( { 'box_id' : boxName } );
			}
		);
		
		return container;
	}
	
	this.dom = createDOMSkeleton();
	var body = this.dom.children('.box-body');
	
	
	
	var createBoxTextDOM = function(boxText) {
		var label = jQuery('<span>').addClass('box-text boxtext-label').text(boxText.label + ': ');
		var value = jQuery('<span>').addClass('box-text boxtext-value').text(boxText.value);
		
		if (boxText.bWrap)
			return jQuery('<span>').append('(').append(label).append(value).append(')');
		else
			return jQuery('<span>').append(label).append(value);
	}
	
	var createTextDOM = function(data) {
		return jQuery('<span>').addClass('box-text').text(data);
	}
	
	var getDOMCreationFunc = function(data) {
		var type = typeof data;
		
		switch (type) {
		
			// We assume object is of type BoxText, as we don't support formatting any other user defined object.
			case 'object':
				return createBoxTextDOM;
				
			case 'string':
			case 'number':
				return createTextDOM;
				
			default:
				return createTextDOM;
		}
	}
	
	var getStyleLineDOM = function(data) {
		var split = data.split('-')[1];
		var lineStyle = split.substr(0, split.length - 1);
		return jQuery('<p>').addClass('box-line').css('border-bottom-style', lineStyle);
	}
	
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
	
	var text = null;
	this.setText = function(textArray) {
		text = textArray; // For serialization
		
		body.empty();
		
		if (!textArray)
			return;
	
		for (var i = 0; i < textArray.length; i++) {
			body.append(createLineDOM(textArray[i]));
		}
	}
	
	var clearCallbacks = [];
	this.onClear = function(f) {
		clearCallbacks.push(f);
	}
	this.clear = function() {
		for (var i = 0; i < clearCallbacks.length; i++) {
			clearCallbacks[i]();
		}
		clearCallbacks = [];
	
		text = null;
		body.empty();
	}
	
	this.destroy = function() {
		this.clear();
		this.dom.remove();
	}
	
	
	this.minimize = function() {
		// Box container
		this.dom.removeClass('box');
		this.dom.addClass('box-mini');
		
		// Title bar
		var titleBar = this.dom.children('.box-title');
		titleBar.removeClass('box-title');
		titleBar.addClass('box-title-mini');
		
		// Mini -> Max
		var miniMax = titleBar.children('.box-image-minimax');
		miniMax.attr('src', 'images/maximize_40x40.png');
		
		this.dom.children('.box-body').css('display', 'none');
		
		isMini = true;
	}
	
	this.maximize = function() {
		// Box container
		this.dom.removeClass('box-mini');
		this.dom.addClass('box');
		
		// Title bar
		var titleBar = this.dom.children('.box-title-mini');
		titleBar.removeClass('box-title-mini');
		titleBar.addClass('box-title');
		
		// Max -> Mini
		var miniMax = titleBar.children('.box-image-minimax');
		miniMax.attr('src', 'images/minimize_40x40.png');
		
		this.dom.children('.box-body').css('display', 'block');
		
		isMini = false;
	}
	
	
	this.serialize = function() {
		var stream = {
			name : boxName,
			bMini : isMini,
			textArray : text
		};
		
		return JSON.stringify(stream);
	}
	
	this.deserialize = function(s) {
		var data = JSON.parse(s);
		
		boxName = data.name;
		isMini = data.bMini;
		
		this.setText(data.textArray);
	}
	
	// Initialize
	jQuery('body').append(this.dom);
}


















