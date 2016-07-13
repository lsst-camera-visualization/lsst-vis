state = {
	boxes: {}, // this stores necessary command the box could do.
	// operations {select, clear}
	lsstviewers: { // this select firefly object of certain id
	},
	show_readouts: undefined,
	term: undefined, // this will be a terminal object

	update_viewer: {
	    updatetime: 10000,
	    latest_time: 0,
	    updatelist: {ffview: false},
	    timeinterval: 5000,

	    // Cached result for when we are paused but there is a new image
	    new_image: {
	        url: null,
	    }
	},
	current_image_url: null
};


var readouts = function() {
	this.register = {};
	this.add = function(name, cb) {
		this.register[name] = cb;
	};
	this.remove = function(name) {
		this.register[name] = undefined;
	};
	firefly.appFlux.getActions('ExternalAccessActions').extensionAdd({
		plotId: 'ffview',
		extType: 'PLOT_MOUSE_READ_OUT',
		callback: function(data) {
			for (var name in this.register) {
				if (this.register[name]) {
					this.register[name](data);
				}
			}
		}.bind(this),
	});
};

var onFireflyLoaded = function() {
	var viewer = loadFirefly('ffview');
	state.lsstviewers['ffview'] = viewer;
	state.show_readouts = new readouts();

	// currently will update the image automatically 10 sec
	state.timeinterval = window.setInterval(function(){
		cmds.update_viewer( { 'viewer_id' : 'ffview' } )
	}, state.updatetime);
};

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
		'hot_pixel viewer_id threshold region' : {
			'callback' : cmds.hot_pixel,
			'description' : 'Calculates the hot pixels within the threshold for the region.',
			'doc_link' : docLink + '#hot_pixel'
		},
		'pause viewer_id' : {
			'callback' : cmds.pause,
			'description' : 'Pauses the automatic retrieval of new images from the Rest Server.',
			'doc_link' : docLink + '#pause'
		},
		'read_mouse viewer_id box_id' : {
			'callback' : cmds.read_mouse,
			'description' : 'Tracks the mouse inside of the view \'viewer_id\' and displays the information in the box \'box_id\'.',
		},
		'resume viewer_id' : {
			'callback' : cmds.resume,
			'description' : 'Pauses the automatic retrieval of new images from the Rest Server.',
			'doc_link' : docLink + '#resume'
		},
		'show_box box_id' : {
			'callback' : cmds.show_box,
			'description' : 'Shows a hidden information box.',
			'doc_link' : docLink + '#show_box'
		},
		'update_viewer viewer_id' : {
			'callback' : cmds.update_viewer,
			'description' : 'Updates a viewer immediately, bypassing the update_viewer_freq interval.',
			'doc_link' : docLink + '#update_viewer'
		},
		'update_viewer_freq viewer_id time_in_millis' : {
			'callback' : cmds.update_viewer_freq,
			'description' : 'Changes the frequency for checking for new images from the Rest Server.',
			'doc_link' : docLink + '#update_viewer_freq'
		},
		'update_viewer_now viewer_id' : {
			'callback' : cmds.update_viewer_now,
			'description' : 'If in a paused state and there is a new image available, calling this command will load the new image without changing the state.',
			'doc_link' : docLink + '#update_viewer_now'
		},
		'show_boundary viewer_id' : {
			'callback' : cmds.show_boundary,
			'description' : 'Show the boudary of amplifiers in the specified viewer.',
			'doc_link' : docLink + '#show_boundary'
		},
		'hide_boundary viewer_id' : {
			'callback' : cmds.hide_boundary,
			'description' : 'Hide the boudary of amplifiers in the specified viewer.',
			'doc_link' : docLink + '#hide_boundary'
		}
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
						});
});

var onClick = function(id) {
    var elem = jQuery('#' + id);
    var viewerID = id.split('---')[0];
    var whichButton = id.split('---')[1];

    switch (whichButton)
    {
        case "pause_resume":
            if (elem.attr('value') == "Pause")
            	cmds.pause( { 'viewer_id' : viewerID } );
            else
                cmds.resume( { 'viewer_id' : viewerID } );

            break;

        case "update_now":
            cmds.update_viewer_now( { 'viewer_id' : viewerID } );
            break;
    }
};

