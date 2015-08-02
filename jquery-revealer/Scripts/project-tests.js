/// <reference path="jquery-1.11.3.js" />
/// <reference path="password-revealer.1.0.0.js" />
/// <reference path="qunit-1.14.0.js" />

/*
	TESTS:

	1 - Check widget is loaded
	2 - Bind button element, targeting all password fields.
	3 - 
*/
$(function () {
	
	QUnit.done = function (details) {
		var cssClass = (details.failed == 0 ? "pass" : "fail");

		var $div = $("<div class=\"qunit-assert-list qunit-collapsed\"></div>");
		var $ol = $('#qunit-tests');
		var $li = $("<li class=\"" + cssClass + "\" style=\"list-style-type:none;\">" +
					"<div id=\"qunit-code-tested\"><strong><span class=\"test-name\">CLICK TO VIEW TEST PAGE</span></strong></div>" +
				"</li>"
			);

		$ol.append($li.append($div.append($('#qunit-fixtures'))));
		$('#qunit-code-tested').click(function () {
			$div.toggleClass("qunit-collapsed");
		});
	}
	
	//This item tests a widget bound to a button, targeting two password fields, with all default values
	QUnit.test("One button, two password fields. All options contain default values ", 31, function () {
		var _widget = $('#test1').find('[data-reveal="true"]').passwordRevealer();

		//test two password fields targeted by widget
		equal(_widget.target.length, 2, "Two password fields bound as widget target (target=':password')");

		//test debug mode option = false
		equal(_widget.options("debug"), false, "Widget NOT running in debug mode");

		//test mode = hold
		equal(_widget.options("mode"), "hold", "Default operation method is to hold target button to reveal.");

		//test current view is as password (blanked)
		equal(_widget.options("view"), "password", "Default view is to hide passwords by default");

		//class used to toggle visibility is ".hidden"
		equal(_widget.options("hiddenCssClass"), "", "Default CSS Class used for hiding elements is blank (widget will use jQuery .show() and .hide() methods to toggle visiblity");

		$.each(_widget.target, function () {
			//Current password fields are visible (match value of "view" property)
			equal($(this).is(":visible"), true, "Password field '#" + this.id + "' is target of widget");

			//Corresponding textbox exists, currently hidden as a child of <body> tag
			equal($("body").children("[name='" + this.name + "']:text").length, 1, "Corresponding textbox for '#" + this.id + "' is found as child element of <body> tag.");
		});

		//Native mode for password revealer is false (hidden)
		equal(_widget.options("native"), false, "Native password revealer (IE10+) is hidden");

		//class used to toggle visibility is ".hidden"
		equal(_widget.options("iconClassSelector"), "glyphicon", "Default CSS Class used for hiding elements is '.glyphicon'");

		//classes used on button for toggling
		equal(_widget.options("textboxViewIconClass"), "glyphicon-eye-close", "Default CSS Class used for textbox view is '.glyphicon-eye-close'");
		equal(_widget.options("passwordViewIconClass"), "glyphicon-eye-open", "Default CSS Class used for password view is '.glyphicon-eye-open'");

		//Fire mousedown event, expect textbox to be visible:
		$(_widget.element).trigger("mousedown");
		$.each(_widget.target, function () {
			//Current password fields are hidden (match value of "view" property)
			equal($(this).is(":visible"), false, "Password field '#" + this.id + "' is now hidden after mousedown");
			equal($("[name='" + this.name + "']:text").is(":visible"), true, "Textbox field for '#" + this.id + "' is now visible");
		});

		equal(_widget.options("view"), "text", "Widget view property is set to 'text' when password is revealed.");

		$(_widget.element).trigger("mouseup");
		$.each(_widget.target, function () {
			//Current password fields are hidden (match value of "view" property)
			equal($(this).is(":visible"), true, "Password field '#" + this.id + "' is now shown after mouseup");
			equal($("[name='" + this.name + "']:text").is(":visible"), false, "Textbox field for '#" + this.id + "' is hidden again");
		});

		equal(_widget.options("view"), "password", "Widget view property is set back to 'password' when password is hidden again.");

		//Keydown events
		var e = $.Event("keydown");
		e.which = 32;
		e.KeyCode = 32; //For some readon, needs to be KeyCode (uppercase 'K') to work in IE
		$(_widget.element).trigger(e);
		$.each(_widget.target, function () {
			//Current password fields are hidden (match value of "view" property)
			equal($(this).is(":visible"), false, "Password field '#" + this.id + "' is now hidden after keydown (of spacebar)");
			equal($("[name='" + this.name + "']:text").is(":visible"), true, "Textbox field for '#" + this.id + "' is now visible");
		});

		e = $.Event("keyup");
		e.which = 32;
		e.KeyCode = 32;
		$(_widget.element).trigger(e);
		$.each(_widget.target, function () {
			//Current password fields are hidden (match value of "view" property)
			equal($(this).is(":visible"), true, "Password field '#" + this.id + "' is now shown after keyup (of spacebar)");
			equal($("[name='" + this.name + "']:text").is(":visible"), false, "Textbox field for '#" + this.id + "' is hidden again");
		});
		
	});
	
	//this test targets a form with two password fields and two individual buttons.
	// - test each widget only controls the relevant item
	QUnit.test("Testing in click mode", 7, function () {
		var _widget1 = $("#ex2_btn1").passwordRevealer();
		var _widget2 = $("#ex2_btn2").passwordRevealer();

		//test two password fields targeted by widgets
		equal(_widget1.target.length, 1, "Only one password field bound as widget1 target (target='#ex2_pwd1')");
		equal(_widget2.target.length, 1, "Only one password field bound as widget2 target (target='#ex2_pwd2')");

		_widget1.element.mousedown();
		equal(_widget1.options("view"), "text", "widget 1 changed to 'text' view");
		equal(_widget2.options("view"), "password", "Widget 2 remains in 'password' view");
				
		_widget1.element.mouseup();
		_widget2.element.mousedown();
		equal(_widget1.options("view"), "password", "widget 1 switched back to 'password' view");
		equal(_widget2.options("view"), "text", "Widget 2 changed to 'text' view");

		_widget2.element.mouseup();
		equal(_widget2.options("view"), "password", "Widget 2 switched back to 'password' view");

	});


	//Test - mode = "click"
	QUnit.test("Testing Mode options = 'click'", 11, function () {
		//
		var _widget = $("#ex3_btn").passwordRevealer();

		equal(_widget.options("mode"), "click", "Check 'mode' option is set to value of 'click'.");

		//Now we should have text visible
		$(_widget.element).click();
		equal($('[name="ex3"]:text').is(":visible"), true, "Textbox is visible after click");
		equal($('[name="ex3"]:password').is(":visible"), false, "Password field is hidden after click");
		equal($('[name="ex3"]:password').is(":disabled"), true, "Password field is now disabled");

		equal($('#test3').find(":text").length, 1, "Textbox moved into the form");
		equal($('#test3').find(":password").length, 0, "Password field moved outside the form");

		$(_widget.element).click();
		equal($('[name="ex3"]:text').is(":visible"), false, "Another click, and textbox is hidden");
		equal($('[name="ex3"]:password').is(":visible"), true, "Similarly, password field is visible");

		equal($('#test3').find(":text").length,0, "Textbox back outside the form");
		equal($('#test3').find(":password").length, 1, "Password field insside the form");
		equal($('#test3').find(":password").is(":disabled"),false, "Password field no longer disabled");


	});

	//test - default view = "text"
	QUnit.test("Testing Default view as 'text'", 4, function () {
		var _widget = $('#ex4_btn').passwordRevealer();

		equal(_widget.options("view"), "text", "Textbox mode is default view");
		equal($(_widget.element).find(".glyphicon-eye-close").length, 1, "Widget button uses 'glyphicon-eye-close' class");

		equal($('[name="ex4"]:text').is(":visible"), true, "Textbox is visible");
		equal($('[name="ex4"]:password').is(":visible"), false, "Password field is hidden");

	});

	//using events and javascript creation
	QUnit.test("Testing widget created in script, with events", 3, function () {
		var _widget = $('#ex5_btn').passwordRevealer();

		equal("created", $('#messagebox').html(), "Widget oncreate event has fired");
		
		_widget.element.mousedown();
		equal("onchange event: text", $('#messagebox').html(), "Widget onchange event has fired, view = 'text'");

		_widget.element.mouseup();
		equal("onchange event: password", $('#messagebox').html(), "Widget onchange event has fired, view = 'password'");
	});

	//using different css classes, font-awesome
	QUnit.test("Using font-awesome classes instead of glyphicon", 11, function () {
		var _widget = $('#ex6_btn').passwordRevealer();
		
		equal($('[name="ex6"]:text').is(":visible"), false, "Textbox is hidden");
		equal($('[name="ex6"]:text').hasClass("hidey-hide"), true, "Alternative hidden class is used to hide textbox");

		equal($(_widget.element).children("span").hasClass("glyphicon"), false, "Glyphicon NOT used");
		equal($(_widget.element).children("span").hasClass("fa"), true, "Font-awesome \"fa\" class used instead");
		equal($(_widget.element).children("span").hasClass("fa-eye"), true, "Font-awesome \"fa-eye\" class used in password view");

		_widget.element.mousedown();
		equal($(_widget.element).children("span").hasClass("fa-eye"), false, "Font-awesome \"fa-eye\" class removed");
		equal($(_widget.element).children("span").hasClass("fa-eye-slash"), true, "Font-awesome \"fa-eye-slash\" class used in text view");
		equal($('[name="ex6"]:text').is(":visible"), true, "Textbox is visible");
		equal($('[name="ex6"]:password').hasClass("hidey-hide"), true, "Password box now hidden using .hidey-hi class");

		_widget.element.mouseup();
		equal($(_widget.element).children("span").hasClass("fa-eye"), true, "Font-awesome \"fa-eye\" class re-instated");
		equal($(_widget.element).children("span").hasClass("fa-eye-slash"), false, "Font-awesome \"fa-eye-slash\" removed");
	});

	
});