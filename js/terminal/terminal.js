
// Terminal namespace
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
				if (curr.match(regex)) {
					var next = arr[i + 1];
					if (next && next.match(regex)) {
						return {
							auto : LSST_TERMINAL.Utility.StringSimilarity(curr, next),
							match : curr,
							bWhole : false
						}
					}
					else {
						return {
							auto : curr,
							match : curr,
							bWhole : true
						}
					}
				}
			}
			return {
				auto : '',
				match : '',
				bWhole : false
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
			
			callback(cmd_args, input);
			
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
		var index = cmds.length;
		
		var saveHistory = function() {
		    localStorage.setItem('cmdHistory', JSON.stringify(cmds));
		    localStorage.setItem('cmdHistoryHelp', JSON.stringify(help));
		}
	
		this.addCommand = function(cmd, helpText) {
		    if (cmds[cmds.length - 1] == cmd) {
		        index = cmds.length;
		        return;
		    }

			cmds.push(cmd);
			help.push(helpText);
			
			saveHistory();
		    
		    if (cmds.length > maxEntries) {
		        cmds.shift();
		        help.shift();
		    }
		    
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
		
		HighlightString : function(string) {
			return '<span class="cmd_highlight cmd_help_element">' + string + '</span>';
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
			return str.match(/\S+/g) || '';
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
		},
		
		StringSimilarity : function(str1, str2) {
			for (var i = 0; i < str1.length; i++) {
				var start = str1.substr(0, i + 1);
				var regex = new RegExp('^' + start);
				
				if (!str2.match(regex)) {
					return str1.substr(0, i);
				}
			}
			return str1;
		}
		
	},

};







/*
  _______                  _             _   _____                 _                           _        _   _             
 |__   __|                (_)           | | |_   _|               | |                         | |      | | (_)            
    | | ___ _ __ _ __ ___  _ _ __   __ _| |   | |  _ __ ___  _ __ | | ___ _ __ ___   ___ _ __ | |_ __ _| |_ _  ___  _ __  
    | |/ _ \ '__| '_ ` _ \| | '_ \ / _` | |   | | | '_ ` _ \| '_ \| |/ _ \ '_ ` _ \ / _ \ '_ \| __/ _` | __| |/ _ \| '_ \ 
    | |  __/ |  | | | | | | | | | | (_| | |  _| |_| | | | | | |_) | |  __/ | | | | |  __/ | | | || (_| | |_| | (_) | | | |
    |_|\___|_|  |_| |_| |_|_|_| |_|\__,_|_| |_____|_| |_| |_| .__/|_|\___|_| |_| |_|\___|_| |_|\__\__,_|\__|_|\___/|_| |_|
                                                            | |                                                           
                                                            |_|                                                           
*/


