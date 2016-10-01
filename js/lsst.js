
// Our global namespace
var LSST = LSST || {};

// Extends the LSST namespace
// @param namespace - A string representing the new namespace
LSST.extend = function(namespace) {
	var nsparts = namespace.split('.');
	var parent = LSST;
	
	if (nsparts[0] === 'LSST')
		nsparts = nsparts.slice(1);
		
	for (var i = 0; i < nsparts.length; i++) {
		var partname = nsparts[i];
		
		if (typeof parent[partname] === 'undefined')
			parent[partname] = {};
			
		parent = parent[partname];
	}
	
	return parent;
}

// Makes a sub class inherit from a base class
// @param sub - The sub class
// @param base - The base class
LSST.inherits = function(sub, base) {
	var s = function(){};
	s.prototype = base.prototype;
	sub.prototype = new s();
	sub.prototype.constructor = sub;
}
