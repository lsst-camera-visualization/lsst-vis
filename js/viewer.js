LSST.extend('LSST.UI');



/*
 \ \    / (_)
  \ \  / / _  _____      _____ _ __
   \ \/ / | |/ _ \ \ /\ / / _ \ '__|
    \  /  | |  __/\ V  V /  __/ |
     \/   |_|\___| \_/\_/ \___|_|
*/

// A viewer contains the following properties:
// - ffHandle: A handle to the firefly viewer.
// - image_url: The url of the image the viewer is currently displaying
// - uv: A UV_Data object.
// - readout: An FFReadout object.
// - header: Store the header information of the image in the Viewer.
LSST.UI.Viewer = function(options) {

	this.html = jQuery(createViewerSkeleton(options.name));
	//this.readout = new LSST.UI.FFReadout(options.name);

	this.header = null;
	this.show_boundary = false;
	this.overscan = false;
	this._regionLayers = []


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

	this.loadImage(getNewImageURL());
	// this.loadImage(("http://web.ipac.caltech.edu/staff/roby/demo/wise-m51-band1.fits"));
	firefly.util.addActionListener(firefly.action.type.READOUT_DATA, this._cursorRead.bind(this));
}

// Inherit from LSST.UI.UIElement
LSST.inherits(LSST.UI.Viewer, LSST.UI.UIElement);


// Draws regions on the viewer.
// @param regions - An array containing the ds9 regions to draw
// @param layerName - The name describing the layer for these regions
LSST.UI.Viewer.prototype.drawRegions = function(regions, layerName) {
	for (var i = 0; i < regions.length; i++) {
		regions[i] = 'image;' + regions[i] + ' # color=blue';
	}

	if (this._regionLayers.indexOf(layerName) == -1)
		this._regionLayers.push(layerName)

	firefly.action.dispatchCreateRegionLayer(layerName, layerName, null, regions, this.name);
}

// Clears the image the viewer from any markings
LSST.UI.Viewer.prototype.clear = function() {
	for (var i = 0; i < this._regionLayers.length; i++)
		firefly.action.dispatchDeleteRegionLayer(this._regionLayers[i], [ this.name ]);

	this._regionLayers = [];
}

// Clears a layer of regions on this viewer
// @param layerName - The layer to clear
LSST.UI.Viewer.prototype.clearLayer = function(layerName) {
	firefly.action.dispatchDeleteRegionLayer(layerName, [ this.name ]);

	var idx = this._regionLayers.indexOf(layerName);
	if (idx != -1)
		this._regionLayers.splice(idx, 1)
}

// Displays a new image in the viewer.
// @param image - The path to the new image
LSST.UI.Viewer.prototype.loadImage = function(image) {
	this.clear();
	this.show_boundary = false;
	this.header = null;

	firefly.showImage(this.name, {
		plotId : this.name,
		URL : image,
		Title : this.name,
		ZoomType : 'TO_WIDTH',
		ZoomToWidth : '100%'
	});

	this.image_url = image;
	this.original_image_url = getNewOriginalImageURL(image);
}

// Adds a context extension to the viewer.
// @param [string] title - The title of this extension
// @param [string] type - The extension type, see firefly extension types
// @param [function] f - The function to execute for this extension
LSST.UI.Viewer.prototype.addExtension = function(title, type, f) {
	var ext = {
		id : title,
		plotId : this.name,
		title : title,
		extType : type,
		callback : f
	};

	firefly.util.image.extensionAdd(ext);
}

LSST.UI.Viewer.prototype._cursorRead = function(action) {
	if (action.payload.readoutItems.imagePt) {
		var imgPt = action.payload.readoutItems.imagePt.value;
		this.cursorPoint = {
			x : imgPt.x,
			y : imgPt.y
		}
	}
}







/*
  _    ___      __   _____            _             _
 | |  | \ \    / /  / ____|          | |           | |
 | |  | |\ \  / /  | |     ___  _ __ | |_ _ __ ___ | |
 | |  | | \ \/ /   | |    / _ \| '_ \| __| '__/ _ \| |
 | |__| |  \  /    | |___| (_) | | | | |_| | | (_) | |
  \____/    \/      \_____\___/|_| |_|\__|_|  \___/|_|


*/


