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
		x1 : Math.trunc(Math.min(x1, x2)),
		y1 : Math.trunc(Math.min(y1, y2)),
		x2 : Math.trunc(Math.max(x1, x2)),
		y2 : Math.trunc(Math.max(y1, y2))
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

LSST.UI.Rect.prototype.toCmdLineFormat = function() {
    return '(' + [ 'rect', this._data.x1, this._data.y1, this._data.x2, this._data.y2 ].join(' ') + ')';
}

LSST.UI.Rect.prototype.toCmdLineArrayFormat = function() {
    return [ 'rect', this._data.x1, this._data.y1, this._data.x2, this._data.y2 ];
}

LSST.UI.Rect.Parse = function(rect) {
	if (Array.isArray(rect) && rect.length == 5) {
		return new LSST.UI.Rect(rect[1], rect[2], rect[3], rect[4]);
	}
  else {
    // Create from Firefly region data
    return new LSST.UI.Rect(rect.ipt0.x, rect.ipt0.y, rect.ipt1.x, rect.ipt1.y);
  }
}




LSST.UI.Circ = function(originX, originY, radius) {
  this.originX = originX;
  this.originY = originY;
  this.radius = radius;
}

LSST.UI.Circ.prototype.toString = function() {
  return [ 'circ', this.originX, this.originY, this.radius ].join(' ');
}

LSST.UI.Circ.prototype.toDS9 = function() {
  return [ 'cicle', this.originX, this.originY, this.radius ].join(' ');
}

LSST.UI.Circ.prototype.toBoxText = function() {
  var origin = new LSST.UI.BoxText('(x, y)', '(' + this.originX + ',' + this.originY + ')');
  var radius = new LSST.UI.BoxText('Radius:', this.radius);
  return [ origin, ',', radius ];
}

LSST.UI.Circ.prototype.toBackendFormat = function() {
	return {
		type : 'circ',
		value : {
		  originX : this.originX,
		  originY : this.originY,
		  radius : this.radius
		}
	};
}

LSST.UI.Circ.prototype.toCmdLineFormat = function() {
    return '(' + [ 'circ', this.originX, this.originY, this.radius ].join(' ') + ')';
}

LSST.UI.Circ.prototype.toCmdLineArrayFormat = function() {
    return [ 'circ', this.originX, this.originY, this.radius ];
}

LSST.UI.Circ.Parse = function(circ) {
  if (Array.isArray(circ) && circ.length == 4) {
    return new LSST.UI.Circ(circ[1], circ[2], circ[3]);
  }
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
  else
    return LSST.UI.Rect.Parse(region);

	return null;
}
