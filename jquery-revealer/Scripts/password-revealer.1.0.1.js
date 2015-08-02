//----------------------------------------------------------------------------------------------
//
//	Name:		Javascript Password Revealer Widget
//  Title:      jquery.passwordrevealer
//	Developers:	Paul Shannon
//	Date:		1 August 2015
//  Contact:    email:		email@paulshannon.uk
//				twitter:	@paul_r_shannon
//
//	Description:
//				Appends a hidden textbox to targeted password fields, enabling a "view password"
//				button to toggle visibility of masked password fields
//
//	Pre-requisites:
//				jQuery >= v1.4.3
//
//	Licence:	https://www.gnu.org/licenses/gpl.html
//
//----------------------------------------------------------------------------------------------
//	Version History:
//----------------------------------------------------------------------------------------------
//	Version:	1.0.0:
//	Date:		1 August 2015
//	Change:		First Version
//----------------------------------------------------------------------------------------------

!function ($) {
	var passwordRevealer = function (element, options) {

		this.element = $(element);
		this.fields = [];

		var _targetSelector = (options ? options.target : undefined) || this.element.attr(this.dataAttribute + "target") || ":password";
		this.target = this.element.parents("form").find(_targetSelector);
		var _jquery = $.fn.jquery.toString().split(".");
		this.jqueryVersion = {
			major: parseFloat(_jquery[0])
    		, minor: parseFloat(_jquery[1])
    		, revision: parseFloat(_jquery[2])
			, valueOf: function () {
				return parseFloat((this.major * 1000000) + (this.minor * 1000) + this.revision);
			}
		}

		this._useProp = (this.jqueryVersion.valueOf() >= 1006000);

		this._options = $.extend(options, {

			//Set default properties; 
			debug: this.element.attr(this.dataAttribute + "debug") || false
            , mode: this.element.attr(this.dataAttribute + "mode") || "hold"
            , view: (this.element.attr(this.dataAttribute + "view") || "password").toLowerCase()
            , native: this.element.attr(this.dataAttribute + "native") || false

            , hiddencssclass: this.element.attr(this.dataAttribute + "hiddenCssClass") || ""
            , iconclassselector: this.element.attr(this.dataAttribute + "iconClassSelector") || "glyphicon"
            , passwordviewiconclass: this.element.attr(this.dataAttribute + "passwordViewIconClass") || "glyphicon-eye-open"
            , textboxviewiconclass: this.element.attr(this.dataAttribute + "textboxViewIconClass") || "glyphicon-eye-close"

			, oncreate: $.noop()
			, onchange: $.noop()
		});

		//pass default options through _validator() method.
		this._validator("debug", this._options.debug);
		this._validator("native", this._options.native);
		this._validator("mode", this._options.mode);
		this._validator("view", this._options.view);

		this._log(this.jqueryVersion);
		this._log(this.jqueryVersion.valueOf());
		//execute startup method, initialize widget 
		this.create();
		return this;
	}

	passwordRevealer.prototype = {
		//Contains all methods for startup, destroy, events and options
		constructor: passwordRevealer
        , nameSpace: "PasswordRevealer"
        , dataAttribute: "data-reveal-"
        , _suppressNativeCSS: "<style type=\"text/css\" id=\"PasswordRevealer_suppressNativeCSS\">::-ms-reveal{display:none;}</style>"
		, _HIDDEN_CSS_CLASS: "hiddencssclass"

		//Internal function to execute write of debugging messages to console window
        , _log: function (msg) {
        	//make sure use fully qualified name of "window.console" as IE9 can get in a hissy without.
        	if (window.console) {
        		if (this._options.debug !== "false") {
        			window.console.log(msg);
        		}
        	}
        }

		//function to clean up event handlers
        , _destroyEvents: function () {
        	//destroy's event handlers bound to the widget element (e.g.: the button)
        	// does not destroy event handlers for the textbox and passoword fields

        	this.element
				.unbind("click." + this.nameSpace)
				.unbind("mousedown." + this.nameSpace)
				.unbind("mouseup." + this.nameSpace)
				.unbind("touchstart." + this.nameSpace)
				.unbind("touchend." + this.nameSpace)
				.unbind("keydown." + this.nameSpace)
				.unbind("keyup." + this.nameSpace)
				.unbind("create." + this.nameSpace)
				.unbind("change." + this.nameSpace)
        	;

        	//var holdEvents = "mousedown." + this.nameSpace + ", mouseup." + this.nameSpace + ", keydown." + this.nameSpace + ", keyup." + this.nameSpace;
        	//this.element.off(holdEvents);
        }

		//Execute validation of options as they are set;
        , _refreshView: function ($in, $out) {
        	//Ensure new field has same value as outgoing one.
        	if ($in.val() != $out.val()) { $in.val($out.val()); }
        	var _fireEvent = false;

        	var hiddenClass = this.options("hiddenCssClass");

        	if ($in.is(":visible") == false) {
        		_fireEvent = true;
        		var classes = (this._useProp == true) ? $out.prop("class") : $out.attr("class");

        		$in.addClass(classes);
        		//password not visible, swap position with textbox and toggle visibility
        		$in.insertBefore($out)
        		$out.appendTo("body");
        		if (hiddenClass == "") {
        			$in.show();
        			$out.hide();
        		} else {
        			$in.removeClass(this.options("hiddenCssClass"));
        			$out.addClass(this.options("hiddenCssClass"));
        		}

        		//We support old versions of jquery by using the attr() method if jquery version < 1.6
        		if (this._useProp == true) {
        			$in.prop("disabled", "");
        			$out.prop("disabled", "disabled");
        		} else {

        			$in.attr("disabled", "");
        			$out.attr("disabled", "disabled");
        		}
        	}

        	//when in click-mode, copy over focus and selection of element
        	if (this.options("mode") == "click") {
        		$out.focus();

        		//copy text selection to new visible item
        		if ($out[0].selectionStart && $out[0].selectionEnd && $in[0].selectionStart && $in[0].selectionEnd) {
        			$in[0].selectionStart = $out[0].selectionStart;
        			$in[0].selectionEnd = $out[0].selectionEnd;
        		}
        	}

        	this._destroyEvents();

        	var _widget = this;

        	if (typeof _widget.options("onchange") == "function") {
        		_widget.element.bind("change." + this.nameSpace, _widget.options("onchange"));
        	}

        	if (typeof _widget.options("oncreate") == "function") {
        		_widget.element.bind("create." + this.nameSpace, _widget.options("oncreate"));
        	}

        	var _eventHandler = function () { void (0); }
        	if (this.options("mode") == "click") {
        		//handle click event to toggle view
        		_eventHandler = function (e) {
        			_widget.options("view", (_widget.options("view") == "password") ? "text" : "password");
        			_widget._log("password revealer: on" + e.type + " raised");
        		};

        		this.element.bind("click." + this.nameSpace, _eventHandler);
        	} else {
        		//bind mousedown and mouseup events
        		_eventHandler = function (e) {

        			var keyCode = (e.keyCode || e.which);
        			//only fire on key event if key is enter or space.
        			var isKey = (keyCode == 13 || keyCode == 32);
        			var isMouse = (e.type == "mousedown" || e.type == "mouseup");
        			var isTouch = (e.type == "touchstart" || e.type == "touchend");
        			var isDown = (e.type == "mousedown" || e.type == "keydown" || e.type=="touchstart");

        			_widget.options("view", (isDown && (isMouse || isKey || isTouch)) ? "text" : "password");
        			_widget._log("password revealer: on" + e.type + " raised");
        		};

        		_widget.element
					.bind("mousedown." + this.nameSpace, _eventHandler)
					.bind("mouseup." + this.nameSpace, _eventHandler)
					.bind("touchstart." + this.nameSpace, _eventHandler)
					.bind("touchend." + this.nameSpace, _eventHandler)
					.bind("keydown." + this.nameSpace, _eventHandler)
					.bind("keyup." + this.nameSpace, _eventHandler)
        		;
        	}

        	//Raise onChange event.
        	if (_fireEvent) { this.element.trigger("change", { element: this.element[0], view: this._options.view }); }
        }

        , _setOption: function (name, value) {
        	if (this._validator(name, value) == true) {
        		this._options[name] = value;
        	}
        }

        , _setOptions: function (options) {
        	var key;

        	for (key in options) {
        		this._setOption(key, options[key]);
        	}
        	this.refresh();
        }

		//Execute validation of options as they are set;
        , _validator: function (key, value) {
        	var _val = (this._options[key] == null ? null : this._options[key].toString());
        	var _return = false;

        	switch (key.toString().toLowerCase()) {
        		case "debug":
        		case "native":
        			_return = (_val == "true" || _val == "false");
        			break;

        		case "mode":
        			_return = (_val == "click" || _val == "hold");
        			break;

        		case "view":
        			_return = (_val == "password" || _val == "text");
        			break;

        		case "target":
        			this._log("'target' option can only be set during widget initialization");
        			_return = false;
        			break;

        		case "hiddencssclass":
        		case "iconclassselector":
        		case "passwordviewiconclass":
        		case "textboxviewiconclass":
        		case "onchange":
        		case "oncreate":
        			_return = true;
        			break;
        		default:
        			this._log("'" + key + "' is not a valid option name.");
        			return null;
        			break;
        	}
        	if (_return == false) {
        		this._log("Value '" + value + "' for option '" + key + "' is not valid.");
        	}
        	return _return;
        }

		//Initialization method;
        , create: function () {
        	var _widget = this;

        	$(this.target).each(function () {
        		if (this.name == "") {
        			/*fix if no name on password field*/
        			this.name = "password_" + new Date().toString();
        			_widget._log("A 'name' attribute is required on password field for this widget.  Automatically set as '" + this.name + "'");
        		}

        		var $p = $(this);

        		var _class = (_widget._useProp ? $(this).prop("class") : $(this).attr("class"));
        		var _dis = (_widget._useProp ? $(this).prop("disabled") : $(this).attr("disabled"));
        		var _style = (_widget._useProp ? $(this).prop("style") : $(this).attr("style"));
        		var _ph = (_widget._useProp ? $(this).prop("placeholder") : $(this).attr("placeholder"));

        		var $t = $("<input type='text' />")
                    .addClass(_class)
                    .addClass(_widget.options("hiddenCssClass"))
                    .attr("disabled", (_dis ? _dis : ""))
                    .attr("name", (this.name ? this.name : ""))
                    .attr("style", (_style ? _style : ""))
					.attr("placeholder", (_ph ? _ph : ""))
                    .appendTo("body:first")
        		;

        		if (_widget.options("hiddenCssClass") == "") { $t.hide(); }

        		//store list of textboxes and password fields in array
        		_widget.fields.push([$t, $p]);

        		$p.bind("change." + _widget.nameSpace, function () {
        			$t.val($p.val());
        			_widget._log("password revealer: password field onchange raised");
        		});
        		$t.bind("change." + _widget.nameSpace, function () {
        			$p.val($t.val());
        			_widget._log("password revealer: textbox field onchange raised");
        		});

        		$("label[for='" + $p.attr("id") + "']").bind("click." + _widget.nameSpace, function () {
        			if ($t.is(":visible") == true) { $t.focus(); }
        			_widget._log("password revealer: field label onclick raised");

        		});

        	});

        	this.refresh();
        	this.element.trigger("create", { element: this.element[0], ui: this.options });
        }

		//Destruction method
        , destroy: function () {
        	//ensure password fields are visible
        	if (_widget.options("view") != "password") _widget.setOption("view", "password");

        	//destroy textboxes and event handlers
        	this._destroyEvents();

        	var _widget = this;
        	$.each(this.target, function () {
        		var $t = $(this[0]);
        		var $p = $(this[1]);

        		$p.unbind("change." + _widget.nameSpace);
        		$t.unbind("change." + _widget.nameSpace);
        		$("label[for='" + $p.attr("id") + "']").unbind("click." + _widget.nameSpace);
        	});

        	//dispose of widget
        	delete $(this).data(this.nameSpace);
        }

        , options: function (key, value) {
        	var options = key,
                parts,
                curOption,
                i;

        	if (arguments.length === 0) {
        		// don't return a reference to the internal hash
        		return $.extend({}, this.options);
        	}

        	if (typeof key === "string") {
        		options = {};
        		parts = key.toLowerCase().split(".");
        		key = parts.shift();
        		if (parts.length) {
        			curOption = this._options[key];

        			for (i = 0; i < parts.length - 1; i++) {
        				if (curOption) {
        					curOption[parts[i]] = curOption[parts[i]] || {};
        					curOption = curOption[parts[i]];
        				}
        			}
        			key = parts.pop();

        			//If an invalid property name was specified
        			if (!curOption) {
        				if (arguments.length === 1) {
        					return null;    //no value to return
        				} else {
        					return this;    //return widget object without making any changes
        				}
        			}
        			if (arguments.length === 1) {
        				return curOption[key] === undefined ? null : curOption[key];
        			}
        			curOption[key] = value;
        		} else {
        			if (arguments.length === 1) {

        				//If curOption is undefined, check to see if key is the name of a method. 
        				if (this._options[key] === undefined) {

        					if (this.constructor.prototype.hasOwnProperty(key) == true) {
        						eval("this." + key + "()");
        						return this;
        					}
        				}


        				return this._options[key] === undefined ? null : this._options[key];
        			}
        			//Use _setOption() as this also calls _validator() method
        			this._setOption(key, value);
        		}
        		this.refresh();
        	}
        	else {
        		//options variable is a JSON object so pass the whole object to _setOptions() method.
        		this._setOptions(options);
        	}

        	return this;
        }

        , refresh: function () {
        	var _widget = this;

        	//remove suppressNative css if present
        	var _sel = "#" + this.nameSpace + "_suppressNativeCSS";
        	if (this.options("native").toString() == "false") {

        		//add css to suppress native password revealer (currently only for IE)
        		if ($(_sel).length == 0) {
        			$("head").append(this._suppressNativeCSS);
        		}
        	} else {
        		$("head").remove("#" + this.nameSpace + "_suppressNativeCSS");
        	}

        	//Update icon class on button to represent selection
        	// not needed if mode is "hold"
        	if (_widget.options("mode") == "click") {
        		_widget.element.find("." + _widget.options("iconClassSelector"))
                    .toggleClass(_widget.options("passwordViewIconClass"))
                    .toggleClass(_widget.options("textboxViewIconClass"))
        		;
        	}

        	var $icon = _widget.element.find("." + _widget.options("iconClassSelector"));

        	if ($icon.length == 0) {
        		$icon = $("<span>").addClass(_widget.options("iconClassSelector"));
        		_widget.element.prepend($icon);
        	}
        	$icon
                .toggleClass(_widget.options("passwordViewIconClass"), _widget.options("view") == "password")
                .toggleClass(_widget.options("textboxViewIconClass"), _widget.options("view") == "text")
        	;


        	$.each(this.fields, function () {
        		var $t = $(this[0]);    //get textbox object
        		var $p = $(this[1]);    //get password object

        		if (_widget.options("view") == "password") {
        			_widget._refreshView($p, $t);
        		} else {
        			_widget._refreshView($t, $p);
        		}
        	});
        	return this;
        }

        , toggle: function () {
        	if (this.options("view") == "click") {
        		this.element.click();
        	} else {
        		this._log("toggle() method not valid when 'view' option is set to a value of 'hold'");
        	}
        	return this;
        }

	};

	//Method to return widget object
	$.fn.passwordRevealer = function (option, val) {
		var results = [];
		var chain = $(this).each(function () {
			var $this = $(this),
				data = $this.data(passwordRevealer.prototype.nameSpace),
				options = typeof option === 'object' && option;
			if (typeof option === 'string') {
				if (data) {
					var result = (val == undefined) ? data.options(option) : data.options(option, val);
					if (typeof result !== 'undefined')
						results.push(result);
				}
			} else if (!data) {
				$this.data(passwordRevealer.prototype.nameSpace, new passwordRevealer(this, option));
				results.push($this.data(passwordRevealer.prototype.nameSpace));
			} else {
				results.push(data);
			}
		});
		return results.length == 1 ? results[0]
            : results.length ? results
            : chain;
	}


}(this.jQuery)

//If developer chooses not to use javascript, apply widgets to elements based on data-* attributes
$(function () {
	$("[data-reveal='true']").each(function () {
		var $x = $(this);
		$x.passwordRevealer();
	});
});
