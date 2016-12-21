

jQuery(document).ready(function() {

	// Terminal settings
	var settingsData = {
		title : 'Terminal Settings',
		form : [
			jQuery('<span>').text('Anchor to bottom right'),
			jQuery('<input>').attr('id', 'csf_anchor').attr('type', 'checkbox').prop('checked', true).css('margin-right', '5px').click(onCSFADClick),
			jQuery('<br>'),
			jQuery('<span>').attr('id', 'csf_draggable_text').text('Draggable').css('text-decoration', 'line-through').css('margin-right', '5px'),
			jQuery('<input>').attr('id', 'csf_draggable').attr('type', 'checkbox').prop('checked', false).prop('disabled', true).click(onCSFADClick),
			jQuery('<br>'),
			jQuery('<span>').text('Always on top'),
			jQuery('<input>').attr('id', 'csf_top').attr('type', 'checkbox').prop('checked', true).click(onCSFTopClick),
			jQuery('<br>'),
			
			jQuery('<span>').text('Font Size: '),
			jQuery('<input>').attr('id', 'csf_fontsize').attr('type', 'text').attr('size', 3),
			jQuery('<span>').text('%'),
			jQuery('<button>').attr('id', 'csf_fontsize_minus').attr('type', 'button').text('-').click( {val:-10} , csfChangeFontSize),
			jQuery('<button>').attr('id', 'csf_fontsize_plus').attr('type', 'button').text('+').click( {val:10} , csfChangeFontSize),
		],
		onCreate : onCSFCreate
	}
	
	// Minimize data
	var miniData = {
		onClick : cmds.minimize_terminal,
	}
	
	var toolbarInfo = [
		new LSST_TB.ToolbarElement('settings', settingsData),
		new LSST_TB.ToolbarElement('mini', miniData),
	];
	
	var options = {
		bShowOnHover : true,
		placement : 'top',
		float : 'right',
		marginSide : 10,
		settings : {
			bDraggable : true,
		},
	}
	
	var draggableProp = {
		disabled : true,
		distance : 10
	}
	var resizableProp = {
		handles : 'n, w, nw'
	};
	
	jQuery('#cmd_container').lsst_toolbar(toolbarInfo, options).draggable(draggableProp).resizable(resizableProp);
	
	
	
	
	LSST.state.defaults.viewer = "ffview";
	LSST.state.defaults.box = "ffbox";
	
	if (LSST.state.term) {
	  LSST.state.term.lsst_term("setDefault", { param : "viewer_id", value : LSST.state.defaults.viewer } );
	  LSST.state.term.lsst_term("setDefault", { param : "box_id", value : LSST.state.defaults.box } );
	}
	
	// For future use, as we don't save session information
	// Set defaults for first time
	/*
	if (!localStorage.getItem('LSST.state.defaults.viewer')) {
	    LSST.state.defaults.viewer = 'ffview';
	    localStorage.setItem('LSST.state.defaults.viewer', 'ffview');
	}
	else {
	    LSST.state.defaults.viewer = localStorage.getItem('LSST.state.defaults.viewer');
	}
	
	if (!localStorage.getItem('LSST.state.defaults.box')) {
	    LSST.state.defaults.box = 'ffbox';
	    localStorage.setItem('LSST.state.defaults.box', 'ffbox');
	}
	else {   
	    LSST.state.defaults.box = localStorage.getItem('LSST.state.defaults.box');
	}*/
});

// When the terminal settings popup is shown
var onCSFCreate = function() {
	// Set the font size
	var fontSizeInput = jQuery('#csf_fontsize');
	var baseFontSize = parseFloat(jQuery('body').css('font-size'));
	var cmdFontSize = parseFloat(jQuery('#cmd').css('font-size'));
	var fontSize = cmdFontSize / baseFontSize * 100;
	fontSizeInput.val(fontSize);
}

var csfChangeFontSize = function(obj) {
	var fontSizeInput = jQuery('#csf_fontsize');
	var fontSize = parseInt(fontSizeInput.val());
	fontSize += obj.data.val;
	
	// Clamp to 100% and 200%
	fontSize = Math.min(Math.max(fontSize, 100), 200);
	
	fontSizeInput.val(fontSize);
	LSST.state.term.lsst_term("setFontSize", fontSize);
}

