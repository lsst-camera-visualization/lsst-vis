

// Represents a graph container.
// @param title - The title of the graph
function Graph(title) {
	
	// Creates the html of the graph
	var createHTML = function() {
		var container = jQuery(
			' \
			<div class="graph"> \
				<p class="graph-title">' + title + '</p> \
				<div class="graph-body"></div> \
			</div> \
			'
		);
		
		return container;
	}
	
	// The html container representing this chart
	this.html = createHTML();
	
}






// Draws a histogram.
// @param json_file - A JSON file describing the chart data
var draw_histogram = function(json_file) {
	jQuery.getJSON(json_file,
		function(data) {
			nv.addGraph(function() {
				var chart = nv.models.discreteBarChart();
				
				chart.x(function(d) {
							return d.label;
						});
				chart.y(function(d) {
							return d.value;
						});
						
				chart.tooltip.enabled(false);
				chart.showValues(true);
				chart.duration(250);
				
				var graphTitle = data.title;
				var graphData = data.data;
				
				var graph = new Graph(graphTitle);
				jQuery('body').append(graph.html);
		
				var canvas = d3.select(graph.html[0]).append('svg');
				canvas
					.datum( [ graphData ] )
					.call(chart);
		
				nv.utils.windowResize(chart.update);
	
				return chart;
			});
		}
	);
}