// A control class to handle updating a viewer.
// @param viewer - The viewer for this control to use
// @param imageRepository - The location of the image repository to check
// @param bStartPaused - The UV_Control initially be paused?
// @param frequency - The initial frequency to check the image repository, in milliseconds (@default = 10000)
LSST.UI.UV_Control = function(viewer, imageRepository, bStartPaused = true, frequency = 10000) {
	this._viewer = viewer;
	this.imageRepo = imageRepository;

	this._bPaused = bStartPaused;
	this._timerID = null;
	this._timestamp = 0;
	this._newImage = null;

	this._minimumFreq = 10000;

	if (!this._bPaused)
	    this.setFrequency(frequency);
}

// Sets the new update frequency for this control.
// @param newFrequency - The new update frequency, in milliseconds
LSST.UI.UV_Control.prototype.setFrequency = function(newFrequency) {
	// Stop timer for viewer
	clearInterval(this._timerID);

	this._timerID = setInterval(LSST.UI.UV_Control.prototype.update.bind(this), Math.max(this._minimumFreq, newFrequency));
}

// Loads the new image, attained from LSST.UI.UV_Control.update().
LSST.UI.UV_Control.prototype.loadNewImage = function() {
	if (this._newImage != null) {
		if (this._newImage) {

			this._viewer.loadImage(this._newImage);

			// Change button status
			var id = this._viewer.name + '---update_now';
			var button = jQuery('input[data-buttonID="' + id + '"]');
			button.prop('disabled', true);
			button.attr('value', 'There are no new images.');
		}

		this._newImage = null;
	}
}

// Pauses this viewer control
LSST.UI.UV_Control.prototype.pause = function() {
	this._bPaused = true;

	var id = this._viewer.name + '---pause_resume';
	var button = jQuery('input[data-buttonID="' + id + '"]');
	button.attr('value', 'Resume');
}

// Resumes this viewer control
LSST.UI.UV_Control.prototype.resume = function() {
	this._bPaused = false;

	var id = this._viewer.name + '---pause_resume';
	var button = jQuery('input[data-buttonID="' + id + '"]');
	button.attr('value', 'Pause');

	// Load new image, if it exists
	this.loadNewImage();
}

// Called on a timer to check the image repository for new images.
LSST.UI.UV_Control.prototype.update = function() {
    var params = {
    	'since': this._timestamp
   	};

   	var updateFunc = function(data) {
   		if (data) {
            // There's a new image.
            this._timestamp = data.timestamp;
            this._newImage = data.uri;

			if (!this._bPaused) {
				this.loadNewImage();
			}
			else {
				var id = this._viewer.name + '---update_now';
				var button = jQuery('input[data-buttonID="' + id + '"]');
				button.prop('disabled', false);
				button.attr('value', 'There is a new image available. Click to load.');
			}
		}

		if (this._newImage == null) {
			// Displayed when there is no new image, or the new image is done loading.
			var id = this._viewer.name + '---update_now';
			var button = jQuery('input[data-buttonID="' + id + '"]');
			button.prop('disabled', true);
			button.attr('value', 'There are no new images.');
		}
   	}.bind(this);

    jQuery.getJSON(this.imageRepo, params, updateFunc);
}












/*
  _   _               _       _    _           _       _   _
 | \ | |             | |     | |  | |         | |     | | (_)
 |  \| | ___  ___  __| |___  | |  | |_ __   __| | __ _| |_ _ _ __   __ _
 | . ` |/ _ \/ _ \/ _` / __| | |  | | '_ \ / _` |/ _` | __| | '_ \ / _` |
 | |\  |  __/  __/ (_| \__ \ | |__| | |_) | (_| | (_| | |_| | | | | (_| |
 |_| \_|\___|\___|\__,_|___/  \____/| .__/ \__,_|\__,_|\__|_|_| |_|\__, |
                                    | |                             __/ |
                                    |_|                            |___/
*/



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

// A function that loads Firefly viewer.
function loadFirefly(viewId, url){
    var primaryViewer = firefly.makeImageViewer(viewId);
    primaryViewer.plot({
        "URL" : url,
        "Title" : "Some WISE image",
        "ZoomType" : "FULL_SCREEN"
    });
    return primaryViewer;
}

// A function that gets the url of the image to be loaded.
function getNewImageURL(){
	return document.location.origin+"/static/images/imageE2V_trimmed.fits";
}

function getNewOriginalImageURL(imageName){
	var newName = imageName;
	if (imageName.includes("_trimmed.fits")){
		newName = imageName.replace("_trimmed.fits", ".fits");
	}
	return newName;
}
