LSST.extend('LSST.UI')

// 2 types of regions at the moment:
//  - Rect: A rectangular region
//	- Circ: A circular region

// Regions must support the following functions:
//	- toString()
//  - toDS9()
//	- toBoxText()
//	- toBackendFormat()

// http://ds9.si.edu/doc/ref/region.html

LSST.UI.Rect = function(x1, y1, x2, y2) {
	this._data = {
		x1 : Math.min(x1, x2),
		y1 : Math.min(y1, y2),
		x2 : Math.max(x1, x2),
		y2 : Math.max(y1, y2)
	};
}

LSST.UI.Rect.prototype.toString = function() {
	return ['rect', this._data.x1, this._data.y1, this._data.x2, this._data.y2].join(' ');
}

LSST.UI.Rect.prototype.toDS9 = function() {
    var width = this._data.x2 - this._data.x1;
    var height = this._data.y2 - this._data.y1;
	return ['box', this._data.x1 + (width / 2), this._data.y1 + (height / 2), width, height, 0].join(' ');
}

LSST.UI.Rect.prototype.toBoxText = function() {
	var first = new LSST.UI.BoxText('(x1, y1)', '(' + this._data.x1 + ',' + this._data.y1 + ')', false);
	var second = new LSST.UI.BoxText('(x2, y2)', '(' + this._data.x2 + ',' + this._data.y2 + ')', false);
	return [ first, ',',  second ];
}

LSST.UI.Rect.prototype.toBackendFormat = function() {
	return {
		type : 'rect',
		value : this._data
	};
}

LSST.UI.Rect.Parse = function(rect) {
	if (Array.isArray(rect) && rect.length == 5) {
		return new LSST.UI.Rect(rect[1], rect[2], rect[3], rect[4]);
	}
}




LSST.UI.Circ = function(circ) {

}

LSST.UI.Circ.prototype.toString = function() {

}

LSST.UI.Circ.prototype.toDS9 = function() {

}

LSST.UI.Circ.prototype.toBoxText = function() {

}

LSST.UI.Circ.Parse = function(circ) {

}


LSST.UI.Region = function() {

}

LSST.UI.Region.Parse = function(region) {
	if (Array.isArray(region)) {
		if (region[0] == 'rect')
			return LSST.UI.Rect.Parse(region);
		else if (region[0] == 'circ')
			return LSST.UI.Circ.Parse(region);
	}
}
