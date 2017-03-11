/*
	Flowerbox
	Copyright (C) 2010-2017 Kayateia
	For license info, please see notes/gpl-3.0.txt under the project root.

	CliMOO - Multi-User Dungeon, Object Oriented for the web
	Copyright (C) 2010-2014 Kayateia
*/

/*

Javascript / JQuery based terminal interface for a web page

This piece was definitely inspired by the xkcd CLI (uni.xkcd.com)
but it's not derivative of it.

*/

///<reference path="../../node_modules/@types/jquery/index.d.ts" />

interface JQuery {
	everyTime: any;
	oneTime: any;
}

/*
Requires:
	jquery-x.x.x.js
	jquery.timers-1.0.0.js
	jquery.hotkeys.js
*/

declare let escape: any;

let Term = {
	///////////////////////////////////////////////////
	// Global terminal settings
	settings: {
		prompt:			"fb&gt; ",
		cursorSpeed:	500,
		commandHandler:	null,
		soundHandler:	null,
		div:			null
	},

	///////////////////////////////////////////////////
	// AJAX spinner
	spinner: {
		_cmdCount: 0,

		// Start an AJAX command and return its ID and a ready-to-go spinner.
		start: function() {
			var thisCmd = ++this._cmdCount;
			var spinnerCode = $(Term.settings.div).find('#input-spinner-template').clone();
			spinnerCode
				.prop('id', 'spinner-' + thisCmd)
				.fadeIn(100);
			return { 'id':thisCmd, 'dom':spinnerCode };
		},

		// Finish an AJAX command and take the spinner out of commission.
		finish: function(cmdId, replaceWith?) {
			$(Term.settings.div).find('#spinner-' + cmdId).fadeOut(100, function() {
				if (replaceWith)
					$(this).before(replaceWith);
				$(this).remove();
			});
		}
	},

	///////////////////////////////////////////////////
	// Scroll handling
	scroll: {
		// Scroll by however many pages (-/+)
		scroll: function(pages) {
			var display = $(Term.settings.div).find('.terminal');
			display.animate({
				scrollTop: display.scrollTop() + pages * (display.height() * .75)
			}, 100, 'linear');
		},

		// Scroll to the bottom.
		toBottom: function() {
			var display = $(Term.settings.div).find('.terminal');
			display.animate({
				scrollTop: display.prop('scrollHeight')
			}, 100, 'linear');
		}
	},

	///////////////////////////////////////////////////
	// Input handler
	input: {
		_curLine: "",
		_cursorPos: 0,

		_update: function() {
			// Find the left half of the line.
			var left = this._curLine.substring(0, this._cursorPos);
			var onCursor = "&nbsp;";
			var right = "";
			if (this._cursorPos < this._curLine.length) {
				onCursor = this._curLine.substring(this._cursorPos, this._cursorPos + 1);
				right = this._curLine.substring(this._cursorPos + 1, this._curLine.length);
			}

			$(Term.settings.div).find('#input-left').html(left);
			$(Term.settings.div).find('#input-cursor').html(onCursor);
			$(Term.settings.div).find('#input-right').html(right);
		},

		set: function(newval) {
			this._curLine = newval;
			this._update();
		},

		get: function() {
			return this._curLine;
		},

		_checkOvershoot: function() {
			if (this._cursorPos > this._curLine.length)
				this._cursorPos = this._curLine.length;
		},

		setCursorPos: function(pos) {
			this._cursorPos = pos;
			this._update();
		},

		getCursorPos: function() {
			return this._cursorPos;
		},

		left: function() {
			this._checkOvershoot();
			if (--this._cursorPos < 0)
				this._cursorPos = 0;
			this._update();
		},

		leftWord: function() {
			var prevSpace;

			// Find the nearest space to the left of the cursor,
			// excluding those immediately adjacent to the cursor.
			// Treat consecutive spaces as a single space.
			do {
				prevSpace = this._curLine.lastIndexOf(' ', --this._cursorPos - 1);
			} while (this._curLine.charAt(prevSpace + 1) == ' ');

			// Position the cursor immediately to the right of the
			// identified space, or the start of the line if there
			// are no further spaces.
			if (prevSpace == -1)
				this._cursorPos = 0;
			else
				this._cursorPos = prevSpace + 1;
			this._update();
		},

		leftToStart: function() {
			this._cursorPos = 0;
			this._update();
		},

		right: function() {
			this._checkOvershoot();
			if (++this._cursorPos > this._curLine.length)
				this._cursorPos = this._curLine.length;
			this._update();
		},

		rightWord: function() {
			var nextSpace;

			// Find the nearest space to the right of the cursor.
			// Treat consecutive spaces as a single space.
			do {
				nextSpace = this._curLine.indexOf(' ', ++this._cursorPos);
			} while (nextSpace != -1 && this._curLine.charAt(nextSpace - 1) == ' ')

			// Position the cursor at the identified space, or at
			// the end of the line if there are no further spaces.
			if (nextSpace == -1)
				this._cursorPos = this._curLine.length;
			else
				this._cursorPos = nextSpace;
			this._update();
		},

		rightToEnd: function() {
			this._cursorPos = this._curLine.length;
			this._update();
		},

		insert: function(ch) {
			this._checkOvershoot();
			if (this._cursorPos == this._curLine.length)
				this._curLine += ch;
			else if (this._cursorPos == 0)
				this._curLine = ch + this._curLine;
			else
				this._curLine =
					this._curLine.substring(0, this._cursorPos)
					+ ch
					+ this._curLine.substring(this._cursorPos, this._curLine.length);
			++this._cursorPos;
			this._update();
		},

		del: function() {
			if (this._cursorPos < this._curLine.length)
				this._curLine = this._curLine.substring(0, this._cursorPos) + this._curLine.substring(this._cursorPos + 1);
			this._update();
		},

		delWord: function() {
			var delTo = this._cursorPos;
			this.leftWord();
			var delFrom = this._cursorPos;

			this._curLine = this._curLine.substring(0, delFrom) + this._curLine.substring(delTo);
			this._update();
		},

		delToStart: function() {
			this._curLine = this._curLine.substring(this._cursorPos);
			this._cursorPos = 0;
			this._update();
		},

		delToEnd: function() {
			var newLine = this._curLine.substring(0, this._cursorPos);
			this._curLine = newLine;
			this._update();
		},

		backspace: function() {
			this._checkOvershoot();
			if (this._cursorPos > 0) {
				this._curLine = this._curLine.substring(0, this._cursorPos - 1)
					+ this._curLine.substring(this._cursorPos, this._curLine.length);
				--this._cursorPos;
			}
			this._update();
		}
	},

	///////////////////////////////////////////////////
	// Command history handling
	history: {
		_commands: [],
		_idx: 0,
		_savedLine: [],

		add: function(line) {
			this._commands.push(line);
			this._idx = this._commands.length;
		},

		up: function() {
			if (this._idx == 0)
				return;
			if (this._idx == this._commands.length)
				this._savedLine = Term.input.get();
			else {
				if (this._commands[this._idx].length == Term.input.getCursorPos())
					Term.input.setCursorPos(this._commands[this._idx - 1].length);
			}

			Term.input.set(this._commands[--this._idx]);
		},

		down: function() {
			if (this._idx == this._commands.length)
				return;
			if (++this._idx == this._commands.length) {
				Term.input.set(this._savedLine);
				this._savedLine = "";
				return;
			} else {
				if (this._commands[this._idx - 1].length == Term.input.getCursorPos())
					Term.input.setCursorPos(this._commands[this._idx].length);
			}

			Term.input.set(this._commands[this._idx]);
		}
	},

	///////////////////////////////////////////////////
	// Output processing
	write: function(text, needSpinner?) {
		var $outputBlock = $('<div class="output-block">' + text + '</div>');
		$(Term.settings.div).find('#term-text').append($outputBlock);

		var spinnerId;
		if (needSpinner) {
			var spinnerInfo = Term.spinner.start();
			spinnerId = spinnerInfo['id'];
			$outputBlock.append(spinnerInfo['dom']);
		}
		Term.scroll.toBottom();

		return spinnerId;
	},

	writeCommand: function(text, needSpinner) {
		return Term.write('<span class="old-command"><span class="prompt">'
			+ Term.settings.prompt
			+ '</span>'
			+ text
			+ '</span>', needSpinner);
	},

	///////////////////////////////////////////////////
	// Command processing handling
	exec: function(commandText) {
		if (!commandText)
			return;

		Term.history.add(commandText);
		if (Term.settings.commandHandler)
			Term.settings.commandHandler(commandText);
		else
			Term.write("No command processor.", false);
	},

	///////////////////////////////////////////////////
	// Global init -- call from document.ready
	active: true,
	init: function(terminalDiv: HTMLElement) {
		Term.settings.div = terminalDiv;

		// Set the prompt.
		$(Term.settings.div).find('#input-prompt').html(Term.settings.prompt);

		// Cursor flashing
		$(Term.settings.div).find('.cursor-flash').everyTime(500, "cursor-flash", function () {
			if (Term.active)
				$(this).toggleClass('on');
			else
				$(this).removeClass('on');
		});

		let keybindings = [
			['keydown', 'pageup', function(evt) {
				Term.scroll.scroll(-1);
			}],

			['keydown', 'pagedown', function(evt) {
				Term.scroll.scroll(1);
			}],

			['keypress', 'return', function(evt) {
				var execLine = Term.input.get();
				Term.input.set("");
				Term.exec(execLine);
			}],

			['keydown', 'left', function(evt) {
				Term.input.left();
			}],

			['keydown', 'ctrl+left', function(evt) {
				Term.input.leftWord();
			}],

			['keydown', 'home', function(evt) {
				Term.input.leftToStart();
			}],

			['keydown', 'right', function(evt) {
				Term.input.right();
			}],

			['keydown', 'ctrl+right', function(evt) {
				Term.input.rightWord();
			}],

			['keydown', 'end', function(evt) {
				Term.input.rightToEnd();
			}],

			['keydown', 'up', function(evt) {
				Term.history.up();
			}],

			['keydown', 'down', function(evt) {
				Term.history.down();
			}],

			['keydown', 'ctrl+u', function(evt) {
				Term.input.delToStart();
			}],

			['keydown', 'ctrl+k', function(evt) {
				Term.input.delToEnd();
			}],

			['keydown', 'ctrl+w', function(evt) {
				Term.input.delWord();
			}],

			['keydown', 'del', function(evt) {
				Term.input.del();
			}],

			['keydown', 'backspace', function(evt) {
				Term.input.backspace();
			}]
		];

		for (let i=0; i<keybindings.length; ++i) {
			let kb: any = keybindings[i];
			let evthandler = { handler:kb[2] };
			$(document).bind(kb[0], kb[1], $.proxy(function(evt) {
				if (Term.active) {
					this.handler(evt);
					return false;
				} else
					return true;
			}, evthandler));
		}

		$(document).keypress(function(evt) {
			if (Term.active && !evt.ctrlKey) {
				if (evt.which >= 32 && evt.which <= 126) {
					var ch = String.fromCharCode(evt.which);
					if (ch) {
						evt.preventDefault();
						Term.input.insert(String.fromCharCode(evt.which));
					}
				}
			}
		});

		$(Term.settings.div).find('.terminal').prop('tabindex', 0);
		$(Term.settings.div).find('.terminal').blur(function(evt) {
			Term.active = false;
		});

		$(Term.settings.div).find('.terminal').focus(function(evt) {
			Term.active = true;
		});

		$(Term.settings.div).find('.terminal').focus();
	}
};

