

function BoxText(label, value) {
	this.label = label;
	this.value = value;
}

function Box(boxName) {

	var createDOMSkeleton = function() {
		var container = jQuery('<div>').addClass('box');
		
		var title = jQuery('<p>').addClass('box-title').text(boxName);
		var body = jQuery('<div>').addClass('box-body');
		
		container.append(title);
		container.append(body);
		
		return container;
	}
	
	this.dom = createDOMSkeleton();
	var body = this.dom.children('.box-body');
	
	
	
	var createBoxTextDOM = function(boxText) {
		var label = jQuery('<span>').addClass('box-text boxtext-label').text(boxText.label + ': ');
		var value = jQuery('<span>').addClass('box-text boxtext-value').text(boxText.value);
		return jQuery('<span>').append('(').append(label).append(value).append(')');
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
	
	this.setText = function(textArray) {
		body.empty();
	
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
	
		body.empty();
	}
	
	this.destroy = function() {
		this.clear();
		this.dom.remove();
	}
	
	
	
	// Initialize
	jQuery('#rightside').append(this.dom);
}
