LSST.extend("LSST.UI");

LSST.UI.ViewerCommandPanel = function(options) {

    this.html = "<div id="viewer-command-container"> \
      <div id="viewer-command-title">Region Command Entry</div> \
      <div id="viewer-command-left"> \
        <ul id="viewer-command-commandlist"> \
          <li class="viewer-command-entry" id="VCAVG" data-cmd="average_pixel">Average Pixel</li> \
          <li class="viewer-command-entry" id="VCHOT" data-cmd="hot_pixel">Hot Pixel</li> \
          <li class="viewer-command-entry" id="VCCHART" data-cmd="chart">Chart</li> \
        </ul> \
      </div> \
      <div id="viewer-command-right"> \
        <h1 id="viewer-command-params-header">Parameters</h1> \
        <div id="viewer-command-params"></div> \
        <button id="viewer-command-execute">Execute Command</button> \
      </div> \
    </div>"

    options.toolbar = {
        desc: [
            new LSST_TB.ToolbarElement(
                'close', {
                    onClick: function(c) {
                        jQuery("#viewer-command-container").css("display", "none");
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
    }

    // Draggable settings
	options.draggable = {
		handle : "#viewer-command-title"
	};

	// Init from UIElement
	LSST.UI.UIElement.prototype._init.call(this, options);
}


// Inherit from LSST.UI.UIElement
LSST.inherits(LSST.UI.ViewerCommandPanel, LSST.UI.UIElement);
