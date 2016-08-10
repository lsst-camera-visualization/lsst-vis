
LSST.CurrentForm = { Form : null, Original : null };


// ####################################################################### //
// ## ALL TOOLBARS ####################################################### //
// ####################################################################### //

var toolbar_enter = function() {
	var container = jQuery(this);
	var toolbar = container.children('.toolbar');
	toolbar.css('display', 'block');
}

var toolbar_leave = function() {
	var container = jQuery(this);
	var toolbar = container.children('.toolbar');
	toolbar.css('display', 'none');
}

// When you enter the parent, we will unhide the toolbar.
jQuery('.toolbar').each(function(idx) {
	
	var e = jQuery(this);
	var parent = jQuery(e.parent());
	parent.hover(toolbar_enter, toolbar_leave);
	
});


// ####################################################################### //
// ## SETTINGS ########################################################### //
// ####################################################################### //

var removeCurrentForm = function() {
	var form = LSST.CurrentForm.Form;
	var e = LSST.CurrentForm.Original;

	// First restore the form dialog
	e.parent().append(form.children().css('display', 'none'));
	
	form.remove();
	jQuery(document).off('click', removeOnClickOutside);
	
	LSST.CurrentForm.Form = null;
}

var removeOnClickOutside = function(e) {
	var t = LSST.CurrentForm.Form;
	if (!t)
		return;
	
	var bIs = !t.is(e.target);
	var bHas = (t.has(e.target).length == 0);
	if (bIs && bHas) {
		// We clicked outside the form
		removeCurrentForm();
	}
}

var onNewForm = function() {
	if (LSST.CurrentForm.Form.attr('id') == 'csf_form') {
		var fontSizeInput = jQuery('#csf_fontsize');
		var baseFontSize = parseFloat(jQuery('body').css('font-size'));
		var cmdFontSize = parseFloat(jQuery('#cmd').css('font-size'));
		var fontSize = cmdFontSize / baseFontSize * 100;
		
		fontSizeInput.val(fontSize);		
		fontSizeInput.attr('size', fontSizeInput.val().length);
	}
}

var settings_click = function(event) {
	var e = jQuery(this);
	var id = e.attr('id');
	
	if (!LSST.CurrentForm.Form) {
		event.stopPropagation();
		var dialog = e.siblings('.settings_form').css('display', 'block').detach();

		var formID = id + '_form';
		var form = jQuery('<div>').addClass('form').attr('id', formID);
		form.append(dialog);
		jQuery(document).click(removeOnClickOutside);
	
		jQuery('body').append(form);
	
		var buttonOffset = e.offset();
		var formOffset = buttonOffset;
		formOffset.left -= form.outerWidth();
		formOffset.top -= form.outerHeight();
		form.offset(formOffset);
		
		LSST.CurrentForm.Form = form;
		LSST.CurrentForm.Original = e;
		
		onNewForm();
	}
	else {	
		// Form already exists so destroy it
		removeCurrentForm();
	}
}

jQuery('.settings_button').each(function(idx) {
	var e = jQuery(this);
	e.click(settings_click);
});







// ####################################################################### //
// ## CSF ################################################################ //
// ####################################################################### //
jQuery('#csf_anchor').click(function() {
	var e = jQuery(this);
	var draggable = jQuery('#csf_draggable');
	
	var disabled = false;
	if (e.prop('checked'))
		disabled = true;
	
	draggable.prop('disabled', disabled);
});

jQuery('#csf_fontsize').keyup(function(event) {
	var e = jQuery(this);
	LSST.state.term.setFontSize(e.val());
	e.attr('size', e.val().length);
});

var csfChangeFontSize = function(val) {
	var fontSizeInput = jQuery('#csf_fontsize');
	var fontSize = parseInt(fontSizeInput.val());
	fontSize += val;
	fontSizeInput.val(fontSize);
	LSST.state.term.setFontSize(fontSize);
}

jQuery('#csf_fontsize_minus').click(function() {
	csfChangeFontSize(-10);
});
jQuery('#csf_fontsize_plus').click(function() {
	csfChangeFontSize(10);
});









