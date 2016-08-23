
jQuery(document).ready(function() {

	// Init state
	LSST.state.boxes = new LSST.UIElementList();
	LSST.state.viewers = new LSST.UIElementList();

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
			'description' : 'If in a paused LSST.state and there is a new image available, calling this command will load the new image without changing the LSST.state.',
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
	    'rect x1 y1 x2 y2',
	    'circ originX originY radius'
	];

	var autoCompleteParams = {
		'box_id' : [ 'ffbox' ],
		'viewer_id' : [ 'ffview' ]
	};

	var paramsWithHint = {
		'region' : 'Hint: (rect), (circ), or selected'
	}

	var terminalProperties = {
		helpLink: docLink,
	    prefix: '~>',
	    fontSize: '150%'
	};
	LSST.state.term = jQuery('#cmd').terminal( commands, subCommands, autoCompleteParams, paramsWithHint, terminalProperties );

});



var executeBackendFunction = function(nameOfTask, params, onFulfilled, onRejected) {

	firefly.getJsonFromTask( 'python', nameOfTask, params ).then(onFulfilled, onRejected);

}


// Terminal commands handlers
cmds = {

	average_pixel: function(cmd_args) {
		var boxID = cmd_args['box_id'];
		var viewerID = cmd_args['viewer_id'];

		var boxExists = LSST.state.boxes.exists(boxID);
		var viewerExists = LSST.state.viewers.exists(viewerID);
		if (boxExists && viewerExists) {

			// The region to do the calculation over
			var region = cmd_args['region'];

			// A handle to the viewer
			var viewer = LSST.state.viewers.get(viewerID);
			// A handle to the ff image viewer
			var imageViewer = viewer;
			// A handle to the box to use
			var box = LSST.state.boxes.get(boxID);

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
			var params = parse_region(region);
			executeBackendFunction('average', params,
				function(data) {
					boxText = [
						'average_pixel',
						'Viewer: ' + viewerID,
						[
							'Region:'
						].concat(region_to_boxtext(region)),
						':line-dashed:',
						new BoxText('Average Pixel Value', data['result'])
					];
					box.setText(boxText);
				},

				function(data) {
					// Called when there was a problem with the promise function
					boxText = [
						'There was a problem with executing the average_pixel function',
						'\n',
						'Please make sure all parameters were typed in correctly',
						new BoxText('Data', data, false)
					];

					box.setText(boxText);
				}
			);
		}
		else if (!boxExists) {
			LSST.state.term.echo('A box with the name \'' + boxID + '\' does not exist!');
		}
		else if (!viewerExists) {
			LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
		}
	},

	/*chart: function(LSST.state, cmd_args) {
		var name = cmd_args[1];
		if (!LSST.state.boxes[name]) {
			LSST.state.term.echo("The box \'" + name + "\' does not exist!\n");
		} else {
			cmds.clear_box(LSST.state, [name]);
			var content = LSST.state.boxes[name].select.select('.box-content').attr('id', 'chart-' + name);
			nv.addGraph(function() {
				return draw_graph(content)
			});
		}
	},

	chart2: function(LSST.state, cmd_args) {
		var name = cmd_args[1];
		if (!LSST.state.boxes[name]) {
			LSST.state.term.echo("The box \'" + name + "\' does not exist!\n");
		} else {
			cmds.clear_box(LSST.state, ['', name]);
			var content = LSST.state.boxes[name].select.select('.box-content').attr('id', 'chart2-' + name);
			nv.addGraph(function() {
				return draw_graph2(content)
			})
		}
	},*/

	clear_box: function(cmd_args) {
		var boxID = cmd_args['box_id'];

		if (LSST.state.boxes.exists(boxID)) {
			var box = LSST.state.boxes.get(boxID);

			box.clear();
		} else {
			LSST.state.term.echo('A box with the name \'' + boxID + '\' does not exist!');
		}
	},

	create_box: function(cmd_args) {
		var boxID = cmd_args['box_id'];

		if (!LSST.state.boxes.exists(boxID)) {
			var box = new Box(boxID);
			box.dom.draggable( {
				distance : 10,
				handle : '.box-title',
				drag : onChangeFocus
			});

			box.dom.on('click', onChangeFocus);

			var closeData = {
				onClick : cmds.delete_box,
				parameters : { box_id : boxID },
			}
			var miniData = {
				onClick : cmds.hide_box,
				parameters : { box_id : boxID },
			}
			var toolbarDesc = [
				new LSST_TB.ToolbarElement('close', closeData),
				new LSST_TB.ToolbarElement('mini', miniData),
			];
			var options = {
				bShowOnHover : true,
			};
			box.dom.lsst_toolbar(toolbarDesc, options);

			// Resizable
			box.dom.resizable( {
				handles : 'se',
			} );

			LSST.state.boxes.add(boxID, box);

			cmds.show_box( { 'box_id' : boxID } );
		}
		else {
            LSST.state.term.echo('A box with the name \'' + boxID + '\' already exists!');
		}
	},

	create_viewer: function(cmd_args) {
		var viewerID = cmd_args['viewer_id'];

		if (!LSST.state.viewers.exists(viewerID)) {
			var viewer = new Viewer(viewerID);

			viewer.readout.register('SELECT_REGION', selectRegion);

			var c = jQuery(viewer.container);
			// Add draggable
			c.draggable( {
				distance : 10,
				cancel : '.viewer-view',
				drag : onChangeFocus
			} );

			// Add resizable
			var w = c.css('width');
			var h = c.css('height');
			c.css('min-height', h);
			c.resizable( {
				handles : 'se',
				alsoResize : c.children('viewer-view'),
				minWidth : w,
				minHeight : h,
			} );

			viewer.container.on('click', onChangeFocus);

			LSST.state.viewers.add(viewerID, viewer);

			cmds.show_viewer( { 'viewer_id' : viewerID } );
		}
		else {
			LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' already exist!');
		}
	},

	delete_box: function(cmd_args) {
		var boxID = cmd_args['box_id'];

		if (LSST.state.boxes.exists(boxID)) {
			LSST.state.boxes.get(boxID).destroy();

			LSST.state.boxes.remove(boxID);

			LSST.state.term.deleteParameterAuto('box_id', boxID);
		}
		else {
			LSST.state.term.echo('A box with the name \'' + boxID + '\' does not exist!');
		}
	},

	hide_boundary: function(cmd_args) {
		var viewerID = cmd_args['viewer_id'];
		var plotid = viewerID;
		var region_id = plotid + '-boundary';
        var viewer = LSST.state.viewers.get(viewerID);
        if (viewer){
            if (viewer.show_boundary){
                viewer.show_boundary = false;
                firefly.removeRegionData(viewer.header["regions_ds9"], region_id);
                LSST.state.term.echo("Boundary Removed");
            }else{
                LSST.state.term.echo("The boundary has not been drawn yet.");
            }
        }else{
            LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
        }
	},

	hide_box: function(cmd_args) {
		var boxID = cmd_args['box_id'];

		if (LSST.state.boxes.exists(boxID)) {
			// A handle to the box
			var box = LSST.state.boxes.get(boxID);
			box.minimize();
			box.dom.draggable('option', 'handle', '.box-title-mini');

			var toolbar = box.dom.children('.LSST_TB-toolbar');
			var mini = jQuery(toolbar.children()[1]);
			mini.attr('src', 'js/toolbar/images/maximize_40x40.png');
			mini.data('onClick', cmds.show_box);
		}
		else {
			LSST.state.term.echo('A box with the name \'' + boxID + '\' does not exist!');
		}
	},

	hot_pixel: function(cmd_args) {
		var viewerID = cmd_args['viewer_id'];
		if (LSST.state.viewers.exists(viewerID)) {

			var threshold = 'max';
			if (cmd_args['threshold']!=='max'){
					threshold = parseInt(cmd_args['threshold']);
			}
			var region = parse_region(cmd_args['region']);

			// A handle to the ff image viewer
			var imageViewer = LSST.state.viewers.get(viewerID);

			var regionID = viewerID + '-hotpixel';
			if (imageViewer[regionID]) {
				firefly.removeRegionData(imageViewer[regionID], regionID);
				imageViewer[regionID] = undefined;
			}

			read_hotpixels(
				{
					filename: "default",
					threshold: threshold,
					"region": region
				},
				function(regions) {
					imageViewer[regionID] = regions;
					firefly.overlayRegionData(regions, regionID, 'hotpixel', viewerID);
				}
			);

		}
		else {
            LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
		}
	},

	load_image: function(cmd_args) {
		var help_string = 'load an image from a URI';
		var viewerID = cmd_args['viewer_id'];
		var uri = cmd_args['uri'];
		var re = /^https?:/;
		var result = "";
		result = "Image: " + uri;
		var viewer = LSST.state.viewers.get(viewerID).ffHandle;
		if (re.test(uri)) { // this is a URL
		    viewer.plot({
		        "URL" : uri,
		        "Title" : result,
		        "ZoomType" : "TO_WIDTH"
		    });
		    LSST.state.term.echo(result);
		} else {
		    result = uri + " !matched " + re;
		    viewer.plot({
		        "File" : uri,
		        "Title" : result,
		        "ZoomType" : "TO_WIDTH"
		    });
		    LSST.state.term.echo(result);
		}
		LSST.state.viewers.get(viewerID).image_url = uri;
		console.log(LSST.state.viewers.get(viewerID));
		return null;
	},
	
	maximize_terminal : function(cmd_args) {
		LSST.state.term.maximize();
		jQuery('#cmd_container').outerHeight(LSST.state.term.outerHeight(true));
		
		var toolbar = jQuery('#cmd_container').children('.LSST_TB-toolbar');
		var max = jQuery(toolbar.children()[1]);
		max.attr('src', 'js/toolbar/images/minimize_40x40.png');
		max.data('onClick', cmds.minimize_terminal);
	},
	
	minimize_terminal : function(cmd_args) {
		LSST.state.term.minimize();
		jQuery('#cmd_container').outerHeight(LSST.state.term.outerHeight(true));
		
		var toolbar = jQuery('#cmd_container').children('.LSST_TB-toolbar');
		var mini = jQuery(toolbar.children()[1]);
		mini.attr('src', 'js/toolbar/images/maximize_40x40.png');
		mini.data('onClick', cmds.maximize_terminal);
	},

	read_mouse: function(cmd_args) {
		var boxID = cmd_args['box_id'];
		var viewerID = cmd_args['viewer_id'];

		var boxExists = LSST.state.boxes.exists(boxID);
		var viewerExists = LSST.state.viewers.exists(viewerID);
		if (boxExists && viewerExists) {
			var box = LSST.state.boxes.get(boxID);
			var viewer = LSST.state.viewers.get(viewerID);

            var plotid = viewerID;
    		var region_id = plotid + '-boundary';

			// Clear
			cmds.clear_box( { 'box_id' : boxID } );

			var boxText = [
				'read_mouse',
				new BoxText('Viewer', viewerID),
				[
					'Point: ',
					new BoxText('X', ''),
					new BoxText('Y', ''),
				],
                'Processing boundary from back end...'
			];
			box.setText(boxText);

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
            }

            LSST.state.term.echo('Boundary of amplifiers shown by default. Use `hide_boundary` to hide it.');

            boxText = [
                'read_mouse',
                new BoxText('Viewer', viewerID),
                [
                    'Point: ',
                    new BoxText('X', ''),
                    new BoxText('Y', ''),
                ],
                'Move the cursor in the viewer to get mouse readout...'
            ];
            box.setText(boxText);

			var readoutID = viewer.readout.register('READ_MOUSE', function(data) {
                var mouse_x = Math.trunc(data.ipt.x);
                var mouse_y = Math.trunc(data.ipt.y);

                var header_info = viewer.header['header'];
                var width = header_info['SEG_DATASIZE']['x'];
                var height = header_info['SEG_DATASIZE']['y'];
                var boundary = header_info['BOUNDARY'];
                var num_y = header_info['NUM_AMPS']['y']; // Segments origin at top left. Need to flip the Y coordinate for segment coordinate.

                if (viewer.overscan){
                    width = header_info['SEG_SIZE']['x'];
                    height = header_info['SEG_SIZE']['y'];
                    boundary = header_info['BOUNDARY_OVERSCAN'];
                }
                var seg_x = Math.floor(mouse_x/width);
                var seg_y = num_y - 1 - Math.floor(mouse_y/height);

				boxText = [
					'read_mouse',
					new BoxText('Viewer', viewerID),
					[
						'Point: ',
						new BoxText('X', mouse_x),
						new BoxText('Y', mouse_y)
					],
                    [
                        'Region/segment: ',
                        new BoxText('X', seg_x),
                        new BoxText('Y', seg_y)
                    ],
                    new BoxText('EXTNAME', (boundary[seg_y][seg_x])['EXTNAME'])
				];
				box.setText(boxText);
	  		});
	  		box.onClear(
	  			function() {
	    			viewer.readout.unregister('READ_MOUSE', readoutID);
	  			}
	  		);
		}
		else if (!boxExists) {
			LSST.state.term.echo('A box with the name \'' + boxID + '\' does not exist!');
		}
		else if (!viewerExists) {
            LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
		}
	},

	show_boundary: function(cmd_args) {
		var viewerID = cmd_args['viewer_id'];
		var plotid = viewerID; // ffview as a default
		var region_id = plotid + '-boundary';
        var viewer = LSST.state.viewers.get(viewerID);
        if (viewer){
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
                LSST.state.term.echo("Boundary of this viewer is already drawn.")
            }
        }else{
			LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
        }
	},

	show_box: function(cmd_args) {
		var boxID = cmd_args['box_id'];

		if (LSST.state.boxes.exists(boxID)) {
			// A handle to the box
			var box = LSST.state.boxes.get(boxID);
			box.maximize();
			box.dom.draggable('option', 'handle', '.box-title');

			var focusFunc = onChangeFocus;
			focusFunc.bind(box.dom);
			focusFunc();

			var toolbar = box.dom.children('.LSST_TB-toolbar');
			var max = jQuery(toolbar.children()[1]);
			max.attr('src', 'js/toolbar/images/minimize_40x40.png');
			max.data('onClick', cmds.hide_box);
		}
		else {
			LSST.state.term.echo('A box with the name \'' + boxID + '\' does not exist!');
		}
	},

	show_viewer : function(cmd_args) {
		var viewerID = cmd_args['viewer_id'];

		if (LSST.state.viewers.exists(viewerID)) {
			var dom = LSST.state.viewers.get(viewerID).container;

			var focusFunc = onChangeFocus;
			focusFunc.bind(dom);
			focusFunc();
		}
		else {
            LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
		}
	},

	uv_freq: function(cmd_args){

	    var viewerID = cmd_args['viewer_id'];

	    if (LSST.state.viewers.exists(viewerID)) {
			var viewer = LSST.state.viewers.get(viewerID);

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
		}
		else {
            LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
		}
	},

	uv_load_new: function(cmd_args) {
		var viewerID = cmd_args['viewer_id'];

		if (LSST.state.viewers.exists(viewerID)) {
			var viewer = LSST.state.viewers.get(viewerID);

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
				var id = viewerID + '---update_now';
				var button = jQuery('input[data-buttonID="' + id + '"]');
				button.prop('disabled', true);
				button.attr('value', 'There are no new images.');
			}
		}
		else {
            LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
		}
	},

	uv_pause: function(cmd_args) {
	    var viewerID = cmd_args['viewer_id'];

	    if (LSST.state.viewers.exists(viewerID)) {
			var viewer = LSST.state.viewers.get(viewerID);

			var id = viewerID + '---pause_resume';
			var button = jQuery('input[data-buttonID="' + id + '"]');
			button.attr('value', 'Resume');

			viewer.uv.paused = true;
		}
		else {
            LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
		}
	},

	uv_resume: function(cmd_args) {
	    var viewerID = cmd_args['viewer_id'];

	    if (LSST.state.viewers.exists(viewerID)) {
			var viewer = LSST.state.viewers.get(viewerID);

			var id = viewerID + '---pause_resume';
			var button = jQuery('input[data-buttonID="' + id + '"]');
			button.attr('value', 'Pause');

			viewer.uv.paused = false;
			cmds.uv_load_new( { 'viewer_id' : viewerID } );
		}
		else {
            LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
		}
	},

	uv_update: function(cmd_args) {
	    var viewerID = cmd_args['viewer_id'];

	    if (LSST.state.viewers.exists(viewerID)) {
			var viewer = LSST.state.viewers.get(viewerID);

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
						var id = viewerID + '---update_now';
						var button = jQuery('input[data-buttonID="' + id + '"]');
						button.prop('disabled', false);
						button.attr('value', 'There is a new image available. Click to load.');
					}
				}

				if (viewer.uv.newest_image == null) {
					// Displayed when there is no new image, or the new image is done loading.
					var id = viewerID + '---update_now';
					var button = jQuery('input[data-buttonID="' + id + '"]');
					button.prop('disabled', true);
					button.attr('value', 'There are no new images.');
				}
		    });
        }
		else {
            LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
		}
	}
}
