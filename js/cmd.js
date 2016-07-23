
jQuery(function($, undefined) {

    var docLink = 'https://github.com/lsst-camera-visualization/frontend/wiki/New-Home';
	var commands = {
		'average_pixel box_id viewer_id region' : {
			'callback' : cmds.average_pixel,
			'description' : 'Calculates the average pixel value for the region.',
			'doc_link' : docLink + '#average_pixel'
		},
		'clear_box box_id' : {
			'callback' : cmds.clear_box,
			'description' : 'Clears an information box.',
			'doc_link' : docLink + '#clear_box'
		},
		'clear_viewer viewer_id' : {
		    'callback' : cmds.clear_viewer,
		    'description' : 'Clears a viewer.',
		    'doc_link' : docLink + '#clear_viewer'
		},
	    'create_box box_id' : {
			'callback' : cmds.create_box,
			'description' : 'Creates a new box for displaying information.',
			'doc_link' : docLink + '#create_box'
		},
		'create_viewer viewer_id' : {
			'callback' : cmds.create_viewer,
			'description' : 'Creates a new viewer.',
			'doc_link' : docLink + '#create_viewer'
		},
		'delete_box box_id' : {
			'callback' : cmds.delete_box,
			'description' : 'Deletes an existing information box.',
			'doc_link' : docLink + '#delete_box'
		},
		'hide_box box_id' : {
			'callback' : cmds.hide_box,
			'description' : 'Hides an information box.',
			'doc_link' : docLink + '#hide_box'
		},
		'hide_boundary viewer_id' : {
			'callback' : cmds.hide_boundary,
			'description' : 'Hide the boudary of amplifiers in the specified viewer.',
			'doc_link' : docLink + '#hide_boundary'
		},
		'hot_pixel viewer_id threshold region' : {
			'callback' : cmds.hot_pixel,
			'description' : 'Calculates the hot pixels within the threshold for the region.',
			'doc_link' : docLink + '#hot_pixel'
		},
		'load_image viewer_id uri' : {
			'callback' : cmds.load_image
		},
		'read_mouse viewer_id box_id' : {
			'callback' : cmds.read_mouse,
			'description' : 'Tracks the mouse inside of the view \'viewer_id\' and displays the information in the box \'box_id\'.',
		},
		'show_boundary viewer_id' : {
			'callback' : cmds.show_boundary,
			'description' : 'Show the boudary of amplifiers in the specified viewer.',
			'doc_link' : docLink + '#show_boundary'
		},
		'show_box box_id' : {
			'callback' : cmds.show_box,
			'description' : 'Shows a hidden information box.',
			'doc_link' : docLink + '#show_box'
		},
		'uv_freq viewer_id time_in_millis' : {
			'callback' : cmds.uv_freq,
			'description' : 'Changes the frequency for checking for new images from the Rest Server.',
			'doc_link' : docLink + '#uv_freq'
		},
		'uv_load_new viewer_id' : {
			'callback' : cmds.uv_load_new,
			'description' : 'If in a paused state and there is a new image available, calling this command will load the new image without changing the state.',
			'doc_link' : docLink + '#uv_load_new'
		},
		'uv_pause viewer_id' : {
			'callback' : cmds.uv_pause,
			'description' : 'Pauses the automatic retrieval of new images from the Rest Server.',
			'doc_link' : docLink + '#uv_pause'
		},
		'uv_resume viewer_id' : {
			'callback' : cmds.uv_resume,
			'description' : 'Pauses the automatic retrieval of new images from the Rest Server.',
			'doc_link' : docLink + '#uv_resume'
		},
		'uv_update viewer_id' : {
			'callback' : cmds.uv_update,
			'description' : 'Updates a viewer immediately, bypassing the update_viewer_freq interval.',
			'doc_link' : docLink + '#uv_update'
		},
	};

	var subCommands = [
	    'rect top left bottom right',
	    'circ originX originY radius'
	];

	state.term = jQuery('#cmd').terminal( commands, subCommands,
	                    {
						    helpLink: docLink,
						    prefix: '~>',
						    width: '100%',
						    height: 300,
						    fontSize: '1.5em'
						}).draggable();
});




