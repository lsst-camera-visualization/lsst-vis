LSST.extend('LSST.state')


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

    jQuery.getJSON("commands.json", function(data) {
        for (command in data) {
            if (data.hasOwnProperty(command)) {
                var commandName = LSST_TERMINAL.Utility.SplitStringByWS(command)[0];
                data[command].callback = cmds[commandName];
            }
        }

        var terminalOptions = {
            // The description of commands that can be entered by the user
            commands: data,

            // Parameters that require more than a single word.
            // These will be wrapped in parenthesis's by the user.
            subCommands: [
                'rect x1 y1 x2 y2',
                'circ originX originY radius'
            ],

            // Parameters that can be auto completed using tab.
            // Will be updated (through code) when necessary, through a terminal function.
            autoCompleteParams: {
                'box_id': ['ffbox'],
                'viewer_id': ['ffview']
            },

            // Hints for certain parameters. Will be displayed to the user
            // when he/she comes upon this parameter.
            paramsWithHint: {
                'region': 'Hint: (rect), (circ), or selected'
            },

            // Various properties for the terminal.
            properties: {
                helpLink: "https://github.com/lsst-camera-visualization/frontend/wiki",
                prefix: '~>',
                fontSize: '150%'
            },

            defaults: {
                "viewer_id": LSST.state.defaults.viewer,
                "box_id": LSST.state.defaults.box
            },

            examples: {
                "region": [
                    "(rect 1000 1200 3000 3200)",
                    "sel",
                    "amp06data"
                ]
            }

        }

        // Create the terminal
        LSST.state.term = new LSST.UI.Terminal({
            name: 'MainTerminal',
            terminalOptions: terminalOptions,
            settings: LSST.getSettings("MainTerminal")
        });

    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("Error loading commands.json: " + errorThrown);
    });

});



var executeBackendFunction = function(nameOfTask, viewer, params, onFulfilled, onRejected) {
    if (nameOfTask == 'boundary') {
        params.image_url = viewer.original_image_url;
    } else {
        params.image_url = viewer.image_url;
    }
    console.log(params);
    firefly.getJsonFromTask('python', nameOfTask, params).then(function(data) {
        onFulfilled(data);
    }).catch(function(data) {
        onRejected(data);
    })
}

function validateParams(cmd_args) {
    if (cmd_args.viewer_id != undefined && !LSST.state.viewers.exists(cmd_args.viewer_id)) {
        LSST.state.term.lsst_term('echo', 'A viewer with the name \'' + cmd_args.viewer_id + '\' does not exist!');
        return false;
    }

    if (cmd_args.box_id != undefined && !LSST.state.boxes.exists(cmd_args.box_id)) {
        LSST.state.term.lsst_term('echo', 'A box with the name \'' + cmd_args.box_id + '\' does not exist!');
        return false;
    }

    return true;
}

var getRegion = function(region, viewer) {
    var result = null;

    if (region === "sel") {
        if (!viewer.selectedAmp) {
            LSST.state.term.lsst_term("echo", "This viewer does not have a selected region.");
            result = null;
        }
        else
            result = viewer.convertAmpToRect(viewer.selectedAmp);
    } else if (typeof(region) == "string") {
        // If we are here, the region should be the name of an amp,
        //    so convert the name to an LSST.UI.Region
        result = viewer.convertAmpToRect(region);
    } else if (Array.isArray(region)) {
        result = LSST.UI.Region.Parse(region)
    }

    // If we have an null region, echo invalidity to user
    if (result == null)
        LSST.state.term.lsst_term("echo", "Please enter a valid region");

    return result;
}