// AJAX functionality for the terminal; this adds the ability to
// send commands to the web server for execution, as well as a long-running
// "push" query for text coming back asynchronously.
let TermAjax = {
	settings: {
		fbapi:		null
	},

	// Newest backlog item we've seen.
	newest: 0,

	// Executes the command on the server via AJAX, with a nice spinner.
	// If squelchText is non-null/empty, it will be printed instead of the command.
	exec: function(commandText, squelchText) {
		if (!squelchText)
			squelchText = commandText;
		var spinnerId = Term.writeCommand(squelchText, true);
		TermAjax.settings.fbapi.terminalExec(commandText, () => {
			Term.spinner.finish(spinnerId);
		}, TermAjax.standardErrorHandler(spinnerId));
	},

	handleResponse: function(data) {
		if (!data.success) {
			console.log("Got bad console output response:", data.error);
			return;
		}

		if (!data.log) {
			console.log("Data.log is empty", data);
			return;
		}

		data.log.forEach(function(log) {
			var items = log.items.map(function(i) {
				if (typeof(i) === "object") {
					if (i.rich === "wob")
						i = '<a style="color:#5aa" href="/objinfo/' + i.id + '">' + i.text + "</a>";
				}
				return i;
			});
			Term.write(log.timestamp + ": " + items.join(" ") + "\n");
			TermAjax.newest = Math.max(TermAjax.newest, log.timestamp);
		});

		/*if (data.text)
			Term.write(data.text);
		if (data.prompt)
			Term.settings.prompt = data.prompt;
		if (data.sound && Term.settings.soundHandler)
			Term.settings.soundHandler(data.sound); */
	},

	// Generates an error handler for terminal-based AJAX requests.
	standardErrorHandler: function(spinnerId) {
		return $.proxy(function(xhr, status, err) {
			var msg;
			if (status == "timeout") {
				msg = "timed out"
			} else {
				msg = "server error";
			}

			// Deal with "spinner handles" handed out by TermLocal.
			var spinnerId = this;
			if ('id' in spinnerId)
				spinnerId = spinnerId.id;

			Term.spinner.finish(spinnerId, ' <span class="error">(' + msg + ')</span>');
		}, spinnerId);
	},

	// Handle unrequested input from server -- this uses a long-poll
	// AJAX request (30 seconds). If something fires, it will return
	// immediately with results, and we will query again immediately;
	// otherwise the timeout will happen and we'll start again.
	pushBegin: function() {
		function errorFunction(timeout: boolean, err: string) {
			if (timeout) {
				TermAjax.pushBegin();
			} else {
				// Wait a bit on error, in case something is flooded.
				console.log("error", err);
				$(document).oneTime(3000, "push-reset", function() {
					TermAjax.pushBegin();
				});
			}
		}
		TermAjax.settings.fbapi.terminalNewEvents((TermAjax.newest + 1),
			(data: any) => {
				TermAjax.handleResponse(data);
				TermAjax.pushBegin();
			},
			errorFunction);
	},

	init: function() {
		Term.settings.commandHandler = TermAjax.exec;
		TermAjax.pushBegin();
	}
};