// Terminal commands handlers
cmds = {

	average_pixel: function(cmd_args) {
		var name = cmd_args['box_id'];
		if (!state.boxes[name]) {

			state.term.echo("The box \'" + name + "\' does not exist!\n");

		} else {

			var viewer = cmd_args['viewer_id'];
			cmds.clear_box( { 'box_id' : name } );

			var content = state.boxes[name].select.select('.box-content').attr('id', 'readout-' + name);
			var first_line = content.append('p');
			first_line.append('span').text('average pixel value around region');
			// var x_point = first_line.append('span').attr('id', 'read_about'+name);
			var region = parse_region(cmd_args['region']) || {
				top: 0,
				left: 0,
				bottom: 1,
				right: 1
			};
			var second_line = content.append('p').text('top: ' + region.top + ' bottom: ' + region.bottom + ' left: ' + region.left + ' right: ' + region.right);
			var third_line = content.append('p').text('value: 0');
			var plotid = viewer;
			var region_id = plotid + '-boundary';
			if (state.viewers[region_id]) {
				firefly.removeRegionData(state.viewers[region_id], region_id);
				state.viewers[region_id] = undefined;
			}
			var content = ['box', region.left, region.bottom, region.right - region.left, region.bottom - region.top, 0, '#color=red'].join(' ');

			state.viewers[region_id] = [content];
			if (firefly.overlayRegionData) {
				firefly.overlayRegionData([content], region_id, "Boundary", plotid);
			}
			firefly.getJsonFromTask("python", "average", {'rect': region}).then(function(data) {
			    third_line.text('value: ' + data["result"]);
			});
		}
	},

	chart: function(state, cmd_args) {
		var name = cmd_args[1];
		if (!state.boxes[name]) {
			state.term.echo("The box \'" + name + "\' does not exist!\n");
		} else {
			cmds.clear_box(state, [name]);
			var content = state.boxes[name].select.select('.box-content').attr('id', 'chart-' + name);
			nv.addGraph(function() {
				return draw_graph(content)
			});
		}
	},

	chart2: function(state, cmd_args) {
		var name = cmd_args[1];
		if (!state.boxes[name]) {
			state.term.echo("The box \'" + name + "\' does not exist!\n");
		} else {
			cmds.clear_box(state, ['', name]);
			var content = state.boxes[name].select.select('.box-content').attr('id', 'chart2-' + name);
			nv.addGraph(function() {
				return draw_graph2(content)
			})
		}
	},

	clear_box: function(cmd_args) {
		var name = cmd_args['box_id'];
		if (!state.boxes[name]) {
			state.term.echo("The box \'" + name + "\' does not exist!\n");
		} else {
			if (state.boxes[name].clear) {
				state.boxes[name].clear();
				state.boxes[name].clear = undefined;
			}
			state.boxes[name].select.select('.box-content').attr("id", "").html("");
		}
	},

	create_box: function(cmd_args) {
		var name = cmd_args['box_id'];
		if (state.boxes[name]) {
			state.term.echo("The box \'" + name + "\' already exists! Please choose another name.\n");
		} else {
			var box = d3.select('#rightside').append('div').classed('box', true);
			var box_title = box.append('div').classed('box-bar', true).text(name);
			var box_content = box.append('div').classed('box-content', true);

			box.attr('id', 'box' + name);

			state.boxes[name] = {
				select: box,
			};
			state.term.echo("Success!\n");
		}
	},

	create_viewer: function(cmd_args) {
		var viewerID = cmd_args['viewer_id'];

		if (!state.viewers[viewerID]) {
			var viewer = new Viewer(viewerID);
			state.viewers[viewerID] = viewer;

			viewer.readout.register('SELECT_REGION', selectRegion);

			// Add draggable
			viewer.container.draggable({
				'cancel' : '.viewer-view'
			});
		}
		else {
			state.term.echo('The viewer \'' + viewerID + '\' already exists!');
		}
	},

	delete_box: function(cmd_args) {
		var name = cmd_args['box_id'];
		if (!state.boxes[name]) {
			state.term.echo("The box \'" + name + "\' does not exist!\n");
		} else {
			cmds.clear_box( { 'box_id' : name } );
			state.boxes[name].select.remove();
			state.boxes[name] = undefined;
			state.term.echo("Success!");
		}
	},

	hide_boundary: function(cmd_args) {
		var viewerID = cmd_args['viewer_id'];
		var plotid = viewer;
		var region_id = plotid + '-boundary';
        var viewer = state.viewers[viewerID];
        if (viewer.show_boundary){
            viewer.show_boundary = false;
            firefly.removeRegionData(viewer.header["regions_ds9"], region_id);
            state.term.echo("Boundary Removed");
        }else{
            state.term.echo("The boundary has not been drawn yet.");
        }
	},

	hide_box: function(cmd_args) {
		var name = cmd_args['box_id'];
		if (!state.boxes[name]) {
			state.term.echo("The box \'" + name + "\' does not exist!\n");
		} else {
			state.boxes[name].select.classed('box-hide', true);
		}
	},

	hot_pixel: function(cmd_args) {
	    var viewerID = cmd_args['viewer_id'];
		var region_id = viewerID + '-hotpixel';
		var threshold = parseInt(cmd_args['threshold']);
		var region = parse_region(cmd_args['region']) || "all";
		if (state.viewers[region_id]) {
			firefly.removeRegionData(state.viewers[region_id], region_id);
			state.viewers[region_id] = undefined;
		}

		read_hotpixels({
		    filename: "default",
		    threshold: "max",
		    "region": {"rect": region}
			},
			function(regions) {
		    state.viewers[region_id] = regions;
		    firefly.overlayRegionData(regions, region_id, 'hotpixel', viewerID);
		});
	},

	load_image: function(cmd_args) {
		var help_string = 'load an image from a URI';
		var viewerID = cmd_args['viewer_id'];
		var uri = cmd_args['uri'];
		var re = /^https?:/;
		var result = "";
		result = "Image: " + uri;
		var viewer = state.viewers[viewerID].ffHandle;
		if (re.test(uri)) { // this is a URL
		    viewer.plot({
		        "URL" : uri,
		        "Title" : result,
		        "ZoomType" : "TO_WIDTH"
		    });
		    state.term.echo(result);
		} else {
		    result = uri + " !matched " + re;
		    viewer.plot({
		        "File" : uri,
		        "Title" : result,
		        "ZoomType" : "TO_WIDTH"
		    });
		    state.term.echo(result);
		}
		state.viewers[viewerID].image_url = uri;
		console.log(state.viewers[viewerID]);
		return null;
	},

	read_mouse: function(cmd_args) {
		var name = cmd_args['box_id'];
		if (!state.boxes[name]) {
			state.term.echo("The box \'" + name + "\' does not exist!\n");
		} else {
			var viewerID = cmd_args['viewer_id'] || 'ffview';
			var viewer = state.viewers[viewerID];

			cmds.clear_box( { 'box_id' : name } );

			var content = state.boxes[name].select.select('.box-content').attr('id', 'readout-' + name);
			var first_line = content.append('p');
			first_line.append('span').text('point x:');
			var x_point = first_line.append('span').attr('id', 'readout-x-' + name);

			var second_line = content.append('p');
			second_line.append('span').text('point y:');
			var y_point = second_line.append('span').attr('id', 'readout-y-' + name);

			var third_line = content.append('p');
			third_line.append('span').text('region: ');
			var region_name = third_line.append('span').attr('id', 'readout-region-' + name);

            // get the size of an image
			var height = 0;
			var width = 0;

			var img = new Image();
			img.onload = function(){
				var height = img.height;
				var width = img.width;
			}
			img.src = viewer.image_url;

			var getRegion = function(pt) {
	    		var x = Math.floor(pt.x / width);
	    		var y = Math.floor(pt.y / height);
	    		return 'Region <' + x + ',' + y + '>';
	  		}

			var readoutID = viewer.readout.register('READ_MOUSE', function(data) {
				x_point.text(Math.floor(data.ipt.x));
				y_point.text(Math.floor(data.ipt.y));
	    		region_name.text(getRegion(data.ipt));
	  		});
	  		state.boxes[name].clear = function() {
	    		viewer.readout.unregister('READ_MOUSE', readoutID);
	  		};
		}
	},

	show_boundary: function(cmd_args) {
		var viewerID = cmd_args['viewer_id'];
		var plotid = viewerID; // ffview as a default
		var region_id = plotid + '-boundary';
        var viewer = state.viewers[viewerID];
        if (!(viewer.show_boundary)){
            if (viewer.header){
                firefly.overlayRegionData(viewers.header["regions_ds9"], region_id, 'Boundary', plotid);
                viewer.show_boundary = true;
            }else{
                read_boundary(plotid, function(regions) { // Asynchronous
                    viewer.header = regions;
                    firefly.overlayRegionData(viewer.header["regions_ds9"], region_id, 'Boundary', plotid);
                    viewer.show_boundary = true;
                })
            }
        }else{
            state.term.echo("Boundary of this viewer is already drawn.")
        }
	},

	show_box: function(cmd_args) {
		var name = cmd_args['box_id'];
		if (!state.boxes[name]) {
			state.term.echo("The box \'" + name + "\' does not exist!\n");
		} else {
			state.boxes[name].select.classed('box-hide', false);
		}
	},

	uv_freq: function(cmd_args){

	    var viewerID = cmd_args['viewer_id'];
	    var viewer = state.viewers[viewerID];

	    var timeAsMilli = cmd_args['time_in_millis'];
		// 5000 milliseconds is the lower bound
		timeAsMilli = Math.min(timeAsMilli, 5000);

		// Stop timer for viewer
		clearInterval(viewer.uv.timer_id);

		// Set new update frequency
		viewer.uv.freq = timeAsMilli;

		// Reset timer
		viewer.uv.timer_id =
		    setInterval(
		        function() {
		        	cmds.uv_update( { 'viewer_id' : viewerID } )
		        },
		        viewer.uv.freq
		    );
	},

	uv_load_new: function(cmd_args) {
		var viewerID = cmd_args['viewer_id'];
	    var viewer = state.viewers[viewerID];

        if (viewer.show_boundary){
            viewer.show_boundary = false;
            firefly.removeRegionData(viewer.header["regions_ds9"], region_id);
        }
        viewer.header = null;

		var newImage = viewer.uv.newest_image;

		if (newImage) {

			cmds.load_image( { 'viewer_id' : viewerID, 'uri' : newImage } );

			/*var newPlot = {
				url: newImage,
				Title: viewerID,
				ZoomType: 'TO_WIDTH'
			};
			viewer.ffHandle.plot(newPlot);

			viewer.image_url = newImage;*/
			viewer.uv.newest_image = null;

		    // Change button status
		    var but = $('#' + viewerID + '---update_now');
		    but.prop('disabled', true);
		    but.attr('value', 'There are no new images.');
		}
	},

	uv_pause: function(cmd_args) {
	    var viewerID = cmd_args['viewer_id'];
	    var viewer = state.viewers[viewerID];

		jQuery("#" + viewerID + "---pause_resume").attr('value', 'Resume');
		viewer.uv.paused = true;
	},

	uv_resume: function(cmd_args) {
	    var viewerID = cmd_args['viewer_id'];
	    var viewer = state.viewers[viewerID];

		jQuery("#" + viewerID + "---pause_resume").attr('value', 'Pause');
		viewer.uv.paused = false;

		cmds.uv_load_new( { 'viewer_id' : viewerID } );
	},

	uv_update: function(cmd_args) {
	    var viewerID = cmd_args['viewer_id'];
	    var viewer = state.viewers[viewerID];

		var CHECK_IMAGE_PORT = "8099";
        var CHECK_IMAGE_URL = "http://172.17.0.1:" + CHECK_IMAGE_PORT + "/vis/checkImage";
        var params = {
        	'since': viewer.uv.image_ts
       	};

        jQuery.getJSON(CHECK_IMAGE_URL, params, function(data) {

            if (data) {
                // There's a new image.
                viewer.uv.image_ts = data.timestamp;
				viewer.uv.newest_image = data.uri;

				if (!viewer.uv.paused) {
					cmds.uv_load_new( { 'viewer_id' : viewerID } );
				}
				else {
				    var but = $('#' + viewerID + '---update_now');
				    but.prop('disabled', false);
				    but.attr('value', 'There is a new image available. Click to load.');
				}
			}

			if (viewer.uv.newest_image == null) {
			    // Displayed when there is no new image, or the new image is done loading.
			    var but = $('#' + viewerID + '---update_now');
			    but.prop('disabled', true);
			    but.attr('value', 'There are no new images.');
			}
        });
	}
}
