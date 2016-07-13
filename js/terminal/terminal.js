

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
		///////////////////////////////////////////////////////////////
	
		
		///////////////////////////////////////////////////////////////
		// 0. Create terminal /////////////////////////////////////////
		///////////////////////////////////////////////////////////////
		var container = $(this);
		//container.addClass('cmd_container');
		container.attr('id', 'cmd_container');
		// Add help line
		container.append('<p id="cmd_help"></p>');
		// Add output area
		container.append('<p id="cmd_output"></p>');
		// Add input box
		container.append('<input id="cmd_input" placeholder="Enter command here">');
				
	
		///////////////////////////////////////////////////////////////
		// 1. Common variable definitions /////////////////////////////
		///////////////////////////////////////////////////////////////
		var inputBox = container.find('#cmd_input');
		var outputArea = container.find('#cmd_output');
		var helpText = container.find('#cmd_help');
		
		var defaultHelpText = 'Command interface: Type help for more info';
		// Will hold { cmdName, {'parameters', 'callback', 'help' }} for each command
		var cmds = {};
		// Will cache the keys to help with auto complete
		var keys = [];
		var cmdHistory = [];
		var cmdHistoryHelp = [];
		var cmdHistoryIndex;
		
		
		///////////////////////////////////////////////////////////////
		// 2. Common helper functions /////////////////////////////////
		///////////////////////////////////////////////////////////////
		var splitByWhiteSpace = function(string) {
			return string.match(/\S+/g);
		};
		
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
		
		var createCommand = function(cmdName, parameters, callback, description = '', doc_link = '') {
			cmds[cmdName] = { 'parameters' : parameters, 'callback' : callback, 
								'description' : description , 'doc_link' : doc_link};
								
			keys.push(cmdName);
		}
		
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
		
		var arrayToString = function(arr) {
		    if (typeof(arr) == 'string')
		        return arr;
		    
		    var s = '';
		    for (var i = 0; i < arr.length; i++) {
		        s += arr[i] + ' ';
		    }
		    return s;
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
		    var splitP = [];
		    for (var i = 0; i < splitWS.length; i++) {
		        var c = splitWS[i];
		        
		        if (c.charAt(0) == properties['multiStart']) {
		            bMulti = true;
		            c = c.substr(1, c.length);
		            splitP.push([]);
		        }
		        if (c.charAt(c.length - 1) == properties['multiEnd']) {
		            bMulti = false;
		            c = c.substr(0, c.length - 1);
		            if (c)
		                splitP[splitP.length - 1].push(c);
		            continue;
		        }
		        
		        if (bMulti) {
		            if (c)
		                splitP[splitP.length - 1].push(c);
		        }
		        else {
		            splitP.push(c);
		        }
		    }
		    
		    return splitP;
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
		container.css('width', properties['width']);
		container.css('height', properties['height']);
		
		// Set font size
		if (properties['fontSize'] == '')
			container.css('font-size', (properties['height'] / 300.0) + 'em');
		else
			container.css('font-size', properties['fontSize']);
		
		// Calculate output are height
		var helpTextHeight = helpText.outerHeight(true);
		var inputBoxHeight = inputBox.outerHeight(true);
		var containerHeight = container.outerHeight(true);
		var leftOver = 100 * ((containerHeight - (helpTextHeight + inputBoxHeight)) / containerHeight);
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
		container.click(function() {
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
			var cmdName = userParams.shift();
						
			if (cmdName in cmds) {
				// Command does exist
				
			    var paramsAsDict = {};
				var cmdParams = cmds[cmdName]['parameters'];
				var cb = cmds[cmdName]['callback'];
				
				for (var i = 0; i < userParams.length; i++) {
				    paramsAsDict[cmdParams[i]] = userParams[i];
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
				    break;*/
				
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
		// 6. Handling functions //////////////////////////////////////
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
		    
		    setHelpText(helpString);
		}
		
		
		return this;
    };
 
}( jQuery ));


(function ( $ ) {
		
    $.fn.echo = function(str) {	

		var output = $(this).find('#cmd_output');
		
		var outStr = '<p class=\'echo_output_text\'>' + str + '</p><br/>';
		output.append(outStr);		
	
		return this;	
	};

}( jQuery ));





