// Local terminal command handlers.
//
// Functions should be in this form:
//   void func(command[, spinner])
// The spinner object will have a single method, finish().
let TermLocal = {
	_handlers: {},

	init: function() {
		var oldHandler = Term.settings.commandHandler;
		Term.settings.commandHandler = function(cmd) {
			for (var key in TermLocal._handlers) {
				if (cmd.substr(0, key.length) == key) {
					let hnd = TermLocal._handlers[key];
					let spnid = Term.writeCommand(cmd, hnd.spinner);
					var spn;
					if (spnid) {
						spn = {
							id: spnid,
							finish: function() {
								Term.spinner.finish(spnid);
							}
						};
					}
					hnd.f(cmd, spn);
					return;
				}
			}
			oldHandler(cmd);
		};
	},

	setHandler: function(prefix, needsSpinner, helpText, func) {
		TermLocal._handlers[prefix] = { f:func, spinner:needsSpinner, help:helpText };
	},

	getHandlers: function() {
		return TermLocal._handlers;
	}
};

let HelpHandler = {
	init: function() {
		TermLocal.setHandler("!help", false, "Shows this help.", function() {
			var output = "<table>";
			var handlers = TermLocal.getHandlers();
			for (var key in handlers)
				output += "<tr><td><span style=\"margin-right:10px; color:#5cc; font-weight:bold\">" + key + "</span></td><td>" + handlers[key].help + "</td></tr>";
			output += "</table>";
			Term.write(output, false);
		});
	}
};

