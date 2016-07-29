
// terminal namespace
var LSST_TERMINAL = {

	// An auto completable array.
	// if allowEmptyMatch is true, an empty string will match the first alphabetized string. 
	AutoCompleteArray : function(strings, allowEmptyMatch = false) {
		
		var arr = [];
		if (strings)
			arr = LSST_TERMINAL.Utility.Alphabetize(strings);
		
		// Returns the array
		this.getArray = function() {
			return arr;
		};
		
		// Gets the first string that matches the input. Returns null if not found.
		this.autoComplete = function(input) {
			if (!allowEmptyMatch && !input)
				return null;
				
			var regex = new RegExp('^' + input);
			
			for (var i = 0; i < arr.length; i++) {
				var curr = arr[i];
				if (curr.match(regex))
					return curr;
			}
		};
		
		this.insert = function(key) {
			// Could probably do better...
			if (arr.indexOf(key) == -1) {
				arr.push(key);
				arr = LSST_TERMINAL.Utility.Alphabetize(arr);
			}
		};
	},
	
	Command : function(cmd, callback, description = null, helpLink = null) {
		
		var splitByWS = LSST_TERMINAL.Utility.SplitStringByWS(cmd);
		
		this.cmdName = splitByWS.shift();
		this.parameters = splitByWS.slice();
		this.description = description;
		this.helpLink = helpLink;
		
		this.execute = function(input, multiStart, multiEnd) {
			
			var splitByParam = LSST_TERMINAL.Utility.SplitStringByParameter(input, multiStart, multiEnd);
			splitByParam.shift();
			
			var cmd_args = {};
			for (var i = 0; i < this.parameters.length; i++) {
				var curr = this.parameters[i];
				cmd_args[curr] = splitByParam[i];
			}
			
			callback(cmd_args);
			
		}
	},
	
	// Keep tracks of the command history.
	// ATM does not work with multiple terminals (JSON).
	CommandHistory : function(maxEntries) {
	
		// The actual commands
		var cmds = LSST_TERMINAL.Utility.GetValue(JSON.parse(localStorage.getItem('cmdHistory')), []);
		// The help string
		var help = LSST_TERMINAL.Utility.GetValue(JSON.parse(localStorage.getItem('cmdHistoryHelp')), []);
	
		// The current index
		var index = cmds.length - 1;
		
		var saveHistory = function() {
		    localStorage.setItem('cmdHistory', JSON.stringify(cmds));
		    localStorage.setItem('cmdHistoryHelp', JSON.stringify(help));
		}
	
		this.addCommand = function(cmd, helpText) {
			cmds.push(cmd);
			help.push(helpText);
			
			saveHistory();
		    
		    index = cmds.length;
		    
		    if (cmds.length > maxEntries) {
		        cmds.shift();
		        help.shift();
		    }
		};
		
		// Gets the command at the current index.
		// return { cmd, help }
		this.get = function() {
			if (index >= 0 && index < cmds.length) {
				return {
					cmd : cmds[index],
					help : help[index]
				};
			}
			else {
				return {
					cmd : null,
					help : null
				};
			}
		};
		
		// Moves the index up (toward the first command)
		this.up = function() {
			index--;
			index = Math.max(0, index);
		};
		// Moves the index down (toward the last command)
		this.down = function() {
			index++;
			index = Math.min(index, cmds.length);
		};
	
		this.clear = function() {
			cmds = [];
			help = [];
			
			saveHistory();
		}
	},
	
	InputElem : function(dom, clearString = '') {
		
		this.clear = function() {
			dom.val(clearString);
		}
		
		this.set = function(text) {
			if (text != null)
				dom.val(text);
			else
				this.clear();
		}
		
		this.append = function(app) {
		    var val = dom.val();
		    dom.val(val + app);
		}
		
		this.text = function() {
			return dom.val();
		}
		
		this.clear();
		
	},
	
	TextContainer : function(dom) {
	
		this.clear = function() {
			dom.empty();
		}
		
		this.append = function(app, htmlClass = 'echo_output_text') {
			var text = app.replace('\n', '<br/>');
			
		    var elem = jQuery('<p>').html(text).addClass(htmlClass);
		    dom.append(elem);
		}
		
		this.clear();
		
	},
	
	TextElem : function(dom, clearString = '') {
	
		this.clear = function() {
			dom.html(clearString);
		}
		
		this.set = function(text) {
			if (text != null)
				dom.html(text);
			else
				this.clear();
		}
		
		this.append = function(app) {
		    var val = dom.html();
		    dom.html(val + app);
		}
		
		this.text = function() {
			return dom.html();
		}
		
		this.clear();
		
	},

	Utility : {
	
		// Returns an alphabetized version of the array. Does not change the original array.
		Alphabetize : function(array) {
			var alpha = array.slice();		
			var alphaSort = function(a, b) {
				var keyA = a.toLowerCase();
				var keyB = b.toLowerCase();
		
				if (keyA < keyB)
					return -1;
				else if (keyA > keyB)
					return 1;
				return 0;
			};
		
			alpha.sort(alphaSort);
			return alpha;
		},
	
		ArrayToString : function(arr) {
		    if (typeof(arr) == 'string')
		        return arr;
		    
		    var s = '';
		    for (var i = 0; i < arr.length; i++) {
		        s += arr[i] + ' ';
		    }
		    return s;
		},
		
		GetValue : function(value, def) {
			if (value == null || value == undefined)
				return def;
			return value;
		},
		
		HighlightString : function(string) {
			return '<span class="cmd_highlight">' + string + '</span>';
		},
		
		HighlightStringAtIndex : function(string, index) {
			var result = '';
			var split = LSST_TERMINAL.Utility.SplitStringByWS(string);
			
			for (var i = 0; i < split.length; i++) {
				var curr = split[i];
				if (i != index)
					result += curr;
				else
					result += LSST_TERMINAL.Utility.HighlightString(curr);
					
				if (i != split.length - 1)
					result += ' ';
			}
			
			return result;
		},
		
		ReplaceStringWithVariables : function(string, variables) {
			var split = LSST_TERMINAL.Utility.SplitStringByWS(string);
			
			var result = '';
			for (var i = 0; i < split.length; i++) {
				var curr = split[i];
				if (curr in variables)
					result += variables[curr];
				else
					result += curr;
				result += ' ';
			}
			
			return result;
		},
		
		SplitStringByWS : function(str) {
			return str.match(/\S+/g);
		},
		
		SplitStringByParameter : function(str, multiStart, multiEnd) {
			var splitWS = LSST_TERMINAL.Utility.SplitStringByWS(str);
		    
		    var bMulti = false;
		    var result = [];
		    for (var i = 0; i < splitWS.length; i++) {
		        var c = splitWS[i];
		        
		        if (c.charAt(0) == multiStart) {
		            bMulti = true;
		            c = c.substr(1, c.length);
		            result.push([]);
		        }
		        if (c.charAt(c.length - 1) == multiEnd) {
		            bMulti = false;
		            c = c.substr(0, c.length - 1);
		            if (c)
		                result[result.length - 1].push(c);
		            continue;
		        }
		        
		        if (bMulti) {
		            if (c)
		                result[result.length - 1].push(c);
		        }
		        else {
		            result.push(c);
		        }
		    }
		    
		    return result;
		}
		
	},

};








