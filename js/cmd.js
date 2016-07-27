
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
		'show_viewer viewer_id' : {
			'callback' : cmds.show_viewer,
			'description' : 'Maximizes a viewer and brings it to the front of the window.',
			'doc_link' : docLink + '#show_viewer'
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
	
	var autoCompleteParams = [
		'box_id',
		'viewer_id'
	];
	
	var terminalProperties = {
		helpLink: docLink,
	    prefix: '~>',
	    width: '100%',
	    height: 300,
	    fontSize: '1.5em'
	};

	state.term = jQuery('#cmd').terminal( commands, subCommands, autoCompleteParams, terminalProperties );
});




// Terminal commands handlers
cmds = {

	average_pixel: function(cmd_args) {
		var boxID = cmd_args['box_id'];
		var viewerID = cmd_args['viewer_id'];
		if (state.boxes[boxID] && state.viewers[viewerID]) {
		
			// The region to do the calculation over
			var region = cmd_args['region'];
			
			// A handle to the viewer
			var viewer = state.viewers[viewerID];
			// A handle to the ff image viewer
			var imageViewer = viewer.ffHandle;
			// A handle to the box to use
			var box = state.boxes[boxID];
			
			// Clear the box of any existing information
			cmds.clear_box( { 'box_id' : boxID } );
			
			// Clear the viewer
			var plotID = viewerID;
			var regionID = plotID + '-boundary';
			if (imageViewer[regionID]) {
				firefly.removeRegionData(imageViewer[regionID], regionID);
				imageViewer[regionID] = undefined;
			}
			
			// Show region on image viewer
			var imageRegion = region_to_overlay(region);
			imageViewer[regionID] = [ imageRegion ];
			if (firefly.overlayRegionData) {
				firefly.overlayRegionData( [ imageRegion ], regionID, "Boundary", plotID);
			}
			
			var boxText = [
				'Processing average_pixel...'
			];
			box.setText(boxText);
			
			// Call average_pixel python task
			firefly.getJsonFromTask("python", "average", parse_region(region) ).then(function(data) {
			
				boxText = [
					'average_pixel',
					new BoxText('Viewer', viewerID),
					[
						'Region:'
					].concat(region_to_boxtext(region)),
					':line-dashed:',
					new BoxText('Average Pixel Value', data['result'])
				];
				box.setText(boxText);
				
			});
            
		} 
		else if (!state.boxes[boxID]) {
			state.term.echo('A box with that name does not exist!');
		}
		else if (!state.viewers[viewerID]) {
			state.term.echo('A viewer with that name does not exist!');
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
		var boxID = cmd_args['box_id'];
		
		if (state.boxes[boxID]) {
			state.boxes[boxID].clear();
		} else {
			state.term.echo('A box with that name does not exist!');
		}
	},

	create_box: function(cmd_args) {
		var name = cmd_args['box_id'];
		
		if (!state.boxes[name]) {
			var box = new Box(name);
			box.dom.draggable({
				'handle' : '.box-title',
				drag : onChangeFocus
			});
			box.dom.on('click', onChangeFocus);
		
			state.boxes[name] = box;
			
			cmds.show_box( { 'box_id' : name } );
		}
		else {
			state.term.echo('A box with that name already exists!');
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
				'cancel' : '.viewer-view',
				drag : onChangeFocus
			});
			viewer.container.on('click', onChangeFocus);
			
			cmds.show_viewer( { 'viewer_id' : viewerID } );
		}
		else {
			state.term.echo('The viewer \'' + viewerID + '\' already exists!');
		}
	},

	delete_box: function(cmd_args) {
		var name = cmd_args['box_id'];
		
		if (state.boxes[name]) {
			state.boxes[name].destroy();
			delete state.boxes[name];
		}
		else {
			state.term.echo('A box with that name does not exist!');
		}
	},

	hide_boundary: function(cmd_args) {
		var viewerID = cmd_args['viewer_id'];
		var plotid = viewerID;
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
		var boxID = cmd_args['box_id'];
		
		if (state.boxes[boxID]) {
			// Do we have to move terminal?
			if (jQuery('#box-minimized-bar').children('.box').length == 0)
				jQuery('#cmd').css('bottom', '60px');
		
			// A handle to the box
			var box = state.boxes[boxID];
			box.minimize();
			box.dom.draggable('disable');
			jQuery('#box-minimized-bar').append(box.dom);
		}
		else {
			state.term.echo('A box with that name does not exist!');
		}		
	},

	hot_pixel: function(cmd_args) {
		var viewerID = cmd_args['viewer_id'];
		if (state.viewers[viewerID]) {
		
			var threshold = parseInt(cmd_args['threshold']);
			var region = parse_region(cmd_args['region']);
			
			// A handle to the ff image viewer
			var imageViewer = state.viewers[viewerID].ffHandle;
			
			var regionID = viewerID + '-hotpixel';
			if (state.viewers[regionID]) {
				firefly.removeRegionData(imageViewer[regionID], regionID);
				imageViewer[regionID] = undefined;
			}

			read_hotpixels(
				{
					filename: "default",
					threshold: "max",
					"region": region
				},
				function(regions) {
					imageViewer[regionID] = regions;
					firefly.overlayRegionData(regions, regionID, 'hotpixel', viewerID);
				}
			);
            
		}
		else {
			state.term.echo('A viewer with that name does not exist!');
		}
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
		var boxID = cmd_args['box_id'];
		var viewerID = cmd_args['viewer_id'];
		
		if (state.boxes[boxID] && state.viewers[viewerID]) {
			var box = state.boxes[boxID];
			var viewer = state.viewers[viewerID];
			
			// Clear 
			cmds.clear_box( { 'box_id' : boxID } );
		
			var boxText = [
				'read_mouse',
				new BoxText('Viewer', viewerID),
				[
					'Point: ',
					new BoxText('X', ''),
					new BoxText('Y', '')
				]
			];
			box.setText(boxText);
			
			var readoutID = viewer.readout.register('READ_MOUSE', function(data) {
				boxText = [
					'read_mouse',
					new BoxText('Viewer', viewerID),
					[
						'Point: ',
						new BoxText('X', Math.trunc(data.ipt.x)),
						new BoxText('Y', Math.trunc(data.ipt.y))
					]
				];
				box.setText(boxText);
	  		});
	  		box.onClear(
	  			function() {
	    			viewer.readout.unregister('READ_MOUSE', readoutID);
	  			}
	  		);
	  		
	  		/*  // get the size of an image
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
	  		};*/
		
		}
		else if (!state.boxes[boxID]) {
			state.term.echo('A box with that name does not exist!');
		}
		else if (!state.viewers[viewerID]) {
			state.term.echo('A viewer with that name does not exist!');
		}
	},

	show_boundary: function(cmd_args) {
		var viewerID = cmd_args['viewer_id'];
		var plotid = viewerID; // ffview as a default
		var region_id = plotid + '-boundary';
        var viewer = state.viewers[viewerID];
        if (!(viewer.show_boundary)){
            if (viewer.header){
                firefly.overlayRegionData(viewer.header["regions_ds9"], region_id, 'Boundary', plotid);
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
		var boxID = cmd_args['box_id'];
		
		if (state.boxes[boxID]) {
			// A handle to the box
			var box = state.boxes[boxID];
			
			box.dom.detach();
			jQuery('body').append(box.dom);
			
			var focusFunc = onChangeFocus;
			focusFunc.bind(box.dom);
			focusFunc();
			
			box.maximize();
			box.dom.draggable('enable');
			
			// Do we have to move the terminal?
			if (jQuery('#box-minimized-bar').children('.box-mini').length == 0)
				jQuery('#cmd').css('bottom', '5px');
		}
		else {
			state.term.echo('A box with that name does not exist!');
		}
	},
	
	show_viewer : function(cmd_args) {
		var viewerID = cmd_args['viewer_id'];
		
		if (state.viewers[viewerID]) {
			var dom = state.viewers[viewerID].container;
			
			var focusFunc = onChangeFocus;
			focusFunc.bind(dom);
			focusFunc();
		}
		else {
			state.term.echo('A viewer with that name does not exist!');
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