// When either anchor or draggable is clicked
var onCSFADClick = function() {
	var draggable = jQuery('#csf_draggable');
	
	var bAnchor = jQuery('#csf_anchor').prop('checked');
	var bDraggable = draggable.prop('checked');

	if (bAnchor) {
		draggable.prop('disabled', true);
		jQuery('#csf_draggable_text').css('text-decoration', 'line-through');
	}
	else {
		draggable.prop('disabled', false);
		jQuery('#csf_draggable_text').css('text-decoration', 'none');
	}
	
	var cmd = jQuery('#cmd_container');
	if (bAnchor) {
		cmd.draggable('disable');
		
		cmd.css('position', 'fixed');
		cmd.css('top', '');
		cmd.css('left', '');
		cmd.css('bottom', '5px');
		cmd.css('right', '5px');
		
		cmd.resizable( "option", "handles", "n, w, nw" );
	}
	else if (bDraggable) {
		cmd.draggable('enable');
	}
	else {
		cmd.draggable('disable');
	}
	
	if (!bAnchor) {
		cmd.resizable( "option", "handles", "all" );
	}
}

var onCSFTopClick = function() {
	var elem = jQuery('#csf_top');
	var bChecked = elem.prop('checked');
	
	var t = jQuery('#cmd_container');
	if (bChecked) {
		t.css('z-index', 999);
		t.off('click', onChangeFocus);
	}
	else {
		t.css('z-index', 1);
		t.click(onChangeFocus);
	}
}
















/*
   _____ _       _           _    _____      _   _   _                 
  / ____| |     | |         | |  / ____|    | | | | (_)                
 | |  __| | ___ | |__   __ _| | | (___   ___| |_| |_ _ _ __   __ _ ___ 
 | | |_ | |/ _ \| '_ \ / _` | |  \___ \ / _ \ __| __| | '_ \ / _` / __|
 | |__| | | (_) | |_) | (_| | |  ____) |  __/ |_| |_| | | | | (_| \__ \
  \_____|_|\___/|_.__/ \__,_|_| |_____/ \___|\__|\__|_|_| |_|\__, |___/
                                                              __/ |    
                                                             |___/     
*/
var onGlobalSettingsClick = function() {
    if (jQuery('#global_settings_popup').length != 0) {
        jQuery('#global_settings_popup').detach();
        return;
    }
    
    var popup = jQuery(
        ' \
            <div id="global_settings_popup"> \
                <p id="global_settings_title">Global Settings</p> \
                <li><div class="global_settings_elem">Default Viewer</div> \
                    <ul id="global_settings_viewers" class="global_settings_ul"> \
                    </ul> \
                </li> \
                <li><div class="global_settings_elem">Default Box</div> \
                    <ul id="global_settings_boxes" class="global_settings_ul"> \
                    </ul> \
                </li> \
            </div> \
        '
    );
    
    jQuery('body').append(popup);
    
    // Add viewers to list
    var viewerList = jQuery('#global_settings_viewers');
    LSST.state.viewers.foreach(function(e) {
        var display = e.name;
        if (display === LSST.state.defaults.viewer)
            display += '*'
        
        viewerList.append('<li><div>' + display + '</div></li>').click(function() {
            LSST.state.defaults.viewer = e.name;
	        // localStorage.setItem('LSST.state.defaults.viewer', e.name);
        });
    });
    
    // Add boxes to list
    var boxList = jQuery('#global_settings_boxes');
    LSST.state.boxes.foreach(function(e) {
        var display = e.name;
        if (display === LSST.state.defaults.box)
            display += '*'
            
        boxList.append('<li><div>' + display + '</div></li>').click(function() {
            LSST.state.defaults.box = e.name;
	        // localStorage.setItem('LSST.state.defaults.box', e.name);
        });
    });
    
    jQuery('#global_settings_popup').menu();
    
    jQuery(document).click(function(e) {
        if (jQuery('#global_settings').is(e.target))
            return;
            
        var elem = jQuery('#global_settings_popup');
    
        var bIs = !elem.is(e.target);
		var bHas = (elem.has(e.target).length == 0);
		if (bIs && bHas) {
			// We clicked outside the form
			elem.detach();
		}
    });
}



































