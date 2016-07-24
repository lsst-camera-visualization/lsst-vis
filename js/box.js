

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
	
	
	
	
	var createBoxTextDOM = function(boxText) {
		var label = jQuery('<span>').addClass('boxtext-label').text(boxText.label + ': ');
		var value = jQuery('<span>').addClass('boxtext-value').text(boxText.value);
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
	
	var createLineDOM = function(data) {
		var line = jQuery('<p>');
		
		if (Array.isArray(data)) {
			for (var i = 0; i < data.length; i++) {
				var curr = data[i];
				line.append(getDOMCreationFunc(curr)(curr)).append(' ');
			}
		}
		else {
			line.append(getDOMCreationFunc(data)(data));
		}
		
		return line;
	}
	
	this.setText = function(textArray) {
		var body = this.dom.children('.box-body');
		body.empty();
	
		for (var i = 0; i < textArray.length; i++) {
			body.append(createLineDOM(textArray[i]));
		}
	}
	
	
	this.destroy = function() {
		this.dom.remove();
	}
	
	
	
	// Initialize
	jQuery('#rightside').append(this.dom);
}
