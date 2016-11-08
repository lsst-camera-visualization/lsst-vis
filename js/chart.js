LSST.extend('LSST.UI');

// Represents a visual chart.
//
// In order to create a new chart, one should use one of the following functions (declared at the bottom of the page):
//		- Chart.fromJSONFile
//		- Chart.fromJSONString
//		- Chart.fromObject
LSST.UI.Histogram = function() {

	this._desc = null;

	options = {};
	options.name = 'Chart ' + LSST.UI.Histogram._count++;
	// Creates the html of the chart
	this.html = jQuery(
		' \
		<div class="chart"> \
			<div id="' + options.name + '" class="chart-body"></div> \
		</div> \
		'
	);
	// Attach the html skeleton to the body
	jQuery('body').append(this.html);

	// Draggable settings
	options.draggable = { };

	// Resizable settings
	options.resizable = {
		stop : LSST.UI.Histogram.prototype.resize.bind(this),
		handles : 'se'
	};

	// Toolbar settings
	// Close button
	var closeData = {
		onClick : this.destroy.bind(this)
	}
	var toolbarDesc = [
		new LSST_TB.ToolbarElement('close', closeData),
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
LSST.inherits(LSST.UI.Histogram, LSST.UI.UIElement);

LSST.UI.Histogram._count = 0;

// Initializes this chart. Use the static LSST.UI.Histogram functions to create a histogram, do not use this function directly.
// @param desc - An object describing the chart.
//					  It will contain the following properties (* properties are required):
//						title - The title of the chart, which is displayed to the user
//						data* - The data that the chart will display.
// 					  See frontend/test_graph.json for example
LSST.UI.Histogram.prototype.set = function(desc) {
	this._desc = desc;
	var title = 'Histogram';
	if (desc.title)
		title = desc.title;

	props = {
		data : desc.data,
		width: this.html.width(),
		height: this.html.height(),
		logs: 'xy',
		desc: title,
		binColor: '#659cef'
 	};
	firefly.util.renderDOM(this.name, firefly.ui.Histogram, props);
}

LSST.UI.Histogram.prototype.resize = function() {
	if (this._desc != null)
		this.set(this._desc);
}

// Destroys this histogram
LSST.UI.Histogram.prototype.destroy = function() {
	// Remove the html element from the page
	this.html.remove();
}

// Creates a chart from a JSON file.
// @param file - The JSON file representing this chart
// @return The newly created chart
LSST.UI.Histogram.fromJSONFile = function(file) {
	var h = new LSST.UI.Histogram();
	var createHisto = function(data) {
		console.log(data);
		this.set(data);
	}
	var onFail = function(jqXHR, textStatus, errorThrown) {
		h.html.children('.chart-body').text('Failed to load histogram data from file: ' + file);
	}

	jQuery.getJSON(file, createHisto.bind(h) )
		.fail(onFail.bind(h));

	return h;
}

// Creates a chart from a JSON formatted string.
// @param str - The JSON formatted string
// @return The newly created chart
LSST.UI.Histogram.fromJSONString = function(data) {
	// NOTE: returned data from backend should already be a json file.
	var h = new LSST.UI.Histogram();
	h.set(data);
	return h;
}

// Creates a chart from an object, following the chart guidelines.
// @param desc - An object describing the chart.
	//					  It will contain the following properties (* properties are required):
	//						title - The title of the chart, which is displayed to the user
	//						type* - The type of chart used, must be one of the following:
	//							- "Discrete Bar"
	//						data* - The data that the chart will display. Since we use nvd3 to display the charts, it follows their guidelines
	// 					  See frontend/test_graph.json for example
LSST.UI.Histogram.fromObject = function(desc) {
	var h = new LSST.UI.Histogram();
	h.set(desc);
	return h;
}