// Terminal commands handlers
cmds = {

    average_pixel: function(cmd_args, userInput) {
        var boxID = cmd_args['box_id'];
        var viewerID = cmd_args['viewer_id'];

        var box = LSST.state.boxes.get(boxID);
        var viewer = LSST.state.viewers.get(viewerID);

        if (!validateParams(cmd_args))
            return;

        // The region to do the calculation over
        var regionParam = cmd_args['region'];

        // Get region, return if it is invalid
        var region = getRegion(regionParam, viewer);
        if (region == null)
            return;

        // Clear the box of any existing information
        cmds.clear_box({
            'box_id': boxID
        });

        // Clear the viewer
        viewer.clear_except_boundary();

        // Draw the region on the viewer
        viewer.drawRegions([region.toDS9()], 'Average Pixel', 'yellow');

        var boxText = [
            'Processing average_pixel...'
        ];
        box.setText(boxText);

        // Call average_pixel python task
        var params = region.toBackendFormat();

        executeBackendFunction('average', viewer, params,
            function(data) {
                boxText = [
                    'average_pixel',
                    'Viewer: ' + viewerID, [
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
                    new LSST.UI.BoxText('User Input', userInput, false),
                    new LSST.UI.BoxText('Error', data, false)
                ];

                box.setText(boxText);
            }
        );
    },

    chart: function(cmd_args) {
        if (!validateParams(cmd_args))
            return;

        var viewerID = cmd_args.viewer_id;
        var viewer = LSST.state.viewers.get(viewerID);

        // Get region, return if it is invalid
        var region = getRegion(cmd_args.region, viewer);
        if (region == null)
            return;

        var params = {
            numBins: (cmd_args.num_bins == undefined) ? 10 : parseInt(cmd_args.num_bins),
            min: (cmd_args.min == undefined) ? -1 : parseInt(cmd_args.min),
            max: (cmd_args.max == undefined) ? -1 : parseInt(cmd_args.max),
            region: region.toBackendFormat()
        }
        executeBackendFunction('chart', LSST.state.viewers.get(cmd_args.viewer_id), params,
            function(data) {
                var h = LSST.UI.Histogram.FromJSONString(data);
                h.setFocus(true);
            },

            function(data) {
                console.log("Failure: " + data);
            }
        );
    },

    clear_box: function(cmd_args) {
        if (!validateParams(cmd_args))
            return;

        var boxID = cmd_args['box_id'];
        var box = LSST.state.boxes.get(boxID);
        box.clear();
    },

    clear_viewer: function(cmd_args) {
        if (!validateParams(cmd_args))
            return;

        var viewerID = cmd_args['viewer_id'];
        var viewer = LSST.state.viewers.get(viewerID);
        viewer.clear();
    },

    create_box: function(cmd_args) {
        var boxID = cmd_args['box_id'];

        if (LSST.state.boxes.exists(boxID)) {
            LSST.state.term.lsst_term('echo', 'A box with the name \'' + boxID + '\' already exists!');
            return;
        }

        var box = new LSST.UI.Box({
            name: boxID
        });
        LSST.state.boxes.add(boxID, box);

        if (LSST.state.boxes.size() == 1)
            cmds.default_box({
                box_id: boxID
            });

        cmds.show_box({
            'box_id': boxID
        });
    },

    create_viewer: function(cmd_args) {
        var viewerID = cmd_args['viewer_id'];
        var image = cmd_args['[image]'];

        if (LSST.state.viewers.exists(viewerID)) {
            LSST.state.term.lsst_term('echo', 'A viewer with the name \'' + viewerID + '\' already exists!');
            return;
        }

        var viewer = new LSST.UI.Viewer({
            name: viewerID,
            image: image
        });
        LSST.state.viewers.add(viewerID, viewer);

        if (LSST.state.viewers.size() == 1)
            cmds.default_viewer({
                viewer_id: viewerID
            });

        viewer.addExtension('Choose Command...', 'AREA_SELECT', viewerCommands.display_area_commands);

        var uvControl = new LSST.UI.UV_Control(viewer, "http://172.17.0.1:8099/vis/checkImage");
        LSST.state.uvControls.add(viewerID, uvControl);

        cmds.show_viewer({
            'viewer_id': viewerID
        });
    },

    default_box: function(cmd_args) {
        var boxID = cmd_args.box_id;

        if (boxID === null || LSST.state.boxes.exists(boxID)) {
            LSST.state.defaults.box = boxID;
            LSST.state.term.lsst_term("setDefault", {
                param: "box_id",
                value: boxID
            });
        } else {
            LSST.state.term.lsst_term("echo", "A box with that name does not exist!");
        }
    },

    default_viewer: function(cmd_args) {
        var viewerID = cmd_args.viewer_id;

        if (viewerID === null || LSST.state.viewers.exists(viewerID)) {
            LSST.state.defaults.viewer = viewerID;
            LSST.state.term.lsst_term("setDefault", {
                param: "viewer_id",
                value: viewerID
            });
        } else {
            LSST.state.term.lsst_term("echo", "A viewer with that name does not exist!");
        }
    },

    delete_box: function(cmd_args) {
        var boxID = cmd_args['box_id'];

        if (LSST.state.boxes.exists(boxID)) {
            LSST.state.boxes.get(boxID).destroy();
            LSST.state.boxes.remove(boxID);

            if (LSST.state.defaults.box == boxID) {
                if (LSST.state.boxes.size() > 0)
                    cmds.default_box({
                        box_id: LSST.state.boxes.get()
                    });
                else
                    cmds.default_box({
                        box_id: null
                    });
            }

            LSST.state.term.lsst_term("deleteParameterAuto", {
                param: 'box_id',
                value: boxID
            });
        } else {
            LSST.state.term.lsst_term('echo', 'A box with the name \'' + boxID + '\' does not exist!');
        }
    },

    delete_viewer: function(cmd_args) {
        var viewerID = cmd_args.viewer_id;

        if (LSST.state.viewers.exists(viewerID)) {
            var viewer = LSST.state.viewers.get(viewerID);
            viewer.destroy();
            LSST.state.viewers.remove(viewerID);

            if (LSST.state.defaults.viewer == viewerID) {
                if (LSST.state.viewers.size() > 0)
                    cmds.default_viewer({
                        viewer_id: LSST.state.viewers.get()
                    });
                else
                    cmds.default_viewer({
                        viewer_id: null
                    });
            }

            LSST.state.term.lsst_term("deleteParameterAuto", {
                param: 'viewer_id',
                value: viewerID
            });
        } else {
            LSST.state.term.lsst_term("echo", "A viewer with the name '" + viewerID + "' does not exist!");
        }
    },

    hide_boundary: function(cmd_args) {
        if (!validateParams(cmd_args))
            return;

        var viewerID = cmd_args['viewer_id'];
        var plotID = viewerID;
        var regionID = plotID + '-boundary';
        var viewer = LSST.state.viewers.get(viewerID);
        if (viewer.show_boundary) {
            viewer.show_boundary = false;
            viewer.clearLayer('Boundary');
            LSST.state.term.lsst_term('echo', "Boundary Removed");
        } else {
            LSST.state.term.lsst_term('echo', "The boundary has not been drawn yet.");
        }
    },

    hot_pixel: function(cmd_args) {

        var viewerID = cmd_args['viewer_id'];
        var viewer = LSST.state.viewers.get(viewerID);

        var threshold = 'max';
        if (cmd_args['threshold'] !== 'max') {
            threshold = parseInt(cmd_args['threshold']);
        }

        // Get region, return if it is invalid
        var region = getRegion(cmd_args.region, viewer);
        if (region == null)
            return;

        var regionID = viewerID + '-hotpixel';
        var plotID = viewerID;

        viewer.clear_except_boundary();
        viewer.drawRegions([region.toDS9()], 'Hot Pixel Boundary', 'yellow');

        var region_backend = region.toBackendFormat();
        var param_backend = {
            'threshold': threshold,
            "region": region_backend
        }

        executeBackendFunction('hot_pixel', viewer, param_backend,
            function(data) {
                var regions = [];
                var color = 'red';
                for (var i = 0; i < data.length; i++) {
                    var d = data[i];
                    // ds9 point format: (circle point x, y)
                    var content = ['circle', 'point', d[1], d[0]].join(' ');
                    regions.push(content);
                }
                viewer.drawRegions(regions, 'Hot Pixels', 'red');
            },
            function(data) {
                LSST.state.term.lsst_term('echo', 'There was a problem when fetching hot pixel information in the FITS file.');
                LSST.state.term.lsst_term('echo', 'Please make sure all parameters were typed in correctly.');
            }
        );
    },

    load_image: function(cmd_args) {
        if (!validateParams(cmd_args))
            return;

        var help_string = 'load an image from a URI';
        var viewerID = cmd_args['viewer_id'];
        var uri = cmd_args['uri'];
        var viewer = LSST.state.viewers.get(viewerID);
        var result = viewer.loadImage(uri);

        LSST.state.viewers.get(viewerID).image_url = uri;
        LSST.state.term.lsst_term("echo", result);
        console.log(LSST.state.viewers.get(viewerID));
        return null;
    },

    maximize_terminal: function(cmd_args) {
        LSST.state.term.maximize();
    },

    minimize_terminal: function(cmd_args) {
        LSST.state.term.minimize();
    },

    read_mouse: function(cmd_args) {
        if (!validateParams(cmd_args))
            return;

        var boxID = cmd_args['box_id'];
        var viewerID = cmd_args['viewer_id'];

        var box = LSST.state.boxes.get(boxID);
        var viewer = LSST.state.viewers.get(viewerID);

        var plotID = viewerID;
        var regionID = plotID + '-boundary';

        // Clear
        cmds.clear_box({
            'box_id': boxID
        });

        var boxText = [
            'read_mouse',
            new LSST.UI.BoxText('Viewer', viewerID), [
                'Point: ',
                new LSST.UI.BoxText('X', ''),
                new LSST.UI.BoxText('Y', ''),
            ],
            'Processing boundary from back end...'
        ];
        box.setText(boxText);

        cmds.show_boundary({
            'viewer_id': viewerID
        });

        LSST.state.term.lsst_term('echo', 'Boundaries of amplifiers shown by default. Use `hide_boundary` to hide it.');


        // Set click event on viewer image, for selecting a region
        viewer.html.children("#" + viewer.name).click(
            function(e) {
                if (e.ctrlKey)
                    viewer.selectedAmp = viewer.cursorAmpName;
            }
        );



        boxText = [
            'read_mouse',
            new LSST.UI.BoxText('Viewer', viewerID), [
                'Point: ',
                new LSST.UI.BoxText('X', ''),
                new LSST.UI.BoxText('Y', ''),
            ],
            'Move the cursor in the viewer to get mouse readout...'
        ];
        box.setText(boxText);

        var readoutID = viewer.onCursorMove(
            function(data) {
                // Update box's text
                boxText = [
                    'read_mouse',
                    new LSST.UI.BoxText('Viewer', viewerID), [
                        'Point: ',
                        new LSST.UI.BoxText('X', Math.trunc(viewer.cursorPoint.x)),
                        new LSST.UI.BoxText('Y', Math.trunc(viewer.cursorPoint.y))
                    ],
                    [
                        'Region/segment: ',
                        new LSST.UI.BoxText('X', viewer.hoveredSeg.x),
                        new LSST.UI.BoxText('Y', viewer.hoveredSeg.y)
                    ],
                    new LSST.UI.BoxText("Region name", viewer.cursorAmpName),
                    new LSST.UI.BoxText("Currently selected region", viewer.selectedAmp)
                ];

                box.setText(boxText);
            }
        );

        box.onClear(
            function() {
                viewer.onCursorMove(null);
            }
        );
    },

    show_boundary: function(cmd_args) {
        if (!validateParams(cmd_args))
            return;

        var viewerID = cmd_args['viewer_id'];
        var plotID = viewerID; // ffview as a default
        var regionID = plotID + '-boundary';
        var viewer = LSST.state.viewers.get(viewerID);
        if (!(viewer.show_boundary)) {
            if (viewer.header) {
                viewer.drawRegions(viewer.header['regions_ds9'], 'Boundary', 'red');
                viewer.show_boundary = true;
            } else {
                viewer.fetch_boundary(function(regions) { // Asynchronous
                    viewer.header = regions;
                    viewer.drawRegions(regions['regions_ds9'], 'Boundary', 'red');
                    viewer.show_boundary = true;
                });
            }
        } else {
            LSST.state.term.lsst_term('echo', "Boundary of this viewer is already drawn.")
        }
    },

    show_box: function(cmd_args) {
        if (!validateParams(cmd_args))
            return;

        var boxID = cmd_args['box_id'];

        // A handle to the box
        var box = LSST.state.boxes.get(boxID);
        box.maximize();
        box.html.draggable('option', 'handle', '.box-title');

        box.setFocus(true);

        var toolbar = box.html.children('.LSST_TB-toolbar');
        var max = jQuery(toolbar.children()[1]);
        max.attr('src', 'js/toolbar/images/minimize_40x40.png');
        max.data('onClick', cmds.hide_box);
    },

    show_viewer: function(cmd_args) {
        if (!validateParams(cmd_args))
            return;

        var viewerID = cmd_args['viewer_id'];
        LSST.state.viewers.get(viewerID).setFocus(true);
    },

    uv_freq: function(cmd_args) {
        if (!validateParams(cmd_args))
            return;

        var viewerID = cmd_args['viewer_id'];
        LSST.state.uvControls.get(viewerID).setFrequency(cmd_args['time_in_millis']);
    },

    uv_load_new: function(cmd_args) {
        if (!validateParams(cmd_args))
            return;

        var viewerID = cmd_args['viewer_id'];
        LSST.state.uvControls.get(viewerID).loadNewImage();
    },

    uv_pause: function(cmd_args) {
        if (!validateParams(cmd_args))
            return;

        var viewerID = cmd_args['viewer_id'];
        LSST.state.uvControls.get(viewerID).pause();
    },

    uv_resume: function(cmd_args) {
        if (!validateParams(cmd_args))
            return;

        var viewerID = cmd_args['viewer_id'];
        LSST.state.uvControls.get(viewerID).resume();
    },

    uv_start: function(cmd_args) {
        if (!validateParams(cmd_args))
            return;

        cmds.uv_resume(cmd_args);
    },

    uv_update: function(cmd_args) {
        if (!validateParams(cmd_args))
            return;

        var viewerID = cmd_args['viewer_id'];
        LSST.state.uvControls.get(viewerID).update();
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

viewerCommandParameterForms = {
    'VCAVG': jQuery(
        ' \
        	<div class="viewer-command-params-entry"> \
            <span>Output Box:</span> \
            <input type="text" data-param-name="box_id"/> \
          </div> \
        '),

    'VCHOT': jQuery(
        ' \
        	<div class="viewer-command-params-entry"> \
            <span>Threshold:</span> \
            <input type="text" data-param-name="threshold"/> \
          </div> \
        '),

    'VCCHART': jQuery(
        ' \
        	<div class="viewer-command-params-entry"> \
            <span>Number of bins:</span> \
            <input type="text" size=3 data-param-name="num_bins" value="10"/> \
          </div> \
          <div class="viewer-command-params-entry"> \
            <span>Min:</span> \
            <input type="text" size=10 data-param-name="min" value="0"/> \
          </div> \
          <div class="viewer-command-params-entry"> \
            <span>Max:</span> \
            <input type="text" size=10 data-param-name="max" value="0"/> \
          </div> \
        ')
}

var viewerCommands = {
    display_area_commands: function(data) {
        var viewerID = data.plotId;

        if (jQuery('.viewer-command-container').size() > 0)
            return;

        container = jQuery(' \
		    <div class="viewer-command-container"> \
              <div class="viewer-command-left"> \
                <ul class="viewer-command-commandlist"> \
                  <li class="viewer-command-entry" id="VCAVG" data-cmd="average_pixel">Average Pixel</li> \
                  <li class="viewer-command-entry" id="VCHOT" data-cmd="hot_pixel">Hot Pixel</li> \
                  <li class="viewer-command-entry" id="VCCHART" data-cmd="chart">Chart</li> \
                </ul> \
              </div> \
              <div class="viewer-command-right"> \
                <h1 class="viewer-command-params-header">Parameters</h1> \
                <div id="viewer-command-params"></div> \
                <button id="viewer-command-execute">Execute Command</button> \
              </div> \
            </div> \
            ');

        var options = {
            toolbar: {
                desc: [
                    new LSST_TB.ToolbarElement(
                        'close', {
                            onClick: function(c) {
                                c.html.remove()
                            },
                            parameters: {
                                html: container
                            },
                        }
                    )
                ],
                options: {
                    bShowOnHover: false
                }
            },
            html: container
        }
        popup = new LSST.UI.UIElement(options);

        jQuery('body').append(container);

        jQuery('.viewer-command-entry').click(function() {
            var id = jQuery(this).attr('id')

            var form = jQuery('#viewer-command-params').empty()
            form.append(viewerCommandParameterForms[id]);

            LSST.state.currentViewerCommand = jQuery(this).data('cmd');
        });

        jQuery('#viewer-command-execute').click(function() {
            var form = jQuery('#viewer-command-params');
            var entries = form.children('.viewer-command-params-entry');
            var params = {};
            entries.children('input').each(function(idx, elem) {
                e = jQuery(elem);
                params[e.data('param-name')] = e.val();
            });

            params.viewer_id = viewerID;
            params.region = new LSST.UI.Rect(data.ipt0.x, data.ipt0.y, data.ipt1.x, data.ipt1.y).toCmdLineArrayFormat();

            cmds[LSST.state.currentViewerCommand](params);

            container.remove();
        });
    }
}
