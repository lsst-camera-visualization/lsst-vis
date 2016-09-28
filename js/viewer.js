
LSST.extend('LSST.UI');

// A struct containing data related to the update viewer commands.
// - freq: The update viewer frequency
// - image_ts: The timestamp of when it received the image it's displaying
// - newest_image: The url of the newest image returned by the rest server
// - paused: true if the update_viewer timer is disabled, false otherwise
// - timer_id: The id used by setinterval and clearinterval
LSST.UI.UV_Data = function() {
	this.freq = 10000;
	this.image_ts = 0;
	this.newest_image = null;
	this.paused = true;
	this.timer_id = null;
}

// An object used for dispatching readouts from Firefly (such as read_mouse or area_select)
LSST.UI.FFReadout = function(viewerID) {
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
		var actions = firefly.appFlux.getActions('ExternalAccessActions');
		actions.extensionAdd(ext);
		callbacks[name] = [];
	}

	// General button for selecting an area
	var areaSelectionExt = {
		id : 'SELECT_REGION',
		plotId : viewerID,
		title : 'Select Region',
		toolTip : 'Area selection tool tip',
		extType : 'AREA_SELECT',
		callback : dispatch
	};
	createExt(areaSelectionExt, 'SELECT_REGION');
	
	// Calculate average_pixel over a region
	var averagePixelExt = {
		id : 'AVERAGE_PIXEL',
		plotId : viewerID,
		title : 'Average Pixel',
		toolTip : 'Calculate the average pixel value over the region',
		extType : 'AREA_SELECT',
		callback : dispatch
	};
	createExt(averagePixelExt, 'AVERAGE_PIXEL');
	
	// Find the hot pixels over a region
	var averagePixelExt = {
		id : 'HOT_PIXEL',
		plotId : viewerID,
		title : 'Hot Pixel',
		toolTip : 'Finds the hot pixels over the region and displays them',
		extType : 'AREA_SELECT',
		callback : dispatch
	};
	createExt(averagePixelExt, 'HOT_PIXEL');

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
LSST.UI.Viewer = function(options) {
	this.html = jQuery(createViewerSkeleton(options.name));
	this.ffHandle = loadFirefly(options.name);
	this.image_url = null;
	this.uv = new LSST.UI.UV_Data();
	this.readout = new LSST.UI.FFReadout(options.name);

	this.header = null;
	this.show_boundary = false;
	this.overscan = false;

	// Call uv_update every uv.freq milliseconds
	this.uv.timer_id =
		setInterval(
			function() {
				cmds.uv_update( { 'viewer_id' : options.name } );
			},
			this.uv.freq
		);
		
	
	options.draggable = {
		cancel : '.viewer-view',
	};
	
	var w = this.html.css('width'); var h = this.html.css('height');
	this.html.css('min-height', h);
	options.resizable = {
		handles : 'se',
		alsoResize : this.html.children('viewer-view'),
		minWidth : w,
		minHeight : h
	}
	
	// Init from UIElement
	LSST.UI.UIElement.prototype._init.call(this, options);
}

// Inherit from LSST.UI.UIElement
LSST.inherits(LSST.UI.Viewer, LSST.UI.UIElement);


// Draws regions on the viewer.
// @param regions - An array containing the ds9 regions to draw
LSST.UI.Viewer.prototype.drawRegions = function(regions) {
	
}

// Clears the image the viewer from any markings
LSST.UI.Viewer.prototype.clear = function() {
	
}


// Called when the user selects a region in a viewer.
var selectRegion = function(data) {
	
	var region;
    if (data.type == 'AREA_SELECT') {
        var x1 = Math.trunc(data.ipt0.x);
        var y1 = Math.trunc(data.ipt0.y);
        var x2 = Math.trunc(data.ipt1.x);
        var y2 = Math.trunc(data.ipt1.y);
        region = [ 'rect', x1, y1, x2, y2 ];
    }
    
    if (data.id == 'SELECT_REGION') {
   		var regionAsString = region_to_string(region);
   		LSST.state.term.setVariable('selected', '(' + regionAsString + ')');
        jQuery("#ffview-var-selected").css('color', 'white');
    }
    else if (data.id == 'AVERAGE_PIXEL') {
    	cmds.average_pixel( { 'box_id' : 'ffbox', 'viewer_id' : data.PlotId, 'region' : region } );
    }
    else if (data.id == 'HOT_PIXEL') {
    	// Once we actually use the threshold value, we will need a way for the user to set it
    	var threshold = 1.0;
    	cmds.hot_pixel( { 'viewer_id' : data.PlotId, 'threshold' : threshold, 'region' : region } );
    }
}


// Handles button clicks for viewers
var onClickViewer = function() {
	var id = jQuery(this).attr('data-buttonID');
    var viewerID = id.split('---')[0];
    var whichButton = id.split('---')[1];

    switch (whichButton)
    {
        case "pause_resume":
            if (jQuery(this).attr('value') == "Pause")
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
var createViewerSkeleton = function(viewerID) {

	var container = jQuery('<div>').addClass('viewer');
	var infoHeader = jQuery('<p>').addClass('viewer-title').text(viewerID);
	var viewer = jQuery('<div>').addClass('viewer-view').attr('id', viewerID);

	var viewerInfo = jQuery('<div>').addClass('viewer-info');

	var updateViewer = jQuery('<div>').addClass('viewer-data border-right');
	var UVHeader = jQuery('<p>').addClass('viewer-data-header').text('Update Viewer Settings');
	var UVPauseResume = jQuery('<input>').addClass('button').on('click', onClickViewer).attr('type', 'button').attr('value', 'Resume').attr('data-buttonID', viewerID + '---pause_resume');
	var UVUpdateNow = jQuery('<input>').addClass('button').on('click', onClickViewer).attr('type', 'button').attr('value', 'There are no new images.').attr('data-buttonID', viewerID + '---update_now').prop('disabled', true);

	var terminalVariables = jQuery('<div>').addClass('viewer-data');
	var TVHeader = jQuery('<p>').addClass('viewer-data-header').text('Terminal Variables');
	var TVSelected = jQuery('<p>').addClass('viewer-data-text viewer-data-text-unselected').attr('id', viewerID + '-var-selected').text('selected');

	container.append(infoHeader);
	container.append(viewer);

	container.append(viewerInfo);

	viewerInfo.append(updateViewer);
	updateViewer.append(UVHeader);
	updateViewer.append(UVPauseResume);
	updateViewer.append(UVUpdateNow);

	viewerInfo.append(terminalVariables);
	terminalVariables.append(TVHeader);
	terminalVariables.append(TVSelected);

	$('body').append(container);

	return container;
}
