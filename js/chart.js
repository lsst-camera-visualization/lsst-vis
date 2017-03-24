LSST.extend('LSST.UI');

// Represents a histogram.
//
// In order to create a new histogram, one should use one of the following functions (declared at the bottom of the page):
//		- LSST.UI.Histogram.FromJSONFile
//		- LSST.UI.Histogram.FromJSONString
//		- LSST.UI.Histogram.FromObject
LSST.UI.Histogram = function() {

	this._desc = null;

	options = {};
	options.name = '_Chart' + LSST.UI.Histogram._count++;
	// Creates the html of the chart
	this.html = jQuery(
		' \
		<div class="chart"> \
		  <p class="chart-title"> <span class="chart-title-text" contenteditable="true"></span> </p> \
			<div id="' + options.name + '" class="chart-body"></div> \
		</div> \
		'
	);
	// Attach the html skeleton to the body
	jQuery('body').append(this.html);

	// Draggable settings
	options.draggable = { 
	  cancel : ".chart-title .chart-title-text"
	};

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
//						title - The title of the chart, which is displayed to the user.
//            xAxis - A label for the x axis.
//						data* - The data that the chart will display.
LSST.UI.Histogram.prototype.set = function(desc) {
	this._desc = desc;

  // Set the chart title
	var title = 'Histogram';
	if (desc.title)
		title = desc.title;
  this.html.find('.chart-title-text').text(title);

  if (desc.xAxis == undefined)
    desc.xAxis = "x-axis";
		
  var containerOffset = this.html.offset();
  var chartOffset = jQuery('#' + this.name).offset();
  var totalHeight = this.html.outerHeight();
  var delta = chartOffset.top - containerOffset.top;

	props = {
		data : desc.data,
		width: this.html.width(),
		height: totalHeight - delta - parseInt(this.html.css('padding-bottom')),
		logs: 'xy',
		desc: desc.xAxis,
		binColor: '#659cef'
 	};
	firefly.util.renderDOM(this.name, firefly.ui.Histogram, props);
}

LSST.UI.Histogram.prototype.resize = function() {
	if (this._desc != null)
		this.set(this._desc);
}

// Destroys this histogram.
LSST.UI.Histogram.prototype.destroy = function() {
	// Remove the html element from the page
	this.html.remove();
}

// Creates a histogram from a JSON file.
// @param file - The JSON file representing this histogram. See LSST.UI.Histogram.FromObject for file formatting.
// @return The newly created histogram.
LSST.UI.Histogram.FromJSONFile = function(file) {
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

// Creates a histogram from a JSON formatted string.
// @param str - The JSON formatted string. See LSST.UI.Histogram.FromObject for file formatting.
// @return The newly created histogram.
LSST.UI.Histogram.FromJSONString = function(data) {
	// NOTE: returned data from backend should already be a json file.
	var h = new LSST.UI.Histogram();
	h.set(data);
	return h;
}

// Creates a histogram from an object, following the chart guidelines.
// @param desc - An object describing the histogram.
	//					  It will contain the following properties (* properties are required):
  //						title - The title of the chart, which is displayed to the user.
  //            xAxis - A label for the x axis.
	//						data* - The data that the histogram will display. Check wiki for example link.
// @return The newly created histogram.
LSST.UI.Histogram.FromObject = function(desc) {
	var h = new LSST.UI.Histogram();
	h.set(desc);
	return h;
}
