LSST.extend("LSST.UI");

LSST.UI.ViewerCommandPanel = function(options) {

    if (!options)
        options = {}

    this.html = jQuery('<div id="viewer-command-container"> \
      <div id="viewer-command-title">Region Command Entry</div> \
      <div id="viewer-command-left"> \
        <ul id="viewer-command-commandlist"> \
          <li class="viewer-command-entry" id="VCAVG" data-cmd="average_pixel">Average Pixel</li> \
          <li class="viewer-command-entry" id="VCHOT" data-cmd="hot_pixel">Hot Pixel</li> \
          <li class="viewer-command-entry" id="VCCHART" data-cmd="chart">Chart</li> \
        </ul> \
      </div> \
      <div id="viewer-command-right"> \
        <div id="viewer-command-params"></div> \
        <button id="viewer-command-execute">Execute Command</button> \
      </div> \
    </div>');

    jQuery("body").append(this.html);

    options.toolbar = {
        desc: [
            new LSST_TB.ToolbarElement(
                'close', {
                    onClick: function() {
                        this.hide()
                    }.bind(this),
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


    jQuery('.viewer-command-entry').click(function() {
        var id = jQuery(this).attr('id');

        var form = jQuery('#viewer-command-params').empty();
        var commandParamForm = LSST.UI.ViewerCommandPanel.parameterForms[id];
        form.append(commandParamForm);

        var boxlist = commandParamForm.children(".viewer-command-boxlist");
        if (boxlist.size() > 0) {
            boxlist.empty();
            var c = false;
            LSST.state.boxes.foreach(function(b) {
                var elem;
                if (!c)
                    elem = "<input type='radio' name='box' value='" + b.name + "' checked> " + b.name + "<br>";
                else
                    elem = "<input type='radio' name='box' value='" + b.name + "'> " + b.name + "<br>";
                boxlist.append(jQuery(elem));
                c = true;
            });
        }

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
        entries.children('form').each(function(idx, elem) {
            e = jQuery(elem);
            var box =jQuery('input[name=box]:checked').val();
            params["box_id"] = box;
        });

        params.viewer_id = this._ffData.plotId;
        params.region = new LSST.UI.Rect(this._ffData.ipt0.x, this._ffData.ipt0.y, this._ffData.ipt1.x, this._ffData.ipt1.y).toCmdLineArrayFormat();

        cmds[LSST.state.currentViewerCommand](params);

        this.hide();
    }.bind(this));


	// Init from UIElement
	LSST.UI.UIElement.prototype._init.call(this, options);

	this.focusOnClick(false);
}


// Inherit from LSST.UI.UIElement
LSST.inherits(LSST.UI.ViewerCommandPanel, LSST.UI.UIElement);




LSST.UI.ViewerCommandPanel.prototype.show = function(ffData) {
    this.html.css("display", "block");
    this._ffData = ffData;
}

LSST.UI.ViewerCommandPanel.prototype.hide = function() {
    this.html.css("display", "none");
}











LSST.UI.ViewerCommandPanel.parameterForms = {
    'VCAVG': jQuery(
        ' \
        	<div class="viewer-command-params-entry"> \
            <span>Output Box:</span> \
            <form class="viewer-command-boxlist" action="" data-param-name="box_id"> </form> \
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
