

jQuery(document).ready(function() {	
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
            cmds.default_box( { box_id : e.name } );
        });
    });
    
    // Add boxes to list
    var boxList = jQuery('#global_settings_boxes');
    LSST.state.boxes.foreach(function(e) {
        var display = e.name;
        if (display === LSST.state.defaults.box)
          display += '*'
            
        boxList.append('<li><div>' + display + '</div></li>').click(function() {
            cmds.default_viewer( { viewer_id : e.name } );
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



































