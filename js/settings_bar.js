


var settings_bar_enter = function(elem) {
	var container = jQuery(elem);
	var settingsBar = container.children('.settings_bar');
	settingsBar.css('display', 'block');
}

var settings_bar_leave = function(elem) {
	var container = jQuery(elem);
	var settingsBar = container.children('.settings_bar');
	settingsBar.css('display', 'none');
}

var settings_bar_click = function(elem) {
	var settingsBar = jQuery(elem);
	console.log('hi');
}