// Sound handler. Takes care of downloading and activating sounds by HTML5 API.
let SoundHandler = {
	init: function() {
		Term.settings.soundHandler = SoundHandler.handle;

		try {
			// Fix up for prefixing
			let wany: any = window;
			wany.AudioContext = wany.AudioContext || wany.webkitAudioContext;
			SoundHandler.context = new AudioContext();
		}
		catch(e) {
			// Web Audio API is not supported in this browser.
			SoundHandler.context = null;
		}
	},

	handle: function(url) {
		if (!SoundHandler.context)
			return;

		if (!SoundHandler.sounds[url]) {
			var request = new XMLHttpRequest();
				request.open('GET', url, true);
				request.responseType = 'arraybuffer';

				// Decode asynchronously
				request.onload = function() {
				SoundHandler.context.decodeAudioData(request.response, function(buffer) {
					SoundHandler.sounds[url] = buffer;
					SoundHandler.playSound(url);
				}, function() {
					console.log("Error loading audio");
				});
			}
			request.send();
		} else {
			SoundHandler.playSound(url);
		}
	},

	playSound: function(url) {
		if (!SoundHandler.context)
			return;

		var source = SoundHandler.context.createBufferSource();		// creates a sound source
		source.buffer = SoundHandler.sounds[url];					// tell the source which sound to play
		source.connect(SoundHandler.context.destination);			// connect the source to the context's destination (the speakers)
		source.start(0);											// play the source now
	},

	context: null,
	sounds: {}
};

// Activate the terminal. This should be called only after the document is loaded.
function termInit(terminalDiv: HTMLElement) {
	Term.init(terminalDiv);
	TermAjax.init();
	TermLocal.init();
	SoundHandler.init();
	HelpHandler.init();
}

function termSetApi(fbapi: Flowerbox) {
	TermAjax.settings.fbapi = fbapi;
}
