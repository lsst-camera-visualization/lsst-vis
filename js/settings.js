

jQuery(document).ready(function() {

	// Terminal settings
	var settingsData = {
		title : 'Viewer Settings',
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
	var toolbarInfo = [
		new LSST_TB.ToolbarElement('settings', settingsData)
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
	LSST.state.term.setFontSize(fontSize);
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


















