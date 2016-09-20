

// Represents a visual chart.
// 
// In order to create a new chart, one should use one of the following functions (declared at the bottom of the page):
//		- Chart.fromJSONFile
//		- Chart.fromJSONString
//		- Chart.fromObject
function Chart() {
	
	// Creates the html of the chart
	var createHTML = function() {
		var container = jQuery(
			' \
			<div class="chart"> \
				<p class="chart-title"></p> \
				<div class="chart-body"></div> \
			</div> \
			'
		);
		
		return container;
	}
	
	// Creates a discrete bar chart.
	// @param data - The data describing the bar chart
	var asDiscreteBar = function(data) {
		var chart = nv.models.discreteBarChart();
	
		chart.x(function(d) {
			return d.label;
		});
		chart.y(function(d) {
			return d.value;
		});
			
		chart.tooltip.enabled(false);
		chart.showValues(true).duration(250);

		var canvas = d3.select(this.html[0]).append('svg');
		canvas
			.datum( [ data ] )
			.call(chart);
			
		this.html.on('resize', function(event, ui) { chart.update(); } );

		nv.utils.windowResize(chart.update);

		return chart;
	}
	
	// Destroys this chart
	this.destroy = function() {
		// Remove the html element from the page
		this.html.remove();
	}
	
	// Creates the nvd3 chart
	// @param chartDesc - The data describing the chart
	var createChart = function(chartDesc) {	
		// Set the title
		var titleHTML = this.html.children('.chart-title').text(chartDesc.title);
	
		// Create the chart based off of the type
		var type = chartDesc.type;
		var chartFunc;
		if (type === 'Discrete Bar') {
			chartFunc = asDiscreteBar;
		}
		else {
			console.log('Unrecognized chart type! Chart was not created.');
			return false;
		}
	
		var c = chartFunc.bind(this, chartDesc.data);
		nv.addGraph(c);
		
		return true;
	}
	
	// Initializes this chart,. Use the static Chart functions to create a chart, do not use this function directly.
	// @param chartDesc - An object describing the chart.
	//					  It will contain the following properties (* properties are required):
	//						title - The title of the chart, which is displayed to the user
	//						type* - The type of chart used, must be one of the following:
	//							- "Discrete Bar"
	//						data* - The data that the chart will display. Since we use nvd3 to display the charts, it follows their guidelines
	// 					  See frontend/test_graph.json for example
	this._init = function(chartDesc) {
		// The html container representing this chart
		this.html = createHTML();
		// Attach the html skeleton to the body
		jQuery('body').append(this.html);
	
		// Bring focus when we are clicked
		this.html.on('click', onChangeFocus);
		onChangeFocus.call(this.html);
	
		// Draggable settings
		this.html.draggable( {
			distance : 10,
			// When the user starts dragging the box, bring it into focus
			drag : onChangeFocus
		});
	
		// Resizable settings
		this.html.resizable( {
			handles : 'se'
		} );
	
		// Toolbar settings
		// Close button
		var closeData = {
			onClick : this.destroy.bind(this)
		}
		var toolbarDesc = [
			new LSST_TB.ToolbarElement('close', closeData),
		];
		var options = {
			// Only show toolbar when the user hovers over the box.
			bShowOnHover : true,
		};
		this.html.lsst_toolbar(toolbarDesc, options);
		
		return createChart.call(this, chartDesc);
	}
}

// Checks if the init function of a chart succeeds, and prints a messsage if it doesn't.
// @param c - The chart to check (and initialize)
// @param desc - The description of the chart (to pass into _init)
var checkChart = function(c, desc) {
	if (!c._init(desc)) {
		console.error('Failed to properly initialize the chart! Please provide a correct description. Current chart description: ', desc);
		c.destroy();
	}
}

// Creates a chart from a JSON file.
// @param file - The JSON file representing this chart
// @return The newly created chart
Chart.fromJSONFile = function(file) {
	var chart = new Chart();
	var createChart = function(data) {
		checkChart(this, data);
	}
	jQuery.getJSON(file, createChart.bind(chart));
	
	return chart;
}

// Creates a chart from a JSON formatted string.
// @param str - The JSON formatted string
// @return The newly created chart
Chart.fromJSONString = function(str) {
	var chart = new Chart();
	checkChart(chart, JSON.parse(str));
	return chart;
}

// Creates a chart from an object, following the chart guidelines.
// @param chartDesc - An object describing the chart.
	//					  It will contain the following properties (* properties are required):
	//						title - The title of the chart, which is displayed to the user
	//						type* - The type of chart used, must be one of the following:
	//							- "Discrete Bar"
	//						data* - The data that the chart will display. Since we use nvd3 to display the charts, it follows their guidelines
	// 					  See frontend/test_graph.json for example
Chart.fromObject = function(chartDesc) {
	var chart = new Chart();
	checkChart(chart, chartDesc);
	return chart;
}
















