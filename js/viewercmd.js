LSST.extend("LSST.UI");

LSST.UI.ViewerCommandPanel = function(options) {

    if (!options)
        options = {}

    this.html = jQuery('<div id="viewer-command-container"> \
      <div id="viewer-command-title">Region Command Entry</div> \
      <div id="viewer-command-left"> \
        <ul id="viewer-command-commandlist"> \
        </ul> \
      </div> \
      <div id="viewer-command-right"> \
        <div id="viewer-command-params"></div> \
        <button id="viewer-command-execute">Execute Command</button> \
      </div> \
    </div>');

    this.html.find("#viewer-command-execute").click(this._executeCommand.bind(this));

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

	// Init from UIElement
	LSST.UI.UIElement.prototype._init.call(this, options);

    this._commands = [];
    this._commandCallbacks = {};
	this.focusOnClick(false);
}


// Inherit from LSST.UI.UIElement
LSST.inherits(LSST.UI.ViewerCommandPanel, LSST.UI.UIElement);




LSST.UI.ViewerCommandPanel.prototype.show = function(ffData) {
    this.html.css("display", "block");
    this._data = ffData;

    this._populatePanel();
}

LSST.UI.ViewerCommandPanel.prototype.hide = function() {
    this.html.css("display", "none");
}



LSST.UI.ViewerCommandPanel.prototype.addCommand = function(commandName, params, cb) {
    command = [ commandName ];

    for (var i = 0; i < params.length; i++) {
        var p = params[i];

        // The region and viewer id will be passed from firefly
        if (p != "region" && p != "viewer_id") {
            command.push(p);
        }
    }

    this._commands.push(command);
    this._commandCallbacks[commandName] = cb;
    // Alphabetize the commands
    this._commands = LSST_TERMINAL.Utility.Alphabetize2(this._commands, 0);
}

LSST.UI.ViewerCommandPanel.prototype._createParamHTML = function(param) {
    var container = jQuery('<div class="viewer-command-params-entry"></div>');
    var label = jQuery('<span>' + param + ': </span>');
    var e;

    if (param == "box_id") {
        var label = jQuery("<span>box_id:</span>");
        e = jQuery('<form class="viewer-command-boxlist" action="" data-param-name="box_id"> </form>');

        // Loop through all the boxes and add an entry for each one
        var c = false;
        LSST.state.boxes.foreach(function(b) {
            var elem;
            if (!c)
                elem = "<input type='radio' name='box' value='" + b.name + "' checked> " + b.name + "<br>";
            else
                elem = "<input type='radio' name='box' value='" + b.name + "'> " + b.name + "<br>";
            e.append(jQuery(elem));
            c = true;
        });
    }
    else {
        e = '<input type="text" data-param-name="' + param + '"/>';
    }

    return container.append(label).append(e).append('<br/>');
}

LSST.UI.ViewerCommandPanel.prototype._populatePanel = function() {
    var commandList = this.html.find("#viewer-command-commandlist");
    var paramList = this.html.find("#viewer-command-params");
    commandList.empty();
    for (var i = 0; i < this._commands.length; i++) {
        var c = this._commands[i];

        // Create the button
        var button = jQuery(
            '<li class="viewer-command-entry">' + c[0] + '</li>'
        );

        // Add on click
        button.click(function(cmd, b) {
            // Empty the param panel
            paramList.empty();
            this._selected.toggleClass("viewer-command-entry-selected");
            b.toggleClass("viewer-command-entry-selected");
            this._selected = b;

            // Loop through the params
            for (var j = 1; j < cmd.length; j++) {
                // Current param
                var p = cmd[j];
                // The jquery element to add
                var e = this._createParamHTML(p);

                // Add the param to the panel
                paramList.append(e);
            }
        }.bind(this, c, button));

        if (!this._selected) {
            this._selected = button.toggleClass("viewer-command-entry-selected");
            this._selected.trigger("click");
        }

        // Add button the list
        commandList.append(button);
    }
}

LSST.UI.ViewerCommandPanel.prototype._executeCommand = function() {
    var commandName = this._selected.text();
    var cb = this._commandCallbacks[commandName];
    var params = {};

    var paramsList = jQuery('#viewer-command-params');
    var entries = paramsList.children('.viewer-command-params-entry');

    entries.children('input').each(function(idx, elem) {
        e = jQuery(elem);
        params[e.data('param-name')] = e.val();
    });
    entries.children('form').each(function(idx, elem) {
        e = jQuery(elem);
        var box =jQuery('input[name=box]:checked').val();
        params["box_id"] = box;
    });

    params.viewer_id = this._data.viewerID;
    params.region = this._data.region.toCmdLineArrayFormat();

    cb(params);

    this.hide();
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
