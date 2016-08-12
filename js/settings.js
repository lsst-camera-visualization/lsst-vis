

jQuery(document).ready(function() {

	// Terminal settings
	var settingsData = {
		title : 'Viewer Settings',
		form : [
			jQuery('<span>').text('Anchor to bottom right'),
			jQuery('<input>').attr('id', 'csf_anchor').attr('type', 'checkbox').prop('checked', true).css('margin-right', '5px'),
			jQuery('<br>'),
			jQuery('<span>').attr('id', 'csf_draggable_text').text('Draggable').css('text-decoration', 'line-through').css('margin-right', '5px'),
			jQuery('<input>').attr('id', 'csf_draggable').attr('type', 'checkbox').prop('checked', false).prop('disabled', true),
			jQuery('<br>'),
			
			jQuery('<span>').text('Font Size: '),
			jQuery('<input>').attr('id', 'csf_fontsize').attr('type', 'text').attr('size', 3),
			jQuery('<span>').text('%'),
			jQuery('<button>').attr('id', 'csf_fontsize_minus').attr('type', 'button').text('-'),
			jQuery('<button>').attr('id', 'csf_fontsize_plus').attr('type', 'button').text('+'),
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
	jQuery('#cmd_container').lsst_toolbar(toolbarInfo, options).draggable( { disabled : true } );

});

// When the terminal settings popup is shown
var onCSFCreate = function() {
	// Set the font size
	var fontSizeInput = jQuery('#csf_fontsize');
	var baseFontSize = parseFloat(jQuery('body').css('font-size'));
	var cmdFontSize = parseFloat(jQuery('#cmd').css('font-size'));
	var fontSize = cmdFontSize / baseFontSize * 100;
	fontSizeInput.val(fontSize);
	
	jQuery('#csf_fontsize_minus').click( {val:-10} , csfChangeFontSize);
	jQuery('#csf_fontsize_plus').click( {val:10}, csfChangeFontSize);
	
	jQuery('#csf_anchor').click(onCSFADClick);
	jQuery('#csf_draggable').click(onCSFADClick);
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
		cmd.css('top', '');
		cmd.css('left', '');
		cmd.css('bottom', '5px');
		cmd.css('right', '5px');
	}
	else if (bDraggable) {
		cmd.draggable('enable');
	}
	else {
		cmd.draggable('disable');
}
}




















