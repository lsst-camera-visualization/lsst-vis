
// https://learn.jquery.com/plugins/basic-plugin-creation/

var LSST_TB = {
	// @param type - Can be any one of the following: 'settings'
	// @param data - Any necessary data for the ToolbarElement type
	ToolbarElement : function(type, data = null) {
		this.type = type;
		this.data = data;
	},
	
	Utility : {
		CreateHTMLFromToolbarElement : function(elem, settings) {
			if (elem.type === 'settings') {
				var image = settings.settings.image;
				var formClass = settings.settings.formClass;
				var formTitleClass = settings.settings.formTitleClass;
				var elementClass = settings.settings.elementClass;
				var data = elem.data;
				
				// The html to add to the toolbar
				var toolbarIcon = jQuery('<img src=' + image + '>');
				toolbarIcon.data('type', 'settings');
				
				// The popup when the user clicks on the settings icon
				var popup = jQuery('<div>').addClass(formClass);
				if (data.title)
					popup.append(jQuery('<p>').text(data.title).addClass(formTitleClass));			
				
				var form = data.form;
				for (var i = 0; i < form.length; i++) {
					var d = form[i];
					
					var html = jQuery(d).addClass(elementClass);
					popup.append(html);
				}
				
				if (settings.settings.bDraggable)
					popup.draggable();
					
				// If there was an onCreate function
				if (data.onCreate)
					popup.data('onCreate', data.onCreate);
				
				return {
					toolbarIcon : toolbarIcon,
					popup : popup
				};
			}
		}
	},
};

// @param toolbarDesc - An array of the toolbar information.
// 						Each element should be of the type LSST_TB.ToolbarElement
//
// @param options -
//					bShowOnHover: Should the toolbar only be visible when the mouse is hovering over the container? Can be true or false.
// 					placement: Describes where the toolbar is in relation to the calling object. Can be 'top'.
//					float: Float the icons to the left or to the right. Can be 'left' or 'right'.
//					margin: The margin between the container and the toolbar.
//					settings: The options for settings type toolbar elements.
//								- image: The image icon for the toolbar
//								- formClass: The class for the settings form
//								- formTitleClass: The class for the settings form title
//								- elementClass: The class for the settings form elements
//								- bDraggable: Is the popup draggable?
jQuery.fn.lsst_toolbar = function(toolbarDesc, options) {
	
	var settings = jQuery.extend( {
		// Default options
		bShowOnHover : true,
		placement : 'top',
		float : 'right',
		margin : 5,
		marginSide : 0,
	}, options );
	
	settings.settings = jQuery.extend( {
			image : 'js/toolbar/images/cog_40x40.png',
			formClass : 'LSST_TB-settings-form',
			formTitleClass : 'LSST_TB-settings-form-title',
			elementClass : 'LSST_TB-settings-element',
			bDraggable : false
		}, options.settings);
	
	var toolbar = jQuery('<div>').addClass('LSST_TB-toolbar LSST_TB-float-' + settings.float);
	if (!settings.bShowOnHover)
		toolbar.css('display', 'block');
	
	
	
	/////////////////////////////////////////////////////////////////////////////////////
	// FUNCS ////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////
	var placeToolbar = function() {
		var elem = jQuery(this);
				
		// Calculate position for the toolbar based on settings.placement
		var offset = elem.offset();
		toolbar.css('display', 'block');
		var toolbarHeight = toolbar.outerHeight(true);
		var horiz = (settings.float === 'left') ? 'left' : 'right';
		
		var p = settings.placement;
		if (p === 'top') {						
			toolbar.css('top', -toolbarHeight);
			toolbar.css('left', settings.marginSide);
			toolbar.css('right', settings.marginSide);
		}
	}
	
	var onEnter = function() {
		placeToolbar();
	}
	
	var onLeave = function() {
		var elem = jQuery(this);	
		var toolbar = elem.children('.LSST_TB-toolbar');
		
		toolbar.css('display', 'none');	
	}
	
	var onIconClick = function(e) {
		e.stopPropagation();
		var elem = jQuery(this);
		var type = elem.data('type');
		
		if (type === 'settings')
			showSettingsPopup(elem);
	}
	
	var showSettingsPopup = function(elem) {
		var popup = elem.data('popup');
		jQuery('body').append(popup);
		
		var o = elem.offset();
		o.top -= popup.outerHeight(true);
		o.left -= popup.outerWidth(true);
		popup.offset(o);
		
		var onCreate = popup.data('onCreate');
		if (onCreate)
			onCreate();
	}
	
	
	jQuery('body').click(function(e) {
		var popups = jQuery('.' + settings.settings.formClass);
		for (var i = 0; i < popups.length; i++) {
			var elem = jQuery(popups[i]);
			
			var bIs = !elem.is(e.target);
			var bHas = (elem.has(e.target).length == 0);
			if (bIs && bHas) {
				// We clicked outside the form
				elem.detach();
			}
		}
	});
	
	
	
	/////////////////////////////////////////////////////////////////////////////////////
	// INIT /////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////
	// Create the html from each toolbar element
	var height = 0;
	for (var i = 0; i < toolbarDesc.length; i++) {
		// A LSST_TB.ToolbarElement
		var elem = toolbarDesc[i];
		var html = LSST_TB.Utility.CreateHTMLFromToolbarElement(elem, settings);
		toolbar.append(html.toolbarIcon);
		html.toolbarIcon.data('popup', html.popup);
		html.toolbarIcon.click(onIconClick);
	}
	
	// Append the toolbar to the container
	this.append(toolbar);
	
	// Adding the margin height will remove bug where you miss going into the toolbar, thus hiding it.
	setTimeout( function(elem) {
			var h = toolbar.outerHeight(true);
			toolbar.outerHeight(h + settings.margin);
			
			// When we enter the container, we should unhide the toolbar
			if (settings.bShowOnHover)
				elem.hover(onEnter, onLeave);
			else
				placeToolbar();
		},
		1000, this);
	
	
	return this;
}