////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////// TERMINAL IMPLEMENTATION /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////


(function ( $ ) {
	
    jQuery.fn.terminal = function(commands, subCommands, autoCompleteParams, paramsWithHint, properties) {
    
    	var parent = jQuery(this);
    
    	// Create terminal
		var terminal = jQuery('<div>').addClass('cmd_container');
		var terminalHelpContainerDOM = jQuery('<p>').addClass('cmd_help_container');
		var terminalHelpDOM = jQuery('<span>').addClass('cmd_help');
		var terminalHelpSubDOM = jQuery('<span>').addClass('cmd_help_sub');
		var terminalOutputDOM = jQuery('<div>').addClass('cmd_output');
		var terminalInputDOM = jQuery('<input>').addClass('cmd_input').attr('placeholder', 'Enter command here');
	
		parent.append(terminal);
		terminal.append(terminalHelpContainerDOM);
		terminalHelpContainerDOM.append(terminalHelpDOM);
		terminalHelpContainerDOM.append(terminalHelpSubDOM);
		terminal.append(terminalOutputDOM);
		terminal.append(terminalInputDOM);
    	
    	// Make sure all properties have values
		properties.width = LSST_TERMINAL.Utility.GetValue(properties.width, 650);
		properties.height = LSST_TERMINAL.Utility.GetValue(properties.height, 300);
		properties.fontSize = LSST_TERMINAL.Utility.GetValue(properties.fontSize, null);
		properties.multiStart = LSST_TERMINAL.Utility.GetValue(properties.multiStart, '(');
		properties.multiEnd = LSST_TERMINAL.Utility.GetValue(properties.multiEnd, ')');
		properties.maxHistoryEntries = LSST_TERMINAL.Utility.GetValue(properties.maxHistoryEntries, 50);
		
    	// Maps command names to LSST_TERMINAL.Command objects.
    	var cmds = {};
    	// The command history.
    	var history = new LSST_TERMINAL.CommandHistory(properties.maxHistoryEntries);
    	// An LSST_TERMINAL.AutoCompleteArray object for all of the command names.
    	var commandNames = null;
    	
    	var terminalInput = new LSST_TERMINAL.InputElem(terminalInputDOM);
    	var terminalOutput = new LSST_TERMINAL.TextContainer(terminalOutputDOM);
    	var terminalHelp = new LSST_TERMINAL.TextElem(terminalHelpDOM, 'Command interface: Type help for more info');
    	var terminalHelpSub = new LSST_TERMINAL.TextElem(terminalHelpSubDOM);
    	
    	var terminalVariables = {};
    	// Maps parameter names to LSST_TERMINAL.AutoCompleteArray objects.
    	var paramAutoCompletes = {};
    	// An LSST_TERMINAL.AutoCompleteArray object for the sub commands
    	var subCommandAutoCompletes = new LSST_TERMINAL.AutoCompleteArray(subCommands);
    	
    	
    	
    	
    	/////////////////////////////////////////////////////////////////////////////
    	//////////////////////////// BUILT-IN CMDS //////////////////////////////////
    	/////////////////////////////////////////////////////////////////////////////
    	var cmd_clear = function(cmd_args) {
    		terminalOutput.clear();
    	}
    	
    	var cmd_help = function(cmd_args) {
    		var commandArray = commandNames.getArray();
    	
    		if (!cmd_args['[command]']) {
				
				if ( properties['helpLink'] != undefined)
					echoLink('Link to help documentation\n', properties['helpLink']);
				
				echoText(' Tip: You can use tab to autocomplete command names!\n');
				echoText(' Note: Commands which take multi-length parameters (such as echo), must be wrapped with \'' + properties['multiStart'].charAt(0) + '\' and \'' + properties['multiEnd'] + '\'\n\n');
				
				for (var i = 0; i < keys.length; i++) {
					var key = commandArray[i];
					var params = cmds[key]['parameters'];
					
					var text = ' - ' + key;
					
					if (params.length != 0)
						text += ': ' + LSST_TERMINAL.Utility.ArrayToString(params);
					echoText(text + '\n');
				}
			}
			else {
				// Display specific command				
				var cmdName = cmd_args['[command]'];
				
				if (commandArray.indexOf(cmdName) == -1) {
					echoText(cmdName + ' is not a command!\n');
				}
				else {
					var params = cmds[cmdName]['parameters'];
					var docLink = cmds[cmdName]['doc_link'];					
					
					echoText('Command: ');
					if (docLink != null && docLink != undefined && docLink != '')
						echoLink(cmdName, docLink);
					else
						echoText(cmdName);
					echoText('\n');
					
					var paramText;
					if (params.length > 0)
						paramText =  LSST_TERMINAL.Utility.ArrayToString(params);
					else
						paramText = 'None';
					
					echoText('Parameters: ' + paramText + '\n');
					echoText('Description: ' + cmds[cmdName]['description'] + '\n');
				}				
			}	
    	}
    	
    	var cmd_echo = function(cmd_args) {
    		var str = cmd_args['string'];
    		terminalOutput.append(str);
    	}
    	
    	var cmd_clearTerminalHistory = function(cmd_args) {
    		history.clear();
    		cmd_clear();
    	}
    
    
    
    
    	
    	
    	/////////////////////////////////////////////////////////////////////////////
    	//////////////////////////// INITIALIZATION /////////////////////////////////
    	/////////////////////////////////////////////////////////////////////////////
        // Set width and height of terminal
		terminal.css('width', properties.width);
		terminal.css('height', properties.height);
    	
    	// Set font size
		if (properties['fontSize'] == null)
			terminal.css('font-size', (properties['height'] / 300.0) + 'em');
		else
			terminal.css('font-size', properties['fontSize']);
    
    	// Calculate output are height
		var helpTextHeight = terminalHelpContainerDOM.outerHeight(true);
		var inputBoxHeight = terminalInputDOM.outerHeight(true);
		var terminalHeight = terminal.outerHeight(true);
		var leftOver = terminalHeight - (helpTextHeight + inputBoxHeight)
		terminalOutputDOM.height((leftOver - 10) + 'px');
    
    	// Clicking anywhere in the terminal will put focus in the input box
		terminal.click(function() {
		    terminalInputDOM.focus();
		});
		
		
		// Format user commands
		var keys = [];
		var createCommand = function(name, command) {
			var cmd = new LSST_TERMINAL.Command(name, command.callback, command.description, command.helpLink);
			var cmdName = LSST_TERMINAL.Utility.SplitStringByWS(name)[0];			
			
			cmds[cmdName] = cmd;
			keys.push(cmdName);
		};
		for (var key in commands) {			
			if (commands.hasOwnProperty(key)) {
				createCommand(key, commands[key]);
			}			
		};
		
		// Add built in commands
		createCommand('clear', { callback : cmd_clear, description : 'Clears the output log of the terminal.' } );
		createCommand('help [command]', { callback : cmd_help, description : 'Displays all the commands, or the help string for a single command.' } );
		createCommand('echo string', { callback : cmd_echo, description : 'Echoes a string to the output area.' } );
		createCommand('clear_terminal_history', { callback : cmd_clearTerminalHistory, description : 'Clears the history of commands.' } );
		
		// Create the auto complete array for command names
		commandNames = new LSST_TERMINAL.AutoCompleteArray(keys);
    
    	// Create auto complete arrays for parameter names
    	for (var key in autoCompleteParams) {
    		var curr = autoCompleteParams[key];
    		paramAutoCompletes[key] = new LSST_TERMINAL.AutoCompleteArray(curr);
    	}
    
    
    
    
    
    	/////////////////////////////////////////////////////////////////////////////
    	//////////////////////////// KEY DOWN/UP ////////////////////////////////////
    	/////////////////////////////////////////////////////////////////////////////
				
		terminalInputDOM.keydown(function(event) {
			var keyCode = event.keyCode || event.which;
			var input = terminalInput.text().trim().toLowerCase();
			
			// Tab
			if (keyCode == 9) {
				event.preventDefault();
				
		    	var splitByParams = LSST_TERMINAL.Utility.SplitStringByParameter(input, properties.multiStart, properties.multiEnd);
				if (!splitByParams)
					return;
					
		    	var length = splitByParams.length;
		    	var autoCmd = commandNames.autoComplete(splitByParams[0]);
		    	if (!autoCmd)
		    		return;
		    		
		    	if (length == 1) {
		    		terminalInput.set(autoCmd + ' ');
		    	}
		    	else {
		    		var command = getCommand(autoCmd);
		    		var currParam = command.parameters[length - 2];
		    		
		    		if (currParam in paramAutoCompletes) {
		    			var ac = paramAutoCompletes[currParam];
		    			var lastUserParam = splitByParams[length - 1];
		    			var autoParam = ac.autoComplete(lastUserParam);
		    			if (autoParam)
			    			terminalInput.append(autoParam.substr(lastUserParam.length) + ' ');
		    		}
		    	}
			}
		});
				
		terminalInputDOM.keyup(function(event) {
				
			var input = terminalInput.text().trim().toLowerCase();
			if (!input)
			    terminalHelp.clear();
						
			switch (event.keyCode) {
				
				// Enter
				case 13:
					var sh = terminalOutputDOM[0].scrollHeight;
					if (sh <= terminalOutputDOM.height())
						sh = 0;
						
				    executeCommand(input);		
				    
					terminalInput.clear();
					terminalHelp.clear();
					terminalHelpSub.clear();
					
					terminalOutputDOM.scrollTop(sh);
					
					break;
				
				// Up arrow
				case 38:
					history.up();
					var hist = history.get();
					terminalInput.set(hist.cmd);
					terminalHelp.set(hist.help);
					break;
				
				// Down arrow
				case 40:
				    history.down();
					var hist = history.get();
					terminalInput.set(hist.cmd);
					terminalHelp.set(hist.help);
					break;
			}
		
			input = terminalInput.text().replace(/^ /g, '').toLowerCase();
			if (!input)
			    return;
			
			terminalHelp.set(createHelpText(input));
		});
    
    
    	
    	
    	
    	
    	
    	/////////////////////////////////////////////////////////////////////////////
    	//////////////////////////// HELPER FUNCTIONS ///////////////////////////////
    	/////////////////////////////////////////////////////////////////////////////
    	var echoCommand = function(text) {
    		terminalOutput.append(text + '\n', 'echo_output_command');
    	}
    	
    	var echoText = function(text) {
    		cmd_echo( { 'string' : text } );
    	}
    	
    	var echoLink = function(text, link) {
			var t = '<a href=\"' + link + '\" target=\"_blank\">' + text + '</a>';
    		terminalOutput.append(t + '\n');			
		}
    	
    	var getCommand = function(input) {
    		var split = LSST_TERMINAL.Utility.SplitStringByWS(input);
    		var cmdName = split[0];
    		
    		if (cmdName in cmds) {
    			return cmds[cmdName];
    		}
    		else
    			return null;
    	}
    	
    	var executeCommand = function(input) {
    		history.addCommand(input, terminalHelp.text());
    		
    		echoCommand(properties.prefix + ' ' + input);
    		input = LSST_TERMINAL.Utility.ReplaceStringWithVariables(input, terminalVariables);
    		
    		var command = getCommand(input);    		
    		if (command) {
    			command.execute(input, properties.multiStart, properties.multiEnd);
    		}
    		else {
    			cmd_echo( { 'string' : 'Please enter a valid command!\n' } );
			}
			
		    var splitByParams = LSST_TERMINAL.Utility.SplitStringByParameter(input, properties.multiStart, properties.multiEnd);
		    splitByParams.shift();
		    for (var i = 0; i < splitByParams.length; i++) {
		    	var currParam = command.parameters[i];
		    	if (currParam in paramAutoCompletes) {
		    		var currAC = paramAutoCompletes[currParam];
		    		currAC.insert(splitByParams[i]);
		    	}
		    }
    	}	
    
    	var createHelpText = function(input) {
		    var split = LSST_TERMINAL.Utility.SplitStringByParameter(input, properties.multiStart, properties.multiEnd);
		    
		    var cmdName = split.shift();
		    var autoCmd = commandNames.autoComplete(cmdName);
		    
		    if (!autoCmd) {
		        terminalHelp.clear();
		        return;
		    }
		    
		    var command = cmds[autoCmd];
		    var cmdParams = command.parameters;
			
			var bLastSpace = input.match(/\s$/);
			var trimmedInput = input.trim();
			var lastParam = split[split.length - 1];
			var bInMulti = Array.isArray(lastParam) && (trimmedInput.charAt(trimmedInput.length - 1) != properties.multiEnd);
			
			var highlightIndex = split.length - 1;
			if (bLastSpace && !bInMulti)
				highlightIndex++;
			
			var helpString = (split.length == 0 && !bLastSpace) ? LSST_TERMINAL.Utility.HighlightString(autoCmd) : autoCmd;
			
			for (var i = 0; i < cmdParams.length; i++) {
				helpString += ' ';
				
				if (i == highlightIndex) {
					helpString += LSST_TERMINAL.Utility.HighlightString(cmdParams[i]);
				}
				else {
					helpString += cmdParams[i];
				}
			}
			
			var validSubCommand = false;
			// If the parameter has a sub command
			if (bInMulti) {
				var multi = lastParam;
				var subType = multi[0];
				var auto = subCommandAutoCompletes.autoComplete(subType);
				if (auto) {
					var index = (multi.length - 1) + ((bLastSpace) ? 1 : 0);
					var autoHighlighted = LSST_TERMINAL.Utility.HighlightStringAtIndex(auto, index);
					var subHelpText = properties.multiStart + autoHighlighted + properties.multiEnd;
					terminalHelpSub.set(subHelpText);
					validSubCommand = true;
				}
			}
			
			// If the parameter we are on has a hint
			var currParam = cmdParams[highlightIndex];
			if (!validSubCommand && paramsWithHint[currParam] != undefined) {
				var hint = paramsWithHint[currParam];
				terminalHelpSub.set(hint);
			}
			else if (!validSubCommand)
				terminalHelpSub.clear();
			
			return helpString;
		}
    
    
    
    	
    	/////////////////////////////////////////////////////////////////////////////
    	//////////////////////////// PUBLIC FUNCTIONS ///////////////////////////////
    	/////////////////////////////////////////////////////////////////////////////
    	this.echo = function(string) {
    		echoText(string += '\n');
    	}
    	
    	this.setVariable = function(name, value) {
    		terminalVariables[name] = value;
    	}
    
    
    	return this;
    
    };
	

}( jQuery ));