//----------CMD---------//

cmds = {
	update_viewer_freq: function(cmd_args){

	    var viewerID = cmd_args['viewer_id'];
	    var timeAsMilli = cmd_args['time_in_millis'];

		if (timeAsMilli < 5000) {
			// lower bound for automatic update.
			timeAsMilli = 5000;
		}
		clearInterval(state.update_viewer.timeinterval);
		state.update_viewer.updatetime = timeAsMilli;
		state.update_viewer.timeinterval =
		    window.setInterval(
		        function(){ cmds.update_viewer( { 'viewer_id' : viewerID } ) },
		        state.update_viewer.updatetime);
	},

	update_viewer: function(cmd_args) {
	    var viewerID = cmd_args['viewer_id'];

		var CHECK_IMAGE_PORT = "8099";
        var CHECK_IMAGE_URL = "http://172.17.0.1:" + CHECK_IMAGE_PORT + "/vis/checkImage";
        var params = { 'since': state.update_viewer.latest_time };
        jQuery.getJSON(CHECK_IMAGE_URL, params, function(data) {

            if (data) {
                // There's a new image.
                state.update_viewer.latest_time = data.timestamp;

				var url = data.uri;
				var resumed = state.update_viewer.updatelist[viewerID];
				if (resumed) {
					state.update_viewer.new_image.url = url;
					cmds.update_viewer_now(cmd_args);
				}
				else {
				    // We are paused
				    var but = $('#' + viewerID + '---update_now');
				    but.prop('disabled', false);
				    but.attr('value', 'There is a new image available. Click to load.');

				    // Store the new image
				    state.update_viewer.new_image.url = url;
				}
			}

			if (state.update_viewer.new_image.url == null) {
			    // Displayed when there is no new image, or the new image is done loading.
			    var but = $('#' + viewerID + '---update_now');
			    but.prop('disabled', true);
			    but.attr('value', 'There are no new images.');
			}
        });
	},

	resume: function(cmd_args) {
	    var viewerID = cmd_args['viewer_id'];

		jQuery("#" + viewerID + "---pause_resume").attr('value', 'Pause');
		state.update_viewer.updatelist[viewerID] = true;
		cmds.update_viewer_now(cmd_args);
	},

	pause: function(cmd_args) {
	    var viewerID = cmd_args['viewer_id'];

		jQuery("#" + viewerID + "---pause_resume").attr('value', 'Resume');
		state.update_viewer.updatelist[viewerID] = false;
	},

	update_viewer_now: function(cmd_args) {
	    var url = state.update_viewer.new_image.url;

	    if (url) {
	        var viewerID = cmd_args['viewer_id'];

	        state.lsstviewers['ffview'].plot({url: url, Title: viewerID, ZoomType: 'TO_WIDTH'});
		    // Clear all boxes
            for (var key in state.boxes) {
                if (state.boxes.hasOwnProperty(key)) {
                    cmds.clear_box([ key ]);
                }
            }
		    //cmds.hide_boundary(state, '', ['ffview']); // clear the red boundary

		    state.current_image_url = url;
		    state.update_viewer.new_image.url = null;

		    // Change button status
		    var but = $('#' + viewerID + '---update_now');
		    but.prop('disabled', true);
		    but.attr('value', 'There are no new images.');
		}
	},

	load_image: function(state, cmd_args) {
		var help_string = 'load an image from a URI';
		var uri = cmd_args[1];
		var re = /^https?:/;
		var result = "";
		result = "Image: " + uri;
		var viewer = state.lsstviewers.ffview;
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
		return null;
	},

	hot_pixel: function(cmd_args) {
	    var viewerID = cmd_args['viewer_id'];
		var region_id = viewerID + '-hotpixel';
		var threshold = parseInt(cmd_args['threshold']);
		var region = parse_region(cmd_args['region']) || "all";
		if (state.lsstviewers[region_id]) {
			firefly.removeRegionData(state.lsstviewers[region_id], region_id);
			state.lsstviewers[region_id] = undefined;
		}

		read_hotpixels({
		    filename: "default",
		    threshold: "max",
		    "region": {"rect": region}
			},
			function(regions) {
		    state.lsstviewers[region_id] = regions;
		    firefly.overlayRegionData(regions, region_id, 'hotpixel', viewerID);
		});
	},

	show_boundary: function(cmd_args) {
		var viewer = cmd_args['viewer_id'];
		var plotid = viewer; // ffview as a default
		var region_id = plotid + '-boundary';
		if (state.lsstviewers[region_id]) {
			firefly.removeRegionData(state.lsstviewers[region_id], region_id);
			state.lsstviewers[region_id] = undefined;
		}
		read_boundary(plotid, function(regions) {
			state.lsstviewers[region_id] = regions;
			firefly.overlayRegionData(regions, region_id, 'Boundary', plotid);
		})
	},

	hide_boundary: function(cmd_args) {
		var viewer = cmd_args['viewer_id'];
		var plotid = viewer;
		var region_id = plotid + '-boundary';
		if (state.lsstviewers[region_id]) {
			firefly.removeRegionData(state.lsstviewers[region_id], region_id);
			state.lsstviewers[region_id] = undefined;
			state.term.echo("Boundary Removed");
		} else {
			state.term.echo("The boundary has not been drawn yet.");
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
			state.boxes[name] = {
				select: box,
			};
			state.term.echo("Success!\n");
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

	hide_box: function(cmd_args) {
		var name = cmd_args['box_id'];
		if (!state.boxes[name]) {
			state.term.echo("The box \'" + name + "\' does not exist!\n");
		} else {
			state.boxes[name].select.classed('box-hide', true);
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

	viewer: function(state, cmd_args) {
		var name = cmd_args[1];
		if (!state.boxes[name]) {
			state.term.echo("The box \'" + name + "\' does not exist!\n");
		} else {
			view_id = "view-" + name;
			cmds.clear_box(state, ['', name]);
			var content = state.boxes[name].select.select('.box-content').attr('id', view_id);
			state.lsstviewers[view_id] = loadFirefly(view_id);
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

	read_mouse: function(cmd_args) {
		var name = cmd_args['box_id'];
		if (!state.boxes[name]) {
			state.term.echo("The box \'" + name + "\' does not exist!\n");
		} else {
			var viewer = cmd_args['viewer_id'] || 'ffview';
			cmds.clear_box([name]);
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
			img.src = state.current_image_url;

			var getRegion = function(pt) {
	    		var x = Math.floor(pt.x / width);
	    		var y = Math.floor(pt.y / height);
	    		return 'Region <' + x + ',' + y + '>';
	  		}
			state.show_readouts.add(name, function(data) {
				x_point.text(Math.floor(data.ipt.x));
				y_point.text(Math.floor(data.ipt.y));
	    		region_name.text(getRegion(data.ipt));
	  		});
	  		state.boxes[name].clear = function() {
	    		state.show_readouts.remove(name);
	  		};
		}
	},

	average_pixel: function(cmd_args) {
		console.log(cmd_args);
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
			if (state.lsstviewers[region_id]) {
				firefly.removeRegionData(state.lsstviewers[region_id], region_id);
				state.lsstviewers[region_id] = undefined;
			}
			var content = ['box', region.left, region.bottom, region.right - region.left, region.bottom - region.top, 0, '#color=red'].join(' ');

			state.lsstviewers[region_id] = [content];
			if (firefly.overlayRegionData) {
				firefly.overlayRegionData([content], region_id, "Boundary", plotid);
			}
			firefly.getJsonFromTask("python", "average", {'rect': region}).then(function(data) {
			    third_line.text('value: ' + data["result"]);
			});
		}
	}
}
