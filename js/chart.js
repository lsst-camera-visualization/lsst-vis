

// Represents a visual chart.
// @param json_file - A JSON file describing the chart
function Chart(json_file) {
	
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
	
	// The html container representing this chart
	this.html = createHTML();
	
	// Creates a discrete bar chart.
	// @param data - The data describing the bar chart
	var setDiscreteBar = function(data) {
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
	
	//////////
	// Init //
	//////////
	jQuery('body').append(this.html);
	
	var createChart = 
		function(data) {
			// Set the title
			var titleHTML = this.html.children('.chart-title').text(data.title);
			
			// Create the chart based off of the type
			var type = data.type;
			var chartFunc;
			if (type === 'Discrete Bar') {
				chartFunc = setDiscreteBar;
			}
			else {
				console.log('Unrecognized chart type recieved in file "' + json_file + '".');
				return false;
			}
			
			var c = chartFunc.bind(this, data.data);
			nv.addGraph(c);
			
			return true;
			
		}.bind(this);
		
	jQuery.getJSON(json_file, createChart);
	
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
}




