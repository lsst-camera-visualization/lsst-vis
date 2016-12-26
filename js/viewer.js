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

	this.html = jQuery(
	  " \
	  <div class='viewer'> \
	    <p class='viewer-title'>" + options.name + "</p> \
	    <div id=" + options.name + " class='viewer-view'></div> \
	    <div class='viewer-info'> \
	      <div class='viewer-uv'> \
	        <p class='viewer-uv-header'>Update Viewer Settings</p> \
          <input class='viewer-uv-button viewer-uv-pr' type='button' value='Resume' data-viewerID=" + options.name + "> \
          <input class='viewer-uv-button viewer-uv-un' type='button' value='There are no new images.' data-viewerID=" + options.name + " disabled> \
	      </div> \
	    </div> \
	  </div> \
	  "
	);
	jQuery('body').append(this.html);
	
	this.html.find('.viewer-uv-pr').click(function() {
	  if (jQuery(this).attr("value") == "Resume") 
	    cmds.uv_resume( { viewer_id : jQuery(this).data("viewerid") } );
	  else
	    cmds.uv_pause( { viewer_id : jQuery(this).data("viewerid") } );
	});
	this.html.find('.viewer-uv-un').click(function() {
	  cmds.uv_load_new( { viewer_id : jQuery(this).data("viewerid") } );
	});
	

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

	var re = /^https?:/;
	var result = "Image: " + image;
	if (re.test(image)) { // this is a URL
		firefly.showImage(this.name, {
			plotId : this.name,
			URL : image,
			Title : result,
			ZoomType : "TO_WIDTH",
			ZoomToWidth : '100%'
		});

	} else {
		result = image + " !matched " + re;
		viewer.showImage(this.name, {
			plotId : this.name,
			File : image,
			Title : result,
			ZoomType : "TO_WIDTH",
			ZoomToWidth : '100%'
		});
	}

	this.image_url = image;
	this.original_image_url = getNewOriginalImageURL(image);
	return result;
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

LSST.UI.Viewer.prototype.onCursorMove = function(c) {
    this._onCursorMoveCallback = c;
}

LSST.UI.Viewer.prototype._cursorRead = function(action) {
	if (action.payload.readoutItems.imagePt) {
		var imgPt = action.payload.readoutItems.imagePt.value;
		if (imgPt) {
		    this.cursorPoint = {
			    x : imgPt.x,
			    y : imgPt.y
		    }

		    if (this._onCursorMoveCallback) {
		        this._onCursorMoveCallback(this.cursorPoint);
		    }
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
	
	// PUT THIS LINE BACK IN, ONCE WE GET THE REAL SERVER
	// this.setFrequency(frequency);
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
			var button = this._viewer.html.find('.viewer-uv-un');
			button.prop('disabled', true);
			button.attr('value', 'There are no new images.');
		}

		this._newImage = null;
	}
}

// Pauses this viewer control
LSST.UI.UV_Control.prototype.pause = function() {
	this._bPaused = true;
	
	var button = this._viewer.html.find(".viewer-uv-pr").attr('value', 'Resume');
}

// Resumes this viewer control
LSST.UI.UV_Control.prototype.resume = function() {
	this._bPaused = false;

	var button = this._viewer.html.find(".viewer-uv-pr").attr('value', 'Pause');

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
				  this._viewer.html.find('.viewer-uv-un');
				  button.prop('disabled', false);
				  button.attr('value', 'There is a new image available. Click to load.');
			  }
		  }

		  if (this._newImage == null) {
			  // Displayed when there is no new image, or the new image is done loading.
			  this._viewer.html.find('.viewer-uv-un');
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
