
// terminal namespace
var LSST_TERMINAL = {

	// An auto completable array.
	// if allowEmptyMatch is true, an empty string will match the first alphabetized string. 
	AutoCompleteArray : function(strings, allowEmptyMatch = false) {
		
		var arr = LSST_TERMINAL.Utility.Alphabetize(strings);
		
		// Returns the array
		this.getArray = function() {
			return arr;
		};
		
		// Gets the first string that matches the input. Returns null if not found.
		this.autoComplete = function(input) {
			if (!allowEmptyMatch && input === '')
				return null;
				
			var regex = new RegExp('^' + input);
			
			for (var i = 0; i < arr.length; i++) {
				var curr = arr[i];
				if (curr.match(regex))
					return curr;
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
	
    jQuery.fn.terminal = function(commands, subCommands, properties) {
    
    	var parent = jQuery(this);
    
    	// Create terminal
		var terminal = jQuery('<div>').addClass('cmd_container');
		var terminalHelpDOM = jQuery('<p>').addClass('cmd_help');
		var terminalOutputDOM = jQuery('<div>').addClass('cmd_output');
		var terminalInputDOM = jQuery('<input>').addClass('cmd_input').attr('placeholder', 'Enter command here');
	
		parent.append(terminal);
		terminal.append(terminalHelpDOM);
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
    	
    	
    	
    	
    	
    	
    	/////////////////////////////////////////////////////////////////////////////
    	//////////////////////////// BUILT-IN CMDS //////////////////////////////////
    	/////////////////////////////////////////////////////////////////////////////
    	var cmd_clear = function(cmd_args) {
    		
    	}
    	
    	var cmd_help = function(cmd_args) {
    		
    	}
    	
    	var cmd_echo = function(cmd_args) {
    		var str = cmd_args['string'];
    		terminalOutput.append(str);
    	}
    	
    	var cmd_clearTerminalHistory = function(cmd_args) {
    		history.clear();
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
    
    
    
    
    
    
    
    	/////////////////////////////////////////////////////////////////////////////
    	//////////////////////////// KEY DOWN/UP ////////////////////////////////////
    	/////////////////////////////////////////////////////////////////////////////
				
		terminalInputDOM.keydown(function(event) {
			var keyCode = event.keyCode || event.which;
			var input = terminalInput.text().trim().toLowerCase();
			
			// Tab
			if (keyCode == 9) {
				event.preventDefault();
				if (!LSST_TERMINAL.Utility.SplitStringByWS(input).includes(' ')) {
					var auto = commandNames.autoComplete(input);
					if (auto)
						terminalInput.set(auto + ' ');
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
			    			
			createHelpText(input);
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
    		
    		var command = getCommand(input);    		
    		if (command) {
    			command.execute(input, properties.multiStart, properties.multiEnd);
    		}
    		else {
    			cmd_echo( { 'string' : 'Please enter a valid command!\n' } );
			}
    	}
    	
    	var highlightString = function(stringToHighlight) {
			
			var prefix = '<span class=\"cmd_highlight\">';
			var postfix = '</span>';
			return prefix + stringToHighlight + postfix;
		}		
    
    	var createHelpText = function(input) {
		    var split = LSST_TERMINAL.Utility.SplitStringByParameter(input);
		    
		    var cmdName = split.shift();
		    var autoCmd = commandNames.autoComplete(cmdName);
		    
		    if (!autoCmd) {
		        terminalHelp.clear();
		        return;
		    }
		    
		    var cmdParams = cmds[autoCmd].parameters;
		    
		    var hlIdx = split.length;
		    var bEndMulti = input.trim().charAt(input.trim().length - 1) == properties.multiEnd;
		    if (input.match(/\s$/) && (!Array.isArray(split[split.length - 1]) || bEndMulti))
		        hlIdx++;
		    hlIdx = Math.min(hlIdx, cmdParams.length);
		    
		    var helpString = autoCmd;
		    if (hlIdx == 0)
		        helpString = highlightString(helpString);
		    
		    var i = 0;
		    for (; i < split.length && i < cmdParams.length; i++) {
		        var c = split[i];
		        
		        /*if (Array.isArray(c)) {
		            var autoSub = getAutoComplete(c[0], subCommands);
		            
		            if (autoSub) {
		                var add = ' ' + properties['multiStart'] + cmdParams[i] + ': ';
		                add += autoSub;
		                add += properties['multiEnd'];
		                if ((i + 1) == hlIdx)
		                    add = highlightString(add);
		                
		                helpString += add;
		                continue;
		            }
		        }*/
		        
		        var add = ' ' + cmdParams[i];
		        if ((i + 1) == hlIdx)
		            add = highlightString(add);
		        helpString += add;
		    }
		    
		    for (; i < cmdParams.length; i++) {
		        var add = ' ' + cmdParams[i];
		        if ((i + 1) == hlIdx)
		            add = highlightString(add);
		        helpString += add;
		    }

			terminalHelp.set(helpString);
		}
    
    
    
    
    	return this;
    
    };
	

}( jQuery ));












/*
(function ( $ ) {

	// @param commands - A list of all of the commands.
	// @param subCommands - A list of strings, containing any possible sub commands. Subcommands are multi variable parameters.
	// @param properties - A dictionary of possible properties for the terminal window.
	// 
	// Command Attributes:
	// 		callback - A function to call when the command is entered in the terminal. Takes one parameter, which is an array of the arguments.
	// 		description - A description of this command. It is displayed in the help section for this command. This attribute is not needed.
	// 		doc_link - A link (relative to the helpLink passed in the terminal function) displayed in the help section for this command. This attribute is not needed.
	//
	// Properties:
	//		helpLink - A link pointing to a help document.
	// 		prefix - The prefix of displaying commands in the terminal.
	//		width - The width of the terminal.
	//		height - The height of the terminal.
	// 		fontSize - The base font size of the text.
	//      multiStart - The starting string for a parameter with multiple data.
	//      multiEnd - The ending string for a paramater with multiple data.
	//      maxHistoryEntries - The maximum number of entries allowed in the history.
	//
	// Example usage:
	// var commands = {
	// 		"hello_world" : { 'callback' : executeHelloWorld, 'description': 'help string for hello_world command' },
	//		"command_with_parameters nameOfParam1 nameOfParam2" : { 'callback' : executeCommandWithParameters, 'doc_link' : 'command_with_parameters' }
	// };
	// $('#cmd_div').terminal(commands);
		
    $.fn.terminal = function(commands, subCommands, properties) {
		var checkProperties = function(name, value) {
			if (properties[name] == undefined)
				properties[name] = value;
		}
		checkProperties('prefix', '~>');
		checkProperties('width', 650);
		checkProperties('height', 300);
		checkProperties('fontSize', '');
		checkProperties('multiStart', '(');
		checkProperties('multiEnd', ')');
		checkProperties('maxHistoryEntries', 50);


		///////////////////////////////////////////////////////////////
		// Table of contents
		// 0. Create terminal
		// 1. Common variable definitions
		// 2. Common helper functions
		// 3. Built in commands
		// 4. Initialization
		// 5. keyup helper functions
		// 6. keydown/keyup function
		// 7. Handling functions
		// 8. Public functions
		///////////////////////////////////////////////////////////////
	
		
		///////////////////////////////////////////////////////////////
		// 0. Create terminal /////////////////////////////////////////
		///////////////////////////////////////////////////////////////
		var container = $(this);
		var terminal = jQuery('<div>').addClass('cmd_container');
		var helpText = jQuery('<p>').addClass('cmd_help');
		var outputArea = jQuery('<p>').addClass('cmd_output');
		var inputBox = jQuery('<input>').addClass('cmd_input').attr('placeholder', 'Enter command here');
		
		container.append(terminal);
		terminal.append(helpText);
		terminal.append(outputArea);
		terminal.append(inputBox);
	
		///////////////////////////////////////////////////////////////
		// 1. Common variable definitions /////////////////////////////
		///////////////////////////////////////////////////////////////
		var defaultHelpText = 'Command interface: Type help for more info';
		// Will hold { cmdName, {'parameters', 'callback', 'help' }} for each command
		var cmds = {};
		// Will cache the keys to help with auto complete
		var keys = [];
		
		var terminalVariables = {};
		
		
		///////////////////////////////////////////////////////////////
		// 2. Common helper functions /////////////////////////////////
		///////////////////////////////////////////////////////////////		
		var isBuiltInCommand = function(cmd) {
			if (cmd == 'clear' || cmd == 'help' || cmd == 'echo')
				return true;
			return false;
		};
		
		var highlightString = function(stringToHighlight) {
			
			var prefix = '<span id=\"cmd_highlight\">';
			var postfix = '</span>';
			return prefix + stringToHighlight + postfix;
		};
		
		var checkStringDef = function(value) {
			if (value == undefined)
				return '';
			return value;
		}
		
		var setHelpText = function(str) {
			helpText.html(str);
		}
		var getHelpText = function() {
		    return helpText.html();
		}	
		var clearHelpText = function() {
			helpText.html(defaultHelpText);
		}
		
		var setInputText = function(str) {
		    inputBox.val(str);
		}
		var clearInputText = function() {
		    inputBox.val('');
		}
		var appendInputText = function(app) {
		    var val = inputBox.val();
		    inputBox.val(val + app);
		}		
		
		var sanitizeText = function(text) {
			var t = text;
			
			t = t.replace(/</g, '&lt;');
			t = t.replace(/>/g, '&gt;');
			t = t.replace(/\n/g, '<br/>');
			
			if (text.trim() == '')
				return '<br/>';
			
			return t;
		}
		
		var echoCommand = function(text) {
			var t = sanitizeText(properties['prefix'] + ' ' + text);
			t = '<p class="echo_output_command">' + t + '</p>';
			
			outputArea.append(t);
		}
		var echoLink = function(text, link) {
			var t = sanitizeText(text);
			t = '<a href=\"' + link + '\" target=\"_blank\">' + t + '</a>';
			
			outputArea.append(t);
		}
		var echoText = function(text, newLine = true) {
			var t = sanitizeText(text);
			t = '<p class="echo_output_text">' + t + '</p>';
			
			outputArea.append(t);					
		}
		
		var addHistory = function(input) {
		    if (cmdHistory.length - 1 >= 0) {
		        if (cmdHistory[cmdHistory.length - 1] == input) {
		            cmdHistoryIndex = cmdHistory.length;
		            return;
		        }
		    }
		    
		    cmdHistory.push(input);
		    cmdHistoryHelp.push(getHelpText());
		    
		    if (cmdHistory.length > properties['maxHistoryEntries']) {
		        cmdHistory.shift();
		        cmdHistoryHelp.shift();
		    }
		    
		    cmdHistoryIndex = cmdHistory.length;
		    
		    localStorage.setItem('cmdHistory', JSON.stringify(cmdHistory));
		    localStorage.setItem('cmdHistoryHelp', JSON.stringify(cmdHistoryHelp));
		}
		var getHistory = function() {
		
		    if (cmdHistory.length == 0)
		        return { 'cmd' : '', 'help' : defaultHelpText };
		
		    if (cmdHistoryIndex < 0)
		        cmdHistoryIndex = 0;
		    else if (cmdHistoryIndex >= cmdHistory.length) {
		        cmdHistoryIndex = cmdHistory.length;
		        return '';
		    }
		    
		    return { 'cmd' : cmdHistory[cmdHistoryIndex], 'help' : cmdHistoryHelp[cmdHistoryIndex] };
		}
		
		var sortArrayAlpha = function(arr) {
		    arr.sort(function(a, b) {
			    var keyA = a.toLowerCase();
			    var keyB = b.toLowerCase();
			
			    if (keyA < keyB)
				    return -1;
			    else if (keyA > keyB)
				    return 1;
			    return 0;
		    });
		}
		
		var splitByParameter = function(input) {
		    var splitWS = splitByWhiteSpace(input);
		    
		    var bMulti = false;
		    var result = [];
		    for (var i = 0; i < splitWS.length; i++) {
		        var c = splitWS[i];
		        
		        if (c.charAt(0) == properties['multiStart']) {
		            bMulti = true;
		            c = c.substr(1, c.length);
		            result.push('');
		        }
		        if (c.charAt(c.length - 1) == properties['multiEnd']) {
		            bMulti = false;
		            c = c.substr(0, c.length - 1);
		            if (c)
		                result[result.length - 1] += c;
		            continue;
		        }
		        
		        if (bMulti) {
		            if (c)
		                result[result.length - 1] += c + ' ';
		        }
		        else {
		            result.push(c);
		        }
		    }
		    
		    return result;
		}
		
		var parseParameters = function(params) {
		    for (var i = 0; i < params.length; i++) {
		        var p = params[i];
			    if (p in terminalVariables) {
			        var curr = terminalVariables[p];
			        params[i] = curr;
			    }
		    }
		}
		
		///////////////////////////////////////////////////////////////
		// 3. Built in commands ///////////////////////////////////////
		///////////////////////////////////////////////////////////////
		var clearOutputArea = function(args) {			
			outputArea.empty();
		};
		
		var displayTerminalHelp = function(args) {
			
			if (!args['[command]']) {
				// Display all commands
				echoCommand('help\n');
				
				if ( properties['helpLink'] != undefined)
					echoLink('Link to help documentation\n', properties['helpLink']);
				
				echoText(' Tip: You can use Ctrl+Space to autocomplete command names!\n');
				echoText(' Note: Commands which take multi-length parameters (such as echo), must be wrapped with \'' + properties['multiStart'].charAt(0) + '\' and \'' + properties['multiEnd'] + '\'\n\n');
				echoText(' Available commands: (* denotes a built in command)\n');
				
				for (var i = 0; i < keys.length; i++) {
					var key = keys[i];
					var params = cmds[key]['parameters'];
					
					var text;
					if (isBuiltInCommand(key))
						text = ' - *' + key;
					else
						text = ' - ' + key;
					
					if (params.length != 0)
						text += ': ' + arrayToString(params);
					echoText(text + '\n');
				}
			}
			else {
				// Display specific command
				
				var cmdName = args['[command]'];
				echoCommand('help ' + cmdName + '\n');
				
				if (keys.indexOf(cmdName) == -1) {
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
						paramText =  arrayToString(params);
					else
						paramText = 'None';
					
					
					echoText('Parameters: ' + paramText + '\n');
					echoText('Description: ' + cmds[cmdName]['description'] + '\n');
				}				
			}			
		};
		
		var echo = function(args) {
			var str = arrayToString(args['echo_string']);
			echoCommand('echo ' + str + '\n');
			echoText(str + '\n');
		}
		
		var clearHistory = function(args) {
		    cmdHistory = [];
		    cmdHistoryHelp = [];
		    cmdHistoryIndex = 0;
		    
		    localStorage.setItem('cmdHistory', null);
		    localStorage.setItem('cmdHistoryHelp', null);
		}
		
		
		///////////////////////////////////////////////////////////////
		// 4. Initialization //////////////////////////////////////////
		///////////////////////////////////////////////////////////////

        // Set width and height of terminal
		terminal.css('width', properties['width']);
		terminal.css('height', properties['height']);
		
		// Set font size
		if (properties['fontSize'] == '')
			terminal.css('font-size', (properties['height'] / 300.0) + 'em');
		else
			terminal.css('font-size', properties['fontSize']);
		
		// Calculate output are height
		var helpTextHeight = helpText.outerHeight(true);
		var inputBoxHeight = inputBox.outerHeight(true);
		var terminalHeight = terminal.outerHeight(true);
		var leftOver = 100 * ((terminalHeight - (helpTextHeight + inputBoxHeight)) / terminalHeight);
		outputArea.height((leftOver - 1) + '%');
		
		// Create a user-defined commands
		for (var key in commands) {			
			if (commands.hasOwnProperty(key)) {
				// Split command string by whitespace
				var parameters = splitByWhiteSpace(key);
				// Store command name
				var cmdName = parameters[0];
				// Remove command name from list of parameters (now it's the actual list of parameters)
				parameters.shift();
				
				var callback = commands[key]['callback'];
				var description = checkStringDef(commands[key]['description']);
				var doc_link = checkStringDef(commands[key]['doc_link']);
				
				createCommand(cmdName, parameters, callback, description, doc_link);			
			}			
		};
		
		// Clicking anywhere in the terminal will put focus in the input box
		terminal.click(function() {
		    inputBox.focus();
		});
		
		// Add built in commands
		createCommand(cmdName = 'clear', parameters = [], callback = clearOutputArea, 
						description = 'Clears the output log of the terminal.');
						
		createCommand(cmdName = 'help', parameters = ['[command]'], callback = displayTerminalHelp, 
						description = 'Displays all the commands, or the help string for a single command.');
						
		createCommand(cmdName = 'echo', parameters = ['echo_string'], callback = echo, 
						description = 'Echoes a string to the output area.');
						
		createCommand(cmdName = 'clear_terminal_history', parameters = [], callback = clearHistory, 
						description = 'Clears the history of commands.');
		
		clearHelpText();
		
		// Sort keys alphabetically
		sortArrayAlpha(keys);
		// Sort sub commands
		sortArrayAlpha(subCommands);
		
		// Get stored history, if exists
		cmdHistory = JSON.parse(localStorage.getItem('cmdHistory'));
		if (!cmdHistory)
		    cmdHistory = [];
		cmdHistoryHelp = JSON.parse(localStorage.getItem('cmdHistoryHelp'));
		if (!cmdHistoryHelp)
		    cmdHistoryHelp = [];
		cmdHistoryIndex = cmdHistory.length;
		
		
		
		
		///////////////////////////////////////////////////////////////
		// 5. keyup helper functions //////////////////////////////////
		///////////////////////////////////////////////////////////////
		// Execute the string given by the command line
		var executeCommand = function(input) {
			input = input.trim();
			if (input == '') {
				inputBox.val('');
				return;
			}
			
			addHistory(input);
			
            var userParams = splitByParameter(input);
            parseParameters(userParams);
			var cmdName = userParams.shift();
						
			if (cmdName in cmds) {
				// Command does exist
				
			    var paramsAsDict = {};
				var cmdParams = cmds[cmdName]['parameters'];
				var cb = cmds[cmdName]['callback'];
				
				for (var i = 0; i < userParams.length; i++) {	
					var p = userParams[i];
					
					if (p.match(/\s/g))
						p = splitByWhiteSpace(p);			
                    paramsAsDict[cmdParams[i]] = p;
				}
				
				// Add input to outputArea
				if (!isBuiltInCommand(cmdName))
					echoCommand(input + '\n');
				
				cb(paramsAsDict);
			
			} else {
				echoCommand('\'' + cmdName + '\' command not valid!\n');
			}
			
			clearInputText();			
		};
		
		// input - The input string
		// list - The list of possible auto completes. Should be in alphabetical order.
		var getAutoComplete = function(input, list) {
		    if (!list)
		        return;	    
		
		    for (var i = 0; i < list.length; i++) {
				var item = list[i];
				var regex = new RegExp('^' + input);
				
				if (item.match(regex) != null) {
				    return item;
				}
			}
			
			// Not found
			return null;
		}
		
		var calculateParamIndex = function(input) {
		    var idx = 0;
		    var bMulti = false;
		    splitByWhiteSpace(input).forEach( function(elem) {
		    
		        if (!bMulti) {
		            if (elem.charAt(0) == properties['multiStart'].charAt(0)) {
		                bMulti = true;
		            }
		            else
		                idx++;
		        }
		        else if (bMulti) {
		            if (elem.charAt(elem.length - 1) == properties['multiEnd'].charAt(0)) {
		                idx++;
		                bMulti = false;
		            }
		        }
		    
		    });
		    if (!bMulti && input.charAt(input.length - 1) != ' ')
		        idx--;
		        
		    return idx;
		}
		
		var findHelpText = function(input) {
		    var auto = getAutoComplete(input, keys);
	        if (auto != null) {
	            var splitter = ' ';
			    var helpStr = auto + splitter;
			    var parameters = cmds[auto]['parameters'];
			    for (var i = 0; i < parameters.length; i++)
				    helpStr += parameters[i] + splitter;
			
			    return helpStr;
	        }
	        return null;
		}
		
		
		///////////////////////////////////////////////////////////////
		// 6. keydown/keyup ///////////////////////////////////////////
		///////////////////////////////////////////////////////////////
		var ctrlDown = false;
		inputBox.keydown(function(event) {			
			
			if (event.keyCode == 17)
				ctrlDown = true;
			
		});
				
		inputBox.keyup(function(event) {
				
			var input = inputBox.val().trim().toLowerCase();
			if (!input)
			    clearHelpText();
						
			switch (event.keyCode) {
				
				// Space
				case 32:
				    if (ctrlDown)
					    handleAutoComplete(input);
					break;
					
				/*case 8: // Backspace
				case 46: // Delete
					if (!input) {
					    clearHelpText();
					    return ;
					}
				    break;
				
				// Enter
				case 13:
				    handleExecuteCommand(input);					
					break;
				
				// Up arrow
				case 38:
				    handleHistory(true);
					break;
				
				// Down arrow
				case 40:
				    handleHistory(false);
					break;
				
				// Ctrl
				case 17:
					ctrlDown = false;
					break;
			}
		
			input = inputBox.val().replace(/^ /g, '').toLowerCase();
			if (!input)
			    return;
			    			
			createHelpText(input);
		});
		
		
		
		///////////////////////////////////////////////////////////////
		// 7. Handling functions //////////////////////////////////////
		///////////////////////////////////////////////////////////////
		var handleAutoComplete = function(input) {
		    if (!input)
			    return;
			
			var split, currParam;
			if (input) {
			    split = splitByWhiteSpace(input);
			    currParam = split[split.length - 1];
			}
		    var list;
		    if (split[0] == 'help' || split.length == 1) {
		        list = keys;
		    }
		
		    var auto = getAutoComplete(currParam, list);
		    if (auto == null)
		        return;
		    
		    appendInputText(auto.substr(currParam.length) + ' ');
		}		
		
		var handleExecuteCommand = function(input) {
			var sh = outputArea[0].scrollHeight;
			if (sh <= outputArea.height())
			    sh = 0;
			    
			executeCommand(input);
			clearHelpText();
			
			outputArea.scrollTop(sh);
		}
		
		var handleHistory = function(up) {
		    if (up)
		        cmdHistoryIndex--;
		    else
		        cmdHistoryIndex++;
		        
		    var hist = getHistory();
		    if (hist) {		    	    
		        setInputText(hist['cmd']);
		        setHelpText(hist['help']);
		    }
		    else {
		        clearInputText();
		        clearHelpText();
		    }		
		}
		
		var createHelpText = function(input) {
		    var split = splitByParameter(input);
		    console.log(split);
		    var cmdName = split.shift();
		    var autoCmd = getAutoComplete(cmdName, keys);
		    
		    if (!autoCmd) {
		        clearHelpText();
		        return;
		    }
		    
		    var cmdParams = cmds[autoCmd]['parameters'];
		    
		    var hlIdx = split.length;
		    var bEndMulti = input.trim().charAt(input.trim().length - 1) == properties['multiEnd'];
		    if (input.match(/\s$/) && (!Array.isArray(split[split.length - 1]) || bEndMulti))
		        hlIdx++;
		    hlIdx = Math.min(hlIdx, cmdParams.length);
		    
		    var helpString = autoCmd;
		    if (hlIdx == 0)
		        helpString = highlightString(helpString);
		    
		    var i = 0;
		    for (; i < split.length && i < cmdParams.length; i++) {
		        var c = split[i];
		        
		        if (Array.isArray(c)) {
		            var autoSub = getAutoComplete(c[0], subCommands);
		            
		            if (autoSub) {
		                var add = ' ' + properties['multiStart'] + cmdParams[i] + ': ';
		                add += autoSub;
		                add += properties['multiEnd'];
		                if ((i + 1) == hlIdx)
		                    add = highlightString(add);
		                
		                helpString += add;
		                continue;
		            }
		        }
		        
		        var add = ' ' + cmdParams[i];
		        if ((i + 1) == hlIdx)
		            add = highlightString(add);
		        helpString += add;
		    }
		    
		    for (; i < cmdParams.length; i++) {
		        var add = ' ' + cmdParams[i];
		        if ((i + 1) == hlIdx)
		            add = highlightString(add);
		        helpString += add;
		    }
		    
		    helpString += ' --- ';
		    setHelpText(helpString);
		}
		
		
		///////////////////////////////////////////////////////////////
		// 8. Public functions ////////////////////////////////////////
		///////////////////////////////////////////////////////////////
		this.setVariable = function(name, value) {
		    terminalVariables[name] = value;
		}
		
		return this;
    };
 
}( jQuery ));


(function ( $ ) {
		
    $.fn.echo = function(str) {	

		var output = $(this).find('.cmd_output');
		
		var outStr = '<p class=\'echo_output_text\'>' + str + '</p><br/>';
		output.append(outStr);		
	
		return this;	
	};

}( jQuery ));*/





















