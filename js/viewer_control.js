

// A struct containing data related to the update viewer commands.
// - freq: The update viewer frequency
// - image_ts: The timestamp of when it received the image it's displaying
// - newest_image: The url of the newest image returned by the rest server
// - paused: true if the update_viewer timer is disabled, false otherwise
// - timer_id: The id used by setinterval and clearinterval
UV_Data = function() {
	this.freq = 10000;
	this.image_ts = 0;
	this.newest_image = null;
	this.paused = true;
	this.timer_id = null;
}

// An object used for dispatching readouts from Firefly (such as read_mouse or area_select)
function FFReadout(viewerID) {
	var callbacks = {};
	var extConv = {
		'AREA_SELECT' : 'SELECT_REGION',
		'PLOT_MOUSE_READ_OUT' : 'READ_MOUSE',
	};

	this.register = function(ext, callback) {
		callbacks[ext].push(callback);
		return callbacks[ext].length - 1;
	};

	this.unregister = function(ext, idx) {
		callbacks[ext].splice(idx, 1);
	};

	var dispatch = function(data) {
		var ext = extConv[data.type];
		var cbArray = callbacks[ext];
		for (var i = 0; i < cbArray.length; i++) {
			//if (data.plotId == viewerID) {
				var cb = cbArray[i];
				cb(data);
			//}
		}
	};

	var createExt = function(ext, name) {
		actions.extensionAdd(ext);
		callbacks[name] = [];
	}

	var actions = firefly.appFlux.getActions('ExternalAccessActions');
	var areaSelectionExt = {
		id : 'SELECT_REGION',
		plotId : viewerID,
		title : 'Select Region',
		toolTip : 'Area selection tool tip',
		extType : 'AREA_SELECT',
		callback : dispatch
	};
	createExt(areaSelectionExt, 'SELECT_REGION');

	// Read mouse extension
	var readMouseExt = {
		plotId : viewerID,
		extType : 'PLOT_MOUSE_READ_OUT',
		callback : dispatch
	};
	createExt(readMouseExt, 'READ_MOUSE');
}

// A viewer contains the following properties:
// - ffHandle: A handle to the firefly viewer.
// - image_url: The url of the image the viewer is currently displaying
// - uv: A UV_Data object.
// - readout: An FFReadout object.
// - header: Store the header information of the image in the Viewer.
function Viewer(id) {
	this.container = createViewerSkeleton(id);
	this.ffHandle = loadFirefly(id);
	this.image_url = null;
	this.uv = new UV_Data();
	this.readout = new FFReadout(id);

	this.header = null;
	this.show_boundary = false;

	// Call uv_update every uv.freq milliseconds
	this.uv.timer_id =
		setInterval(
			function() {
				cmds.uv_update( { 'viewer_id' : id } );
			},
			this.uv.freq
		);
}




// Called when the user selects a region in a viewer.
// This function formats the data and sets it in the terminal variable called 'selected'.
var selectRegion = function(data) {

    if (data.type == 'AREA_SELECT') {
        var top = data.ipt0.y;
        var bottom = data.ipt1.y;
        var left = data.ipt0.x;
        var right = data.ipt1.x;

        state.term.setVariable('selected', 'rect ' + top + ' ' + left + ' ' + bottom + ' ' + right);

        jQuery("#ffview-var-selected").css('color', 'white');
    }

}


// Handles button clicks for viewers
var onClickViewer = function(id) {
    var elem = jQuery('#' + id);
    var viewerID = id.split('---')[0];
    var whichButton = id.split('---')[1];

    switch (whichButton)
    {
        case "pause_resume":
            if (elem.attr('value') == "Pause")
            	cmds.uv_pause( { 'viewer_id' : viewerID } );
            else
                cmds.uv_resume( { 'viewer_id' : viewerID } );

            break;

        case "update_now":
            cmds.uv_load_new( { 'viewer_id' : viewerID } );
            break;
    }
};


// Creates an HTML skeleton of a viewer. The parent container is called viewerID-container (ie ffview-container).
// NOTE: Does not function properly, this function only creates the html.
var createViewerSkeleton = function(viewerID) {

	var container = jQuery('<div class="viewer" id="' + viewerID + '-container"></div>');
	var containerID = '#' + viewerID + '-container';

	var main = jQuery('<div class="viewer-main"></div>');
	var infoHeader = jQuery('<p class="viewer-info-header">' + viewerID + '</p>');
	var expandFunc = jQuery('<img src="./images/func.png" class="viewer-expand-functions">');
	var viewer = jQuery('<div id="' + viewerID + '" class="viewer-view"></div>');

	var viewerInfo = jQuery('<div class="viewer-info"></div>');

	var updateViewer = jQuery('<div class="viewer-data border-right"></div>');
	var UVHeader = jQuery('<p class="viewer-data-header viewer-data-text">Update Viewer Settings</p>');
	var UVPauseResume = jQuery(' <input onclick="onClickViewer(this.id)" type="button" value="Resume" class="button" id="' + viewerID + '---pause_resume">');
	var UVUpdateNow = jQuery('<input onclick="onClickViewer(this.id)" type="button" value="There are no new images." class="button update-now" id="' + viewerID + '---update_now" disabled>');

	var terminalVariables = jQuery('<div class="viewer-data"></div>');
	var TVHeader = jQuery('<p class="viewer-data-header viewer-data-text">Terminal Variables</p>');
	var TVSelected = jQuery('<p class="viewer-data-text viewer-data-text-unselected" id="ffview-var-selected">selected</p>');

	var functionBar = jQuery('<div class="viewer-function-bar"></div>');
	var task1 = jQuery('<img src="./images/func.png" class="viewer-function-task">');
	var task2 = jQuery('<img src="./images/func.png" class="viewer-function-task">');
	var task3 = jQuery('<img src="./images/func.png" class="viewer-function-task">');
	var task4 = jQuery('<img src="./images/func.png" class="viewer-function-task">');
	var task5 = jQuery('<img src="./images/func.png" class="viewer-function-task">');

	jQuery('#leftside').append(container);

	container.append(main);
	main.append(infoHeader);
	main.append(expandFunc);
	main.append(viewer);

	main.append(viewerInfo);

	viewerInfo.append(updateViewer);
	updateViewer.append(UVHeader);
	updateViewer.append(UVPauseResume);
	updateViewer.append(UVUpdateNow);

	viewerInfo.append(terminalVariables);
	terminalVariables.append(TVHeader);
	terminalVariables.append(TVSelected);

	container.append(functionBar);
	functionBar.append(task1);
	functionBar.append(task2);
	functionBar.append(task3);
	functionBar.append(task4);
	functionBar.append(task5);

	expandFunc.on('click', toggleFunctionBar);

	return container;
}

// Hides or displays the function task toolbar in a viewer.
var toggleFunctionBar = function() {

	console.log('click');

	var viewer = jQuery(this).parent().parent();
	var functionBar = viewer.children('.viewer-function-bar');

	var currDisp = functionBar.css('display');
	var newDisp = (currDisp == 'none') ? 'block' : 'none';
	functionBar.css('display', newDisp);

}
