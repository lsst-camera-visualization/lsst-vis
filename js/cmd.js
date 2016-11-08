
/*
  _______    _     _         ____   __    _____            _             _
 |__   __|  | |   | |       / __ \ / _|  / ____|          | |           | |
    | | __ _| |__ | | ___  | |  | | |_  | |     ___  _ __ | |_ ___ _ __ | |_ ___
    | |/ _` | '_ \| |/ _ \ | |  | |  _| | |    / _ \| '_ \| __/ _ \ '_ \| __/ __|
    | | (_| | |_) | |  __/ | |__| | |   | |___| (_) | | | | ||  __/ | | | |_\__ \
    |_|\__,_|_.__/|_|\___|  \____/|_|    \_____\___/|_| |_|\__\___|_| |_|\__|___/


1. Init of terminal
2. Commands, as executed by the terminal
3. Commands, as executed by the viewer toolbar

*/


jQuery(document).ready(function() {

    var docLink = 'https://github.com/lsst-camera-visualization/frontend/wiki';
	var commands = {
		'average_pixel box_id viewer_id region' : {
			'callback' : cmds.average_pixel,
			'description' : 'Calculates the average pixel value for the region.',
			'doc_link' : docLink + '#average_pixel'
		},
		'chart viewer_id region' : {
			callback : cmds.chart,
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
		'uv_start viewer_id' : {
			callback : cmds.uv_resume,
			description : 'Begins the update viewer cycle for a viewer.',
			doc_link : docLink + '#uv_start'
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



var executeBackendFunction = function(nameOfTask, viewer, params, onFulfilled, onRejected) {
	if (nameOfTask=='boundary'){
		params.image_url = viewer.original_image_url;
	}else{
		params.image_url = viewer.image_url;
	}
	console.log(params);
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
			var regionParam = cmd_args['region'];

			// A handle to the viewer
			var viewer = LSST.state.viewers.get(viewerID);
			// A handle to the ff image viewer
			var imageViewer = viewer;
			// A handle to the box to use
			var box = LSST.state.boxes.get(boxID);

			// Clear the box of any existing information
			cmds.clear_box( { 'box_id' : boxID } );

			// Clear the viewer
			viewer.clear();

			var region = LSST.UI.Region.Parse(regionParam);
			viewer.drawRegions( [ region.toDS9() ], 'Average Pixel');

			var boxText = [
				'Processing average_pixel...'
			];
			box.setText(boxText);

			// Call average_pixel python task
			var params = region.toBackendFormat();
            console.log(params);
			executeBackendFunction('average', viewer, params,
				function(data) {
					boxText = [
						'average_pixel',
						'Viewer: ' + viewerID,
						[
							'Region:'
						].concat(region.toBoxText()),
						':line-dashed:',
						new LSST.UI.BoxText('Average Pixel Value', data['result'])
					];
					box.setText(boxText);
				},

				function(data) {
					// Called when there was a problem with the promise function
					boxText = [
						'There was a problem with executing the average_pixel function',
						'\n',
						'Please make sure all parameters were typed in correctly',
						new LSST.UI.BoxText('Error', data, false)
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

	chart: function(cmd_args) {
	    if (LSST.state.viewers.exists(cmd_args.viewer_id)) {
	        region = LSST.UI.Region.Parse(cmd_args.region);
	        params = {
	            numBins : 10,
	            region : region.toBackendFormat()
	        }
	        executeBackendFunction('chart', LSST.state.viewers.get(cmd_args.viewer_id), params,
	            function(data) {
	                console.log("Success: " + data);
	                var h = LSST.UI.Histogram.fromJSONString(data);
	                h.setFocus(true);
	            },

	            function(data) {
	                console.log("Failure: " + data);
	            }
	        );
		}
	},

	clear_box: function(cmd_args) {
		var boxID = cmd_args['box_id'];

		if (LSST.state.boxes.exists(boxID)) {
			var box = LSST.state.boxes.get(boxID);
			box.clear();
		} else {
			LSST.state.term.echo('A box with the name \'' + boxID + '\' does not exist!');
		}
	},

	clear_viewer : function(cmd_args) {
		var viewerID = cmd_args['viewer_id'];

		if (LSST.state.viewers.exists(viewerID)) {
			var viewer = LSST.state.viewers.get(viewerID);
			viewer.clear();
		}
		else {
			LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
		}
	},

	create_box: function(cmd_args) {
		var boxID = cmd_args['box_id'];

		if (!LSST.state.boxes.exists(boxID)) {
			var box = new LSST.UI.Box( { name : boxID } );
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
			var viewer = new LSST.UI.Viewer( { name : viewerID } );
			LSST.state.viewers.add(viewerID, viewer);

			viewer.addExtension('Average Pixel', 'AREA_SELECT', viewerCommands.average_pixel );

			var uvControl = new LSST.UI.UV_Control(viewer, "http://172.17.0.1:8099/vis/checkImage");
			LSST.state.uvControls.add(viewerID, uvControl);

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
		var plotID = viewerID;
		var regionID = plotID + '-boundary';
        var viewer = LSST.state.viewers.get(viewerID);
        if (viewer){
            if (viewer.show_boundary){
                viewer.show_boundary = false;
                firefly.action.dispatchDeleteRegionLayer(regionID, plotID);
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
			box.html.draggable('option', 'handle', '.box-title-mini');

			var toolbar = box.html.children('.LSST_TB-toolbar');
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
            var plotID = viewerID;
			if (imageViewer[regionID]) {
                firefly.action.dispatchDeleteRegionLayer(regionID, plotID);
				imageViewer[regionID] = undefined;
			}

			read_hotpixels(
				{
					threshold: threshold,
					"region": region
				},
				function(regions) {
					imageViewer[regionID] = regions;
                    firefly.action.dispatchCreateRegionLayer(regionID, regionID, null, regions, plotID);
				},
				imageViewer
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

            var plotID = viewerID;
    		var regionID = plotID + '-boundary';

			// Clear
			cmds.clear_box( { 'box_id' : boxID } );

			var boxText = [
				'read_mouse',
				new LSST.UI.BoxText('Viewer', viewerID),
				[
					'Point: ',
					new LSST.UI.BoxText('X', ''),
					new LSST.UI.BoxText('Y', ''),
				],
                'Processing boundary from back end...'
			];
			box.setText(boxText);

            if (!(viewer.show_boundary)){
                if (viewer.header){
                    firefly.action.dispatchCreateRegionLayer(regionID, regionID, null, viewer.header["regions_ds9"], plotID);
                    viewer.show_boundary = true;
                }else{
                    read_boundary({},
						function(regions) { // Asynchronous
	                        viewer.header = regions;
	                        firefly.action.dispatchCreateRegionLayer(regionID, regionID, null, viewer.header["regions_ds9"], plotID);
	                        viewer.show_boundary = true;
						},
						viewer
					);
                }
            }

            LSST.state.term.echo('Boundary of amplifiers shown by default. Use `hide_boundary` to hide it.');

            boxText = [
                'read_mouse',
                new LSST.UI.BoxText('Viewer', viewerID),
                [
                    'Point: ',
                    new LSST.UI.BoxText('X', ''),
                    new LSST.UI.BoxText('Y', ''),
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
					new LSST.UI.BoxText('Viewer', viewerID),
					[
						'Point: ',
						new LSST.UI.BoxText('X', mouse_x),
						new LSST.UI.BoxText('Y', mouse_y)
					],
                    [
                        'Region/segment: ',
                        new LSST.UI.BoxText('X', seg_x),
                        new LSST.UI.BoxText('Y', seg_y)
                    ],
                    new LSST.UI.BoxText('EXTNAME', (boundary[seg_y][seg_x])['EXTNAME'])
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
		var plotID = viewerID; // ffview as a default
		var regionID = plotID + '-boundary';
        var viewer = LSST.state.viewers.get(viewerID);
        if (viewer){
            if (!(viewer.show_boundary)){
                if (viewer.header){
                    firefly.action.dispatchCreateRegionLayer(regionID, regionID, null, viewer.header["regions_ds9"], plotID);
                    viewer.show_boundary = true;
                }else{
                    read_boundary({},
						function(regions) { // Asynchronous
	                        viewer.header = regions;
	                        firefly.action.dispatchCreateRegionLayer(regionID, regionID, null, viewer.header["regions_ds9"], plotID);
	                        viewer.show_boundary = true;
						},
						viewer);
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
			box.html.draggable('option', 'handle', '.box-title');

			box.setFocus(true);

			var toolbar = box.html.children('.LSST_TB-toolbar');
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
			LSST.state.viewers.get(viewerID).setFocus(true);
		}
		else {
            LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
		}
	},

	uv_freq: function(cmd_args) {
	    var viewerID = cmd_args['viewer_id'];

	    if (LSST.state.viewers.exists(viewerID)) {
	    	LSST.state.uvControls.get(viewerID).setFrequency( cmd_args['time_in_millis'] );
		}
		else {
            LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
		}
	},

	uv_load_new: function(cmd_args) {
		var viewerID = cmd_args['viewer_id'];

		if (LSST.state.viewers.exists(viewerID)) {
			LSST.state.uvControls.get(viewerID).loadNewImage();
		}
		else {
            LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
		}
	},

	uv_pause: function(cmd_args) {
	    var viewerID = cmd_args['viewer_id'];

	    if (LSST.state.viewers.exists(viewerID)) {
			LSST.state.uvControls.get(viewerID).pause();
		}
		else {
            LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
		}
	},

	uv_resume: function(cmd_args) {
	    var viewerID = cmd_args['viewer_id'];

	    if (LSST.state.viewers.exists(viewerID)) {
			LSST.state.uvControls.get(viewerID).resume();
		}
		else {
            LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
		}
	},

	uv_update: function(cmd_args) {
	    var viewerID = cmd_args['viewer_id'];

	    if (LSST.state.viewers.exists(viewerID)) {
			LSST.state.uvControls.get(viewerID).update();
        }
		else {
            LSST.state.term.echo('A viewer with the name \'' + viewerID + '\' does not exist!');
		}
	}
}








/*
 __      ___                           _____                                          _
 \ \    / (_)                         / ____|                                        | |
  \ \  / / _  _____      _____ _ __  | |     ___  _ __ ___  _ __ ___   __ _ _ __   __| |___
   \ \/ / | |/ _ \ \ /\ / / _ \ '__| | |    / _ \| '_ ` _ \| '_ ` _ \ / _` | '_ \ / _` / __|
    \  /  | |  __/\ V  V /  __/ |    | |___| (_) | | | | | | | | | | | (_| | | | | (_| \__ \
     \/   |_|\___| \_/\_/ \___|_|     \_____\___/|_| |_| |_|_| |_| |_|\__,_|_| |_|\__,_|___/
*/

var viewerCommands = {
	average_pixel : function(data) {
		var viewerID = data.plotId;
		LSST.state.viewers.get(viewerID);

		console.log(data);
	}
}