(function ( $ ) {
	
  // @param request:
  //          - Object: The description of a new terminal to be created and returned.
  //          - String: The name of a function to execute
  //            - Possible functions are: options, echo, 
  // @param params - If request is a function, this holds the necessary values for the function call.
  //                - It can be either an object or a single value, depending on the function call.
  jQuery.fn.lsst_term = function(request, params) {
  
    var plugin = jQuery(this);
  
    function getOption(name) {
        var obj = plugin.data("lsst_term");        
        return obj[name];
    }

    function setOption(name, value) {
        var obj = plugin.data("lsst_term");
        var defaults = {};
        if (!obj) {
            obj = $.extend({}, defaults);
            plugin.data("lsst_term", obj);
        }
        obj[name] = value;
        return obj[name];
    }
     	
    
    /////////////////////////////////////////////////////////////////////////////
  	//////////////////////////// BUILT-IN CMDS //////////////////////////////////
  	/////////////////////////////////////////////////////////////////////////////
  	var cmd_clear = function(cmd_args) {
  		getOption("terminalOutput").clear();
  	}
  	
  	var cmd_help = function(cmd_args) {
  		var commandArray = getOption("commandNames").getArray();
  		var properties = getOption("properties");
  		var cmds = getOption("cmds");
  		var keys = getOption("keys");
  	
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
  		getOption("terminalOutput").append(str);
  	}
  	
  	var cmd_clearTerminalHistory = function(cmd_args) {
  		getOption("history").clear();
  		cmd_clear();
  	}   	
      	
      	
  	/////////////////////////////////////////////////////////////////////////////
  	//////////////////////////// HELPER FUNCTIONS ///////////////////////////////
  	/////////////////////////////////////////////////////////////////////////////
  	var setOutputAreaHeight = function() {
  		// Fuck this shit
	    getOption("terminalOutputDOM").innerHeight('70%');
  	}
  	
  	var echoCommand = function(text) {
  		getOption("terminalOutput").append(text + '\n', 'echo_output_command');
  	}
  	
  	var echoText = function(text) {
  		cmd_echo( { 'string' : text } );
  	}
  	
  	var echoLink = function(text, link) {
	    var t = '<a href=\"' + link + '\" target=\"_blank\">' + text + '</a>';
  		getOption("terminalOutput").append(t + '\n');			
    }
   	
  	var getCommand = function(input) {
  	  var cmds = getOption("cmds");
  	  
  		var split = LSST_TERMINAL.Utility.SplitStringByWS(input);
  		var cmdName = split[0];
  		
  		if (cmdName in cmds) {
  			return cmds[cmdName];
  		}
  		else
  			return null;
  	}
  	
  	var executeCommand = function(input) {
  		getOption("history").addCommand(input, getOption("terminalHelp").text());
  		
  		var properties = getOption("properties");
  		var paramAutoCompletes = getOption("paramAutoCompletes");
  		
  		echoCommand(properties.prefix + ' ' + input);
  		input = LSST_TERMINAL.Utility.ReplaceStringWithVariables(input, getOption("terminalVariables"));
  		
  		var command = getCommand(input.toLowerCase());    		
  		if (command) {
  		  // Add parameter to auto complete, if necessary
  		  var splitByParams = LSST_TERMINAL.Utility.SplitStringByParameter(input, properties.multiStart, properties.multiEnd);
        splitByParams.shift();
        for (var i = 0; i < splitByParams.length; i++) {
        	var currParam = command.parameters[i];
        	if (currParam in paramAutoCompletes) {
        		var currAC = paramAutoCompletes[currParam];
        		currAC.insert(splitByParams[i]);
        	}
        }
  		  
  		  // Execute the command
  			command.execute(input, properties.multiStart, properties.multiEnd);
  		}
  		else {
  			cmd_echo( { 'string' : 'Please enter a valid command!\n' } );
  			return;
	    }
  	}	
  
  	var createHelpText = function(input) {
  	  var properties = getOption("properties");
  	  var cmds = getOption("cmds");
  	  var commandNames = getOption("commandNames");
  	  var terminalHelpSub = getOption("terminalHelpSub");
  	  var subCommandAutoCompletes = getOption("subCommandAutoCompletes");
  	  var examples = getOption("examples");
      var examplesDOM = jQuery(getOption("terminalExamplesDOM")).empty().css("display", "none");
  	  
      var split = LSST_TERMINAL.Utility.SplitStringByParameter(input, properties.multiStart, properties.multiEnd);
      
      var cmdName = split.shift();
      var autoCmd = commandNames.autoComplete(cmdName).match;
      var bLastSpace = input.match(/\s$/);
      
      // If the auto complete doesn't find a match,
      // or
      // the user is past the command name but the auto complete isn't the full command name
      // ---- ie the user has entered "uv_fre ffv", uv_fre isn't a command even though it autocompletes to uv_freq
      var bInvalidCmdName = (commandNames.getArray().indexOf(cmdName) == -1);
      if (!autoCmd || (bInvalidCmdName && (split.length > 0 || bLastSpace))) {
          getOption("terminalHelp").clear();
          return;
      }
      
      var command = cmds[autoCmd];
      var cmdParams = command.parameters;
	
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
			    helpString += '<span class="cmd_help_element">' + cmdParams[i] + '</span>';
		    }
	    }
	    
	    
	
	    var validSubCommand = false;
	    // If the parameter has a sub command
	    if (bInMulti) {
		    var multi = lastParam;
		    var subType = multi[0];
		    var auto = subCommandAutoCompletes.autoComplete(subType);
		
		    if (auto) {
			    auto = auto.match;
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
		    
		    
		    
		    
		 
	    
	    // Display examples if necessary
	    if (currParam && currParam in examples) {
	      var currExamples = examples[currParam];
	      examplesDOM.css("display", "inline-block");
	      examplesDOM.append(jQuery("<p>").text("Examples for " + currParam + " parameter:"));
	      for (var i = 0; i < currExamples.length; i++) {
	        var e = currExamples[i];
	        examplesDOM.append(jQuery("<p>").text(e));
	      }
	      var height = examplesDOM.outerHeight(true);
	      var offset = getOption("terminalHelpDOM").children(".cmd_highlight").offset();
	      offset.top -= (height + 20);
	      examplesDOM.offset(offset);
	    }
	    
	    
	    
	    
	    
	
	    return helpString;
    }
      
      
      
      	
  	/////////////////////////////////////////////////////////////////////////////
  	//////////////////////////// PUBLIC FUNCTIONS ///////////////////////////////
  	/////////////////////////////////////////////////////////////////////////////
  	function echo(value) {
  	  echoText(params += '\n');
  	}	
  	function setVariable(name, value) {
  		getOption("terminalVariables")[name] = value;
  	}
  	
  	function setFontSize(value) {
  		if (Number.isInteger(value))
  			value = value.toString();
  			
  		if (value.charAt(value.length - 1) != '%')
  			value += '%';
  		getOption("terminal").css('font-size', value);
  		
  		setOutputAreaHeight();
  	}
  	
  	function deleteParameterAuto(param, value) {
  	  var paramAutoCompletes = getOption("paramAutoCompletes");
  	 
  		if (param in paramAutoCompletes) {
  			var array = paramAutoCompletes[param].getArray();
  			
  			var idx = array.indexOf(value);
  			if (idx != -1) {
  				array.splice(idx, 1);
  				paramAutoCompletes[param] = new LSST_TERMINAL.AutoCompleteArray(array);
  			}
  		}
  		
  		setOption("paramAutoCompletes", paramAutoCompletes);
  	}
  	
  	function minimize(){
  		getOption("terminalOutputDOM").css('display', 'none');
  		
  		var newHeight = getOption("terminalInputDOM").outerHeight(true) + getOption("terminalHelpContainerDOM").outerHeight(true);
  		getOption("terminal").height(newHeight);
  	}
  	
  	function maximize() {
  		getOption("terminalOutputDOM").css('display', '');
  		
  		getOption("terminal").height(getOption("properties").height);
  	}
  	
  	function setDefault(param, value) {
  	  if (!getOption("defaults")) {
  	    setOption("defaults", {});
  	  }
  	  getOption("defaults")[param] = value;
  	}
      
    
    
    
    
    
    
    
    
    
    
    
    
    
    if (typeof request === "string") {
      if (request === "echo") {
        echo(params);
      }
      else if (request === "setVariable") {
        setVariable(params);
      }
      else if (request === "deleteParameterAuto") {
        deleteParameterAuto(params.param, params.value);
      }
      else if (request === "minimize") {
        minimize();
      }
      else if (request === "maximize") {
        maximize();
      }
      else if (request === "setDefault") {
        setDefault(params.param, params.value);
      }
      else if (request === "setFontSize") {
        setFontSize(params);
      }
    }
    else {
      var commands = request.commands;
      var subCommands = request.subCommands;
      var autoCompleteParams = request.autoCompleteParams;
      var paramsWithHint = request.paramsWithHint;
      var properties = request.properties;   
      setOption("defaults", jQuery.extend({}, request.defaults));
      setOption("examples", request.examples);
    
      // Create terminal
		  var terminal                 = setOption("terminal", jQuery(this).addClass('cmd_container'));
		  var terminalHelpContainerDOM = setOption("terminalHelpContainerDOM", jQuery('<p>').addClass('cmd_help_container'));
		  var terminalHelpDOM          = setOption("terminalHelpDOM", jQuery('<span>').addClass('cmd_help'));
		  var terminalHelpSubDOM       = setOption("terminalHelpSubDOM", jQuery('<span>').addClass('cmd_help_sub'));
		  var terminalOutputDOM        = setOption("terminalOutputDOM", jQuery('<div>').addClass('cmd_output'));
		  var terminalInputDOM         = setOption("terminalInputDOM", jQuery('<input>').addClass('cmd_input').attr('placeholder', 'Enter command here'));
		  var terminalExamplesDOM      = setOption("terminalExamplesDOM", jQuery('<div>').addClass('cmd_examples'));
	
		  terminal.append(terminalHelpContainerDOM).append(terminalOutputDOM).append(terminalInputDOM);
		  terminalHelpContainerDOM.append(terminalHelpDOM).append(terminalHelpSubDOM);
		  jQuery('body').append(terminalExamplesDOM);
      	
    	// Make sure all properties have values
	    properties.fontSize = LSST_TERMINAL.Utility.GetValue(properties.fontSize, '150%');
	    properties.multiStart = LSST_TERMINAL.Utility.GetValue(properties.multiStart, '(');
	    properties.multiEnd = LSST_TERMINAL.Utility.GetValue(properties.multiEnd, ')');
	    properties.maxHistoryEntries = LSST_TERMINAL.Utility.GetValue(properties.maxHistoryEntries, 50);
	    properties = setOption("properties", properties);
	
    	// Maps command names to LSST_TERMINAL.Command objects.
    	var cmds = {};
    	// The command history.
    	setOption("history", new LSST_TERMINAL.CommandHistory(properties.maxHistoryEntries));
    	// An LSST_TERMINAL.AutoCompleteArray object for all of the command names.
    	var commandNames = null;
    	
    	terminalInput   = setOption("terminalInput", new LSST_TERMINAL.InputElem(terminalInputDOM));
    	terminalOutput  = setOption("terminalOutput", new LSST_TERMINAL.TextContainer(terminalOutputDOM));
    	terminalHelp    = setOption("terminalHelp", new LSST_TERMINAL.TextElem(terminalHelpDOM, 'Command interface: Type help for more info'));
    	terminalHelpSub = setOption("terminalHelpSub", new LSST_TERMINAL.TextElem(terminalHelpSubDOM));
    	
    	setOption("terminalVariables", {});
    	// Maps parameter names to LSST_TERMINAL.AutoCompleteArray objects.
    	var paramAutoCompletes = {};
    	// An LSST_TERMINAL.AutoCompleteArray object for the sub commands
    	setOption("subCommandAutoCompletes", new LSST_TERMINAL.AutoCompleteArray(subCommands));
    	
    	
    	
      	
    	/////////////////////////////////////////////////////////////////////////////
    	//////////////////////////// INITIALIZATION /////////////////////////////////
    	/////////////////////////////////////////////////////////////////////////////
      	
    	// Set width and height of terminal
      if (properties.width)
	      terminal.css('width', properties.width);
      if (properties.height)
	      terminal.css('height', properties.height);
      else
	      properties.height = terminal.height();
  	
  	  // Set font size
      setFontSize(properties['fontSize']);
  
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
      setOption("keys", keys);
      setOption("cmds", cmds);
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
      setOption("commandNames", new LSST_TERMINAL.AutoCompleteArray(keys));
  
    	// Create auto complete arrays for parameter names
    	for (var key in autoCompleteParams) {
    		var curr = autoCompleteParams[key];
    		paramAutoCompletes[key] = new LSST_TERMINAL.AutoCompleteArray(curr);
    	}
    	setOption("paramAutoCompletes", paramAutoCompletes);
    	
    	setTimeout(this.setFontSize, 3000, properties['fontSize'] );
    
    
    
      /////////////////////////////////////////////////////////////////////////////
    	//////////////////////////// KEY DOWN/UP ////////////////////////////////////
    	/////////////////////////////////////////////////////////////////////////////
		
      getOption("terminalInputDOM").keydown(function(event) {
        var terminalInput = getOption("terminalInput");
      
	      var keyCode = event.keyCode || event.which;
	      var input = terminalInput.text().trim().toLowerCase();
	
	      // Tab
	      if (keyCode == 9) {
		      event.preventDefault();
		
	        var properties = getOption("properties");
	        var commandNames = getOption("commandNames");
	        var paramAutoCompletes = getOption("paramAutoCompletes");
	        
        	var splitByParams = LSST_TERMINAL.Utility.SplitStringByParameter(input, properties.multiStart, properties.multiEnd);
	        if (!splitByParams)
		        return;
		
        	var length = splitByParams.length;
        	var autoCmd = commandNames.autoComplete(splitByParams[0]);
        	if (!autoCmd)
        		return;
        		
          var bLastSpace = terminalInput.text().match(/\s$/);
          // Check for default parameter
        	if (length > 0 && bLastSpace) {
        		var currParam = getCommand(autoCmd.match).parameters[length - 1];
        	  var defaults = getOption("defaults");
        	  
        	  if (currParam in defaults) {
        	    terminalInput.append(defaults[currParam] + " ");
        	    return;
        	  }
        	}
        	
        	if (length == 1) {
        		var after = (autoCmd.bWhole) ? ' ' : '';
        		terminalInput.set(autoCmd.auto + after);
        	}
        	else {
        		var command = getCommand(autoCmd.match);
        		var pos = bLastSpace ? length - 1 : length - 2;
        		var currParam = command.parameters[pos];
        		
        		if (currParam in paramAutoCompletes) {
        			var ac = paramAutoCompletes[currParam];
        			var lastUserParam = splitByParams[length - 1];
        			var autoParam = ac.autoComplete(lastUserParam);
        			if (autoParam.auto) {
        				var after = (autoParam.bWhole) ? ' ' : '';
          			terminalInput.append(autoParam.auto.substr(lastUserParam.length) + after);
          		}
        		}
        	}
        }
      });
		
      getOption("terminalInputDOM").keyup(function(event) {
        var terminalInput = getOption("terminalInput");
        var terminalHelp = getOption("terminalHelp");
        var terminalHelpSub = getOption("terminalHelpSub");
        
	      var input = terminalInput.text().trim();
	      if (!input)
	          terminalHelp.clear();
	          
	      var history = getOption("history");
				
	      switch (event.keyCode) {
		
		      // Enter
		      case 13:
		        var terminalOutputDOM = getOption("terminalOutputDOM");
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
	
	      handleHelpPopup(input);
      });
        
        
        	
    	/////////////////////////////////////////////////////////////////////////////
    	//////////////////////////// jQuery FUNCTIONS ///////////////////////////////
    	/////////////////////////////////////////////////////////////////////////////
    	var handleHelpPopup = function(input) {
    		jQuery('.cmd_help_element').mouseenter(function() {
    		
    		  var paramAutoCompletes = getOption("paramAutoCompletes");
    		
    			// Destroy if there already is one
		      jQuery('#cmd_popup_container').remove();
				
    			var elem = jQuery(this);
    			var param = elem.text();
    			
    			if (param in paramAutoCompletes) {	
    				var list = paramAutoCompletes[param].getArray();
    				if (list.length == 0)
    					return;
    					
        		var split = LSST_TERMINAL.Utility.SplitStringByWS(input);
    				var currTyping = split[split.length - 1];
    				var bLastSpace = input.match(/\s$/) ? true : false;
    				var r = new RegExp('^' + currTyping);
    				
    				var popup_container = jQuery('<div>').attr('id', 'cmd_popup_container');
    				var popup_listcontainer = jQuery('<ul>').attr('id', 'cmd_popup_listcontainer');
    				for (var i = 0; i < list.length; i++) {
    					if (!list[i].match(r) && !bLastSpace)
    						continue;
    						
    					var li = jQuery('<li>').addClass('cmd_popup_element').text(list[i]);
    					popup_listcontainer.append(li);
    					
    					li.on('click', function() {
    						getOption("terminalInput").append(jQuery(this).text() + ' ');
					      jQuery('#cmd_popup_container').remove();
    					});
    				}
    				
    				if (popup_listcontainer.children().length == 0)
    					return;
    				
    				popup_container.append(popup_listcontainer);
    				
    				getOption("terminal").append(popup_container);
    				var elemOffset = elem.offset();
    				var elemHeight = elem.height();
    				
    				popup_container.offset(elemOffset);
    				popup_listcontainer.offset({
    					top : elemOffset.top + elemHeight,
    					left : elemOffset.left
    				});
    				
    				
			      jQuery('#cmd_popup_container').mouseleave(function() {
				      jQuery('#cmd_popup_container').remove();
			      });
    			}
    		});
    	}
    }  
    
    
  
  	return this;
  
  };
	

}( jQuery ));





























