
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

LSST._getSaveID = function(id) {
  return "LSST.settings." + id;
}


// Gets the saved settings for an object.
// @param id [String]: The ID for this object.
// @return [Object] The settings and values.
LSST.getSettings = function(id) {
  var saveID = LSST._getSaveID(id);
  return JSON.parse(localStorage.getItem(saveID));
}

// Saves an individual setting for an object.
// @param id [String]: The ID holder for this setting.
// @param settings [Dictionary]: The settings to save.
//        Key [String]: A settings name.
//        Value [Anything]: A settings value.
LSST.saveSettings = function(id, settings) {
  var saveID = LSST._getSaveID(id);
  var existing = JSON.parse(localStorage.getItem(saveID));
  var newSettings = jQuery.extend({}, existing, settings);
  localStorage.setItem(saveID, JSON.stringify(newSettings));
}

// Deletes any saved settings for the ID.
// @param id [String]: The ID for these settings.
LSST.deleteSettings = function(id) {
  var saveID = LSST._getSaveID(id);
  localStorage.removeItem(saveID);
}
