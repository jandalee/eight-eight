// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS

/**
 * @license Highcharts JS v4.1.7 (2015-06-26)
 *
 * (c) 2009-2014 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */

// JSLint options:
/*global Highcharts, HighchartsAdapter, document, window, navigator, setInterval, clearInterval, clearTimeout, setTimeout, location, jQuery, $, console, each, grep */
/*jslint ass: true, sloppy: true, forin: true, plusplus: true, nomen: true, vars: true, regexp: true, newcap: true, browser: true, continue: true, white: true */
(function () {
// encapsulated variables
var UNDEFINED,
	doc = document,
	win = window,
	math = Math,
	mathRound = math.round,
	mathFloor = math.floor,
	mathCeil = math.ceil,
	mathMax = math.max,
	mathMin = math.min,
	mathAbs = math.abs,
	mathCos = math.cos,
	mathSin = math.sin,
	mathPI = math.PI,
	deg2rad = mathPI * 2 / 360,


	// some variables
	userAgent = navigator.userAgent,
	isOpera = win.opera,
	isIE = /(msie|trident)/i.test(userAgent) && !isOpera,
	docMode8 = doc.documentMode === 8,
	isWebKit = /AppleWebKit/.test(userAgent),
	isFirefox = /Firefox/.test(userAgent),
	isTouchDevice = /(Mobile|Android|Windows Phone)/.test(userAgent),
	SVG_NS = 'http://www.w3.org/2000/svg',
	hasSVG = !!doc.createElementNS && !!doc.createElementNS(SVG_NS, 'svg').createSVGRect,
	hasBidiBug = isFirefox && parseInt(userAgent.split('Firefox/')[1], 10) < 4, // issue #38
	useCanVG = !hasSVG && !isIE && !!doc.createElement('canvas').getContext,
	Renderer,
	hasTouch,
	symbolSizes = {},
	idCounter = 0,
	garbageBin,
	defaultOptions,
	dateFormat, // function
	globalAnimation,
	pathAnim,
	timeUnits,
	noop = function () { return UNDEFINED; },
	charts = [],
	chartCount = 0,
	PRODUCT = 'Highcharts',
	VERSION = '4.1.7',

	// some constants for frequently used strings
	DIV = 'div',
	ABSOLUTE = 'absolute',
	RELATIVE = 'relative',
	HIDDEN = 'hidden',
	PREFIX = 'highcharts-',
	VISIBLE = 'visible',
	PX = 'px',
	NONE = 'none',
	M = 'M',
	L = 'L',
	numRegex = /^[0-9]+$/,
	NORMAL_STATE = '',
	HOVER_STATE = 'hover',
	SELECT_STATE = 'select',
	marginNames = ['plotTop', 'marginRight', 'marginBottom', 'plotLeft'],
	
	// Object for extending Axis
	AxisPlotLineOrBandExtension,

	// constants for attributes
	STROKE_WIDTH = 'stroke-width',

	// time methods, changed based on whether or not UTC is used
	Date,  // Allow using a different Date class
	makeTime,
	timezoneOffset,
	getTimezoneOffset,
	getMinutes,
	getHours,
	getDay,
	getDate,
	getMonth,
	getFullYear,
	setMilliseconds,
	setSeconds,
	setMinutes,
	setHours,
	setDate,
	setMonth,
	setFullYear,


	// lookup over the types and the associated classes
	seriesTypes = {},
	Highcharts;

// The Highcharts namespace
Highcharts = win.Highcharts = win.Highcharts ? error(16, true) : {};

Highcharts.seriesTypes = seriesTypes;

/**
 * Extend an object with the members of another
 * @param {Object} a The object to be extended
 * @param {Object} b The object to add to the first one
 */
var extend = Highcharts.extend = function (a, b) {
	var n;
	if (!a) {
		a = {};
	}
	for (n in b) {
		a[n] = b[n];
	}
	return a;
};
	
/**
 * Deep merge two or more objects and return a third object. If the first argument is
 * true, the contents of the second object is copied into the first object.
 * Previously this function redirected to jQuery.extend(true), but this had two limitations.
 * First, it deep merged arrays, which lead to workarounds in Highcharts. Second,
 * it copied properties from extended prototypes. 
 */
function merge() {
	var i,
		args = arguments,
		len,
		ret = {},
		doCopy = function (copy, original) {
			var value, key;

			// An object is replacing a primitive
			if (typeof copy !== 'object') {
				copy = {};
			}

			for (key in original) {
				if (original.hasOwnProperty(key)) {
					value = original[key];

					// Copy the contents of objects, but not arrays or DOM nodes
					if (value && typeof value === 'object' && Object.prototype.toString.call(value) !== '[object Array]' &&
							key !== 'renderTo' && typeof value.nodeType !== 'number') {
						copy[key] = doCopy(copy[key] || {}, value);
				
					// Primitives and arrays are copied over directly
					} else {
						copy[key] = original[key];
					}
				}
			}
			return copy;
		};

	// If first argument is true, copy into the existing object. Used in setOptions.
	if (args[0] === true) {
		ret = args[1];
		args = Array.prototype.slice.call(args, 2);
	}

	// For each argument, extend the return
	len = args.length;
	for (i = 0; i < len; i++) {
		ret = doCopy(ret, args[i]);
	}

	return ret;
}

/**
 * Shortcut for parseInt
 * @param {Object} s
 * @param {Number} mag Magnitude
 */
function pInt(s, mag) {
	return parseInt(s, mag || 10);
}

/**
 * Check for string
 * @param {Object} s
 */
function isString(s) {
	return typeof s === 'string';
}

/**
 * Check for object
 * @param {Object} obj
 */
function isObject(obj) {
	return obj && typeof obj === 'object';
}

/**
 * Check for array
 * @param {Object} obj
 */
function isArray(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
}

/**
 * Check for number
 * @param {Object} n
 */
function isNumber(n) {
	return typeof n === 'number';
}

function log2lin(num) {
	return math.log(num) / math.LN10;
}
function lin2log(num) {
	return math.pow(10, num);
}

/**
 * Remove last occurence of an item from an array
 * @param {Array} arr
 * @param {Mixed} item
 */
function erase(arr, item) {
	var i = arr.length;
	while (i--) {
		if (arr[i] === item) {
			arr.splice(i, 1);
			break;
		}
	}
	//return arr;
}

/**
 * Returns true if the object is not null or undefined. Like MooTools' $.defined.
 * @param {Object} obj
 */
function defined(obj) {
	return obj !== UNDEFINED && obj !== null;
}

/**
 * Set or get an attribute or an object of attributes. Can't use jQuery attr because
 * it attempts to set expando properties on the SVG element, which is not allowed.
 *
 * @param {Object} elem The DOM element to receive the attribute(s)
 * @param {String|Object} prop The property or an abject of key-value pairs
 * @param {String} value The value if a single property is set
 */
function attr(elem, prop, value) {
	var key,
		ret;

	// if the prop is a string
	if (isString(prop)) {
		// set the value
		if (defined(value)) {
			elem.setAttribute(prop, value);

		// get the value
		} else if (elem && elem.getAttribute) { // elem not defined when printing pie demo...
			ret = elem.getAttribute(prop);
		}

	// else if prop is defined, it is a hash of key/value pairs
	} else if (defined(prop) && isObject(prop)) {
		for (key in prop) {
			elem.setAttribute(key, prop[key]);
		}
	}
	return ret;
}
/**
 * Check if an element is an array, and if not, make it into an array. Like
 * MooTools' $.splat.
 */
function splat(obj) {
	return isArray(obj) ? obj : [obj];
}


/**
 * Return the first value that is defined. Like MooTools' $.pick.
 */
var pick = Highcharts.pick = function () {
	var args = arguments,
		i,
		arg,
		length = args.length;
	for (i = 0; i < length; i++) {
		arg = args[i];
		if (arg !== UNDEFINED && arg !== null) {
			return arg;
		}
	}
};

/**
 * Set CSS on a given element
 * @param {Object} el
 * @param {Object} styles Style object with camel case property names
 */
function css(el, styles) {
	if (isIE && !hasSVG) { // #2686
		if (styles && styles.opacity !== UNDEFINED) {
			styles.filter = 'alpha(opacity=' + (styles.opacity * 100) + ')';
		}
	}
	extend(el.style, styles);
}

/**
 * Utility function to create element with attributes and styles
 * @param {Object} tag
 * @param {Object} attribs
 * @param {Object} styles
 * @param {Object} parent
 * @param {Object} nopad
 */
function createElement(tag, attribs, styles, parent, nopad) {
	var el = doc.createElement(tag);
	if (attribs) {
		extend(el, attribs);
	}
	if (nopad) {
		css(el, {padding: 0, border: NONE, margin: 0});
	}
	if (styles) {
		css(el, styles);
	}
	if (parent) {
		parent.appendChild(el);
	}
	return el;
}

/**
 * Extend a prototyped class by new members
 * @param {Object} parent
 * @param {Object} members
 */
function extendClass(parent, members) {
	var object = function () { return UNDEFINED; };
	object.prototype = new parent();
	extend(object.prototype, members);
	return object;
}

/**
 * Pad a string to a given length by adding 0 to the beginning
 * @param {Number} number
 * @param {Number} length
 */
function pad(number, length) {
	// Create an array of the remaining length +1 and join it with 0's
	return new Array((length || 2) + 1 - String(number).length).join(0) + number;
}

/**
 * Return a length based on either the integer value, or a percentage of a base.
 */
function relativeLength (value, base) {
	return (/%$/).test(value) ? base * parseFloat(value) / 100 : parseFloat(value);
}

/**
 * Wrap a method with extended functionality, preserving the original function
 * @param {Object} obj The context object that the method belongs to 
 * @param {String} method The name of the method to extend
 * @param {Function} func A wrapper function callback. This function is called with the same arguments
 * as the original function, except that the original function is unshifted and passed as the first 
 * argument. 
 */
var wrap = Highcharts.wrap = function (obj, method, func) {
	var proceed = obj[method];
	obj[method] = function () {
		var args = Array.prototype.slice.call(arguments);
		args.unshift(proceed);
		return func.apply(this, args);
	};
};


function getTZOffset(timestamp) {
	return ((getTimezoneOffset && getTimezoneOffset(timestamp)) || timezoneOffset || 0) * 60000;
}

/**
 * Based on http://www.php.net/manual/en/function.strftime.php
 * @param {String} format
 * @param {Number} timestamp
 * @param {Boolean} capitalize
 */
dateFormat = function (format, timestamp, capitalize) {
	if (!defined(timestamp) || isNaN(timestamp)) {
		return 'Invalid date';
	}
	format = pick(format, '%Y-%m-%d %H:%M:%S');

	var date = new Date(timestamp - getTZOffset(timestamp)),
		key, // used in for constuct below
		// get the basic time values
		hours = date[getHours](),
		day = date[getDay](),
		dayOfMonth = date[getDate](),
		month = date[getMonth](),
		fullYear = date[getFullYear](),
		lang = defaultOptions.lang,
		langWeekdays = lang.weekdays,

		// List all format keys. Custom formats can be added from the outside. 
		replacements = extend({

			// Day
			'a': langWeekdays[day].substr(0, 3), // Short weekday, like 'Mon'
			'A': langWeekdays[day], // Long weekday, like 'Monday'
			'd': pad(dayOfMonth), // Two digit day of the month, 01 to 31
			'e': dayOfMonth, // Day of the month, 1 through 31
			'w': day,

			// Week (none implemented)
			//'W': weekNumber(),

			// Month
			'b': lang.shortMonths[month], // Short month, like 'Jan'
			'B': lang.months[month], // Long month, like 'January'
			'm': pad(month + 1), // Two digit month number, 01 through 12

			// Year
			'y': fullYear.toString().substr(2, 2), // Two digits year, like 09 for 2009
			'Y': fullYear, // Four digits year, like 2009

			// Time
			'H': pad(hours), // Two digits hours in 24h format, 00 through 23
			'I': pad((hours % 12) || 12), // Two digits hours in 12h format, 00 through 11
			'l': (hours % 12) || 12, // Hours in 12h format, 1 through 12
			'M': pad(date[getMinutes]()), // Two digits minutes, 00 through 59
			'p': hours < 12 ? 'AM' : 'PM', // Upper case AM or PM
			'P': hours < 12 ? 'am' : 'pm', // Lower case AM or PM
			'S': pad(date.getSeconds()), // Two digits seconds, 00 through  59
			'L': pad(mathRound(timestamp % 1000), 3) // Milliseconds (naming from Ruby)
		}, Highcharts.dateFormats);


	// do the replaces
	for (key in replacements) {
		while (format.indexOf('%' + key) !== -1) { // regex would do it in one line, but this is faster
			format = format.replace('%' + key, typeof replacements[key] === 'function' ? replacements[key](timestamp) : replacements[key]);
		}
	}

	// Optionally capitalize the string and return
	return capitalize ? format.substr(0, 1).toUpperCase() + format.substr(1) : format;
};

/** 
 * Format a single variable. Similar to sprintf, without the % prefix.
 */
function formatSingle(format, val) {
	var floatRegex = /f$/,
		decRegex = /\.([0-9])/,
		lang = defaultOptions.lang,
		decimals;

	if (floatRegex.test(format)) { // float
		decimals = format.match(decRegex);
		decimals = decimals ? decimals[1] : -1;
		if (val !== null) {
			val = Highcharts.numberFormat(
				val,
				decimals,
				lang.decimalPoint,
				format.indexOf(',') > -1 ? lang.thousandsSep : ''
			);
		}
	} else {
		val = dateFormat(format, val);
	}
	return val;
}

/**
 * Format a string according to a subset of the rules of Python's String.format method.
 */
function format(str, ctx) {
	var splitter = '{',
		isInside = false,
		segment,
		valueAndFormat,
		path,
		i,
		len,
		ret = [],
		val,
		index;
	
	while ((index = str.indexOf(splitter)) !== -1) {
		
		segment = str.slice(0, index);
		if (isInside) { // we're on the closing bracket looking back
			
			valueAndFormat = segment.split(':');
			path = valueAndFormat.shift().split('.'); // get first and leave format
			len = path.length;
			val = ctx;

			// Assign deeper paths
			for (i = 0; i < len; i++) {
				val = val[path[i]];
			}

			// Format the replacement
			if (valueAndFormat.length) {
				val = formatSingle(valueAndFormat.join(':'), val);
			}

			// Push the result and advance the cursor
			ret.push(val);
			
		} else {
			ret.push(segment);
			
		}
		str = str.slice(index + 1); // the rest
		isInside = !isInside; // toggle
		splitter = isInside ? '}' : '{'; // now look for next matching bracket
	}
	ret.push(str);
	return ret.join('');
}

/**
 * Get the magnitude of a number
 */
function getMagnitude(num) {
	return math.pow(10, mathFloor(math.log(num) / math.LN10));
}

/**
 * Take an interval and normalize it to multiples of 1, 2, 2.5 and 5
 * @param {Number} interval
 * @param {Array} multiples
 * @param {Number} magnitude
 * @param {Object} options
 */
function normalizeTickInterval(interval, multiples, magnitude, allowDecimals, preventExceed) {
	var normalized, 
		i,
		retInterval = interval;

	// round to a tenfold of 1, 2, 2.5 or 5
	magnitude = pick(magnitude, 1);
	normalized = interval / magnitude;

	// multiples for a linear scale
	if (!multiples) {
		multiples = [1, 2, 2.5, 5, 10];

		// the allowDecimals option
		if (allowDecimals === false) {
			if (magnitude === 1) {
				multiples = [1, 2, 5, 10];
			} else if (magnitude <= 0.1) {
				multiples = [1 / magnitude];
			}
		}
	}

	// normalize the interval to the nearest multiple
	for (i = 0; i < multiples.length; i++) {
		retInterval = multiples[i];
		if ((preventExceed && retInterval * magnitude >= interval) || // only allow tick amounts smaller than natural
			(!preventExceed && (normalized <= (multiples[i] + (multiples[i + 1] || multiples[i])) / 2))) {
			break;
		}
	}

	// multiply back to the correct magnitude
	retInterval *= magnitude;
	
	return retInterval;
}


/**
 * Utility method that sorts an object array and keeping the order of equal items.
 * ECMA script standard does not specify the behaviour when items are equal.
 */
function stableSort(arr, sortFunction) {
	var length = arr.length,
		sortValue,
		i;

	// Add index to each item
	for (i = 0; i < length; i++) {
		arr[i].ss_i = i; // stable sort index
	}

	arr.sort(function (a, b) {
		sortValue = sortFunction(a, b);
		return sortValue === 0 ? a.ss_i - b.ss_i : sortValue;
	});

	// Remove index from items
	for (i = 0; i < length; i++) {
		delete arr[i].ss_i; // stable sort index
	}
}

/**
 * Non-recursive method to find the lowest member of an array. Math.min raises a maximum
 * call stack size exceeded error in Chrome when trying to apply more than 150.000 points. This
 * method is slightly slower, but safe.
 */
function arrayMin(data) {
	var i = data.length,
		min = data[0];

	while (i--) {
		if (data[i] < min) {
			min = data[i];
		}
	}
	return min;
}

/**
 * Non-recursive method to find the lowest member of an array. Math.min raises a maximum
 * call stack size exceeded error in Chrome when trying to apply more than 150.000 points. This
 * method is slightly slower, but safe.
 */
function arrayMax(data) {
	var i = data.length,
		max = data[0];

	while (i--) {
		if (data[i] > max) {
			max = data[i];
		}
	}
	return max;
}

/**
 * Utility method that destroys any SVGElement or VMLElement that are properties on the given object.
 * It loops all properties and invokes destroy if there is a destroy method. The property is
 * then delete'ed.
 * @param {Object} The object to destroy properties on
 * @param {Object} Exception, do not destroy this property, only delete it.
 */
function destroyObjectProperties(obj, except) {
	var n;
	for (n in obj) {
		// If the object is non-null and destroy is defined
		if (obj[n] && obj[n] !== except && obj[n].destroy) {
			// Invoke the destroy
			obj[n].destroy();
		}

		// Delete the property from the object.
		delete obj[n];
	}
}


/**
 * Discard an element by moving it to the bin and delete
 * @param {Object} The HTML node to discard
 */
function discardElement(element) {
	// create a garbage bin element, not part of the DOM
	if (!garbageBin) {
		garbageBin = createElement(DIV);
	}

	// move the node and empty bin
	if (element) {
		garbageBin.appendChild(element);
	}
	garbageBin.innerHTML = '';
}

/**
 * Provide error messages for debugging, with links to online explanation 
 */
function error (code, stop) {
	var msg = 'Highcharts error #' + code + ': www.highcharts.com/errors/' + code;
	if (stop) {
		throw msg;
	}
	// else ...
	if (win.console) {
		console.log(msg);
	}
}

/**
 * Fix JS round off float errors
 * @param {Number} num
 */
function correctFloat(num) {
	return parseFloat(
		num.toPrecision(14)
	);
}

/**
 * Set the global animation to either a given value, or fall back to the
 * given chart's animation option
 * @param {Object} animation
 * @param {Object} chart
 */
function setAnimation(animation, chart) {
	globalAnimation = pick(animation, chart.animation);
}

/**
 * The time unit lookup
 */
timeUnits = {
	millisecond: 1,
	second: 1000,
	minute: 60000,
	hour: 3600000,
	day: 24 * 3600000,
	week: 7 * 24 * 3600000,
	month: 28 * 24 * 3600000,
	year: 364 * 24 * 3600000
};


/**
 * Format a number and return a string based on input settings
 * @param {Number} number The input number to format
 * @param {Number} decimals The amount of decimals
 * @param {String} decPoint The decimal point, defaults to the one given in the lang options
 * @param {String} thousandsSep The thousands separator, defaults to the one given in the lang options
 */
Highcharts.numberFormat = function (number, decimals, decPoint, thousandsSep) {
	var lang = defaultOptions.lang,
		// http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_number_format/
		n = +number || 0,
		c = decimals === -1 ?
			mathMin((n.toString().split('.')[1] || '').length, 20) : // Preserve decimals. Not huge numbers (#3793).
			(isNaN(decimals = mathAbs(decimals)) ? 2 : decimals),
		d = decPoint === undefined ? lang.decimalPoint : decPoint,
		t = thousandsSep === undefined ? lang.thousandsSep : thousandsSep,
		s = n < 0 ? "-" : "",
		i = String(pInt(n = mathAbs(n).toFixed(c))),
		j = i.length > 3 ? i.length % 3 : 0;

	return (s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
			(c ? d + mathAbs(n - i).toFixed(c).slice(2) : ""));
};
/**
 * Path interpolation algorithm used across adapters
 */
pathAnim = {
	/**
	 * Prepare start and end values so that the path can be animated one to one
	 */
	init: function (elem, fromD, toD) {
		fromD = fromD || '';
		var shift = elem.shift,
			bezier = fromD.indexOf('C') > -1,
			numParams = bezier ? 7 : 3,
			endLength,
			slice,
			i,
			start = fromD.split(' '),
			end = [].concat(toD), // copy
			startBaseLine,
			endBaseLine,
			sixify = function (arr) { // in splines make move points have six parameters like bezier curves
				i = arr.length;
				while (i--) {
					if (arr[i] === M) {
						arr.splice(i + 1, 0, arr[i + 1], arr[i + 2], arr[i + 1], arr[i + 2]);
					}
				}
			};

		if (bezier) {
			sixify(start);
			sixify(end);
		}

		// pull out the base lines before padding
		if (elem.isArea) {
			startBaseLine = start.splice(start.length - 6, 6);
			endBaseLine = end.splice(end.length - 6, 6);
		}

		// if shifting points, prepend a dummy point to the end path
		if (shift <= end.length / numParams && start.length === end.length) {
			while (shift--) {
				end = [].concat(end).splice(0, numParams).concat(end);
			}
		}
		elem.shift = 0; // reset for following animations

		// copy and append last point until the length matches the end length
		if (start.length) {
			endLength = end.length;
			while (start.length < endLength) {

				//bezier && sixify(start);
				slice = [].concat(start).splice(start.length - numParams, numParams);
				if (bezier) { // disable first control point
					slice[numParams - 6] = slice[numParams - 2];
					slice[numParams - 5] = slice[numParams - 1];
				}
				start = start.concat(slice);
			}
		}

		if (startBaseLine) { // append the base lines for areas
			start = start.concat(startBaseLine);
			end = end.concat(endBaseLine);
		}
		return [start, end];
	},

	/**
	 * Interpolate each value of the path and return the array
	 */
	step: function (start, end, pos, complete) {
		var ret = [],
			i = start.length,
			startVal;

		if (pos === 1) { // land on the final path without adjustment points appended in the ends
			ret = complete;

		} else if (i === end.length && pos < 1) {
			while (i--) {
				startVal = parseFloat(start[i]);
				ret[i] =
					isNaN(startVal) ? // a letter instruction like M or L
						start[i] :
						pos * (parseFloat(end[i] - startVal)) + startVal;

			}
		} else { // if animation is finished or length not matching, land on right value
			ret = end;
		}
		return ret;
	}
};

(function ($) {
	/**
	 * The default HighchartsAdapter for jQuery
	 */
	win.HighchartsAdapter = win.HighchartsAdapter || ($ && {
		
		/**
		 * Initialize the adapter by applying some extensions to jQuery
		 */
		init: function (pathAnim) {
			
			// extend the animate function to allow SVG animations
			var Fx = $.fx;
			
			/*jslint unparam: true*//* allow unused param x in this function */
			$.extend($.easing, {
				easeOutQuad: function (x, t, b, c, d) {
					return -c * (t /= d) * (t - 2) + b;
				}
			});
			/*jslint unparam: false*/
		
			// extend some methods to check for elem.attr, which means it is a Highcharts SVG object
			$.each(['cur', '_default', 'width', 'height', 'opacity'], function (i, fn) {
				var obj = Fx.step,
					base;
					
				// Handle different parent objects
				if (fn === 'cur') {
					obj = Fx.prototype; // 'cur', the getter, relates to Fx.prototype
				
				} else if (fn === '_default' && $.Tween) { // jQuery 1.8 model
					obj = $.Tween.propHooks[fn];
					fn = 'set';
				}
		
				// Overwrite the method
				base = obj[fn];
				if (base) { // step.width and step.height don't exist in jQuery < 1.7
		
					// create the extended function replacement
					obj[fn] = function (fx) {

						var elem;
						
						// Fx.prototype.cur does not use fx argument
						fx = i ? fx : this;

						// Don't run animations on textual properties like align (#1821)
						if (fx.prop === 'align') {
							return;
						}
		
						// shortcut
						elem = fx.elem;
		
						// Fx.prototype.cur returns the current value. The other ones are setters
						// and returning a value has no effect.
						return elem.attr ? // is SVG element wrapper
							elem.attr(fx.prop, fn === 'cur' ? UNDEFINED : fx.now) : // apply the SVG wrapper's method
							base.apply(this, arguments); // use jQuery's built-in method
					};
				}
			});

			// Extend the opacity getter, needed for fading opacity with IE9 and jQuery 1.10+
			wrap($.cssHooks.opacity, 'get', function (proceed, elem, computed) {
				return elem.attr ? (elem.opacity || 0) : proceed.call(this, elem, computed);
			});
			
			// Define the setter function for d (path definitions)
			this.addAnimSetter('d', function (fx) {
				var elem = fx.elem,
					ends;
		
				// Normally start and end should be set in state == 0, but sometimes,
				// for reasons unknown, this doesn't happen. Perhaps state == 0 is skipped
				// in these cases
				if (!fx.started) {
					ends = pathAnim.init(elem, elem.d, elem.toD);
					fx.start = ends[0];
					fx.end = ends[1];
					fx.started = true;
				}
		
				// Interpolate each value of the path
				elem.attr('d', pathAnim.step(fx.start, fx.end, fx.pos, elem.toD));
			});
			
			/**
			 * Utility for iterating over an array. Parameters are reversed compared to jQuery.
			 * @param {Array} arr
			 * @param {Function} fn
			 */
			this.each = Array.prototype.forEach ?
				function (arr, fn) { // modern browsers
					return Array.prototype.forEach.call(arr, fn);
					
				} : 
				function (arr, fn) { // legacy
					var i, 
						len = arr.length;
					for (i = 0; i < len; i++) {
						if (fn.call(arr[i], arr[i], i, arr) === false) {
							return i;
						}
					}
				};
			
			/**
			 * Register Highcharts as a plugin in the respective framework
			 */
			$.fn.highcharts = function () {
				var constr = 'Chart', // default constructor
					args = arguments,
					options,
					ret,
					chart;

				if (this[0]) {

					if (isString(args[0])) {
						constr = args[0];
						args = Array.prototype.slice.call(args, 1); 
					}
					options = args[0];

					// Create the chart
					if (options !== UNDEFINED) {
						/*jslint unused:false*/
						options.chart = options.chart || {};
						options.chart.renderTo = this[0];
						chart = new Highcharts[constr](options, args[1]);
						ret = this;
						/*jslint unused:true*/
					}

					// When called without parameters or with the return argument, get a predefined chart
					if (options === UNDEFINED) {
						ret = charts[attr(this[0], 'data-highcharts-chart')];
					}
				}
				
				return ret;
			};

		},

		/**
		 * Add an animation setter for a specific property
		 */
		addAnimSetter: function (prop, setter) {
			// jQuery 1.8 style
			if ($.Tween) {
				$.Tween.propHooks[prop] = {
					set: setter
				};
			// pre 1.8
			} else {
				$.fx.step[prop] = setter;
			}
		},
		
		/**
		 * Downloads a script and executes a callback when done.
		 * @param {String} scriptLocation
		 * @param {Function} callback
		 */
		getScript: $.getScript,
		
		/**
		 * Return the index of an item in an array, or -1 if not found
		 */
		inArray: $.inArray,
		
		/**
		 * A direct link to jQuery methods. MooTools and Prototype adapters must be implemented for each case of method.
		 * @param {Object} elem The HTML element
		 * @param {String} method Which method to run on the wrapped element
		 */
		adapterRun: function (elem, method) {
			return $(elem)[method]();
		},
	
		/**
		 * Filter an array
		 */
		grep: $.grep,
	
		/**
		 * Map an array
		 * @param {Array} arr
		 * @param {Function} fn
		 */
		map: function (arr, fn) {
			//return jQuery.map(arr, fn);
			var results = [],
				i = 0,
				len = arr.length;
			for (; i < len; i++) {
				results[i] = fn.call(arr[i], arr[i], i, arr);
			}
			return results;
	
		},
	
		/**
		 * Get the position of an element relative to the top left of the page
		 */
		offset: function (el) {
			return $(el).offset();
		},
	
		/**
		 * Add an event listener
		 * @param {Object} el A HTML element or custom object
		 * @param {String} event The event type
		 * @param {Function} fn The event handler
		 */
		addEvent: function (el, event, fn) {
			$(el).bind(event, fn);
		},
	
		/**
		 * Remove event added with addEvent
		 * @param {Object} el The object
		 * @param {String} eventType The event type. Leave blank to remove all events.
		 * @param {Function} handler The function to remove
		 */
		removeEvent: function (el, eventType, handler) {
			// workaround for jQuery issue with unbinding custom events:
			// http://forum.jQuery.com/topic/javascript-error-when-unbinding-a-custom-event-using-jQuery-1-4-2
			var func = doc.removeEventListener ? 'removeEventListener' : 'detachEvent';
			if (doc[func] && el && !el[func]) {
				el[func] = function () {};
			}
	
			$(el).unbind(eventType, handler);
		},
	
		/**
		 * Fire an event on a custom object
		 * @param {Object} el
		 * @param {String} type
		 * @param {Object} eventArguments
		 * @param {Function} defaultFunction
		 */
		fireEvent: function (el, type, eventArguments, defaultFunction) {
			var event = $.Event(type),
				detachedType = 'detached' + type,
				defaultPrevented;
	
			// Remove warnings in Chrome when accessing returnValue (#2790), layerX and layerY. Although Highcharts
			// never uses these properties, Chrome includes them in the default click event and
			// raises the warning when they are copied over in the extend statement below.
			//
			// To avoid problems in IE (see #1010) where we cannot delete the properties and avoid
			// testing if they are there (warning in chrome) the only option is to test if running IE.
			if (!isIE && eventArguments) {
				delete eventArguments.layerX;
				delete eventArguments.layerY;
				delete eventArguments.returnValue;
			}
	
			extend(event, eventArguments);
	
			// Prevent jQuery from triggering the object method that is named the
			// same as the event. For example, if the event is 'select', jQuery
			// attempts calling el.select and it goes into a loop.
			if (el[type]) {
				el[detachedType] = el[type];
				el[type] = null;
			}
	
			// Wrap preventDefault and stopPropagation in try/catch blocks in
			// order to prevent JS errors when cancelling events on non-DOM
			// objects. #615.
			/*jslint unparam: true*/
			$.each(['preventDefault', 'stopPropagation'], function (i, fn) {
				var base = event[fn];
				event[fn] = function () {
					try {
						base.call(event);
					} catch (e) {
						if (fn === 'preventDefault') {
							defaultPrevented = true;
						}
					}
				};
			});
			/*jslint unparam: false*/
	
			// trigger it
			$(el).trigger(event);
	
			// attach the method
			if (el[detachedType]) {
				el[type] = el[detachedType];
				el[detachedType] = null;
			}
	
			if (defaultFunction && !event.isDefaultPrevented() && !defaultPrevented) {
				defaultFunction(event);
			}
		},
		
		/**
		 * Extension method needed for MooTools
		 */
		washMouseEvent: function (e) {
			var ret = e.originalEvent || e;
			
			// computed by jQuery, needed by IE8
			if (ret.pageX === UNDEFINED) { // #1236
				ret.pageX = e.pageX;
				ret.pageY = e.pageY;
			}
			
			return ret;
		},
	
		/**
		 * Animate a HTML element or SVG element wrapper
		 * @param {Object} el
		 * @param {Object} params
		 * @param {Object} options jQuery-like animation options: duration, easing, callback
		 */
		animate: function (el, params, options) {
			var $el = $(el);
			if (!el.style) {
				el.style = {}; // #1881
			}
			if (params.d) {
				el.toD = params.d; // keep the array form for paths, used in $.fx.step.d
				params.d = 1; // because in jQuery, animating to an array has a different meaning
			}
	
			$el.stop();
			if (params.opacity !== UNDEFINED && el.attr) {
				params.opacity += 'px'; // force jQuery to use same logic as width and height (#2161)
			}
			el.hasAnim = 1; // #3342
			$el.animate(params, options);
	
		},
		/**
		 * Stop running animation
		 */
		stop: function (el) {
			if (el.hasAnim) { // #3342, memory leak on calling $(el) from destroy
				$(el).stop();
			}
		}
	});
}(win.jQuery));


// check for a custom HighchartsAdapter defined prior to this file
var globalAdapter = win.HighchartsAdapter,
	adapter = globalAdapter || {};
	
// Initialize the adapter
if (globalAdapter) {
	globalAdapter.init.call(globalAdapter, pathAnim);
}


// Utility functions. If the HighchartsAdapter is not defined, adapter is an empty object
// and all the utility functions will be null. In that case they are populated by the
// default adapters below.
var adapterRun = adapter.adapterRun,
	getScript = adapter.getScript,
	inArray = adapter.inArray,
	each = Highcharts.each = adapter.each,
	grep = adapter.grep,
	offset = adapter.offset,
	map = adapter.map,
	addEvent = adapter.addEvent,
	removeEvent = adapter.removeEvent,
	fireEvent = adapter.fireEvent,
	washMouseEvent = adapter.washMouseEvent,
	animate = adapter.animate,
	stop = adapter.stop;



/* ****************************************************************************
 * Handle the options                                                         *
 *****************************************************************************/
defaultOptions = {
	colors: ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', 
		    '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'],
	symbols: ['circle', 'diamond', 'square', 'triangle', 'triangle-down'],
	lang: {
		loading: 'Loading...',
		months: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
				'August', 'September', 'October', 'November', 'December'],
		shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		decimalPoint: '.',
		numericSymbols: ['k', 'M', 'G', 'T', 'P', 'E'], // SI prefixes used in axis labels
		resetZoom: 'Reset zoom',
		resetZoomTitle: 'Reset zoom level 1:1',
		thousandsSep: ' '
	},
	global: {
		useUTC: true,
		//timezoneOffset: 0,
		canvasToolsURL: 'http://code.highcharts.com/4.1.7/modules/canvas-tools.js',
		VMLRadialGradientURL: 'http://code.highcharts.com/4.1.7/gfx/vml-radial-gradient.png'
	},
	chart: {
		//animation: true,
		//alignTicks: false,
		//reflow: true,
		//className: null,
		//events: { load, selection },
		//margin: [null],
		//marginTop: null,
		//marginRight: null,
		//marginBottom: null,
		//marginLeft: null,
		borderColor: '#4572A7',
		//borderWidth: 0,
		borderRadius: 0,
		defaultSeriesType: 'line',
		ignoreHiddenSeries: true,
		//inverted: false,
		//shadow: false,
		spacing: [10, 10, 15, 10],
		//spacingTop: 10,
		//spacingRight: 10,
		//spacingBottom: 15,
		//spacingLeft: 10,
		//style: {
		//	fontFamily: '"Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif', // default font
		//	fontSize: '12px'
		//},
		backgroundColor: '#FFFFFF',
		//plotBackgroundColor: null,
		plotBorderColor: '#C0C0C0',
		//plotBorderWidth: 0,
		//plotShadow: false,
		//zoomType: ''
		resetZoomButton: {
			theme: {
				zIndex: 20
			},
			position: {
				align: 'right',
				x: -10,
				//verticalAlign: 'top',
				y: 10
			}
			// relativeTo: 'plot'
		}
	},
	title: {
		text: 'Chart title',
		align: 'center',
		// floating: false,
		margin: 15,
		// x: 0,
		// verticalAlign: 'top',
		// y: null,
		style: {
			color: '#333333',
			fontSize: '18px'
		}

	},
	subtitle: {
		text: '',
		align: 'center',
		// floating: false
		// x: 0,
		// verticalAlign: 'top',
		// y: null,
		style: {
			color: '#555555'
		}
	},

	plotOptions: {
		line: { // base series options
			allowPointSelect: false,
			showCheckbox: false,
			animation: {
				duration: 1000
			},
			//connectNulls: false,
			//cursor: 'default',
			//clip: true,
			//dashStyle: null,
			//enableMouseTracking: true,
			events: {},
			//legendIndex: 0,
			//linecap: 'round',
			lineWidth: 2,
			//shadow: false,
			// stacking: null,
			marker: {
				//enabled: true,
				//symbol: null,
				lineWidth: 0,
				radius: 4,
				lineColor: '#FFFFFF',
				//fillColor: null,
				states: { // states for a single point
					hover: {
						enabled: true,
						lineWidthPlus: 1,
						radiusPlus: 2
					},
					select: {
						fillColor: '#FFFFFF',
						lineColor: '#000000',
						lineWidth: 2
					}
				}
			},
			point: {
				events: {}
			},
			dataLabels: {
				align: 'center',
				// defer: true,
				// enabled: false,
				formatter: function () {
					return this.y === null ? '' : Highcharts.numberFormat(this.y, -1);
				},
				style: {
					color: 'contrast',
					fontSize: '11px',
					fontWeight: 'bold',
					textShadow: '0 0 6px contrast, 0 0 3px contrast'
				},
				verticalAlign: 'bottom', // above singular point
				x: 0,
				y: 0,
				// backgroundColor: undefined,
				// borderColor: undefined,
				// borderRadius: undefined,
				// borderWidth: undefined,
				padding: 5
				// shadow: false
			},
			cropThreshold: 300, // draw points outside the plot area when the number of points is less than this
			pointRange: 0,
			//pointStart: 0,
			//pointInterval: 1,
			//showInLegend: null, // auto: true for standalone series, false for linked series
			states: { // states for the entire series
				hover: {
					//enabled: false,
					lineWidthPlus: 1,
					marker: {
						// lineWidth: base + 1,
						// radius: base + 1
					},
					halo: {
						size: 10,
						opacity: 0.25
					}
				},
				select: {
					marker: {}
				}
			},
			stickyTracking: true,
			//tooltip: {
				//pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b>'
				//valueDecimals: null,
				//xDateFormat: '%A, %b %e, %Y',
				//valuePrefix: '',
				//ySuffix: ''				
			//}
			turboThreshold: 1000
			// zIndex: null
		}
	},
	labels: {
		//items: [],
		style: {
			//font: defaultFont,
			position: ABSOLUTE,
			color: '#3E576F'
		}
	},
	legend: {
		enabled: true,
		align: 'center',
		//floating: false,
		layout: 'horizontal',
		labelFormatter: function () {
			return this.name;
		},
		//borderWidth: 0,
		borderColor: '#909090',
		borderRadius: 0,
		navigation: {
			// animation: true,
			activeColor: '#274b6d',
			// arrowSize: 12
			inactiveColor: '#CCC'
			// style: {} // text styles
		},
		// margin: 20,
		// reversed: false,
		shadow: false,
		// backgroundColor: null,
		/*style: {
			padding: '5px'
		},*/
		itemStyle: {			
			color: '#333333',
			fontSize: '12px',
			fontWeight: 'bold'
		},
		itemHoverStyle: {
			//cursor: 'pointer', removed as of #601
			color: '#000'
		},
		itemHiddenStyle: {
			color: '#CCC'
		},
		itemCheckboxStyle: {
			position: ABSOLUTE,
			width: '13px', // for IE precision
			height: '13px'
		},
		// itemWidth: undefined,
		// symbolRadius: 0,
		// symbolWidth: 16,
		symbolPadding: 5,
		verticalAlign: 'bottom',
		// width: undefined,
		x: 0,
		y: 0,
		title: {
			//text: null,
			style: {
				fontWeight: 'bold'
			}
		}			
	},

	loading: {
		// hideDuration: 100,
		labelStyle: {
			fontWeight: 'bold',
			position: RELATIVE,
			top: '45%'
		},
		// showDuration: 0,
		style: {
			position: ABSOLUTE,
			backgroundColor: 'white',
			opacity: 0.5,
			textAlign: 'center'
		}
	},

	tooltip: {
		enabled: true,
		animation: hasSVG,
		//crosshairs: null,
		backgroundColor: 'rgba(249, 249, 249, .85)',
		borderWidth: 1,
		borderRadius: 3,
		dateTimeLabelFormats: { 
			millisecond: '%A, %b %e, %H:%M:%S.%L',
			second: '%A, %b %e, %H:%M:%S',
			minute: '%A, %b %e, %H:%M',
			hour: '%A, %b %e, %H:%M',
			day: '%A, %b %e, %Y',
			week: 'Week from %A, %b %e, %Y',
			month: '%B %Y',
			year: '%Y'
		},
		footerFormat: '',
		//formatter: defaultFormatter,
		headerFormat: '<span style="font-size: 10px">{point.key}</span><br/>',
		pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>',
		shadow: true,
		//shape: 'callout',
		//shared: false,
		snap: isTouchDevice ? 25 : 10,
		style: {
			color: '#333333',
			cursor: 'default',
			fontSize: '12px',
			padding: '8px',
			whiteSpace: 'nowrap'
		}
		//xDateFormat: '%A, %b %e, %Y',
		//valueDecimals: null,
		//valuePrefix: '',
		//valueSuffix: ''
	},

	credits: {
		enabled: true,
		text: 'Highcharts.com',
		href: 'http://www.highcharts.com',
		position: {
			align: 'right',
			x: -10,
			verticalAlign: 'bottom',
			y: -5
		},
		style: {
			cursor: 'pointer',
			color: '#909090',
			fontSize: '9px'
		}
	}
};




// Series defaults
var defaultPlotOptions = defaultOptions.plotOptions,
	defaultSeriesOptions = defaultPlotOptions.line;

// set the default time methods
setTimeMethods();



/**
 * Set the time methods globally based on the useUTC option. Time method can be either
 * local time or UTC (default).
 */
function setTimeMethods() {
	var globalOptions = defaultOptions.global,
		useUTC = globalOptions.useUTC,
		GET = useUTC ? 'getUTC' : 'get',
		SET = useUTC ? 'setUTC' : 'set';


	Date = globalOptions.Date || window.Date;
	timezoneOffset = useUTC && globalOptions.timezoneOffset;
	getTimezoneOffset = useUTC && globalOptions.getTimezoneOffset;
	makeTime = function (year, month, date, hours, minutes, seconds) {
		var d;
		if (useUTC) {
			d = Date.UTC.apply(0, arguments);
			d += getTZOffset(d);
		} else {
			d = new Date(
				year,
				month,
				pick(date, 1),
				pick(hours, 0),
				pick(minutes, 0),
				pick(seconds, 0)
			).getTime();
		}
		return d;
	};
	getMinutes =      GET + 'Minutes';
	getHours =        GET + 'Hours';
	getDay =          GET + 'Day';
	getDate =         GET + 'Date';
	getMonth =        GET + 'Month';
	getFullYear =     GET + 'FullYear';
	setMilliseconds = SET + 'Milliseconds';
	setSeconds =      SET + 'Seconds';
	setMinutes =      SET + 'Minutes';
	setHours =        SET + 'Hours';
	setDate =         SET + 'Date';
	setMonth =        SET + 'Month';
	setFullYear =     SET + 'FullYear';

}

/**
 * Merge the default options with custom options and return the new options structure
 * @param {Object} options The new custom options
 */
function setOptions(options) {
	
	// Copy in the default options
	defaultOptions = merge(true, defaultOptions, options);
	
	// Apply UTC
	setTimeMethods();

	return defaultOptions;
}

/**
 * Get the updated default options. Until 3.0.7, merely exposing defaultOptions for outside modules
 * wasn't enough because the setOptions method created a new object.
 */
function getOptions() {
	return defaultOptions;
}


/**
 * Handle color operations. The object methods are chainable.
 * @param {String} input The input color in either rbga or hex format
 */
var rgbaRegEx = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]?(?:\.[0-9]+)?)\s*\)/,
	hexRegEx = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
	rgbRegEx = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/;

var Color = function (input) {
	// declare variables
	var rgba = [], result, stops;

	/**
	 * Parse the input color to rgba array
	 * @param {String} input
	 */
	function init(input) {

		// Gradients
		if (input && input.stops) {
			stops = map(input.stops, function (stop) {
				return Color(stop[1]);
			});

		// Solid colors
		} else {
			// rgba
			result = rgbaRegEx.exec(input);
			if (result) {
				rgba = [pInt(result[1]), pInt(result[2]), pInt(result[3]), parseFloat(result[4], 10)];
			} else { 
				// hex
				result = hexRegEx.exec(input);
				if (result) {
					rgba = [pInt(result[1], 16), pInt(result[2], 16), pInt(result[3], 16), 1];
				} else {
					// rgb
					result = rgbRegEx.exec(input);
					if (result) {
						rgba = [pInt(result[1]), pInt(result[2]), pInt(result[3]), 1];
					}
				}
			}
		}		

	}
	/**
	 * Return the color a specified format
	 * @param {String} format
	 */
	function get(format) {
		var ret;

		if (stops) {
			ret = merge(input);
			ret.stops = [].concat(ret.stops);
			each(stops, function (stop, i) {
				ret.stops[i] = [ret.stops[i][0], stop.get(format)];
			});

		// it's NaN if gradient colors on a column chart
		} else if (rgba && !isNaN(rgba[0])) {
			if (format === 'rgb') {
				ret = 'rgb(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ')';
			} else if (format === 'a') {
				ret = rgba[3];
			} else {
				ret = 'rgba(' + rgba.join(',') + ')';
			}
		} else {
			ret = input;
		}
		return ret;
	}

	/**
	 * Brighten the color
	 * @param {Number} alpha
	 */
	function brighten(alpha) {
		if (stops) {
			each(stops, function (stop) {
				stop.brighten(alpha);
			});
		
		} else if (isNumber(alpha) && alpha !== 0) {
			var i;
			for (i = 0; i < 3; i++) {
				rgba[i] += pInt(alpha * 255);

				if (rgba[i] < 0) {
					rgba[i] = 0;
				}
				if (rgba[i] > 255) {
					rgba[i] = 255;
				}
			}
		}
		return this;
	}
	/**
	 * Set the color's opacity to a given alpha value
	 * @param {Number} alpha
	 */
	function setOpacity(alpha) {
		rgba[3] = alpha;
		return this;
	}

	// initialize: parse the input
	init(input);

	// public methods
	return {
		get: get,
		brighten: brighten,
		rgba: rgba,
		setOpacity: setOpacity,
		raw: input
	};
};


/**
 * A wrapper object for SVG elements
 */
function SVGElement() {}

SVGElement.prototype = {
	
	// Default base for animation
	opacity: 1,
	// For labels, these CSS properties are applied to the <text> node directly
	textProps: ['fontSize', 'fontWeight', 'fontFamily', 'fontStyle', 'color', 
		'lineHeight', 'width', 'textDecoration', 'textShadow'],
	
	/**
	 * Initialize the SVG renderer
	 * @param {Object} renderer
	 * @param {String} nodeName
	 */
	init: function (renderer, nodeName) {
		var wrapper = this;
		wrapper.element = nodeName === 'span' ?
			createElement(nodeName) :
			doc.createElementNS(SVG_NS, nodeName);
		wrapper.renderer = renderer;
	},
	
	/**
	 * Animate a given attribute
	 * @param {Object} params
	 * @param {Number} options The same options as in jQuery animation
	 * @param {Function} complete Function to perform at the end of animation
	 */
	animate: function (params, options, complete) {
		var animOptions = pick(options, globalAnimation, true);
		stop(this); // stop regardless of animation actually running, or reverting to .attr (#607)
		if (animOptions) {
			animOptions = merge(animOptions, {}); //#2625
			if (complete) { // allows using a callback with the global animation without overwriting it
				animOptions.complete = complete;
			}
			animate(this, params, animOptions);
		} else {
			this.attr(params);
			if (complete) {
				complete();
			}
		}
		return this;
	},

	/**
	 * Build an SVG gradient out of a common JavaScript configuration object
	 */
	colorGradient: function (color, prop, elem) {
		var renderer = this.renderer,
			colorObject,
			gradName,
			gradAttr,
			gradients,
			gradientObject,
			stops,
			stopColor,
			stopOpacity,
			radialReference,
			n,
			id,
			key = [];

		// Apply linear or radial gradients
		if (color.linearGradient) {
			gradName = 'linearGradient';
		} else if (color.radialGradient) {
			gradName = 'radialGradient';
		}

		if (gradName) {
			gradAttr = color[gradName];
			gradients = renderer.gradients;
			stops = color.stops;
			radialReference = elem.radialReference;

			// Keep < 2.2 kompatibility
			if (isArray(gradAttr)) {
				color[gradName] = gradAttr = {
					x1: gradAttr[0],
					y1: gradAttr[1],
					x2: gradAttr[2],
					y2: gradAttr[3],
					gradientUnits: 'userSpaceOnUse'
				};
			}

			// Correct the radial gradient for the radial reference system
			if (gradName === 'radialGradient' && radialReference && !defined(gradAttr.gradientUnits)) {
				gradAttr = merge(gradAttr, {
					cx: (radialReference[0] - radialReference[2] / 2) + gradAttr.cx * radialReference[2],
					cy: (radialReference[1] - radialReference[2] / 2) + gradAttr.cy * radialReference[2],
					r: gradAttr.r * radialReference[2],
					gradientUnits: 'userSpaceOnUse'
				});
			}

			// Build the unique key to detect whether we need to create a new element (#1282)
			for (n in gradAttr) {
				if (n !== 'id') {
					key.push(n, gradAttr[n]);
				}
			}
			for (n in stops) {
				key.push(stops[n]);
			}
			key = key.join(',');

			// Check if a gradient object with the same config object is created within this renderer
			if (gradients[key]) {
				id = gradients[key].attr('id');

			} else {

				// Set the id and create the element
				gradAttr.id = id = PREFIX + idCounter++;
				gradients[key] = gradientObject = renderer.createElement(gradName)
					.attr(gradAttr)
					.add(renderer.defs);


				// The gradient needs to keep a list of stops to be able to destroy them
				gradientObject.stops = [];
				each(stops, function (stop) {
					var stopObject;
					if (stop[1].indexOf('rgba') === 0) {
						colorObject = Color(stop[1]);
						stopColor = colorObject.get('rgb');
						stopOpacity = colorObject.get('a');
					} else {
						stopColor = stop[1];
						stopOpacity = 1;
					}
					stopObject = renderer.createElement('stop').attr({
						offset: stop[0],
						'stop-color': stopColor,
						'stop-opacity': stopOpacity
					}).add(gradientObject);

					// Add the stop element to the gradient
					gradientObject.stops.push(stopObject);
				});
			}

			// Set the reference to the gradient object
			elem.setAttribute(prop, 'url(' + renderer.url + '#' + id + ')');
		} 
	},

	/**
	 * Apply a polyfill to the text-stroke CSS property, by copying the text element
	 * and apply strokes to the copy.
	 *
	 * docs: update default, document the polyfill and the limitations on hex colors and pixel values, document contrast pseudo-color
	 * TODO: 
	 * - update defaults
	 */
	applyTextShadow: function (textShadow) {
		var elem = this.element,
			tspans,
			hasContrast = textShadow.indexOf('contrast') !== -1,
			styles = {},
			// IE10 and IE11 report textShadow in elem.style even though it doesn't work. Check
			// this again with new IE release. In exports, the rendering is passed to PhantomJS. 
			supports = this.renderer.forExport || (elem.style.textShadow !== UNDEFINED && !isIE);

		// When the text shadow is set to contrast, use dark stroke for light text and vice versa
		if (hasContrast) {
			styles.textShadow = textShadow = textShadow.replace(/contrast/g, this.renderer.getContrast(elem.style.fill));
		}

		// Safari with retina displays as well as PhantomJS bug (#3974). Firefox does not tolerate this,
		// it removes the text shadows.
		if (isWebKit) {
			styles.textRendering = 'geometricPrecision';
		}

		/* Selective side-by-side testing in supported browser (http://jsfiddle.net/highcharts/73L1ptrh/)
		if (elem.textContent.indexOf('2.') === 0) {
			elem.style['text-shadow'] = 'none';
			supports = false;
		}
		// */

		// No reason to polyfill, we've got native support
		if (supports) {
			css(elem, styles); // Apply altered textShadow or textRendering workaround
		} else {

			this.fakeTS = true; // Fake text shadow

			// In order to get the right y position of the clones, 
			// copy over the y setter
			this.ySetter = this.xSetter;

			tspans = [].slice.call(elem.getElementsByTagName('tspan'));
			each(textShadow.split(/\s?,\s?/g), function (textShadow) {
				var firstChild = elem.firstChild,
					color,
					strokeWidth;
				
				textShadow = textShadow.split(' ');
				color = textShadow[textShadow.length - 1];

				// Approximately tune the settings to the text-shadow behaviour
				strokeWidth = textShadow[textShadow.length - 2];

				if (strokeWidth) {
					each(tspans, function (tspan, y) {
						var clone;

						// Let the first line start at the correct X position
						if (y === 0) {
							tspan.setAttribute('x', elem.getAttribute('x'));
							y = elem.getAttribute('y');
							tspan.setAttribute('y', y || 0);
							if (y === null) {
								elem.setAttribute('y', 0);
							}
						}

						// Create the clone and apply shadow properties
						clone = tspan.cloneNode(1);
						attr(clone, {
							'class': PREFIX + 'text-shadow',
							'fill': color,
							'stroke': color,
							'stroke-opacity': 1 / mathMax(pInt(strokeWidth), 3),
							'stroke-width': strokeWidth,
							'stroke-linejoin': 'round'
						});
						elem.insertBefore(clone, firstChild);
					});
				}
			});
		}
	},

	/**
	 * Set or get a given attribute
	 * @param {Object|String} hash
	 * @param {Mixed|Undefined} val
	 */
	attr: function (hash, val) {
		var key,
			value,
			element = this.element,
			hasSetSymbolSize,
			ret = this,
			skipAttr;

		// single key-value pair
		if (typeof hash === 'string' && val !== UNDEFINED) {
			key = hash;
			hash = {};
			hash[key] = val;
		}

		// used as a getter: first argument is a string, second is undefined
		if (typeof hash === 'string') {
			ret = (this[hash + 'Getter'] || this._defaultGetter).call(this, hash, element);
		
		// setter
		} else {

			for (key in hash) {
				value = hash[key];
				skipAttr = false;



				if (this.symbolName && /^(x|y|width|height|r|start|end|innerR|anchorX|anchorY)/.test(key)) {
					if (!hasSetSymbolSize) {
						this.symbolAttr(hash);
						hasSetSymbolSize = true;
					}
					skipAttr = true;
				}

				if (this.rotation && (key === 'x' || key === 'y')) {
					this.doTransform = true;
				}
				
				if (!skipAttr) {
					(this[key + 'Setter'] || this._defaultSetter).call(this, value, key, element);
				}

				// Let the shadow follow the main element
				if (this.shadows && /^(width|height|visibility|x|y|d|transform|cx|cy|r)$/.test(key)) {
					this.updateShadows(key, value);
				}
			}

			// Update transform. Do this outside the loop to prevent redundant updating for batch setting
			// of attributes.
			if (this.doTransform) {
				this.updateTransform();
				this.doTransform = false;
			}

		}

		return ret;
	},

	updateShadows: function (key, value) {
		var shadows = this.shadows,
			i = shadows.length;
		while (i--) {
			shadows[i].setAttribute(
				key,
				key === 'height' ?
					mathMax(value - (shadows[i].cutHeight || 0), 0) :
					key === 'd' ? this.d : value
			);
		}
	},

	/**
	 * Add a class name to an element
	 */
	addClass: function (className) {
		var element = this.element,
			currentClassName = attr(element, 'class') || '';

		if (currentClassName.indexOf(className) === -1) {
			attr(element, 'class', currentClassName + ' ' + className);
		}
		return this;
	},
	/* hasClass and removeClass are not (yet) needed
	hasClass: function (className) {
		return attr(this.element, 'class').indexOf(className) !== -1;
	},
	removeClass: function (className) {
		attr(this.element, 'class', attr(this.element, 'class').replace(className, ''));
		return this;
	},
	*/

	/**
	 * If one of the symbol size affecting parameters are changed,
	 * check all the others only once for each call to an element's
	 * .attr() method
	 * @param {Object} hash
	 */
	symbolAttr: function (hash) {
		var wrapper = this;

		each(['x', 'y', 'r', 'start', 'end', 'width', 'height', 'innerR', 'anchorX', 'anchorY'], function (key) {
			wrapper[key] = pick(hash[key], wrapper[key]);
		});

		wrapper.attr({
			d: wrapper.renderer.symbols[wrapper.symbolName](
				wrapper.x,
				wrapper.y,
				wrapper.width,
				wrapper.height,
				wrapper
			)
		});
	},

	/**
	 * Apply a clipping path to this object
	 * @param {String} id
	 */
	clip: function (clipRect) {
		return this.attr('clip-path', clipRect ? 'url(' + this.renderer.url + '#' + clipRect.id + ')' : NONE);
	},

	/**
	 * Calculate the coordinates needed for drawing a rectangle crisply and return the
	 * calculated attributes
	 * @param {Number} strokeWidth
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 */
	crisp: function (rect) {

		var wrapper = this,
			key,
			attribs = {},
			normalizer,
			strokeWidth = rect.strokeWidth || wrapper.strokeWidth || 0;

		normalizer = mathRound(strokeWidth) % 2 / 2; // mathRound because strokeWidth can sometimes have roundoff errors

		// normalize for crisp edges
		rect.x = mathFloor(rect.x || wrapper.x || 0) + normalizer;
		rect.y = mathFloor(rect.y || wrapper.y || 0) + normalizer;
		rect.width = mathFloor((rect.width || wrapper.width || 0) - 2 * normalizer);
		rect.height = mathFloor((rect.height || wrapper.height || 0) - 2 * normalizer);
		rect.strokeWidth = strokeWidth;

		for (key in rect) {
			if (wrapper[key] !== rect[key]) { // only set attribute if changed
				wrapper[key] = attribs[key] = rect[key];
			}
		}

		return attribs;
	},

	/**
	 * Set styles for the element
	 * @param {Object} styles
	 */
	css: function (styles) {
		var elemWrapper = this,
			oldStyles = elemWrapper.styles,
			newStyles = {},
			elem = elemWrapper.element,
			textWidth,
			n,
			serializedCss = '',
			hyphenate,
			hasNew = !oldStyles;

		// convert legacy
		if (styles && styles.color) {
			styles.fill = styles.color;
		}

		// Filter out existing styles to increase performance (#2640)
		if (oldStyles) {
			for (n in styles) {
				if (styles[n] !== oldStyles[n]) {
					newStyles[n] = styles[n];
					hasNew = true;
				}
			}
		}
		if (hasNew) {
			textWidth = elemWrapper.textWidth = 
				(styles && styles.width && elem.nodeName.toLowerCase() === 'text' && pInt(styles.width)) || 
				elemWrapper.textWidth; // #3501

			// Merge the new styles with the old ones
			if (oldStyles) {
				styles = extend(
					oldStyles,
					newStyles
				);
			}		

			// store object
			elemWrapper.styles = styles;

			if (textWidth && (useCanVG || (!hasSVG && elemWrapper.renderer.forExport))) {
				delete styles.width;
			}

			// serialize and set style attribute
			if (isIE && !hasSVG) {
				css(elemWrapper.element, styles);
			} else {
				/*jslint unparam: true*/
				hyphenate = function (a, b) { return '-' + b.toLowerCase(); };
				/*jslint unparam: false*/
				for (n in styles) {
					serializedCss += n.replace(/([A-Z])/g, hyphenate) + ':' + styles[n] + ';';
				}
				attr(elem, 'style', serializedCss); // #1881
			}


			// re-build text
			if (textWidth && elemWrapper.added) {
				elemWrapper.renderer.buildText(elemWrapper);
			}
		}

		return elemWrapper;
	},

	/**
	 * Add an event listener
	 * @param {String} eventType
	 * @param {Function} handler
	 */
	on: function (eventType, handler) {
		var svgElement = this,
			element = svgElement.element;
		
		// touch
		if (hasTouch && eventType === 'click') {
			element.ontouchstart = function (e) {			
				svgElement.touchEventFired = Date.now();				
				e.preventDefault();
				handler.call(element, e);
			};
			element.onclick = function (e) {												
				if (userAgent.indexOf('Android') === -1 || Date.now() - (svgElement.touchEventFired || 0) > 1100) { // #2269
					handler.call(element, e);
				}
			};			
		} else {
			// simplest possible event model for internal use
			element['on' + eventType] = handler;
		}
		return this;
	},

	/**
	 * Set the coordinates needed to draw a consistent radial gradient across
	 * pie slices regardless of positioning inside the chart. The format is
	 * [centerX, centerY, diameter] in pixels.
	 */
	setRadialReference: function (coordinates) {
		this.element.radialReference = coordinates;
		return this;
	},

	/**
	 * Move an object and its children by x and y values
	 * @param {Number} x
	 * @param {Number} y
	 */
	translate: function (x, y) {
		return this.attr({
			translateX: x,
			translateY: y
		});
	},

	/**
	 * Invert a group, rotate and flip
	 */
	invert: function () {
		var wrapper = this;
		wrapper.inverted = true;
		wrapper.updateTransform();
		return wrapper;
	},

	/**
	 * Private method to update the transform attribute based on internal
	 * properties
	 */
	updateTransform: function () {
		var wrapper = this,
			translateX = wrapper.translateX || 0,
			translateY = wrapper.translateY || 0,
			scaleX = wrapper.scaleX,
			scaleY = wrapper.scaleY,
			inverted = wrapper.inverted,
			rotation = wrapper.rotation,
			element = wrapper.element,
			transform;

		// flipping affects translate as adjustment for flipping around the group's axis
		if (inverted) {
			translateX += wrapper.attr('width');
			translateY += wrapper.attr('height');
		}

		// Apply translate. Nearly all transformed elements have translation, so instead
		// of checking for translate = 0, do it always (#1767, #1846).
		transform = ['translate(' + translateX + ',' + translateY + ')'];

		// apply rotation
		if (inverted) {
			transform.push('rotate(90) scale(-1,1)');
		} else if (rotation) { // text rotation
			transform.push('rotate(' + rotation + ' ' + (element.getAttribute('x') || 0) + ' ' + (element.getAttribute('y') || 0) + ')');
			
			// Delete bBox memo when the rotation changes
			//delete wrapper.bBox;
		}

		// apply scale
		if (defined(scaleX) || defined(scaleY)) {
			transform.push('scale(' + pick(scaleX, 1) + ' ' + pick(scaleY, 1) + ')');
		}

		if (transform.length) {
			element.setAttribute('transform', transform.join(' '));
		}
	},
	/**
	 * Bring the element to the front
	 */
	toFront: function () {
		var element = this.element;
		element.parentNode.appendChild(element);
		return this;
	},


	/**
	 * Break down alignment options like align, verticalAlign, x and y
	 * to x and y relative to the chart.
	 *
	 * @param {Object} alignOptions
	 * @param {Boolean} alignByTranslate
	 * @param {String[Object} box The box to align to, needs a width and height. When the
	 *		box is a string, it refers to an object in the Renderer. For example, when
	 *		box is 'spacingBox', it refers to Renderer.spacingBox which holds width, height
	 *		x and y properties.
	 *
	 */
	align: function (alignOptions, alignByTranslate, box) {
		var align,
			vAlign,
			x,
			y,
			attribs = {},
			alignTo,
			renderer = this.renderer,
			alignedObjects = renderer.alignedObjects;

		// First call on instanciate
		if (alignOptions) {
			this.alignOptions = alignOptions;
			this.alignByTranslate = alignByTranslate;
			if (!box || isString(box)) { // boxes other than renderer handle this internally
				this.alignTo = alignTo = box || 'renderer';
				erase(alignedObjects, this); // prevent duplicates, like legendGroup after resize
				alignedObjects.push(this);
				box = null; // reassign it below
			}

		// When called on resize, no arguments are supplied
		} else {
			alignOptions = this.alignOptions;
			alignByTranslate = this.alignByTranslate;
			alignTo = this.alignTo;
		}

		box = pick(box, renderer[alignTo], renderer);

		// Assign variables
		align = alignOptions.align;
		vAlign = alignOptions.verticalAlign;
		x = (box.x || 0) + (alignOptions.x || 0); // default: left align
		y = (box.y || 0) + (alignOptions.y || 0); // default: top align

		// Align
		if (align === 'right' || align === 'center') {
			x += (box.width - (alignOptions.width || 0)) /
					{ right: 1, center: 2 }[align];
		}
		attribs[alignByTranslate ? 'translateX' : 'x'] = mathRound(x);


		// Vertical align
		if (vAlign === 'bottom' || vAlign === 'middle') {
			y += (box.height - (alignOptions.height || 0)) /
					({ bottom: 1, middle: 2 }[vAlign] || 1);

		}
		attribs[alignByTranslate ? 'translateY' : 'y'] = mathRound(y);

		// Animate only if already placed
		this[this.placed ? 'animate' : 'attr'](attribs);
		this.placed = true;
		this.alignAttr = attribs;

		return this;
	},

	/**
	 * Get the bounding box (width, height, x and y) for the element
	 */
	getBBox: function (reload) {
		var wrapper = this,
			bBox,// = wrapper.bBox,
			renderer = wrapper.renderer,
			width,
			height,
			rotation = wrapper.rotation,
			element = wrapper.element,
			styles = wrapper.styles,
			rad = rotation * deg2rad,
			textStr = wrapper.textStr,
			textShadow,
			elemStyle = element.style,
			toggleTextShadowShim,
			cacheKey;

		if (textStr !== UNDEFINED) {

			// Properties that affect bounding box
			cacheKey = ['', rotation || 0, styles && styles.fontSize, element.style.width].join(',');

			// Since numbers are monospaced, and numerical labels appear a lot in a chart,
			// we assume that a label of n characters has the same bounding box as others 
			// of the same length.
			if (textStr === '' || numRegex.test(textStr)) {
				cacheKey = 'num:' + textStr.toString().length + cacheKey;

			// Caching all strings reduces rendering time by 4-5%.
			} else {
				cacheKey = textStr + cacheKey;
			}
		}

		if (cacheKey && !reload) {
			bBox = renderer.cache[cacheKey];
		}

		// No cache found
		if (!bBox) {

			// SVG elements
			if (element.namespaceURI === SVG_NS || renderer.forExport) {
				try { // Fails in Firefox if the container has display: none.

					// When the text shadow shim is used, we need to hide the fake shadows
					// to get the correct bounding box (#3872)
					toggleTextShadowShim = this.fakeTS && function (display) {
						each(element.querySelectorAll('.' + PREFIX + 'text-shadow'), function (tspan) {
							tspan.style.display = display;
						});
					};

					// Workaround for #3842, Firefox reporting wrong bounding box for shadows
					if (isFirefox && elemStyle.textShadow) {
						textShadow = elemStyle.textShadow;
						elemStyle.textShadow = '';
					} else if (toggleTextShadowShim) {
						toggleTextShadowShim(NONE);
					}

					bBox = element.getBBox ?
						// SVG: use extend because IE9 is not allowed to change width and height in case
						// of rotation (below)
						extend({}, element.getBBox()) :
						// Canvas renderer and legacy IE in export mode
						{
							width: element.offsetWidth,
							height: element.offsetHeight
						};

					// #3842
					if (textShadow) {
						elemStyle.textShadow = textShadow;
					} else if (toggleTextShadowShim) {
						toggleTextShadowShim('');
					}
				} catch (e) {}

				// If the bBox is not set, the try-catch block above failed. The other condition
				// is for Opera that returns a width of -Infinity on hidden elements.
				if (!bBox || bBox.width < 0) {
					bBox = { width: 0, height: 0 };
				}


			// VML Renderer or useHTML within SVG
			} else {

				bBox = wrapper.htmlGetBBox();

			}

			// True SVG elements as well as HTML elements in modern browsers using the .useHTML option
			// need to compensated for rotation
			if (renderer.isSVG) {
				width = bBox.width;
				height = bBox.height;

				// Workaround for wrong bounding box in IE9 and IE10 (#1101, #1505, #1669, #2568)
				if (isIE && styles && styles.fontSize === '11px' && height.toPrecision(3) === '16.9') {
					bBox.height = height = 14;
				}

				// Adjust for rotated text
				if (rotation) {
					bBox.width = mathAbs(height * mathSin(rad)) + mathAbs(width * mathCos(rad));
					bBox.height = mathAbs(height * mathCos(rad)) + mathAbs(width * mathSin(rad));
				}
			}

			// Cache it
			renderer.cache[cacheKey] = bBox;
		}
		return bBox;
	},

	/**
	 * Show the element
	 */
	show: function (inherit) {
		// IE9-11 doesn't handle visibilty:inherit well, so we remove the attribute instead (#2881)
		if (inherit && this.element.namespaceURI === SVG_NS) {
			this.element.removeAttribute('visibility');
		} else {
			this.attr({ visibility: inherit ? 'inherit' : VISIBLE });
		}
		return this;
	},

	/**
	 * Hide the element
	 */
	hide: function () {
		return this.attr({ visibility: HIDDEN });
	},

	fadeOut: function (duration) {
		var elemWrapper = this;
		elemWrapper.animate({
			opacity: 0
		}, {
			duration: duration || 150,
			complete: function () {
				elemWrapper.attr({ y: -9999 }); // #3088, assuming we're only using this for tooltips
			}
		});
	},

	/**
	 * Add the element
	 * @param {Object|Undefined} parent Can be an element, an element wrapper or undefined
	 *	to append the element to the renderer.box.
	 */
	add: function (parent) {

		var renderer = this.renderer,
			element = this.element,
			inserted;

		if (parent) {
			this.parentGroup = parent;
		}

		// mark as inverted
		this.parentInverted = parent && parent.inverted;

		// build formatted text
		if (this.textStr !== undefined) {
			renderer.buildText(this);
		}

		// Mark as added
		this.added = true;

		// If we're adding to renderer root, or other elements in the group 
		// have a z index, we need to handle it
		if (!parent || parent.handleZ || this.zIndex) {
			inserted = this.zIndexSetter();
		}

		// If zIndex is not handled, append at the end
		if (!inserted) {
			(parent ? parent.element : renderer.box).appendChild(element);
		}

		// fire an event for internal hooks
		if (this.onAdd) {
			this.onAdd();
		}

		return this;
	},

	/**
	 * Removes a child either by removeChild or move to garbageBin.
	 * Issue 490; in VML removeChild results in Orphaned nodes according to sIEve, discardElement does not.
	 */
	safeRemoveChild: function (element) {
		var parentNode = element.parentNode;
		if (parentNode) {
			parentNode.removeChild(element);
		}
	},

	/**
	 * Destroy the element and element wrapper
	 */
	destroy: function () {
		var wrapper = this,
			element = wrapper.element || {},
			shadows = wrapper.shadows,
			parentToClean = wrapper.renderer.isSVG && element.nodeName === 'SPAN' && wrapper.parentGroup,
			grandParent,
			key,
			i;

		// remove events
		element.onclick = element.onmouseout = element.onmouseover = element.onmousemove = element.point = null;
		stop(wrapper); // stop running animations

		if (wrapper.clipPath) {
			wrapper.clipPath = wrapper.clipPath.destroy();
		}

		// Destroy stops in case this is a gradient object
		if (wrapper.stops) {
			for (i = 0; i < wrapper.stops.length; i++) {
				wrapper.stops[i] = wrapper.stops[i].destroy();
			}
			wrapper.stops = null;
		}

		// remove element
		wrapper.safeRemoveChild(element);

		// destroy shadows
		if (shadows) {
			each(shadows, function (shadow) {
				wrapper.safeRemoveChild(shadow);
			});
		}

		// In case of useHTML, clean up empty containers emulating SVG groups (#1960, #2393, #2697).
		while (parentToClean && parentToClean.div && parentToClean.div.childNodes.length === 0) {
			grandParent = parentToClean.parentGroup;
			wrapper.safeRemoveChild(parentToClean.div);
			delete parentToClean.div;
			parentToClean = grandParent;
		}

		// remove from alignObjects
		if (wrapper.alignTo) {
			erase(wrapper.renderer.alignedObjects, wrapper);
		}

		for (key in wrapper) {
			delete wrapper[key];
		}

		return null;
	},

	/**
	 * Add a shadow to the element. Must be done after the element is added to the DOM
	 * @param {Boolean|Object} shadowOptions
	 */
	shadow: function (shadowOptions, group, cutOff) {
		var shadows = [],
			i,
			shadow,
			element = this.element,
			strokeWidth,
			shadowWidth,
			shadowElementOpacity,

			// compensate for inverted plot area
			transform;


		if (shadowOptions) {
			shadowWidth = pick(shadowOptions.width, 3);
			shadowElementOpacity = (shadowOptions.opacity || 0.15) / shadowWidth;
			transform = this.parentInverted ?
				'(-1,-1)' :
				'(' + pick(shadowOptions.offsetX, 1) + ', ' + pick(shadowOptions.offsetY, 1) + ')';
			for (i = 1; i <= shadowWidth; i++) {
				shadow = element.cloneNode(0);
				strokeWidth = (shadowWidth * 2) + 1 - (2 * i);
				attr(shadow, {
					'isShadow': 'true',
					'stroke': shadowOptions.color || 'black',
					'stroke-opacity': shadowElementOpacity * i,
					'stroke-width': strokeWidth,
					'transform': 'translate' + transform,
					'fill': NONE
				});
				if (cutOff) {
					attr(shadow, 'height', mathMax(attr(shadow, 'height') - strokeWidth, 0));
					shadow.cutHeight = strokeWidth;
				}

				if (group) {
					group.element.appendChild(shadow);
				} else {
					element.parentNode.insertBefore(shadow, element);
				}

				shadows.push(shadow);
			}

			this.shadows = shadows;
		}
		return this;

	},

	xGetter: function (key) {
		if (this.element.nodeName === 'circle') {
			key = { x: 'cx', y: 'cy' }[key] || key;
		}
		return this._defaultGetter(key);
	},

	/** 
	 * Get the current value of an attribute or pseudo attribute, used mainly
	 * for animation.
	 */
	_defaultGetter: function (key) {
		var ret = pick(this[key], this.element ? this.element.getAttribute(key) : null, 0);

		if (/^[\-0-9\.]+$/.test(ret)) { // is numerical
			ret = parseFloat(ret);
		}
		return ret;
	},


	dSetter: function (value, key, element) {
		if (value && value.join) { // join path
			value = value.join(' ');
		}
		if (/(NaN| {2}|^$)/.test(value)) {
			value = 'M 0 0';
		}
		element.setAttribute(key, value);

		this[key] = value;
	},
	dashstyleSetter: function (value) {
		var i;
		value = value && value.toLowerCase();
		if (value) {
			value = value
				.replace('shortdashdotdot', '3,1,1,1,1,1,')
				.replace('shortdashdot', '3,1,1,1')
				.replace('shortdot', '1,1,')
				.replace('shortdash', '3,1,')
				.replace('longdash', '8,3,')
				.replace(/dot/g, '1,3,')
				.replace('dash', '4,3,')
				.replace(/,$/, '')
				.split(','); // ending comma

			i = value.length;
			while (i--) {
				value[i] = pInt(value[i]) * this['stroke-width'];
			}
			value = value.join(',')
				.replace('NaN', 'none'); // #3226
			this.element.setAttribute('stroke-dasharray', value);
		}
	},
	alignSetter: function (value) {
		this.element.setAttribute('text-anchor', { left: 'start', center: 'middle', right: 'end' }[value]);
	},
	opacitySetter: function (value, key, element) {
		this[key] = value;
		element.setAttribute(key, value);
	},
	titleSetter: function (value) {
		var titleNode = this.element.getElementsByTagName('title')[0];
		if (!titleNode) {
			titleNode = doc.createElementNS(SVG_NS, 'title');
			this.element.appendChild(titleNode);
		}
		titleNode.appendChild(
			doc.createTextNode(
				(String(pick(value), '')).replace(/<[^>]*>/g, '') // #3276, #3895
			)
		);
	},
	textSetter: function (value) {
		if (value !== this.textStr) {
			// Delete bBox memo when the text changes
			delete this.bBox;
		
			this.textStr = value;
			if (this.added) {
				this.renderer.buildText(this);
			}
		}
	},
	fillSetter: function (value, key, element) {
		if (typeof value === 'string') {
			element.setAttribute(key, value);
		} else if (value) {
			this.colorGradient(value, key, element);
		}
	},
	zIndexSetter: function (value, key) {
		var renderer = this.renderer,
			parentGroup = this.parentGroup,
			parentWrapper = parentGroup || renderer,
			parentNode = parentWrapper.element || renderer.box,
			childNodes,
			otherElement,
			otherZIndex,
			element = this.element,
			inserted,
			run = this.added,
			i;
		
		if (defined(value)) {
			element.setAttribute(key, value); // So we can read it for other elements in the group
			value = +value;
			if (this[key] === value) { // Only update when needed (#3865)
				run = false;
			}
			this[key] = value;
		}

		// Insert according to this and other elements' zIndex. Before .add() is called,
		// nothing is done. Then on add, or by later calls to zIndexSetter, the node
		// is placed on the right place in the DOM.
		if (run) {
			value = this.zIndex;

			if (value && parentGroup) {
				parentGroup.handleZ = true;
			}
		
			childNodes = parentNode.childNodes;
			for (i = 0; i < childNodes.length && !inserted; i++) {
				otherElement = childNodes[i];
				otherZIndex = attr(otherElement, 'zIndex');
				if (otherElement !== element && (
						// Insert before the first element with a higher zIndex
						pInt(otherZIndex) > value ||
						// If no zIndex given, insert before the first element with a zIndex
						(!defined(value) && defined(otherZIndex))

						)) {
					parentNode.insertBefore(element, otherElement);
					inserted = true;
				}
			}
			if (!inserted) {
				parentNode.appendChild(element);
			}
		}
		return inserted;
	},
	_defaultSetter: function (value, key, element) {
		element.setAttribute(key, value);
	}
};

// Some shared setters and getters
SVGElement.prototype.yGetter = SVGElement.prototype.xGetter;
SVGElement.prototype.translateXSetter = SVGElement.prototype.translateYSetter = 
		SVGElement.prototype.rotationSetter = SVGElement.prototype.verticalAlignSetter = 
		SVGElement.prototype.scaleXSetter = SVGElement.prototype.scaleYSetter = function (value, key) {
	this[key] = value;
	this.doTransform = true;
};

// WebKit and Batik have problems with a stroke-width of zero, so in this case we remove the 
// stroke attribute altogether. #1270, #1369, #3065, #3072.
SVGElement.prototype['stroke-widthSetter'] = SVGElement.prototype.strokeSetter = function (value, key, element) {
	this[key] = value;
	// Only apply the stroke attribute if the stroke width is defined and larger than 0
	if (this.stroke && this['stroke-width']) {
		this.strokeWidth = this['stroke-width'];
		SVGElement.prototype.fillSetter.call(this, this.stroke, 'stroke', element); // use prototype as instance may be overridden
		element.setAttribute('stroke-width', this['stroke-width']);
		this.hasStroke = true;
	} else if (key === 'stroke-width' && value === 0 && this.hasStroke) {
		element.removeAttribute('stroke');
		this.hasStroke = false;
	}
};


/**
 * The default SVG renderer
 */
var SVGRenderer = function () {
	this.init.apply(this, arguments);
};
SVGRenderer.prototype = {
	Element: SVGElement,

	/**
	 * Initialize the SVGRenderer
	 * @param {Object} container
	 * @param {Number} width
	 * @param {Number} height
	 * @param {Boolean} forExport
	 */
	init: function (container, width, height, style, forExport) {
		var renderer = this,
			loc = location,
			boxWrapper,
			element,
			desc;

		boxWrapper = renderer.createElement('svg')
			.attr({
				version: '1.1'
			})
			.css(this.getStyle(style));
		element = boxWrapper.element;
		container.appendChild(element);

		// For browsers other than IE, add the namespace attribute (#1978)
		if (container.innerHTML.indexOf('xmlns') === -1) {
			attr(element, 'xmlns', SVG_NS);
		}

		// object properties
		renderer.isSVG = true;
		renderer.box = element;
		renderer.boxWrapper = boxWrapper;
		renderer.alignedObjects = [];

		// Page url used for internal references. #24, #672, #1070
		renderer.url = (isFirefox || isWebKit) && doc.getElementsByTagName('base').length ?
			loc.href
				.replace(/#.*?$/, '') // remove the hash
				.replace(/([\('\)])/g, '\\$1') // escape parantheses and quotes
				.replace(/ /g, '%20') : // replace spaces (needed for Safari only)
			'';

		// Add description
		desc = this.createElement('desc').add();
		desc.element.appendChild(doc.createTextNode('Created with ' + PRODUCT + ' ' + VERSION));


		renderer.defs = this.createElement('defs').add();
		renderer.forExport = forExport;
		renderer.gradients = {}; // Object where gradient SvgElements are stored
		renderer.cache = {}; // Cache for numerical bounding boxes

		renderer.setSize(width, height, false);



		// Issue 110 workaround:
		// In Firefox, if a div is positioned by percentage, its pixel position may land
		// between pixels. The container itself doesn't display this, but an SVG element
		// inside this container will be drawn at subpixel precision. In order to draw
		// sharp lines, this must be compensated for. This doesn't seem to work inside
		// iframes though (like in jsFiddle).
		var subPixelFix, rect;
		if (isFirefox && container.getBoundingClientRect) {
			renderer.subPixelFix = subPixelFix = function () {
				css(container, { left: 0, top: 0 });
				rect = container.getBoundingClientRect();
				css(container, {
					left: (mathCeil(rect.left) - rect.left) + PX,
					top: (mathCeil(rect.top) - rect.top) + PX
				});
			};

			// run the fix now
			subPixelFix();

			// run it on resize
			addEvent(win, 'resize', subPixelFix);
		}
	},

	getStyle: function (style) {
		return (this.style = extend({
			fontFamily: '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif', // default font
			fontSize: '12px'
		}, style));
	},

	/**
	 * Detect whether the renderer is hidden. This happens when one of the parent elements
	 * has display: none. #608.
	 */
	isHidden: function () {
		return !this.boxWrapper.getBBox().width;
	},

	/**
	 * Destroys the renderer and its allocated members.
	 */
	destroy: function () {
		var renderer = this,
			rendererDefs = renderer.defs;
		renderer.box = null;
		renderer.boxWrapper = renderer.boxWrapper.destroy();

		// Call destroy on all gradient elements
		destroyObjectProperties(renderer.gradients || {});
		renderer.gradients = null;

		// Defs are null in VMLRenderer
		// Otherwise, destroy them here.
		if (rendererDefs) {
			renderer.defs = rendererDefs.destroy();
		}

		// Remove sub pixel fix handler
		// We need to check that there is a handler, otherwise all functions that are registered for event 'resize' are removed
		// See issue #982
		if (renderer.subPixelFix) {
			removeEvent(win, 'resize', renderer.subPixelFix);
		}

		renderer.alignedObjects = null;

		return null;
	},

	/**
	 * Create a wrapper for an SVG element
	 * @param {Object} nodeName
	 */
	createElement: function (nodeName) {
		var wrapper = new this.Element();
		wrapper.init(this, nodeName);
		return wrapper;
	},

	/**
	 * Dummy function for use in canvas renderer
	 */
	draw: function () {},

	/**
	 * Parse a simple HTML string into SVG tspans
	 *
	 * @param {Object} textNode The parent text SVG node
	 */
	buildText: function (wrapper) {
		var textNode = wrapper.element,
			renderer = this,
			forExport = renderer.forExport,
			textStr = pick(wrapper.textStr, '').toString(),
			hasMarkup = textStr.indexOf('<') !== -1,
			lines,
			childNodes = textNode.childNodes,
			styleRegex,
			hrefRegex,
			parentX = attr(textNode, 'x'),
			textStyles = wrapper.styles,
			width = wrapper.textWidth,
			textLineHeight = textStyles && textStyles.lineHeight,
			textShadow = textStyles && textStyles.textShadow,
			ellipsis = textStyles && textStyles.textOverflow === 'ellipsis',
			i = childNodes.length,
			tempParent = width && !wrapper.added && this.box,
			getLineHeight = function (tspan) {
				return textLineHeight ? 
					pInt(textLineHeight) :
					renderer.fontMetrics(
						/(px|em)$/.test(tspan && tspan.style.fontSize) ?
							tspan.style.fontSize :
							((textStyles && textStyles.fontSize) || renderer.style.fontSize || 12),
						tspan
					).h;
			},
			unescapeAngleBrackets = function (inputStr) {
				return inputStr.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
			};

		/// remove old text
		while (i--) {
			textNode.removeChild(childNodes[i]);
		}

		// Skip tspans, add text directly to text node. The forceTSpan is a hook 
		// used in text outline hack.
		if (!hasMarkup && !textShadow && !ellipsis && textStr.indexOf(' ') === -1) {
			textNode.appendChild(doc.createTextNode(unescapeAngleBrackets(textStr)));
			return;

		// Complex strings, add more logic
		} else {

			styleRegex = /<.*style="([^"]+)".*>/;
			hrefRegex = /<.*href="(http[^"]+)".*>/;

			if (tempParent) {
				tempParent.appendChild(textNode); // attach it to the DOM to read offset width
			}

			if (hasMarkup) {
				lines = textStr
					.replace(/<(b|strong)>/g, '<span style="font-weight:bold">')
					.replace(/<(i|em)>/g, '<span style="font-style:italic">')
					.replace(/<a/g, '<span')
					.replace(/<\/(b|strong|i|em|a)>/g, '</span>')
					.split(/<br.*?>/g);

			} else {
				lines = [textStr];
			}


			// remove empty line at end
			if (lines[lines.length - 1] === '') {
				lines.pop();
			}

			
			// build the lines
			each(lines, function (line, lineNo) {
				var spans, spanNo = 0;

				line = line.replace(/<span/g, '|||<span').replace(/<\/span>/g, '</span>|||');
				spans = line.split('|||');

				each(spans, function (span) {
					if (span !== '' || spans.length === 1) {
						var attributes = {},
							tspan = doc.createElementNS(SVG_NS, 'tspan'),
							spanStyle; // #390
						if (styleRegex.test(span)) {
							spanStyle = span.match(styleRegex)[1].replace(/(;| |^)color([ :])/, '$1fill$2');
							attr(tspan, 'style', spanStyle);
						}
						if (hrefRegex.test(span) && !forExport) { // Not for export - #1529
							attr(tspan, 'onclick', 'location.href=\"' + span.match(hrefRegex)[1] + '\"');
							css(tspan, { cursor: 'pointer' });
						}

						span = unescapeAngleBrackets(span.replace(/<(.|\n)*?>/g, '') || ' ');

						// Nested tags aren't supported, and cause crash in Safari (#1596)
						if (span !== ' ') {

							// add the text node
							tspan.appendChild(doc.createTextNode(span));

							if (!spanNo) { // first span in a line, align it to the left
								if (lineNo && parentX !== null) {
									attributes.x = parentX;
								}
							} else {
								attributes.dx = 0; // #16
							}

							// add attributes
							attr(tspan, attributes);

							// Append it
							textNode.appendChild(tspan);

							// first span on subsequent line, add the line height
							if (!spanNo && lineNo) {

								// allow getting the right offset height in exporting in IE
								if (!hasSVG && forExport) {
									css(tspan, { display: 'block' });
								}

								// Set the line height based on the font size of either
								// the text element or the tspan element
								attr(
									tspan,
									'dy',
									getLineHeight(tspan)
								);
							}

							/*if (width) {
								renderer.breakText(wrapper, width);
							}*/

							// Check width and apply soft breaks or ellipsis
							if (width) {
								var words = span.replace(/([^\^])-/g, '$1- ').split(' '), // #1273
									hasWhiteSpace = spans.length > 1 || lineNo || (words.length > 1 && textStyles.whiteSpace !== 'nowrap'),
									tooLong,
									wasTooLong,
									actualWidth,
									rest = [],
									dy = getLineHeight(tspan),
									softLineNo = 1,
									rotation = wrapper.rotation,
									wordStr = span, // for ellipsis
									cursor = wordStr.length, // binary search cursor
									bBox;

								while ((hasWhiteSpace || ellipsis) && (words.length || rest.length)) {
									wrapper.rotation = 0; // discard rotation when computing box
									bBox = wrapper.getBBox(true);
									actualWidth = bBox.width;

									// Old IE cannot measure the actualWidth for SVG elements (#2314)
									if (!hasSVG && renderer.forExport) {
										actualWidth = renderer.measureSpanWidth(tspan.firstChild.data, wrapper.styles);
									}

									tooLong = actualWidth > width;

									// For ellipsis, do a binary search for the correct string length
									if (wasTooLong === undefined) {
										wasTooLong = tooLong; // First time
									}
									if (ellipsis && wasTooLong) {
										cursor /= 2;

										if (wordStr === '' || (!tooLong && cursor < 0.5)) {
											words = []; // All ok, break out
										} else {
											if (tooLong) {
												wasTooLong = true;
											}
											wordStr = span.substring(0, wordStr.length + (tooLong ? -1 : 1) * mathCeil(cursor));
											words = [wordStr + (width > 3 ? '\u2026' : '')];
											tspan.removeChild(tspan.firstChild);
										}

									// Looping down, this is the first word sequence that is not too long,
									// so we can move on to build the next line.
									} else if (!tooLong || words.length === 1) {
										words = rest;
										rest = [];
												
										if (words.length) {
											softLineNo++;
											
											tspan = doc.createElementNS(SVG_NS, 'tspan');
											attr(tspan, {
												dy: dy,
												x: parentX
											});
											if (spanStyle) { // #390
												attr(tspan, 'style', spanStyle);
											}
											textNode.appendChild(tspan);
										}
										if (actualWidth > width) { // a single word is pressing it out
											width = actualWidth;
										}
									} else { // append to existing line tspan
										tspan.removeChild(tspan.firstChild);
										rest.unshift(words.pop());
									}
									if (words.length) {
										tspan.appendChild(doc.createTextNode(words.join(' ').replace(/- /g, '-')));
									}
								}
								if (wasTooLong) {
									wrapper.attr('title', wrapper.textStr);
								}
								wrapper.rotation = rotation;
							}

							spanNo++;
						}
					}
				});
			});
			if (tempParent) {
				tempParent.removeChild(textNode); // attach it to the DOM to read offset width
			}

			// Apply the text shadow
			if (textShadow && wrapper.applyTextShadow) {
				wrapper.applyTextShadow(textShadow);
			}
		}
	},

	

	/*
	breakText: function (wrapper, width) {
		var bBox = wrapper.getBBox(),
			node = wrapper.element,
			textLength = node.textContent.length,
			pos = mathRound(width * textLength / bBox.width), // try this position first, based on average character width
			increment = 0,
			finalPos;

		if (bBox.width > width) {
			while (finalPos === undefined) {
				textLength = node.getSubStringLength(0, pos);

				if (textLength <= width) {
					if (increment === -1) {
						finalPos = pos;
					} else {
						increment = 1;
					}
				} else {
					if (increment === 1) {
						finalPos = pos - 1;
					} else {
						increment = -1;
					}
				}
				pos += increment;
			}
		}
		console.log(finalPos, node.getSubStringLength(0, finalPos))
	},
	*/

	/** 
	 * Returns white for dark colors and black for bright colors
	 */
	getContrast: function (color) {
		color = Color(color).rgba;
		return color[0] + color[1] + color[2] > 384 ? '#000000' : '#FFFFFF';
	},

	/**
	 * Create a button with preset states
	 * @param {String} text
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Function} callback
	 * @param {Object} normalState
	 * @param {Object} hoverState
	 * @param {Object} pressedState
	 */
	button: function (text, x, y, callback, normalState, hoverState, pressedState, disabledState, shape) {
		var label = this.label(text, x, y, shape, null, null, null, null, 'button'),
			curState = 0,
			stateOptions,
			stateStyle,
			normalStyle,
			hoverStyle,
			pressedStyle,
			disabledStyle,
			verticalGradient = { x1: 0, y1: 0, x2: 0, y2: 1 };

		// Normal state - prepare the attributes
		normalState = merge({
			'stroke-width': 1,
			stroke: '#CCCCCC',
			fill: {
				linearGradient: verticalGradient,
				stops: [
					[0, '#FEFEFE'],
					[1, '#F6F6F6']
				]
			},
			r: 2,
			padding: 5,
			style: {
				color: 'black'
			}
		}, normalState);
		normalStyle = normalState.style;
		delete normalState.style;

		// Hover state
		hoverState = merge(normalState, {
			stroke: '#68A',
			fill: {
				linearGradient: verticalGradient,
				stops: [
					[0, '#FFF'],
					[1, '#ACF']
				]
			}
		}, hoverState);
		hoverStyle = hoverState.style;
		delete hoverState.style;

		// Pressed state
		pressedState = merge(normalState, {
			stroke: '#68A',
			fill: {
				linearGradient: verticalGradient,
				stops: [
					[0, '#9BD'],
					[1, '#CDF']
				]
			}
		}, pressedState);
		pressedStyle = pressedState.style;
		delete pressedState.style;

		// Disabled state
		disabledState = merge(normalState, {
			style: {
				color: '#CCC'
			}
		}, disabledState);
		disabledStyle = disabledState.style;
		delete disabledState.style;

		// Add the events. IE9 and IE10 need mouseover and mouseout to funciton (#667).
		addEvent(label.element, isIE ? 'mouseover' : 'mouseenter', function () {
			if (curState !== 3) {
				label.attr(hoverState)
					.css(hoverStyle);
			}
		});
		addEvent(label.element, isIE ? 'mouseout' : 'mouseleave', function () {
			if (curState !== 3) {
				stateOptions = [normalState, hoverState, pressedState][curState];
				stateStyle = [normalStyle, hoverStyle, pressedStyle][curState];
				label.attr(stateOptions)
					.css(stateStyle);
			}
		});

		label.setState = function (state) {
			label.state = curState = state;
			if (!state) {
				label.attr(normalState)
					.css(normalStyle);
			} else if (state === 2) {
				label.attr(pressedState)
					.css(pressedStyle);
			} else if (state === 3) {
				label.attr(disabledState)
					.css(disabledStyle);
			}
		};

		return label
			.on('click', function () {
				if (curState !== 3) {
					callback.call(label);
				}
			})
			.attr(normalState)
			.css(extend({ cursor: 'default' }, normalStyle));
	},

	/**
	 * Make a straight line crisper by not spilling out to neighbour pixels
	 * @param {Array} points
	 * @param {Number} width
	 */
	crispLine: function (points, width) {
		// points format: [M, 0, 0, L, 100, 0]
		// normalize to a crisp line
		if (points[1] === points[4]) {
			// Substract due to #1129. Now bottom and left axis gridlines behave the same.
			points[1] = points[4] = mathRound(points[1]) - (width % 2 / 2);
		}
		if (points[2] === points[5]) {
			points[2] = points[5] = mathRound(points[2]) + (width % 2 / 2);
		}
		return points;
	},


	/**
	 * Draw a path
	 * @param {Array} path An SVG path in array form
	 */
	path: function (path) {
		var attr = {
			fill: NONE
		};
		if (isArray(path)) {
			attr.d = path;
		} else if (isObject(path)) { // attributes
			extend(attr, path);
		}
		return this.createElement('path').attr(attr);
	},

	/**
	 * Draw and return an SVG circle
	 * @param {Number} x The x position
	 * @param {Number} y The y position
	 * @param {Number} r The radius
	 */
	circle: function (x, y, r) {
		var attr = isObject(x) ?
			x :
			{
				x: x,
				y: y,
				r: r
			},
			wrapper = this.createElement('circle');

		wrapper.xSetter = function (value) {
			this.element.setAttribute('cx', value);
		};
		wrapper.ySetter = function (value) {
			this.element.setAttribute('cy', value);
		};
		return wrapper.attr(attr);
	},

	/**
	 * Draw and return an arc
	 * @param {Number} x X position
	 * @param {Number} y Y position
	 * @param {Number} r Radius
	 * @param {Number} innerR Inner radius like used in donut charts
	 * @param {Number} start Starting angle
	 * @param {Number} end Ending angle
	 */
	arc: function (x, y, r, innerR, start, end) {
		var arc;

		if (isObject(x)) {
			y = x.y;
			r = x.r;
			innerR = x.innerR;
			start = x.start;
			end = x.end;
			x = x.x;
		}

		// Arcs are defined as symbols for the ability to set
		// attributes in attr and animate
		arc = this.symbol('arc', x || 0, y || 0, r || 0, r || 0, {
			innerR: innerR || 0,
			start: start || 0,
			end: end || 0
		});
		arc.r = r; // #959
		return arc;
	},

	/**
	 * Draw and return a rectangle
	 * @param {Number} x Left position
	 * @param {Number} y Top position
	 * @param {Number} width
	 * @param {Number} height
	 * @param {Number} r Border corner radius
	 * @param {Number} strokeWidth A stroke width can be supplied to allow crisp drawing
	 */
	rect: function (x, y, width, height, r, strokeWidth) {

		r = isObject(x) ? x.r : r;

		var wrapper = this.createElement('rect'),
			attribs = isObject(x) ? x : x === UNDEFINED ? {} : {
				x: x,
				y: y,
				width: mathMax(width, 0),
				height: mathMax(height, 0)
			};

		if (strokeWidth !== UNDEFINED) {
			attribs.strokeWidth = strokeWidth;
			attribs = wrapper.crisp(attribs);
		}

		if (r) {
			attribs.r = r;
		}

		wrapper.rSetter = function (value) {
			attr(this.element, {
				rx: value,
				ry: value
			});
		};
		
		return wrapper.attr(attribs);
	},

	/**
	 * Resize the box and re-align all aligned elements
	 * @param {Object} width
	 * @param {Object} height
	 * @param {Boolean} animate
	 *
	 */
	setSize: function (width, height, animate) {
		var renderer = this,
			alignedObjects = renderer.alignedObjects,
			i = alignedObjects.length;

		renderer.width = width;
		renderer.height = height;

		renderer.boxWrapper[pick(animate, true) ? 'animate' : 'attr']({
			width: width,
			height: height
		});

		while (i--) {
			alignedObjects[i].align();
		}
	},

	/**
	 * Create a group
	 * @param {String} name The group will be given a class name of 'highcharts-{name}'.
	 *	 This can be used for styling and scripting.
	 */
	g: function (name) {
		var elem = this.createElement('g');
		return defined(name) ? elem.attr({ 'class': PREFIX + name }) : elem;
	},

	/**
	 * Display an image
	 * @param {String} src
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 */
	image: function (src, x, y, width, height) {
		var attribs = {
				preserveAspectRatio: NONE
			},
			elemWrapper;

		// optional properties
		if (arguments.length > 1) {
			extend(attribs, {
				x: x,
				y: y,
				width: width,
				height: height
			});
		}

		elemWrapper = this.createElement('image').attr(attribs);

		// set the href in the xlink namespace
		if (elemWrapper.element.setAttributeNS) {
			elemWrapper.element.setAttributeNS('http://www.w3.org/1999/xlink',
				'href', src);
		} else {
			// could be exporting in IE
			// using href throws "not supported" in ie7 and under, requries regex shim to fix later
			elemWrapper.element.setAttribute('hc-svg-href', src);
		}
		return elemWrapper;
	},

	/**
	 * Draw a symbol out of pre-defined shape paths from the namespace 'symbol' object.
	 *
	 * @param {Object} symbol
	 * @param {Object} x
	 * @param {Object} y
	 * @param {Object} radius
	 * @param {Object} options
	 */
	symbol: function (symbol, x, y, width, height, options) {

		var obj,

			// get the symbol definition function
			symbolFn = this.symbols[symbol],

			// check if there's a path defined for this symbol
			path = symbolFn && symbolFn(
				mathRound(x),
				mathRound(y),
				width,
				height,
				options
			),

			imageElement,
			imageRegex = /^url\((.*?)\)$/,
			imageSrc,
			imageSize,
			centerImage;

		if (path) {

			obj = this.path(path);
			// expando properties for use in animate and attr
			extend(obj, {
				symbolName: symbol,
				x: x,
				y: y,
				width: width,
				height: height
			});
			if (options) {
				extend(obj, options);
			}


		// image symbols
		} else if (imageRegex.test(symbol)) {

			// On image load, set the size and position
			centerImage = function (img, size) {
				if (img.element) { // it may be destroyed in the meantime (#1390)
					img.attr({
						width: size[0],
						height: size[1]
					});

					if (!img.alignByTranslate) { // #185
						img.translate(
							mathRound((width - size[0]) / 2), // #1378
							mathRound((height - size[1]) / 2)
						);
					}
				}
			};

			imageSrc = symbol.match(imageRegex)[1];
			imageSize = symbolSizes[imageSrc] || (options && options.width && options.height && [options.width, options.height]);

			// Ireate the image synchronously, add attribs async
			obj = this.image(imageSrc)
				.attr({
					x: x,
					y: y
				});
			obj.isImg = true;

			if (imageSize) {
				centerImage(obj, imageSize);
			} else {
				// Initialize image to be 0 size so export will still function if there's no cached sizes.
				obj.attr({ width: 0, height: 0 });

				// Create a dummy JavaScript image to get the width and height. Due to a bug in IE < 8,
				// the created element must be assigned to a variable in order to load (#292).
				imageElement = createElement('img', {
					onload: function () {
						centerImage(obj, symbolSizes[imageSrc] = [this.width, this.height]);
					},
					src: imageSrc
				});
			}
		}

		return obj;
	},

	/**
	 * An extendable collection of functions for defining symbol paths.
	 */
	symbols: {
		'circle': function (x, y, w, h) {
			var cpw = 0.166 * w;
			return [
				M, x + w / 2, y,
				'C', x + w + cpw, y, x + w + cpw, y + h, x + w / 2, y + h,
				'C', x - cpw, y + h, x - cpw, y, x + w / 2, y,
				'Z'
			];
		},

		'square': function (x, y, w, h) {
			return [
				M, x, y,
				L, x + w, y,
				x + w, y + h,
				x, y + h,
				'Z'
			];
		},

		'triangle': function (x, y, w, h) {
			return [
				M, x + w / 2, y,
				L, x + w, y + h,
				x, y + h,
				'Z'
			];
		},

		'triangle-down': function (x, y, w, h) {
			return [
				M, x, y,
				L, x + w, y,
				x + w / 2, y + h,
				'Z'
			];
		},
		'diamond': function (x, y, w, h) {
			return [
				M, x + w / 2, y,
				L, x + w, y + h / 2,
				x + w / 2, y + h,
				x, y + h / 2,
				'Z'
			];
		},
		'arc': function (x, y, w, h, options) {
			var start = options.start,
				radius = options.r || w || h,
				end = options.end - 0.001, // to prevent cos and sin of start and end from becoming equal on 360 arcs (related: #1561)
				innerRadius = options.innerR,
				open = options.open,
				cosStart = mathCos(start),
				sinStart = mathSin(start),
				cosEnd = mathCos(end),
				sinEnd = mathSin(end),
				longArc = options.end - start < mathPI ? 0 : 1;

			return [
				M,
				x + radius * cosStart,
				y + radius * sinStart,
				'A', // arcTo
				radius, // x radius
				radius, // y radius
				0, // slanting
				longArc, // long or short arc
				1, // clockwise
				x + radius * cosEnd,
				y + radius * sinEnd,
				open ? M : L,
				x + innerRadius * cosEnd,
				y + innerRadius * sinEnd,
				'A', // arcTo
				innerRadius, // x radius
				innerRadius, // y radius
				0, // slanting
				longArc, // long or short arc
				0, // clockwise
				x + innerRadius * cosStart,
				y + innerRadius * sinStart,

				open ? '' : 'Z' // close
			];
		},

		/**
		 * Callout shape used for default tooltips, also used for rounded rectangles in VML
		 */
		callout: function (x, y, w, h, options) {
			var arrowLength = 6,
				halfDistance = 6,
				r = mathMin((options && options.r) || 0, w, h),
				safeDistance = r + halfDistance,
				anchorX = options && options.anchorX,
				anchorY = options && options.anchorY,
				path;

			path = [
				'M', x + r, y, 
				'L', x + w - r, y, // top side
				'C', x + w, y, x + w, y, x + w, y + r, // top-right corner
				'L', x + w, y + h - r, // right side
				'C', x + w, y + h, x + w, y + h, x + w - r, y + h, // bottom-right corner
				'L', x + r, y + h, // bottom side
				'C', x, y + h, x, y + h, x, y + h - r, // bottom-left corner
				'L', x, y + r, // left side
				'C', x, y, x, y, x + r, y // top-right corner
			];
			
			if (anchorX && anchorX > w && anchorY > y + safeDistance && anchorY < y + h - safeDistance) { // replace right side
				path.splice(13, 3,
					'L', x + w, anchorY - halfDistance, 
					x + w + arrowLength, anchorY,
					x + w, anchorY + halfDistance,
					x + w, y + h - r
				);
			} else if (anchorX && anchorX < 0 && anchorY > y + safeDistance && anchorY < y + h - safeDistance) { // replace left side
				path.splice(33, 3, 
					'L', x, anchorY + halfDistance, 
					x - arrowLength, anchorY,
					x, anchorY - halfDistance,
					x, y + r
				);
			} else if (anchorY && anchorY > h && anchorX > x + safeDistance && anchorX < x + w - safeDistance) { // replace bottom
				path.splice(23, 3,
					'L', anchorX + halfDistance, y + h,
					anchorX, y + h + arrowLength,
					anchorX - halfDistance, y + h,
					x + r, y + h
				);
			} else if (anchorY && anchorY < 0 && anchorX > x + safeDistance && anchorX < x + w - safeDistance) { // replace top
				path.splice(3, 3,
					'L', anchorX - halfDistance, y,
					anchorX, y - arrowLength,
					anchorX + halfDistance, y,
					w - r, y
				);
			}
			return path;
		}
	},

	/**
	 * Define a clipping rectangle
	 * @param {String} id
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 */
	clipRect: function (x, y, width, height) {
		var wrapper,
			id = PREFIX + idCounter++,

			clipPath = this.createElement('clipPath').attr({
				id: id
			}).add(this.defs);

		wrapper = this.rect(x, y, width, height, 0).add(clipPath);
		wrapper.id = id;
		wrapper.clipPath = clipPath;
		wrapper.count = 0;

		return wrapper;
	},


	


	/**
	 * Add text to the SVG object
	 * @param {String} str
	 * @param {Number} x Left position
	 * @param {Number} y Top position
	 * @param {Boolean} useHTML Use HTML to render the text
	 */
	text: function (str, x, y, useHTML) {

		// declare variables
		var renderer = this,
			fakeSVG = useCanVG || (!hasSVG && renderer.forExport),
			wrapper,
			attr = {};

		if (useHTML && !renderer.forExport) {
			return renderer.html(str, x, y);
		}

		attr.x = Math.round(x || 0); // X is always needed for line-wrap logic
		if (y) {
			attr.y = Math.round(y);
		}
		if (str || str === 0) {
			attr.text = str;
		}

		wrapper = renderer.createElement('text')
			.attr(attr);

		// Prevent wrapping from creating false offsetWidths in export in legacy IE (#1079, #1063)
		if (fakeSVG) {
			wrapper.css({
				position: ABSOLUTE
			});
		}

		if (!useHTML) {
			wrapper.xSetter = function (value, key, element) {
				var tspans = element.getElementsByTagName('tspan'),
					tspan,
					parentVal = element.getAttribute(key),
					i;
				for (i = 0; i < tspans.length; i++) {
					tspan = tspans[i];
					// If the x values are equal, the tspan represents a linebreak
					if (tspan.getAttribute(key) === parentVal) {
						tspan.setAttribute(key, value);
					}
				}
				element.setAttribute(key, value);
			};
		}
		
		return wrapper;
	},

	/**
	 * Utility to return the baseline offset and total line height from the font size
	 */
	fontMetrics: function (fontSize, elem) {
		var lineHeight,
			baseline,
			style;

		fontSize = fontSize || this.style.fontSize;
		if (elem && win.getComputedStyle) {
			elem = elem.element || elem; // SVGElement
			style = win.getComputedStyle(elem, "");
			fontSize = style && style.fontSize; // #4309, the style doesn't exist inside a hidden iframe in Firefox
		}
		fontSize = /px/.test(fontSize) ? pInt(fontSize) : /em/.test(fontSize) ? parseFloat(fontSize) * 12 : 12;

		// Empirical values found by comparing font size and bounding box height.
		// Applies to the default font family. http://jsfiddle.net/highcharts/7xvn7/
		lineHeight = fontSize < 24 ? fontSize + 3 : mathRound(fontSize * 1.2);
		baseline = mathRound(lineHeight * 0.8);

		return {
			h: lineHeight,
			b: baseline,
			f: fontSize
		};
	},

	/**
	 * Correct X and Y positioning of a label for rotation (#1764)
	 */
	rotCorr: function (baseline, rotation, alterY) {
		var y = baseline;
		if (rotation && alterY) {
			y = mathMax(y * mathCos(rotation * deg2rad), 4);
		}
		return {
			x: (-baseline / 3) * mathSin(rotation * deg2rad),
			y: y
		};
	},

	/**
	 * Add a label, a text item that can hold a colored or gradient background
	 * as well as a border and shadow.
	 * @param {string} str
	 * @param {Number} x
	 * @param {Number} y
	 * @param {String} shape
	 * @param {Number} anchorX In case the shape has a pointer, like a flag, this is the
	 *	coordinates it should be pinned to
	 * @param {Number} anchorY
	 * @param {Boolean} baseline Whether to position the label relative to the text baseline,
	 *	like renderer.text, or to the upper border of the rectangle.
	 * @param {String} className Class name for the group
	 */
	label: function (str, x, y, shape, anchorX, anchorY, useHTML, baseline, className) {

		var renderer = this,
			wrapper = renderer.g(className),
			text = renderer.text('', 0, 0, useHTML)
				.attr({
					zIndex: 1
				}),
				//.add(wrapper),
			box,
			bBox,
			alignFactor = 0,
			padding = 3,
			paddingLeft = 0,
			width,
			height,
			wrapperX,
			wrapperY,
			crispAdjust = 0,
			deferredAttr = {},
			baselineOffset,
			needsBox;

		/**
		 * This function runs after the label is added to the DOM (when the bounding box is
		 * available), and after the text of the label is updated to detect the new bounding
		 * box and reflect it in the border box.
		 */
		function updateBoxSize() {
			var boxX,
				boxY,
				style = text.element.style;

			bBox = (width === undefined || height === undefined || wrapper.styles.textAlign) && defined(text.textStr) && 
				text.getBBox(); //#3295 && 3514 box failure when string equals 0
			wrapper.width = (width || bBox.width || 0) + 2 * padding + paddingLeft;
			wrapper.height = (height || bBox.height || 0) + 2 * padding;

			// update the label-scoped y offset
			baselineOffset = padding + renderer.fontMetrics(style && style.fontSize, text).b;

			
			if (needsBox) {

				// create the border box if it is not already present
				if (!box) {
					boxX = mathRound(-alignFactor * padding) + crispAdjust;
					boxY = (baseline ? -baselineOffset : 0) + crispAdjust;

					wrapper.box = box = shape ?
						renderer.symbol(shape, boxX, boxY, wrapper.width, wrapper.height, deferredAttr) :
						renderer.rect(boxX, boxY, wrapper.width, wrapper.height, 0, deferredAttr[STROKE_WIDTH]);
					box.attr('fill', NONE).add(wrapper);
				}

				// apply the box attributes
				if (!box.isImg) { // #1630
					box.attr(extend({
						width: mathRound(wrapper.width),
						height: mathRound(wrapper.height)
					}, deferredAttr));
				}
				deferredAttr = null;
			}
		}

		/**
		 * This function runs after setting text or padding, but only if padding is changed
		 */
		function updateTextPadding() {
			var styles = wrapper.styles,
				textAlign = styles && styles.textAlign,
				x = paddingLeft + padding * (1 - alignFactor),
				y;

			// determin y based on the baseline
			y = baseline ? 0 : baselineOffset;

			// compensate for alignment
			if (defined(width) && bBox && (textAlign === 'center' || textAlign === 'right')) {
				x += { center: 0.5, right: 1 }[textAlign] * (width - bBox.width);
			}

			// update if anything changed
			if (x !== text.x || y !== text.y) {
				text.attr('x', x);
				if (y !== UNDEFINED) {
					text.attr('y', y);
				}
			}

			// record current values
			text.x = x;
			text.y = y;
		}

		/**
		 * Set a box attribute, or defer it if the box is not yet created
		 * @param {Object} key
		 * @param {Object} value
		 */
		function boxAttr(key, value) {
			if (box) {
				box.attr(key, value);
			} else {
				deferredAttr[key] = value;
			}
		}

		/**
		 * After the text element is added, get the desired size of the border box
		 * and add it before the text in the DOM.
		 */
		wrapper.onAdd = function () {
			text.add(wrapper);
			wrapper.attr({
				text: (str || str === 0) ? str : '', // alignment is available now // #3295: 0 not rendered if given as a value
				x: x,
				y: y
			});

			if (box && defined(anchorX)) {
				wrapper.attr({
					anchorX: anchorX,
					anchorY: anchorY
				});
			}
		};

		/*
		 * Add specific attribute setters.
		 */

		// only change local variables
		wrapper.widthSetter = function (value) {
			width = value;
		};
		wrapper.heightSetter = function (value) {
			height = value;
		};
		wrapper.paddingSetter =  function (value) {
			if (defined(value) && value !== padding) {
				padding = wrapper.padding = value;
				updateTextPadding();
			}
		};
		wrapper.paddingLeftSetter =  function (value) {
			if (defined(value) && value !== paddingLeft) {
				paddingLeft = value;
				updateTextPadding();
			}
		};


		// change local variable and prevent setting attribute on the group
		wrapper.alignSetter = function (value) {
			alignFactor = { left: 0, center: 0.5, right: 1 }[value];
		};

		// apply these to the box and the text alike
		wrapper.textSetter = function (value) {
			if (value !== UNDEFINED) {
				text.textSetter(value);
			}
			updateBoxSize();
			updateTextPadding();
		};

		// apply these to the box but not to the text
		wrapper['stroke-widthSetter'] = function (value, key) {
			if (value) {
				needsBox = true;
			}
			crispAdjust = value % 2 / 2;
			boxAttr(key, value);
		};
		wrapper.strokeSetter = wrapper.fillSetter = wrapper.rSetter = function (value, key) {
			if (key === 'fill' && value) {
				needsBox = true;
			}
			boxAttr(key, value);
		};
		wrapper.anchorXSetter = function (value, key) {
			anchorX = value;
			boxAttr(key, mathRound(value) - crispAdjust - wrapperX);
		};
		wrapper.anchorYSetter = function (value, key) {
			anchorY = value;
			boxAttr(key, value - wrapperY);
		};

		// rename attributes
		wrapper.xSetter = function (value) {
			wrapper.x = value; // for animation getter
			if (alignFactor) {
				value -= alignFactor * ((width || bBox.width) + padding);
			}
			wrapperX = mathRound(value);
			wrapper.attr('translateX', wrapperX);
		};
		wrapper.ySetter = function (value) {
			wrapperY = wrapper.y = mathRound(value);
			wrapper.attr('translateY', wrapperY);
		};

		// Redirect certain methods to either the box or the text
		var baseCss = wrapper.css;
		return extend(wrapper, {
			/**
			 * Pick up some properties and apply them to the text instead of the wrapper
			 */
			css: function (styles) {
				if (styles) {
					var textStyles = {};
					styles = merge(styles); // create a copy to avoid altering the original object (#537)
					each(wrapper.textProps, function (prop) {
						if (styles[prop] !== UNDEFINED) {
							textStyles[prop] = styles[prop];
							delete styles[prop];
						}
					});
					text.css(textStyles);
				}
				return baseCss.call(wrapper, styles);
			},
			/**
			 * Return the bounding box of the box, not the group
			 */
			getBBox: function () {
				return {
					width: bBox.width + 2 * padding,
					height: bBox.height + 2 * padding,
					x: bBox.x - padding,
					y: bBox.y - padding
				};
			},
			/**
			 * Apply the shadow to the box
			 */
			shadow: function (b) {
				if (box) {
					box.shadow(b);
				}
				return wrapper;
			},
			/**
			 * Destroy and release memory.
			 */
			destroy: function () {

				// Added by button implementation
				removeEvent(wrapper.element, 'mouseenter');
				removeEvent(wrapper.element, 'mouseleave');

				if (text) {
					text = text.destroy();
				}
				if (box) {
					box = box.destroy();
				}
				// Call base implementation to destroy the rest
				SVGElement.prototype.destroy.call(wrapper);

				// Release local pointers (#1298)
				wrapper = renderer = updateBoxSize = updateTextPadding = boxAttr = null;
			}
		});
	}
}; // end SVGRenderer


// general renderer
Renderer = SVGRenderer;
// extend SvgElement for useHTML option
extend(SVGElement.prototype, {
	/**
	 * Apply CSS to HTML elements. This is used in text within SVG rendering and
	 * by the VML renderer
	 */
	htmlCss: function (styles) {
		var wrapper = this,
			element = wrapper.element,
			textWidth = styles && element.tagName === 'SPAN' && styles.width;

		if (textWidth) {
			delete styles.width;
			wrapper.textWidth = textWidth;
			wrapper.updateTransform();
		}
		if (styles && styles.textOverflow === 'ellipsis') {
			styles.whiteSpace = 'nowrap';
			styles.overflow = 'hidden';
		}
		wrapper.styles = extend(wrapper.styles, styles);
		css(wrapper.element, styles);

		return wrapper;
	},

	/**
	 * VML and useHTML method for calculating the bounding box based on offsets
	 * @param {Boolean} refresh Whether to force a fresh value from the DOM or to
	 * use the cached value
	 *
	 * @return {Object} A hash containing values for x, y, width and height
	 */

	htmlGetBBox: function () {
		var wrapper = this,
			element = wrapper.element;

		// faking getBBox in exported SVG in legacy IE
		// faking getBBox in exported SVG in legacy IE (is this a duplicate of the fix for #1079?)
		if (element.nodeName === 'text') {
			element.style.position = ABSOLUTE;
		}

		return {
			x: element.offsetLeft,
			y: element.offsetTop,
			width: element.offsetWidth,
			height: element.offsetHeight
		};
	},

	/**
	 * VML override private method to update elements based on internal
	 * properties based on SVG transform
	 */
	htmlUpdateTransform: function () {
		// aligning non added elements is expensive
		if (!this.added) {
			this.alignOnAdd = true;
			return;
		}

		var wrapper = this,
			renderer = wrapper.renderer,
			elem = wrapper.element,
			translateX = wrapper.translateX || 0,
			translateY = wrapper.translateY || 0,
			x = wrapper.x || 0,
			y = wrapper.y || 0,
			align = wrapper.textAlign || 'left',
			alignCorrection = { left: 0, center: 0.5, right: 1 }[align],
			shadows = wrapper.shadows,
			styles = wrapper.styles;

		// apply translate
		css(elem, {
			marginLeft: translateX,
			marginTop: translateY
		});
		if (shadows) { // used in labels/tooltip
			each(shadows, function (shadow) {
				css(shadow, {
					marginLeft: translateX + 1,
					marginTop: translateY + 1
				});
			});
		}

		// apply inversion
		if (wrapper.inverted) { // wrapper is a group
			each(elem.childNodes, function (child) {
				renderer.invertChild(child, elem);
			});
		}

		if (elem.tagName === 'SPAN') {

			var width,
				rotation = wrapper.rotation,
				baseline,
				textWidth = pInt(wrapper.textWidth),
				currentTextTransform = [rotation, align, elem.innerHTML, wrapper.textWidth].join(',');

			if (currentTextTransform !== wrapper.cTT) { // do the calculations and DOM access only if properties changed


				baseline = renderer.fontMetrics(elem.style.fontSize).b;

				// Renderer specific handling of span rotation
				if (defined(rotation)) {
					wrapper.setSpanRotation(rotation, alignCorrection, baseline);
				}

				width = pick(wrapper.elemWidth, elem.offsetWidth);

				// Update textWidth
				if (width > textWidth && /[ \-]/.test(elem.textContent || elem.innerText)) { // #983, #1254
					css(elem, {
						width: textWidth + PX,
						display: 'block',
						whiteSpace: (styles && styles.whiteSpace) || 'normal' // #3331
					});
					width = textWidth;
				}

				wrapper.getSpanCorrection(width, baseline, alignCorrection, rotation, align);
			}

			// apply position with correction
			css(elem, {
				left: (x + (wrapper.xCorr || 0)) + PX,
				top: (y + (wrapper.yCorr || 0)) + PX
			});

			// force reflow in webkit to apply the left and top on useHTML element (#1249)
			if (isWebKit) {
				baseline = elem.offsetHeight; // assigned to baseline for JSLint purpose
			}

			// record current text transform
			wrapper.cTT = currentTextTransform;
		}
	},

	/**
	 * Set the rotation of an individual HTML span
	 */
	setSpanRotation: function (rotation, alignCorrection, baseline) {
		var rotationStyle = {},
			cssTransformKey = isIE ? '-ms-transform' : isWebKit ? '-webkit-transform' : isFirefox ? 'MozTransform' : isOpera ? '-o-transform' : '';

		rotationStyle[cssTransformKey] = rotationStyle.transform = 'rotate(' + rotation + 'deg)';
		rotationStyle[cssTransformKey + (isFirefox ? 'Origin' : '-origin')] = rotationStyle.transformOrigin = (alignCorrection * 100) + '% ' + baseline + 'px';
		css(this.element, rotationStyle);
	},

	/**
	 * Get the correction in X and Y positioning as the element is rotated.
	 */
	getSpanCorrection: function (width, baseline, alignCorrection) {
		this.xCorr = -width * alignCorrection;
		this.yCorr = -baseline;
	}
});

// Extend SvgRenderer for useHTML option.
extend(SVGRenderer.prototype, {
	/**
	 * Create HTML text node. This is used by the VML renderer as well as the SVG
	 * renderer through the useHTML option.
	 *
	 * @param {String} str
	 * @param {Number} x
	 * @param {Number} y
	 */
	html: function (str, x, y) {
		var wrapper = this.createElement('span'),
			element = wrapper.element,
			renderer = wrapper.renderer;

		// Text setter
		wrapper.textSetter = function (value) {
			if (value !== element.innerHTML) {
				delete this.bBox;
			}
			element.innerHTML = this.textStr = value;
		};

		// Various setters which rely on update transform
		wrapper.xSetter = wrapper.ySetter = wrapper.alignSetter = wrapper.rotationSetter = function (value, key) {
			if (key === 'align') {
				key = 'textAlign'; // Do not overwrite the SVGElement.align method. Same as VML.
			}
			wrapper[key] = value;
			wrapper.htmlUpdateTransform();
		};

		// Set the default attributes
		wrapper.attr({
				text: str,
				x: mathRound(x),
				y: mathRound(y)
			})
			.css({
				position: ABSOLUTE,
				fontFamily: this.style.fontFamily,
				fontSize: this.style.fontSize
			});

		// Keep the whiteSpace style outside the wrapper.styles collection
		element.style.whiteSpace = 'nowrap';

		// Use the HTML specific .css method
		wrapper.css = wrapper.htmlCss;

		// This is specific for HTML within SVG
		if (renderer.isSVG) {
			wrapper.add = function (svgGroupWrapper) {

				var htmlGroup,
					container = renderer.box.parentNode,
					parentGroup,
					parents = [];

				this.parentGroup = svgGroupWrapper;

				// Create a mock group to hold the HTML elements
				if (svgGroupWrapper) {
					htmlGroup = svgGroupWrapper.div;
					if (!htmlGroup) {

						// Read the parent chain into an array and read from top down
						parentGroup = svgGroupWrapper;
						while (parentGroup) {

							parents.push(parentGroup);

							// Move up to the next parent group
							parentGroup = parentGroup.parentGroup;
						}

						// Ensure dynamically updating position when any parent is translated
						each(parents.reverse(), function (parentGroup) {
							var htmlGroupStyle,
								cls = attr(parentGroup.element, 'class');

							if (cls) {
								cls = { className: cls };
							} // else null

							// Create a HTML div and append it to the parent div to emulate
							// the SVG group structure
							htmlGroup = parentGroup.div = parentGroup.div || createElement(DIV, cls, {
								position: ABSOLUTE,
								left: (parentGroup.translateX || 0) + PX,
								top: (parentGroup.translateY || 0) + PX
							}, htmlGroup || container); // the top group is appended to container

							// Shortcut
							htmlGroupStyle = htmlGroup.style;

							// Set listeners to update the HTML div's position whenever the SVG group
							// position is changed
							extend(parentGroup, {
								translateXSetter: function (value, key) {
									htmlGroupStyle.left = value + PX;
									parentGroup[key] = value;
									parentGroup.doTransform = true;
								},
								translateYSetter: function (value, key) {
									htmlGroupStyle.top = value + PX;
									parentGroup[key] = value;
									parentGroup.doTransform = true;
								},
								visibilitySetter: function (value, key) {
									htmlGroupStyle[key] = value;
								}
							});
						});

					}
				} else {
					htmlGroup = container;
				}

				htmlGroup.appendChild(element);

				// Shared with VML:
				wrapper.added = true;
				if (wrapper.alignOnAdd) {
					wrapper.htmlUpdateTransform();
				}

				return wrapper;
			};
		}
		return wrapper;
	}
});

/* ****************************************************************************
 *                                                                            *
 * START OF INTERNET EXPLORER <= 8 SPECIFIC CODE                              *
 *                                                                            *
 * For applications and websites that don't need IE support, like platform    *
 * targeted mobile apps and web apps, this code can be removed.               *
 *                                                                            *
 *****************************************************************************/

/**
 * @constructor
 */
var VMLRenderer, VMLElement;
if (!hasSVG && !useCanVG) {

/**
 * The VML element wrapper.
 */
VMLElement = {

	/**
	 * Initialize a new VML element wrapper. It builds the markup as a string
	 * to minimize DOM traffic.
	 * @param {Object} renderer
	 * @param {Object} nodeName
	 */
	init: function (renderer, nodeName) {
		var wrapper = this,
			markup =  ['<', nodeName, ' filled="f" stroked="f"'],
			style = ['position: ', ABSOLUTE, ';'],
			isDiv = nodeName === DIV;

		// divs and shapes need size
		if (nodeName === 'shape' || isDiv) {
			style.push('left:0;top:0;width:1px;height:1px;');
		}
		style.push('visibility: ', isDiv ? HIDDEN : VISIBLE);

		markup.push(' style="', style.join(''), '"/>');

		// create element with default attributes and style
		if (nodeName) {
			markup = isDiv || nodeName === 'span' || nodeName === 'img' ?
				markup.join('')
				: renderer.prepVML(markup);
			wrapper.element = createElement(markup);
		}

		wrapper.renderer = renderer;
	},

	/**
	 * Add the node to the given parent
	 * @param {Object} parent
	 */
	add: function (parent) {
		var wrapper = this,
			renderer = wrapper.renderer,
			element = wrapper.element,
			box = renderer.box,
			inverted = parent && parent.inverted,

			// get the parent node
			parentNode = parent ?
				parent.element || parent :
				box;


		// if the parent group is inverted, apply inversion on all children
		if (inverted) { // only on groups
			renderer.invertChild(element, parentNode);
		}

		// append it
		parentNode.appendChild(element);

		// align text after adding to be able to read offset
		wrapper.added = true;
		if (wrapper.alignOnAdd && !wrapper.deferUpdateTransform) {
			wrapper.updateTransform();
		}

		// fire an event for internal hooks
		if (wrapper.onAdd) {
			wrapper.onAdd();
		}

		return wrapper;
	},

	/**
	 * VML always uses htmlUpdateTransform
	 */
	updateTransform: SVGElement.prototype.htmlUpdateTransform,

	/**
	 * Set the rotation of a span with oldIE's filter
	 */
	setSpanRotation: function () {
		// Adjust for alignment and rotation. Rotation of useHTML content is not yet implemented
		// but it can probably be implemented for Firefox 3.5+ on user request. FF3.5+
		// has support for CSS3 transform. The getBBox method also needs to be updated
		// to compensate for the rotation, like it currently does for SVG.
		// Test case: http://jsfiddle.net/highcharts/Ybt44/

		var rotation = this.rotation,
			costheta = mathCos(rotation * deg2rad),
			sintheta = mathSin(rotation * deg2rad);
					
		css(this.element, {
			filter: rotation ? ['progid:DXImageTransform.Microsoft.Matrix(M11=', costheta,
				', M12=', -sintheta, ', M21=', sintheta, ', M22=', costheta,
				', sizingMethod=\'auto expand\')'].join('') : NONE
		});
	},

	/**
	 * Get the positioning correction for the span after rotating. 
	 */
	getSpanCorrection: function (width, baseline, alignCorrection, rotation, align) {

		var costheta = rotation ? mathCos(rotation * deg2rad) : 1,
			sintheta = rotation ? mathSin(rotation * deg2rad) : 0,
			height = pick(this.elemHeight, this.element.offsetHeight),
			quad,
			nonLeft = align && align !== 'left';

		// correct x and y
		this.xCorr = costheta < 0 && -width;
		this.yCorr = sintheta < 0 && -height;

		// correct for baseline and corners spilling out after rotation
		quad = costheta * sintheta < 0;
		this.xCorr += sintheta * baseline * (quad ? 1 - alignCorrection : alignCorrection);
		this.yCorr -= costheta * baseline * (rotation ? (quad ? alignCorrection : 1 - alignCorrection) : 1);
		// correct for the length/height of the text
		if (nonLeft) {
			this.xCorr -= width * alignCorrection * (costheta < 0 ? -1 : 1);
			if (rotation) {
				this.yCorr -= height * alignCorrection * (sintheta < 0 ? -1 : 1);
			}
			css(this.element, {
				textAlign: align
			});
		}
	},

	/**
	 * Converts a subset of an SVG path definition to its VML counterpart. Takes an array
	 * as the parameter and returns a string.
	 */
	pathToVML: function (value) {
		// convert paths
		var i = value.length,
			path = [];

		while (i--) {

			// Multiply by 10 to allow subpixel precision.
			// Substracting half a pixel seems to make the coordinates
			// align with SVG, but this hasn't been tested thoroughly
			if (isNumber(value[i])) {
				path[i] = mathRound(value[i] * 10) - 5;
			} else if (value[i] === 'Z') { // close the path
				path[i] = 'x';
			} else {
				path[i] = value[i];

				// When the start X and end X coordinates of an arc are too close,
				// they are rounded to the same value above. In this case, substract or 
				// add 1 from the end X and Y positions. #186, #760, #1371, #1410.
				if (value.isArc && (value[i] === 'wa' || value[i] === 'at')) {
					// Start and end X
					if (path[i + 5] === path[i + 7]) {
						path[i + 7] += value[i + 7] > value[i + 5] ? 1 : -1;
					}
					// Start and end Y
					if (path[i + 6] === path[i + 8]) {
						path[i + 8] += value[i + 8] > value[i + 6] ? 1 : -1;
					}
				}
			}
		}

		
		// Loop up again to handle path shortcuts (#2132)
		/*while (i++ < path.length) {
			if (path[i] === 'H') { // horizontal line to
				path[i] = 'L';
				path.splice(i + 2, 0, path[i - 1]);
			} else if (path[i] === 'V') { // vertical line to
				path[i] = 'L';
				path.splice(i + 1, 0, path[i - 2]);
			}
		}*/
		return path.join(' ') || 'x';
	},

	/**
	 * Set the element's clipping to a predefined rectangle
	 *
	 * @param {String} id The id of the clip rectangle
	 */
	clip: function (clipRect) {
		var wrapper = this,
			clipMembers,
			cssRet;

		if (clipRect) {
			clipMembers = clipRect.members;
			erase(clipMembers, wrapper); // Ensure unique list of elements (#1258)
			clipMembers.push(wrapper);
			wrapper.destroyClip = function () {
				erase(clipMembers, wrapper);
			};
			cssRet = clipRect.getCSS(wrapper);

		} else {
			if (wrapper.destroyClip) {
				wrapper.destroyClip();
			}
			cssRet = { clip: docMode8 ? 'inherit' : 'rect(auto)' }; // #1214
		}

		return wrapper.css(cssRet);

	},

	/**
	 * Set styles for the element
	 * @param {Object} styles
	 */
	css: SVGElement.prototype.htmlCss,

	/**
	 * Removes a child either by removeChild or move to garbageBin.
	 * Issue 490; in VML removeChild results in Orphaned nodes according to sIEve, discardElement does not.
	 */
	safeRemoveChild: function (element) {
		// discardElement will detach the node from its parent before attaching it
		// to the garbage bin. Therefore it is important that the node is attached and have parent.
		if (element.parentNode) {
			discardElement(element);
		}
	},

	/**
	 * Extend element.destroy by removing it from the clip members array
	 */
	destroy: function () {
		if (this.destroyClip) {
			this.destroyClip();
		}

		return SVGElement.prototype.destroy.apply(this);
	},

	/**
	 * Add an event listener. VML override for normalizing event parameters.
	 * @param {String} eventType
	 * @param {Function} handler
	 */
	on: function (eventType, handler) {
		// simplest possible event model for internal use
		this.element['on' + eventType] = function () {
			var evt = win.event;
			evt.target = evt.srcElement;
			handler(evt);
		};
		return this;
	},

	/**
	 * In stacked columns, cut off the shadows so that they don't overlap
	 */
	cutOffPath: function (path, length) {

		var len;

		path = path.split(/[ ,]/);
		len = path.length;

		if (len === 9 || len === 11) {
			path[len - 4] = path[len - 2] = pInt(path[len - 2]) - 10 * length;
		}
		return path.join(' ');
	},

	/**
	 * Apply a drop shadow by copying elements and giving them different strokes
	 * @param {Boolean|Object} shadowOptions
	 */
	shadow: function (shadowOptions, group, cutOff) {
		var shadows = [],
			i,
			element = this.element,
			renderer = this.renderer,
			shadow,
			elemStyle = element.style,
			markup,
			path = element.path,
			strokeWidth,
			modifiedPath,
			shadowWidth,
			shadowElementOpacity;

		// some times empty paths are not strings
		if (path && typeof path.value !== 'string') {
			path = 'x';
		}
		modifiedPath = path;

		if (shadowOptions) {
			shadowWidth = pick(shadowOptions.width, 3);
			shadowElementOpacity = (shadowOptions.opacity || 0.15) / shadowWidth;
			for (i = 1; i <= 3; i++) {

				strokeWidth = (shadowWidth * 2) + 1 - (2 * i);

				// Cut off shadows for stacked column items
				if (cutOff) {
					modifiedPath = this.cutOffPath(path.value, strokeWidth + 0.5);
				}

				markup = ['<shape isShadow="true" strokeweight="', strokeWidth,
					'" filled="false" path="', modifiedPath,
					'" coordsize="10 10" style="', element.style.cssText, '" />'];

				shadow = createElement(renderer.prepVML(markup),
					null, {
						left: pInt(elemStyle.left) + pick(shadowOptions.offsetX, 1),
						top: pInt(elemStyle.top) + pick(shadowOptions.offsetY, 1)
					}
				);
				if (cutOff) {
					shadow.cutOff = strokeWidth + 1;
				}

				// apply the opacity
				markup = ['<stroke color="', shadowOptions.color || 'black', '" opacity="', shadowElementOpacity * i, '"/>'];
				createElement(renderer.prepVML(markup), null, null, shadow);


				// insert it
				if (group) {
					group.element.appendChild(shadow);
				} else {
					element.parentNode.insertBefore(shadow, element);
				}

				// record it
				shadows.push(shadow);

			}

			this.shadows = shadows;
		}
		return this;
	},
	updateShadows: noop, // Used in SVG only

	setAttr: function (key, value) {
		if (docMode8) { // IE8 setAttribute bug
			this.element[key] = value;
		} else {
			this.element.setAttribute(key, value);
		}
	},
	classSetter: function (value) {
		// IE8 Standards mode has problems retrieving the className unless set like this
		this.element.className = value;
	},
	dashstyleSetter: function (value, key, element) {
		var strokeElem = element.getElementsByTagName('stroke')[0] ||
			createElement(this.renderer.prepVML(['<stroke/>']), null, null, element);
		strokeElem[key] = value || 'solid';
		this[key] = value; /* because changing stroke-width will change the dash length
			and cause an epileptic effect */
	},
	dSetter: function (value, key, element) {
		var i,
			shadows = this.shadows;
		value = value || [];
		this.d = value.join && value.join(' '); // used in getter for animation

		element.path = value = this.pathToVML(value);

		// update shadows
		if (shadows) {
			i = shadows.length;
			while (i--) {
				shadows[i].path = shadows[i].cutOff ? this.cutOffPath(value, shadows[i].cutOff) : value;
			}
		}
		this.setAttr(key, value);
	},
	fillSetter: function (value, key, element) {
		var nodeName = element.nodeName;
		if (nodeName === 'SPAN') { // text color
			element.style.color = value;
		} else if (nodeName !== 'IMG') { // #1336
			element.filled = value !== NONE;
			this.setAttr('fillcolor', this.renderer.color(value, element, key, this));
		}
	},
	opacitySetter: noop, // Don't bother - animation is too slow and filters introduce artifacts
	rotationSetter: function (value, key, element) {
		var style = element.style;
		this[key] = style[key] = value; // style is for #1873

		// Correction for the 1x1 size of the shape container. Used in gauge needles.
		style.left = -mathRound(mathSin(value * deg2rad) + 1) + PX;
		style.top = mathRound(mathCos(value * deg2rad)) + PX;
	},
	strokeSetter: function (value, key, element) {
		this.setAttr('strokecolor', this.renderer.color(value, element, key));
	},
	'stroke-widthSetter': function (value, key, element) {
		element.stroked = !!value; // VML "stroked" attribute
		this[key] = value; // used in getter, issue #113
		if (isNumber(value)) {
			value += PX;
		}
		this.setAttr('strokeweight', value);
	},
	titleSetter: function (value, key) {
		this.setAttr(key, value);
	},
	visibilitySetter: function (value, key, element) {

		// Handle inherited visibility
		if (value === 'inherit') {
			value = VISIBLE;
		}
		
		// Let the shadow follow the main element
		if (this.shadows) {
			each(this.shadows, function (shadow) {
				shadow.style[key] = value;
			});
		}

		// Instead of toggling the visibility CSS property, move the div out of the viewport.
		// This works around #61 and #586
		if (element.nodeName === 'DIV') {
			value = value === HIDDEN ? '-999em' : 0;

			// In order to redraw, IE7 needs the div to be visible when tucked away
			// outside the viewport. So the visibility is actually opposite of
			// the expected value. This applies to the tooltip only.
			if (!docMode8) {
				element.style[key] = value ? VISIBLE : HIDDEN;
			}
			key = 'top';
		}
		element.style[key] = value;
	},
	xSetter: function (value, key, element) {
		this[key] = value; // used in getter

		if (key === 'x') {
			key = 'left';
		} else if (key === 'y') {
			key = 'top';
		}/* else {
			value = mathMax(0, value); // don't set width or height below zero (#311)
		}*/

		// clipping rectangle special
		if (this.updateClipping) {
			this[key] = value; // the key is now 'left' or 'top' for 'x' and 'y'
			this.updateClipping();
		} else {
			// normal
			element.style[key] = value;
		}
	},
	zIndexSetter: function (value, key, element) {
		element.style[key] = value;
	}
};
Highcharts.VMLElement = VMLElement = extendClass(SVGElement, VMLElement);

// Some shared setters
VMLElement.prototype.ySetter =
	VMLElement.prototype.widthSetter = 
	VMLElement.prototype.heightSetter = 
	VMLElement.prototype.xSetter;


/**
 * The VML renderer
 */
var VMLRendererExtension = { // inherit SVGRenderer

	Element: VMLElement,
	isIE8: userAgent.indexOf('MSIE 8.0') > -1,


	/**
	 * Initialize the VMLRenderer
	 * @param {Object} container
	 * @param {Number} width
	 * @param {Number} height
	 */
	init: function (container, width, height, style) {
		var renderer = this,
			boxWrapper,
			box,
			css;

		renderer.alignedObjects = [];

		boxWrapper = renderer.createElement(DIV)
			.css(extend(this.getStyle(style), { position: RELATIVE}));
		box = boxWrapper.element;
		container.appendChild(boxWrapper.element);


		// generate the containing box
		renderer.isVML = true;
		renderer.box = box;
		renderer.boxWrapper = boxWrapper;
		renderer.cache = {};


		renderer.setSize(width, height, false);

		// The only way to make IE6 and IE7 print is to use a global namespace. However,
		// with IE8 the only way to make the dynamic shapes visible in screen and print mode
		// seems to be to add the xmlns attribute and the behaviour style inline.
		if (!doc.namespaces.hcv) {

			doc.namespaces.add('hcv', 'urn:schemas-microsoft-com:vml');

			// Setup default CSS (#2153, #2368, #2384)
			css = 'hcv\\:fill, hcv\\:path, hcv\\:shape, hcv\\:stroke' +
				'{ behavior:url(#default#VML); display: inline-block; } ';
			try {
				doc.createStyleSheet().cssText = css;
			} catch (e) {
				doc.styleSheets[0].cssText += css;
			}

		}
	},


	/**
	 * Detect whether the renderer is hidden. This happens when one of the parent elements
	 * has display: none
	 */
	isHidden: function () {
		return !this.box.offsetWidth;
	},

	/**
	 * Define a clipping rectangle. In VML it is accomplished by storing the values
	 * for setting the CSS style to all associated members.
	 *
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 */
	clipRect: function (x, y, width, height) {

		// create a dummy element
		var clipRect = this.createElement(),
			isObj = isObject(x);

		// mimic a rectangle with its style object for automatic updating in attr
		return extend(clipRect, {
			members: [],
			count: 0,
			left: (isObj ? x.x : x) + 1,
			top: (isObj ? x.y : y) + 1,
			width: (isObj ? x.width : width) - 1,
			height: (isObj ? x.height : height) - 1,
			getCSS: function (wrapper) {
				var element = wrapper.element,
					nodeName = element.nodeName,
					isShape = nodeName === 'shape',
					inverted = wrapper.inverted,
					rect = this,
					top = rect.top - (isShape ? element.offsetTop : 0),
					left = rect.left,
					right = left + rect.width,
					bottom = top + rect.height,
					ret = {
						clip: 'rect(' +
							mathRound(inverted ? left : top) + 'px,' +
							mathRound(inverted ? bottom : right) + 'px,' +
							mathRound(inverted ? right : bottom) + 'px,' +
							mathRound(inverted ? top : left) + 'px)'
					};

				// issue 74 workaround
				if (!inverted && docMode8 && nodeName === 'DIV') {
					extend(ret, {
						width: right + PX,
						height: bottom + PX
					});
				}
				return ret;
			},

			// used in attr and animation to update the clipping of all members
			updateClipping: function () {
				each(clipRect.members, function (member) {
					if (member.element) { // Deleted series, like in stock/members/series-remove demo. Should be removed from members, but this will do.
						member.css(clipRect.getCSS(member));
					}
				});
			}
		});

	},


	/**
	 * Take a color and return it if it's a string, make it a gradient if it's a
	 * gradient configuration object, and apply opacity.
	 *
	 * @param {Object} color The color or config object
	 */
	color: function (color, elem, prop, wrapper) {
		var renderer = this,
			colorObject,
			regexRgba = /^rgba/,
			markup,
			fillType,
			ret = NONE;

		// Check for linear or radial gradient
		if (color && color.linearGradient) {
			fillType = 'gradient';
		} else if (color && color.radialGradient) {
			fillType = 'pattern';
		}


		if (fillType) {

			var stopColor,
				stopOpacity,
				gradient = color.linearGradient || color.radialGradient,
				x1,
				y1,
				x2,
				y2,
				opacity1,
				opacity2,
				color1,
				color2,
				fillAttr = '',
				stops = color.stops,
				firstStop,
				lastStop,
				colors = [],
				addFillNode = function () {
					// Add the fill subnode. When colors attribute is used, the meanings of opacity and o:opacity2
					// are reversed.
					markup = ['<fill colors="' + colors.join(',') + '" opacity="', opacity2, '" o:opacity2="', opacity1,
						'" type="', fillType, '" ', fillAttr, 'focus="100%" method="any" />'];
					createElement(renderer.prepVML(markup), null, null, elem);
				};

			// Extend from 0 to 1
			firstStop = stops[0];
			lastStop = stops[stops.length - 1];
			if (firstStop[0] > 0) {
				stops.unshift([
					0,
					firstStop[1]
				]);
			}
			if (lastStop[0] < 1) {
				stops.push([
					1,
					lastStop[1]
				]);
			}

			// Compute the stops
			each(stops, function (stop, i) {
				if (regexRgba.test(stop[1])) {
					colorObject = Color(stop[1]);
					stopColor = colorObject.get('rgb');
					stopOpacity = colorObject.get('a');
				} else {
					stopColor = stop[1];
					stopOpacity = 1;
				}

				// Build the color attribute
				colors.push((stop[0] * 100) + '% ' + stopColor);

				// Only start and end opacities are allowed, so we use the first and the last
				if (!i) {
					opacity1 = stopOpacity;
					color2 = stopColor;
				} else {
					opacity2 = stopOpacity;
					color1 = stopColor;
				}
			});

			// Apply the gradient to fills only.
			if (prop === 'fill') {

				// Handle linear gradient angle
				if (fillType === 'gradient') {
					x1 = gradient.x1 || gradient[0] || 0;
					y1 = gradient.y1 || gradient[1] || 0;
					x2 = gradient.x2 || gradient[2] || 0;
					y2 = gradient.y2 || gradient[3] || 0;
					fillAttr = 'angle="' + (90  - math.atan(
						(y2 - y1) / // y vector
						(x2 - x1) // x vector
						) * 180 / mathPI) + '"';

					addFillNode();

				// Radial (circular) gradient
				} else {

					var r = gradient.r,
						sizex = r * 2,
						sizey = r * 2,
						cx = gradient.cx,
						cy = gradient.cy,
						radialReference = elem.radialReference,
						bBox,
						applyRadialGradient = function () {
							if (radialReference) {
								bBox = wrapper.getBBox();
								cx += (radialReference[0] - bBox.x) / bBox.width - 0.5;
								cy += (radialReference[1] - bBox.y) / bBox.height - 0.5;
								sizex *= radialReference[2] / bBox.width;
								sizey *= radialReference[2] / bBox.height;
							}
							fillAttr = 'src="' + defaultOptions.global.VMLRadialGradientURL + '" ' +
								'size="' + sizex + ',' + sizey + '" ' +
								'origin="0.5,0.5" ' +
								'position="' + cx + ',' + cy + '" ' +
								'color2="' + color2 + '" ';

							addFillNode();
						};

					// Apply radial gradient
					if (wrapper.added) {
						applyRadialGradient();
					} else {
						// We need to know the bounding box to get the size and position right
						wrapper.onAdd = applyRadialGradient;
					}

					// The fill element's color attribute is broken in IE8 standards mode, so we
					// need to set the parent shape's fillcolor attribute instead.
					ret = color1;
				}

			// Gradients are not supported for VML stroke, return the first color. #722.
			} else {
				ret = stopColor;
			}

		// if the color is an rgba color, split it and add a fill node
		// to hold the opacity component
		} else if (regexRgba.test(color) && elem.tagName !== 'IMG') {

			colorObject = Color(color);

			markup = ['<', prop, ' opacity="', colorObject.get('a'), '"/>'];
			createElement(this.prepVML(markup), null, null, elem);

			ret = colorObject.get('rgb');


		} else {
			var propNodes = elem.getElementsByTagName(prop); // 'stroke' or 'fill' node
			if (propNodes.length) {
				propNodes[0].opacity = 1;
				propNodes[0].type = 'solid';
			}
			ret = color;
		}

		return ret;
	},

	/**
	 * Take a VML string and prepare it for either IE8 or IE6/IE7.
	 * @param {Array} markup A string array of the VML markup to prepare
	 */
	prepVML: function (markup) {
		var vmlStyle = 'display:inline-block;behavior:url(#default#VML);',
			isIE8 = this.isIE8;

		markup = markup.join('');

		if (isIE8) { // add xmlns and style inline
			markup = markup.replace('/>', ' xmlns="urn:schemas-microsoft-com:vml" />');
			if (markup.indexOf('style="') === -1) {
				markup = markup.replace('/>', ' style="' + vmlStyle + '" />');
			} else {
				markup = markup.replace('style="', 'style="' + vmlStyle);
			}

		} else { // add namespace
			markup = markup.replace('<', '<hcv:');
		}

		return markup;
	},

	/**
	 * Create rotated and aligned text
	 * @param {String} str
	 * @param {Number} x
	 * @param {Number} y
	 */
	text: SVGRenderer.prototype.html,

	/**
	 * Create and return a path element
	 * @param {Array} path
	 */
	path: function (path) {
		var attr = {
			// subpixel precision down to 0.1 (width and height = 1px)
			coordsize: '10 10'
		};
		if (isArray(path)) {
			attr.d = path;
		} else if (isObject(path)) { // attributes
			extend(attr, path);
		}
		// create the shape
		return this.createElement('shape').attr(attr);
	},

	/**
	 * Create and return a circle element. In VML circles are implemented as
	 * shapes, which is faster than v:oval
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} r
	 */
	circle: function (x, y, r) {
		var circle = this.symbol('circle');
		if (isObject(x)) {
			r = x.r;
			y = x.y;
			x = x.x;
		}
		circle.isCircle = true; // Causes x and y to mean center (#1682)
		circle.r = r;
		return circle.attr({ x: x, y: y });
	},

	/**
	 * Create a group using an outer div and an inner v:group to allow rotating
	 * and flipping. A simple v:group would have problems with positioning
	 * child HTML elements and CSS clip.
	 *
	 * @param {String} name The name of the group
	 */
	g: function (name) {
		var wrapper,
			attribs;

		// set the class name
		if (name) {
			attribs = { 'className': PREFIX + name, 'class': PREFIX + name };
		}

		// the div to hold HTML and clipping
		wrapper = this.createElement(DIV).attr(attribs);

		return wrapper;
	},

	/**
	 * VML override to create a regular HTML image
	 * @param {String} src
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 */
	image: function (src, x, y, width, height) {
		var obj = this.createElement('img')
			.attr({ src: src });

		if (arguments.length > 1) {
			obj.attr({
				x: x,
				y: y,
				width: width,
				height: height
			});
		}
		return obj;
	},

	/**
	 * For rectangles, VML uses a shape for rect to overcome bugs and rotation problems
	 */
	createElement: function (nodeName) {
		return nodeName === 'rect' ? this.symbol(nodeName) : SVGRenderer.prototype.createElement.call(this, nodeName);	
	},

	/**
	 * In the VML renderer, each child of an inverted div (group) is inverted
	 * @param {Object} element
	 * @param {Object} parentNode
	 */
	invertChild: function (element, parentNode) {
		var ren = this,
			parentStyle = parentNode.style,
			imgStyle = element.tagName === 'IMG' && element.style; // #1111

		css(element, {
			flip: 'x',
			left: pInt(parentStyle.width) - (imgStyle ? pInt(imgStyle.top) : 1),
			top: pInt(parentStyle.height) - (imgStyle ? pInt(imgStyle.left) : 1),
			rotation: -90
		});

		// Recursively invert child elements, needed for nested composite shapes like box plots and error bars. #1680, #1806.
		each(element.childNodes, function (child) {
			ren.invertChild(child, element);
		});
	},

	/**
	 * Symbol definitions that override the parent SVG renderer's symbols
	 *
	 */
	symbols: {
		// VML specific arc function
		arc: function (x, y, w, h, options) {
			var start = options.start,
				end = options.end,
				radius = options.r || w || h,
				innerRadius = options.innerR,
				cosStart = mathCos(start),
				sinStart = mathSin(start),
				cosEnd = mathCos(end),
				sinEnd = mathSin(end),
				ret;

			if (end - start === 0) { // no angle, don't show it.
				return ['x'];
			}

			ret = [
				'wa', // clockwise arc to
				x - radius, // left
				y - radius, // top
				x + radius, // right
				y + radius, // bottom
				x + radius * cosStart, // start x
				y + radius * sinStart, // start y
				x + radius * cosEnd, // end x
				y + radius * sinEnd  // end y
			];

			if (options.open && !innerRadius) {
				ret.push(
					'e',
					M,
					x,// - innerRadius,
					y// - innerRadius
				);
			}

			ret.push(
				'at', // anti clockwise arc to
				x - innerRadius, // left
				y - innerRadius, // top
				x + innerRadius, // right
				y + innerRadius, // bottom
				x + innerRadius * cosEnd, // start x
				y + innerRadius * sinEnd, // start y
				x + innerRadius * cosStart, // end x
				y + innerRadius * sinStart, // end y
				'x', // finish path
				'e' // close
			);

			ret.isArc = true;
			return ret;

		},
		// Add circle symbol path. This performs significantly faster than v:oval.
		circle: function (x, y, w, h, wrapper) {

			if (wrapper) {
				w = h = 2 * wrapper.r;
			}

			// Center correction, #1682
			if (wrapper && wrapper.isCircle) {
				x -= w / 2;
				y -= h / 2;
			}

			// Return the path
			return [
				'wa', // clockwisearcto
				x, // left
				y, // top
				x + w, // right
				y + h, // bottom
				x + w, // start x
				y + h / 2,     // start y
				x + w, // end x
				y + h / 2,     // end y
				//'x', // finish path
				'e' // close
			];
		},
		/**
		 * Add rectangle symbol path which eases rotation and omits arcsize problems
		 * compared to the built-in VML roundrect shape. When borders are not rounded,
		 * use the simpler square path, else use the callout path without the arrow.
		 */
		rect: function (x, y, w, h, options) {
			return SVGRenderer.prototype.symbols[
				!defined(options) || !options.r ? 'square' : 'callout'
			].call(0, x, y, w, h, options);
		}
	}
};
Highcharts.VMLRenderer = VMLRenderer = function () {
	this.init.apply(this, arguments);
};
VMLRenderer.prototype = merge(SVGRenderer.prototype, VMLRendererExtension);

	// general renderer
	Renderer = VMLRenderer;
}

// This method is used with exporting in old IE, when emulating SVG (see #2314)
SVGRenderer.prototype.measureSpanWidth = function (text, styles) {
	var measuringSpan = doc.createElement('span'),
		offsetWidth,
	textNode = doc.createTextNode(text);

	measuringSpan.appendChild(textNode);
	css(measuringSpan, styles);
	this.box.appendChild(measuringSpan);
	offsetWidth = measuringSpan.offsetWidth;
	discardElement(measuringSpan); // #2463
	return offsetWidth;
};


/* ****************************************************************************
 *                                                                            *
 * END OF INTERNET EXPLORER <= 8 SPECIFIC CODE                                *
 *                                                                            *
 *****************************************************************************/
/* ****************************************************************************
 *                                                                            *
 * START OF ANDROID < 3 SPECIFIC CODE. THIS CAN BE REMOVED IF YOU'RE NOT      *
 * TARGETING THAT SYSTEM.                                                     *
 *                                                                            *
 *****************************************************************************/
var CanVGRenderer,
	CanVGController;

if (useCanVG) {
	/**
	 * The CanVGRenderer is empty from start to keep the source footprint small.
	 * When requested, the CanVGController downloads the rest of the source packaged
	 * together with the canvg library.
	 */
	Highcharts.CanVGRenderer = CanVGRenderer = function () {
		// Override the global SVG namespace to fake SVG/HTML that accepts CSS
		SVG_NS = 'http://www.w3.org/1999/xhtml';
	};

	/**
	 * Start with an empty symbols object. This is needed when exporting is used (exporting.src.js will add a few symbols), but 
	 * the implementation from SvgRenderer will not be merged in until first render.
	 */
	CanVGRenderer.prototype.symbols = {};

	/**
	 * Handles on demand download of canvg rendering support.
	 */
	CanVGController = (function () {
		// List of renderering calls
		var deferredRenderCalls = [];

		/**
		 * When downloaded, we are ready to draw deferred charts.
		 */
		function drawDeferred() {
			var callLength = deferredRenderCalls.length,
				callIndex;

			// Draw all pending render calls
			for (callIndex = 0; callIndex < callLength; callIndex++) {
				deferredRenderCalls[callIndex]();
			}
			// Clear the list
			deferredRenderCalls = [];
		}

		return {
			push: function (func, scriptLocation) {
				// Only get the script once
				if (deferredRenderCalls.length === 0) {
					getScript(scriptLocation, drawDeferred);
				}
				// Register render call
				deferredRenderCalls.push(func);
			}
		};
	}());

	Renderer = CanVGRenderer;
} // end CanVGRenderer

/* ****************************************************************************
 *                                                                            *
 * END OF ANDROID < 3 SPECIFIC CODE                                           *
 *                                                                            *
 *****************************************************************************/

/**
 * The Tick class
 */
function Tick(axis, pos, type, noLabel) {
	this.axis = axis;
	this.pos = pos;
	this.type = type || '';
	this.isNew = true;

	if (!type && !noLabel) {
		this.addLabel();
	}
}

Tick.prototype = {
	/**
	 * Write the tick label
	 */
	addLabel: function () {
		var tick = this,
			axis = tick.axis,
			options = axis.options,
			chart = axis.chart,
			categories = axis.categories,
			names = axis.names,
			pos = tick.pos,
			labelOptions = options.labels,
			str,
			tickPositions = axis.tickPositions,
			isFirst = pos === tickPositions[0],
			isLast = pos === tickPositions[tickPositions.length - 1],
			value = categories ?
				pick(categories[pos], names[pos], pos) :
				pos,
			label = tick.label,
			tickPositionInfo = tickPositions.info,
			dateTimeLabelFormat;

		// Set the datetime label format. If a higher rank is set for this position, use that. If not,
		// use the general format.
		if (axis.isDatetimeAxis && tickPositionInfo) {
			dateTimeLabelFormat = options.dateTimeLabelFormats[tickPositionInfo.higherRanks[pos] || tickPositionInfo.unitName];
		}
		// set properties for access in render method
		tick.isFirst = isFirst;
		tick.isLast = isLast;

		// get the string
		str = axis.labelFormatter.call({
			axis: axis,
			chart: chart,
			isFirst: isFirst,
			isLast: isLast,
			dateTimeLabelFormat: dateTimeLabelFormat,
			value: axis.isLog ? correctFloat(lin2log(value)) : value
		});

		// prepare CSS
		//css = width && { width: mathMax(1, mathRound(width - 2 * (labelOptions.padding || 10))) + PX };
		
		// first call
		if (!defined(label)) {

			tick.label = label =
				defined(str) && labelOptions.enabled ?
					chart.renderer.text(
							str,
							0,
							0,
							labelOptions.useHTML
						)
						//.attr(attr)
						// without position absolute, IE export sometimes is wrong
						.css(merge(labelOptions.style))
						.add(axis.labelGroup) :
					null;
			tick.labelLength = label && label.getBBox().width; // Un-rotated length
			tick.rotation = 0; // Base value to detect change for new calls to getBBox

		// update
		} else if (label) {
			label.attr({ text: str });
		}
	},

	/**
	 * Get the offset height or width of the label
	 */
	getLabelSize: function () {
		return this.label ?
			this.label.getBBox()[this.axis.horiz ? 'height' : 'width'] :
			0;
	},

	/**
	 * Handle the label overflow by adjusting the labels to the left and right edge, or
	 * hide them if they collide into the neighbour label.
	 */
	handleOverflow: function (xy) {
		var axis = this.axis,
			pxPos = xy.x,
			chartWidth = axis.chart.chartWidth,
			spacing = axis.chart.spacing,
			leftBound = pick(axis.labelLeft, mathMin(axis.pos, spacing[3])),
			rightBound = pick(axis.labelRight, mathMax(axis.pos + axis.len, chartWidth - spacing[1])),
			label = this.label,
			rotation = this.rotation,
			factor = { left: 0, center: 0.5, right: 1 }[axis.labelAlign],
			labelWidth = label.getBBox().width,
			slotWidth = axis.slotWidth,
			xCorrection = factor,
			goRight = 1,
			leftPos,
			rightPos,
			textWidth,
			css = {};

		// Check if the label overshoots the chart spacing box. If it does, move it.
		// If it now overshoots the slotWidth, add ellipsis.
		if (!rotation) {
			leftPos = pxPos - factor * labelWidth;
			rightPos = pxPos + (1 - factor) * labelWidth;

			if (leftPos < leftBound) {
				slotWidth = xy.x + slotWidth * (1 - factor) - leftBound;
			} else if (rightPos > rightBound) {
				slotWidth = rightBound - xy.x + slotWidth * factor;
				goRight = -1;
			}

			slotWidth = mathMin(axis.slotWidth, slotWidth); // #4177
			if (slotWidth < axis.slotWidth && axis.labelAlign === 'center') {
				xy.x += goRight * (axis.slotWidth - slotWidth - xCorrection * (axis.slotWidth - mathMin(labelWidth, slotWidth)));				
			}
			// If the label width exceeds the available space, set a text width to be 
			// picked up below. Also, if a width has been set before, we need to set a new
			// one because the reported labelWidth will be limited by the box (#3938).
			if (labelWidth > slotWidth || (axis.autoRotation && label.styles.width)) {
				textWidth = slotWidth;
			}

		// Add ellipsis to prevent rotated labels to be clipped against the edge of the chart
		} else if (rotation < 0 && pxPos - factor * labelWidth < leftBound) {
			textWidth = mathRound(pxPos / mathCos(rotation * deg2rad) - leftBound);
		} else if (rotation > 0 && pxPos + factor * labelWidth > rightBound) {
			textWidth = mathRound((chartWidth - pxPos) / mathCos(rotation * deg2rad));
		}

		if (textWidth) {
			css.width = textWidth;
			if (!axis.options.labels.style.textOverflow) {
				css.textOverflow = 'ellipsis';
			}
			label.css(css);
		}
	},

	/**
	 * Get the x and y position for ticks and labels
	 */
	getPosition: function (horiz, pos, tickmarkOffset, old) {
		var axis = this.axis,
			chart = axis.chart,
			cHeight = (old && chart.oldChartHeight) || chart.chartHeight;

		return {
			x: horiz ?
				axis.translate(pos + tickmarkOffset, null, null, old) + axis.transB :
				axis.left + axis.offset + (axis.opposite ? ((old && chart.oldChartWidth) || chart.chartWidth) - axis.right - axis.left : 0),

			y: horiz ?
				cHeight - axis.bottom + axis.offset - (axis.opposite ? axis.height : 0) :
				cHeight - axis.translate(pos + tickmarkOffset, null, null, old) - axis.transB
		};

	},

	/**
	 * Get the x, y position of the tick label
	 */
	getLabelPosition: function (x, y, label, horiz, labelOptions, tickmarkOffset, index, step) {
		var axis = this.axis,
			transA = axis.transA,
			reversed = axis.reversed,
			staggerLines = axis.staggerLines,
			rotCorr = axis.tickRotCorr || { x: 0, y: 0 },
			yOffset = pick(labelOptions.y, rotCorr.y + (axis.side === 2 ? 8 : -(label.getBBox().height / 2))),
			line;

		x = x + labelOptions.x + rotCorr.x - (tickmarkOffset && horiz ?
			tickmarkOffset * transA * (reversed ? -1 : 1) : 0);
		y = y + yOffset - (tickmarkOffset && !horiz ?
			tickmarkOffset * transA * (reversed ? 1 : -1) : 0);

		// Correct for staggered labels
		if (staggerLines) {
			line = (index / (step || 1) % staggerLines);
			y += line * (axis.labelOffset / staggerLines);
		}

		return {
			x: x,
			y: mathRound(y)
		};
	},

	/**
	 * Extendible method to return the path of the marker
	 */
	getMarkPath: function (x, y, tickLength, tickWidth, horiz, renderer) {
		return renderer.crispLine([
				M,
				x,
				y,
				L,
				x + (horiz ? 0 : -tickLength),
				y + (horiz ? tickLength : 0)
			], tickWidth);
	},

	/**
	 * Put everything in place
	 *
	 * @param index {Number}
	 * @param old {Boolean} Use old coordinates to prepare an animation into new position
	 */
	render: function (index, old, opacity) {
		var tick = this,
			axis = tick.axis,
			options = axis.options,
			chart = axis.chart,
			renderer = chart.renderer,
			horiz = axis.horiz,
			type = tick.type,
			label = tick.label,
			pos = tick.pos,
			labelOptions = options.labels,
			gridLine = tick.gridLine,
			gridPrefix = type ? type + 'Grid' : 'grid',
			tickPrefix = type ? type + 'Tick' : 'tick',
			gridLineWidth = options[gridPrefix + 'LineWidth'],
			gridLineColor = options[gridPrefix + 'LineColor'],
			dashStyle = options[gridPrefix + 'LineDashStyle'],
			tickLength = options[tickPrefix + 'Length'],
			tickWidth = options[tickPrefix + 'Width'] || 0,
			tickColor = options[tickPrefix + 'Color'],
			tickPosition = options[tickPrefix + 'Position'],
			gridLinePath,
			mark = tick.mark,
			markPath,
			step = /*axis.labelStep || */labelOptions.step,
			attribs,
			show = true,
			tickmarkOffset = axis.tickmarkOffset,
			xy = tick.getPosition(horiz, pos, tickmarkOffset, old),
			x = xy.x,
			y = xy.y,
			reverseCrisp = ((horiz && x === axis.pos + axis.len) || (!horiz && y === axis.pos)) ? -1 : 1; // #1480, #1687

		opacity = pick(opacity, 1);
		this.isActive = true;

		// create the grid line
		if (gridLineWidth) {
			gridLinePath = axis.getPlotLinePath(pos + tickmarkOffset, gridLineWidth * reverseCrisp, old, true);

			if (gridLine === UNDEFINED) {
				attribs = {
					stroke: gridLineColor,
					'stroke-width': gridLineWidth
				};
				if (dashStyle) {
					attribs.dashstyle = dashStyle;
				}
				if (!type) {
					attribs.zIndex = 1;
				}
				if (old) {
					attribs.opacity = 0;
				}
				tick.gridLine = gridLine =
					gridLineWidth ?
						renderer.path(gridLinePath)
							.attr(attribs).add(axis.gridGroup) :
						null;
			}

			// If the parameter 'old' is set, the current call will be followed
			// by another call, therefore do not do any animations this time
			if (!old && gridLine && gridLinePath) {
				gridLine[tick.isNew ? 'attr' : 'animate']({
					d: gridLinePath,
					opacity: opacity
				});
			}
		}

		// create the tick mark
		if (tickWidth && tickLength) {

			// negate the length
			if (tickPosition === 'inside') {
				tickLength = -tickLength;
			}
			if (axis.opposite) {
				tickLength = -tickLength;
			}

			markPath = tick.getMarkPath(x, y, tickLength, tickWidth * reverseCrisp, horiz, renderer);
			if (mark) { // updating
				mark.animate({
					d: markPath,
					opacity: opacity
				});
			} else { // first time
				tick.mark = renderer.path(
					markPath
				).attr({
					stroke: tickColor,
					'stroke-width': tickWidth,
					opacity: opacity
				}).add(axis.axisGroup);
			}
		}

		// the label is created on init - now move it into place
		if (label && !isNaN(x)) {
			label.xy = xy = tick.getLabelPosition(x, y, label, horiz, labelOptions, tickmarkOffset, index, step);

			// Apply show first and show last. If the tick is both first and last, it is
			// a single centered tick, in which case we show the label anyway (#2100).
			if ((tick.isFirst && !tick.isLast && !pick(options.showFirstLabel, 1)) ||
					(tick.isLast && !tick.isFirst && !pick(options.showLastLabel, 1))) {
				show = false;

			// Handle label overflow and show or hide accordingly
			} else if (horiz && !axis.isRadial && !labelOptions.step && !labelOptions.rotation && !old && opacity !== 0) {
				tick.handleOverflow(xy);
			}

			// apply step
			if (step && index % step) {
				// show those indices dividable by step
				show = false;
			}

			// Set the new position, and show or hide
			if (show && !isNaN(xy.y)) {
				xy.opacity = opacity;
				label[tick.isNew ? 'attr' : 'animate'](xy);
				tick.isNew = false;
			} else {
				label.attr('y', -9999); // #1338
			}
		}
	},

	/**
	 * Destructor for the tick prototype
	 */
	destroy: function () {
		destroyObjectProperties(this, this.axis);
	}
};

/**
 * The object wrapper for plot lines and plot bands
 * @param {Object} options
 */
Highcharts.PlotLineOrBand = function (axis, options) {
	this.axis = axis;

	if (options) {
		this.options = options;
		this.id = options.id;
	}
};

Highcharts.PlotLineOrBand.prototype = {
	
	/**
	 * Render the plot line or plot band. If it is already existing,
	 * move it.
	 */
	render: function () {
		var plotLine = this,
			axis = plotLine.axis,
			horiz = axis.horiz,
			options = plotLine.options,
			optionsLabel = options.label,
			label = plotLine.label,
			width = options.width,
			to = options.to,
			from = options.from,
			isBand = defined(from) && defined(to),
			value = options.value,
			dashStyle = options.dashStyle,
			svgElem = plotLine.svgElem,
			path = [],
			addEvent,
			eventType,
			xs,
			ys,
			x,
			y,
			color = options.color,
			zIndex = options.zIndex,
			events = options.events,
			attribs = {},
			renderer = axis.chart.renderer;

		// logarithmic conversion
		if (axis.isLog) {
			from = log2lin(from);
			to = log2lin(to);
			value = log2lin(value);
		}

		// plot line
		if (width) {
			path = axis.getPlotLinePath(value, width);
			attribs = {
				stroke: color,
				'stroke-width': width
			};
			if (dashStyle) {
				attribs.dashstyle = dashStyle;
			}
		} else if (isBand) { // plot band

			path = axis.getPlotBandPath(from, to, options);
			if (color) {
				attribs.fill = color;
			}
			if (options.borderWidth) {
				attribs.stroke = options.borderColor;
				attribs['stroke-width'] = options.borderWidth;
			}
		} else {
			return;
		}
		// zIndex
		if (defined(zIndex)) {
			attribs.zIndex = zIndex;
		}

		// common for lines and bands
		if (svgElem) {
			if (path) {
				svgElem.animate({
					d: path
				}, null, svgElem.onGetPath);
			} else {
				svgElem.hide();
				svgElem.onGetPath = function () {
					svgElem.show();
				};
				if (label) {
					plotLine.label = label = label.destroy();
				}
			}
		} else if (path && path.length) {
			plotLine.svgElem = svgElem = renderer.path(path)
				.attr(attribs).add();

			// events
			if (events) {
				addEvent = function (eventType) {
					svgElem.on(eventType, function (e) {
						events[eventType].apply(plotLine, [e]);
					});
				};
				for (eventType in events) {
					addEvent(eventType);
				}
			}
		}

		// the plot band/line label
		if (optionsLabel && defined(optionsLabel.text) && path && path.length && axis.width > 0 && axis.height > 0) {
			// apply defaults
			optionsLabel = merge({
				align: horiz && isBand && 'center',
				x: horiz ? !isBand && 4 : 10,
				verticalAlign : !horiz && isBand && 'middle',
				y: horiz ? isBand ? 16 : 10 : isBand ? 6 : -4,
				rotation: horiz && !isBand && 90
			}, optionsLabel);

			// add the SVG element
			if (!label) {
				attribs = {
					align: optionsLabel.textAlign || optionsLabel.align,
					rotation: optionsLabel.rotation
				};
				if (defined(zIndex)) {
					attribs.zIndex = zIndex;
				}
				plotLine.label = label = renderer.text(
						optionsLabel.text,
						0,
						0,
						optionsLabel.useHTML
					)
					.attr(attribs)
					.css(optionsLabel.style)
					.add();
			}

			// get the bounding box and align the label
			// #3000 changed to better handle choice between plotband or plotline
			xs = [path[1], path[4], (isBand ? path[6] : path[1])];
			ys = [path[2], path[5], (isBand ? path[7] : path[2])];
			x = arrayMin(xs);
			y = arrayMin(ys);

			label.align(optionsLabel, false, {
				x: x,
				y: y,
				width: arrayMax(xs) - x,
				height: arrayMax(ys) - y
			});
			label.show();

		} else if (label) { // move out of sight
			label.hide();
		}

		// chainable
		return plotLine;
	},

	/**
	 * Remove the plot line or band
	 */
	destroy: function () {
		// remove it from the lookup
		erase(this.axis.plotLinesAndBands, this);
		
		delete this.axis;
		destroyObjectProperties(this);
	}
};

/**
 * Object with members for extending the Axis prototype
 */

AxisPlotLineOrBandExtension = {

	/**
	 * Create the path for a plot band
	 */ 
	getPlotBandPath: function (from, to) {
		var toPath = this.getPlotLinePath(to, null, null, true),
			path = this.getPlotLinePath(from, null, null, true);

		if (path && toPath && path.toString() !== toPath.toString()) { // #3836
			path.push(
				toPath[4],
				toPath[5],
				toPath[1],
				toPath[2]
			);
		} else { // outside the axis area
			path = null;
		}
		
		return path;
	},

	addPlotBand: function (options) {
		return this.addPlotBandOrLine(options, 'plotBands');
	},
	
	addPlotLine: function (options) {
		return this.addPlotBandOrLine(options, 'plotLines');
	},

	/**
	 * Add a plot band or plot line after render time
	 *
	 * @param options {Object} The plotBand or plotLine configuration object
	 */
	addPlotBandOrLine: function (options, coll) {
		var obj = new Highcharts.PlotLineOrBand(this, options).render(),
			userOptions = this.userOptions;

		if (obj) { // #2189
			// Add it to the user options for exporting and Axis.update
			if (coll) {
				userOptions[coll] = userOptions[coll] || [];
				userOptions[coll].push(options); 
			}
			this.plotLinesAndBands.push(obj); 
		}
		
		return obj;
	},

	/**
	 * Remove a plot band or plot line from the chart by id
	 * @param {Object} id
	 */
	removePlotBandOrLine: function (id) {
		var plotLinesAndBands = this.plotLinesAndBands,
			options = this.options,
			userOptions = this.userOptions,
			i = plotLinesAndBands.length;
		while (i--) {
			if (plotLinesAndBands[i].id === id) {
				plotLinesAndBands[i].destroy();
			}
		}
		each([options.plotLines || [], userOptions.plotLines || [], options.plotBands || [], userOptions.plotBands || []], function (arr) {
			i = arr.length;
			while (i--) {
				if (arr[i].id === id) {
					erase(arr, arr[i]);
				}
			}
		});
	}
};

/**
 * Create a new axis object
 * @param {Object} chart
 * @param {Object} options
 */
var Axis = Highcharts.Axis = function () {
	this.init.apply(this, arguments);
};

Axis.prototype = {

	/**
	 * Default options for the X axis - the Y axis has extended defaults
	 */
	defaultOptions: {
		// allowDecimals: null,
		// alternateGridColor: null,
		// categories: [],
		dateTimeLabelFormats: {
			millisecond: '%H:%M:%S.%L',
			second: '%H:%M:%S',
			minute: '%H:%M',
			hour: '%H:%M',
			day: '%e. %b',
			week: '%e. %b',
			month: '%b \'%y',
			year: '%Y'
		},
		endOnTick: false,
		gridLineColor: '#D8D8D8',
		// gridLineDashStyle: 'solid',
		// gridLineWidth: 0,
		// reversed: false,

		labels: {
			enabled: true,
			// rotation: 0,
			// align: 'center',
			// step: null,
			style: {
				color: '#606060',
				cursor: 'default',
				fontSize: '11px'
			},
			x: 0,
			y: 15
			/*formatter: function () {
				return this.value;
			},*/
		},
		lineColor: '#C0D0E0',
		lineWidth: 1,
		//linkedTo: null,
		//max: undefined,
		//min: undefined,
		minPadding: 0.01,
		maxPadding: 0.01,
		//minRange: null,
		minorGridLineColor: '#E0E0E0',
		// minorGridLineDashStyle: null,
		minorGridLineWidth: 1,
		minorTickColor: '#A0A0A0',
		//minorTickInterval: null,
		minorTickLength: 2,
		minorTickPosition: 'outside', // inside or outside
		//minorTickWidth: 0,
		//opposite: false,
		//offset: 0,
		//plotBands: [{
		//	events: {},
		//	zIndex: 1,
		//	labels: { align, x, verticalAlign, y, style, rotation, textAlign }
		//}],
		//plotLines: [{
		//	events: {}
		//  dashStyle: {}
		//	zIndex:
		//	labels: { align, x, verticalAlign, y, style, rotation, textAlign }
		//}],
		//reversed: false,
		// showFirstLabel: true,
		// showLastLabel: true,
		startOfWeek: 1,
		startOnTick: false,
		tickColor: '#C0D0E0',
		//tickInterval: null,
		tickLength: 10,
		tickmarkPlacement: 'between', // on or between
		tickPixelInterval: 100,
		tickPosition: 'outside',
		tickWidth: 1,
		title: {
			//text: null,
			align: 'middle', // low, middle or high
			//margin: 0 for horizontal, 10 for vertical axes,
			//rotation: 0,
			//side: 'outside',
			style: {
				color: '#707070'
			}
			//x: 0,
			//y: 0
		},
		type: 'linear' // linear, logarithmic or datetime
	},

	/**
	 * This options set extends the defaultOptions for Y axes
	 */
	defaultYAxisOptions: {
		endOnTick: true,
		gridLineWidth: 1,
		tickPixelInterval: 72,
		showLastLabel: true,
		labels: {
			x: -8,
			y: 3
		},
		lineWidth: 0,
		maxPadding: 0.05,
		minPadding: 0.05,
		startOnTick: true,
		tickWidth: 0,
		title: {
			rotation: 270,
			text: 'Values'
		},
		stackLabels: {
			enabled: false,
			//align: dynamic,
			//y: dynamic,
			//x: dynamic,
			//verticalAlign: dynamic,
			//textAlign: dynamic,
			//rotation: 0,
			formatter: function () {
				return Highcharts.numberFormat(this.total, -1);
			},
			style: merge(defaultPlotOptions.line.dataLabels.style, { color: '#000000' })
		}
	},

	/**
	 * These options extend the defaultOptions for left axes
	 */
	defaultLeftAxisOptions: {
		labels: {
			x: -15,
			y: null
		},
		title: {
			rotation: 270
		}
	},

	/**
	 * These options extend the defaultOptions for right axes
	 */
	defaultRightAxisOptions: {
		labels: {
			x: 15,
			y: null
		},
		title: {
			rotation: 90
		}
	},

	/**
	 * These options extend the defaultOptions for bottom axes
	 */
	defaultBottomAxisOptions: {
		labels: {
			autoRotation: [-45],
			x: 0,
			y: null // based on font size
			// overflow: undefined,
			// staggerLines: null
		},
		title: {
			rotation: 0
		}
	},
	/**
	 * These options extend the defaultOptions for top axes
	 */
	defaultTopAxisOptions: {
		labels: {
			autoRotation: [-45],
			x: 0,
			y: -15
			// overflow: undefined
			// staggerLines: null
		},
		title: {
			rotation: 0
		}
	},

	/**
	 * Initialize the axis
	 */
	init: function (chart, userOptions) {


		var isXAxis = userOptions.isX,
			axis = this;

		// Flag, is the axis horizontal
		axis.horiz = chart.inverted ? !isXAxis : isXAxis;

		// Flag, isXAxis
		axis.isXAxis = isXAxis;
		axis.coll = isXAxis ? 'xAxis' : 'yAxis';

		axis.opposite = userOptions.opposite; // needed in setOptions
		axis.side = userOptions.side || (axis.horiz ?
				(axis.opposite ? 0 : 2) : // top : bottom
				(axis.opposite ? 1 : 3));  // right : left

		axis.setOptions(userOptions);


		var options = this.options,
			type = options.type,
			isDatetimeAxis = type === 'datetime';

		axis.labelFormatter = options.labels.formatter || axis.defaultLabelFormatter; // can be overwritten by dynamic format


		// Flag, stagger lines or not
		axis.userOptions = userOptions;

		//axis.axisTitleMargin = UNDEFINED,// = options.title.margin,
		axis.minPixelPadding = 0;
		//axis.ignoreMinPadding = UNDEFINED; // can be set to true by a column or bar series
		//axis.ignoreMaxPadding = UNDEFINED;

		axis.chart = chart;
		axis.reversed = options.reversed;
		axis.zoomEnabled = options.zoomEnabled !== false;

		// Initial categories
		axis.categories = options.categories || type === 'category';
		axis.names = axis.names || []; // Preserve on update (#3830)

		// Elements
		//axis.axisGroup = UNDEFINED;
		//axis.gridGroup = UNDEFINED;
		//axis.axisTitle = UNDEFINED;
		//axis.axisLine = UNDEFINED;

		// Shorthand types
		axis.isLog = type === 'logarithmic';
		axis.isDatetimeAxis = isDatetimeAxis;

		// Flag, if axis is linked to another axis
		axis.isLinked = defined(options.linkedTo);
		// Linked axis.
		//axis.linkedParent = UNDEFINED;

		// Tick positions
		//axis.tickPositions = UNDEFINED; // array containing predefined positions
		// Tick intervals
		//axis.tickInterval = UNDEFINED;
		//axis.minorTickInterval = UNDEFINED;

		
		// Major ticks
		axis.ticks = {};
		axis.labelEdge = [];
		// Minor ticks
		axis.minorTicks = {};

		// List of plotLines/Bands
		axis.plotLinesAndBands = [];

		// Alternate bands
		axis.alternateBands = {};

		// Axis metrics
		//axis.left = UNDEFINED;
		//axis.top = UNDEFINED;
		//axis.width = UNDEFINED;
		//axis.height = UNDEFINED;
		//axis.bottom = UNDEFINED;
		//axis.right = UNDEFINED;
		//axis.transA = UNDEFINED;
		//axis.transB = UNDEFINED;
		//axis.oldTransA = UNDEFINED;
		axis.len = 0;
		//axis.oldMin = UNDEFINED;
		//axis.oldMax = UNDEFINED;
		//axis.oldUserMin = UNDEFINED;
		//axis.oldUserMax = UNDEFINED;
		//axis.oldAxisLength = UNDEFINED;
		axis.minRange = axis.userMinRange = options.minRange || options.maxZoom;
		axis.range = options.range;
		axis.offset = options.offset || 0;


		// Dictionary for stacks
		axis.stacks = {};
		axis.oldStacks = {};
		
		// Min and max in the data
		//axis.dataMin = UNDEFINED,
		//axis.dataMax = UNDEFINED,

		// The axis range
		axis.max = null;
		axis.min = null;

		// User set min and max
		//axis.userMin = UNDEFINED,
		//axis.userMax = UNDEFINED,

		// Crosshair options
		axis.crosshair = pick(options.crosshair, splat(chart.options.tooltip.crosshairs)[isXAxis ? 0 : 1], false);
		// Run Axis

		var eventType,
			events = axis.options.events;

		// Register
		if (inArray(axis, chart.axes) === -1) { // don't add it again on Axis.update()
			if (isXAxis && !this.isColorAxis) { // #2713
				chart.axes.splice(chart.xAxis.length, 0, axis);
			} else {
				chart.axes.push(axis);
			}

			chart[axis.coll].push(axis);
		}

		axis.series = axis.series || []; // populated by Series

		// inverted charts have reversed xAxes as default
		if (chart.inverted && isXAxis && axis.reversed === UNDEFINED) {
			axis.reversed = true;
		}

		axis.removePlotBand = axis.removePlotBandOrLine;
		axis.removePlotLine = axis.removePlotBandOrLine;


		// register event listeners
		for (eventType in events) {
			addEvent(axis, eventType, events[eventType]);
		}

		// extend logarithmic axis
		if (axis.isLog) {
			axis.val2lin = log2lin;
			axis.lin2val = lin2log;
		}
	},

	/**
	 * Merge and set options
	 */
	setOptions: function (userOptions) {
		this.options = merge(
			this.defaultOptions,
			this.isXAxis ? {} : this.defaultYAxisOptions,
			[this.defaultTopAxisOptions, this.defaultRightAxisOptions,
				this.defaultBottomAxisOptions, this.defaultLeftAxisOptions][this.side],
			merge(
				defaultOptions[this.coll], // if set in setOptions (#1053)
				userOptions
			)
		);
	},

	/**
	 * The default label formatter. The context is a special config object for the label.
	 */
	defaultLabelFormatter: function () {
		var axis = this.axis,
			value = this.value,
			categories = axis.categories,
			dateTimeLabelFormat = this.dateTimeLabelFormat,
			numericSymbols = defaultOptions.lang.numericSymbols,
			i = numericSymbols && numericSymbols.length,
			multi,
			ret,
			formatOption = axis.options.labels.format,

			// make sure the same symbol is added for all labels on a linear axis
			numericSymbolDetector = axis.isLog ? value : axis.tickInterval;

		if (formatOption) {
			ret = format(formatOption, this);

		} else if (categories) {
			ret = value;

		} else if (dateTimeLabelFormat) { // datetime axis
			ret = dateFormat(dateTimeLabelFormat, value);

		} else if (i && numericSymbolDetector >= 1000) {
			// Decide whether we should add a numeric symbol like k (thousands) or M (millions).
			// If we are to enable this in tooltip or other places as well, we can move this
			// logic to the numberFormatter and enable it by a parameter.
			while (i-- && ret === UNDEFINED) {
				multi = Math.pow(1000, i + 1);
				if (numericSymbolDetector >= multi && (value * 10) % multi === 0 && numericSymbols[i] !== null) {
					ret = Highcharts.numberFormat(value / multi, -1) + numericSymbols[i];
				}
			}
		}

		if (ret === UNDEFINED) {
			if (mathAbs(value) >= 10000) { // add thousands separators
				ret = Highcharts.numberFormat(value, -1);

			} else { // small numbers
				ret = Highcharts.numberFormat(value, -1, UNDEFINED, ''); // #2466
			}
		}

		return ret;
	},

	/**
	 * Get the minimum and maximum for the series of each axis
	 */
	getSeriesExtremes: function () {
		var axis = this,
			chart = axis.chart;

		axis.hasVisibleSeries = false;

		// Reset properties in case we're redrawing (#3353)
		axis.dataMin = axis.dataMax = axis.ignoreMinPadding = axis.ignoreMaxPadding = null;
		
		if (axis.buildStacks) {
			axis.buildStacks();
		}

		// loop through this axis' series
		each(axis.series, function (series) {

			if (series.visible || !chart.options.chart.ignoreHiddenSeries) {

				var seriesOptions = series.options,
					xData,
					threshold = seriesOptions.threshold,
					seriesDataMin,
					seriesDataMax;

				axis.hasVisibleSeries = true;

				// Validate threshold in logarithmic axes
				if (axis.isLog && threshold <= 0) {
					threshold = null;
				}

				// Get dataMin and dataMax for X axes
				if (axis.isXAxis) {
					xData = series.xData;
					if (xData.length) {
						axis.dataMin = mathMin(pick(axis.dataMin, xData[0]), arrayMin(xData));
						axis.dataMax = mathMax(pick(axis.dataMax, xData[0]), arrayMax(xData));
					}

				// Get dataMin and dataMax for Y axes, as well as handle stacking and processed data
				} else {

					// Get this particular series extremes
					series.getExtremes();
					seriesDataMax = series.dataMax;
					seriesDataMin = series.dataMin;

					// Get the dataMin and dataMax so far. If percentage is used, the min and max are
					// always 0 and 100. If seriesDataMin and seriesDataMax is null, then series
					// doesn't have active y data, we continue with nulls
					if (defined(seriesDataMin) && defined(seriesDataMax)) {
						axis.dataMin = mathMin(pick(axis.dataMin, seriesDataMin), seriesDataMin);
						axis.dataMax = mathMax(pick(axis.dataMax, seriesDataMax), seriesDataMax);
					}

					// Adjust to threshold
					if (defined(threshold)) {
						if (axis.dataMin >= threshold) {
							axis.dataMin = threshold;
							axis.ignoreMinPadding = true;
						} else if (axis.dataMax < threshold) {
							axis.dataMax = threshold;
							axis.ignoreMaxPadding = true;
						}
					}
				}
			}
		});
	},

	/**
	 * Translate from axis value to pixel position on the chart, or back
	 *
	 */
	translate: function (val, backwards, cvsCoord, old, handleLog, pointPlacement) {
		var axis = this.linkedParent || this, // #1417
			sign = 1,
			cvsOffset = 0,
			localA = old ? axis.oldTransA : axis.transA,
			localMin = old ? axis.oldMin : axis.min,
			returnValue,
			minPixelPadding = axis.minPixelPadding,
			doPostTranslate = (axis.doPostTranslate || (axis.isLog && handleLog)) && axis.lin2val;

		if (!localA) {
			localA = axis.transA;
		}

		// In vertical axes, the canvas coordinates start from 0 at the top like in
		// SVG.
		if (cvsCoord) {
			sign *= -1; // canvas coordinates inverts the value
			cvsOffset = axis.len;
		}

		// Handle reversed axis
		if (axis.reversed) {
			sign *= -1;
			cvsOffset -= sign * (axis.sector || axis.len);
		}

		// From pixels to value
		if (backwards) { // reverse translation

			val = val * sign + cvsOffset;
			val -= minPixelPadding;
			returnValue = val / localA + localMin; // from chart pixel to value
			if (doPostTranslate) { // log and ordinal axes
				returnValue = axis.lin2val(returnValue);
			}

		// From value to pixels
		} else {
			if (doPostTranslate) { // log and ordinal axes
				val = axis.val2lin(val);
			}
			if (pointPlacement === 'between') {
				pointPlacement = 0.5;
			}
			returnValue = sign * (val - localMin) * localA + cvsOffset + (sign * minPixelPadding) +
				(isNumber(pointPlacement) ? localA * pointPlacement * axis.pointRange : 0);
		}

		return returnValue;
	},

	/**
	 * Utility method to translate an axis value to pixel position.
	 * @param {Number} value A value in terms of axis units
	 * @param {Boolean} paneCoordinates Whether to return the pixel coordinate relative to the chart
	 *        or just the axis/pane itself.
	 */
	toPixels: function (value, paneCoordinates) {
		return this.translate(value, false, !this.horiz, null, true) + (paneCoordinates ? 0 : this.pos);
	},

	/*
	 * Utility method to translate a pixel position in to an axis value
	 * @param {Number} pixel The pixel value coordinate
	 * @param {Boolean} paneCoordiantes Whether the input pixel is relative to the chart or just the
	 *        axis/pane itself.
	 */
	toValue: function (pixel, paneCoordinates) {
		return this.translate(pixel - (paneCoordinates ? 0 : this.pos), true, !this.horiz, null, true);
	},

	/**
	 * Create the path for a plot line that goes from the given value on
	 * this axis, across the plot to the opposite side
	 * @param {Number} value
	 * @param {Number} lineWidth Used for calculation crisp line
	 * @param {Number] old Use old coordinates (for resizing and rescaling)
	 */
	getPlotLinePath: function (value, lineWidth, old, force, translatedValue) {
		var axis = this,
			chart = axis.chart,
			axisLeft = axis.left,
			axisTop = axis.top,
			x1,
			y1,
			x2,
			y2,
			cHeight = (old && chart.oldChartHeight) || chart.chartHeight,
			cWidth = (old && chart.oldChartWidth) || chart.chartWidth,
			skip,
			transB = axis.transB,
			/**
			 * Check if x is between a and b. If not, either move to a/b or skip, 
			 * depending on the force parameter.
			 */
			between = function (x, a, b) {
				if (x < a || x > b) {
					if (force) {
						x = mathMin(mathMax(a, x), b);
					} else {
						skip = true;
					}
				}
				return x;
			};

		translatedValue = pick(translatedValue, axis.translate(value, null, null, old));
		x1 = x2 = mathRound(translatedValue + transB);
		y1 = y2 = mathRound(cHeight - translatedValue - transB);

		if (isNaN(translatedValue)) { // no min or max
			skip = true;

		} else if (axis.horiz) {
			y1 = axisTop;
			y2 = cHeight - axis.bottom;
			x1 = x2 = between(x1, axisLeft, axisLeft + axis.width);
		} else {
			x1 = axisLeft;
			x2 = cWidth - axis.right;
			y1 = y2 = between(y1, axisTop, axisTop + axis.height);
		}
		return skip && !force ?
			null :
			chart.renderer.crispLine([M, x1, y1, L, x2, y2], lineWidth || 1);
	},

	/**
	 * Set the tick positions of a linear axis to round values like whole tens or every five.
	 */
	getLinearTickPositions: function (tickInterval, min, max) {
		var pos,
			lastPos,
			roundedMin = correctFloat(mathFloor(min / tickInterval) * tickInterval),
			roundedMax = correctFloat(mathCeil(max / tickInterval) * tickInterval),
			tickPositions = [];

		// For single points, add a tick regardless of the relative position (#2662)
		if (min === max && isNumber(min)) {
			return [min];
		}

		// Populate the intermediate values
		pos = roundedMin;
		while (pos <= roundedMax) {

			// Place the tick on the rounded value
			tickPositions.push(pos);

			// Always add the raw tickInterval, not the corrected one.
			pos = correctFloat(pos + tickInterval);

			// If the interval is not big enough in the current min - max range to actually increase
			// the loop variable, we need to break out to prevent endless loop. Issue #619
			if (pos === lastPos) {
				break;
			}

			// Record the last value
			lastPos = pos;
		}
		return tickPositions;
	},

	/**
	 * Return the minor tick positions. For logarithmic axes, reuse the same logic
	 * as for major ticks.
	 */
	getMinorTickPositions: function () {
		var axis = this,
			options = axis.options,
			tickPositions = axis.tickPositions,
			minorTickInterval = axis.minorTickInterval,
			minorTickPositions = [],
			pos,
			i,
			min = axis.min,
			max = axis.max,
			range = max - min,
			len;

		// If minor ticks get too dense, they are hard to read, and may cause long running script. So we don't draw them.
		if (range && range / minorTickInterval < axis.len / 3) { // #3875

			if (axis.isLog) {
				len = tickPositions.length;
				for (i = 1; i < len; i++) {
					minorTickPositions = minorTickPositions.concat(
						axis.getLogTickPositions(minorTickInterval, tickPositions[i - 1], tickPositions[i], true)
					);
				}
			} else if (axis.isDatetimeAxis && options.minorTickInterval === 'auto') { // #1314
				minorTickPositions = minorTickPositions.concat(
					axis.getTimeTicks(
						axis.normalizeTimeTickInterval(minorTickInterval),
						min,
						max,
						options.startOfWeek
					)
				);
			} else {
				for (pos = min + (tickPositions[0] - min) % minorTickInterval; pos <= max; pos += minorTickInterval) {
					minorTickPositions.push(pos);
				}
			}
		}

		axis.trimTicks(minorTickPositions); // #3652 #3743
		return minorTickPositions;
	},

	/**
	 * Adjust the min and max for the minimum range. Keep in mind that the series data is
	 * not yet processed, so we don't have information on data cropping and grouping, or
	 * updated axis.pointRange or series.pointRange. The data can't be processed until
	 * we have finally established min and max.
	 */
	adjustForMinRange: function () {
		var axis = this,
			options = axis.options,
			min = axis.min,
			max = axis.max,
			zoomOffset,
			spaceAvailable = axis.dataMax - axis.dataMin >= axis.minRange,
			closestDataRange,
			i,
			distance,
			xData,
			loopLength,
			minArgs,
			maxArgs;

		// Set the automatic minimum range based on the closest point distance
		if (axis.isXAxis && axis.minRange === UNDEFINED && !axis.isLog) {

			if (defined(options.min) || defined(options.max)) {
				axis.minRange = null; // don't do this again

			} else {

				// Find the closest distance between raw data points, as opposed to
				// closestPointRange that applies to processed points (cropped and grouped)
				each(axis.series, function (series) {
					xData = series.xData;
					loopLength = series.xIncrement ? 1 : xData.length - 1;
					for (i = loopLength; i > 0; i--) {
						distance = xData[i] - xData[i - 1];
						if (closestDataRange === UNDEFINED || distance < closestDataRange) {
							closestDataRange = distance;
						}
					}
				});
				axis.minRange = mathMin(closestDataRange * 5, axis.dataMax - axis.dataMin);
			}
		}

		// if minRange is exceeded, adjust
		if (max - min < axis.minRange) {
			var minRange = axis.minRange;
			zoomOffset = (minRange - max + min) / 2;

			// if min and max options have been set, don't go beyond it
			minArgs = [min - zoomOffset, pick(options.min, min - zoomOffset)];
			if (spaceAvailable) { // if space is available, stay within the data range
				minArgs[2] = axis.dataMin;
			}
			min = arrayMax(minArgs);

			maxArgs = [min + minRange, pick(options.max, min + minRange)];
			if (spaceAvailable) { // if space is availabe, stay within the data range
				maxArgs[2] = axis.dataMax;
			}

			max = arrayMin(maxArgs);

			// now if the max is adjusted, adjust the min back
			if (max - min < minRange) {
				minArgs[0] = max - minRange;
				minArgs[1] = pick(options.min, max - minRange);
				min = arrayMax(minArgs);
			}
		}

		// Record modified extremes
		axis.min = min;
		axis.max = max;
	},

	/**
	 * Update translation information
	 */
	setAxisTranslation: function (saveOld) {
		var axis = this,
			range = axis.max - axis.min,
			pointRange = axis.axisPointRange || 0,
			closestPointRange,
			minPointOffset = 0,
			pointRangePadding = 0,
			linkedParent = axis.linkedParent,
			ordinalCorrection,
			hasCategories = !!axis.categories,
			transA = axis.transA,
			isXAxis = axis.isXAxis;

		// Adjust translation for padding. Y axis with categories need to go through the same (#1784).
		if (isXAxis || hasCategories || pointRange) {
			if (linkedParent) {
				minPointOffset = linkedParent.minPointOffset;
				pointRangePadding = linkedParent.pointRangePadding;

			} else {
				each(axis.series, function (series) {
					var seriesPointRange = hasCategories ? 1 : (isXAxis ? series.pointRange : (axis.axisPointRange || 0)), // #2806
						pointPlacement = series.options.pointPlacement,
						seriesClosestPointRange = series.closestPointRange;

					if (seriesPointRange > range) { // #1446
						seriesPointRange = 0;
					}
					pointRange = mathMax(pointRange, seriesPointRange);

					if (!axis.single) {
						// minPointOffset is the value padding to the left of the axis in order to make
						// room for points with a pointRange, typically columns. When the pointPlacement option
						// is 'between' or 'on', this padding does not apply.
						minPointOffset = mathMax(
							minPointOffset,
							isString(pointPlacement) ? 0 : seriesPointRange / 2
						);

						// Determine the total padding needed to the length of the axis to make room for the
						// pointRange. If the series' pointPlacement is 'on', no padding is added.
						pointRangePadding = mathMax(
							pointRangePadding,
							pointPlacement === 'on' ? 0 : seriesPointRange
						);
					}

					// Set the closestPointRange
					if (!series.noSharedTooltip && defined(seriesClosestPointRange)) {
						closestPointRange = defined(closestPointRange) ?
							mathMin(closestPointRange, seriesClosestPointRange) :
							seriesClosestPointRange;
					}
				});
			}

			// Record minPointOffset and pointRangePadding
			ordinalCorrection = axis.ordinalSlope && closestPointRange ? axis.ordinalSlope / closestPointRange : 1; // #988, #1853
			axis.minPointOffset = minPointOffset = minPointOffset * ordinalCorrection;
			axis.pointRangePadding = pointRangePadding = pointRangePadding * ordinalCorrection;

			// pointRange means the width reserved for each point, like in a column chart
			axis.pointRange = mathMin(pointRange, range);

			// closestPointRange means the closest distance between points. In columns
			// it is mostly equal to pointRange, but in lines pointRange is 0 while closestPointRange
			// is some other value
			if (isXAxis) {
				axis.closestPointRange = closestPointRange;
			}
		}

		// Secondary values
		if (saveOld) {
			axis.oldTransA = transA;
		}
		axis.translationSlope = axis.transA = transA = axis.len / ((range + pointRangePadding) || 1);
		axis.transB = axis.horiz ? axis.left : axis.bottom; // translation addend
		axis.minPixelPadding = transA * minPointOffset;
	},

	/**
	 * Set the tick positions to round values and optionally extend the extremes
	 * to the nearest tick
	 */
	setTickInterval: function (secondPass) {
		var axis = this,
			chart = axis.chart,
			options = axis.options,
			isLog = axis.isLog,
			isDatetimeAxis = axis.isDatetimeAxis,
			isXAxis = axis.isXAxis,
			isLinked = axis.isLinked,
			maxPadding = options.maxPadding,
			minPadding = options.minPadding,
			length,
			linkedParentExtremes,
			tickIntervalOption = options.tickInterval,
			minTickInterval,
			tickPixelIntervalOption = options.tickPixelInterval,
			categories = axis.categories;

		if (!isDatetimeAxis && !categories && !isLinked) {
			this.getTickAmount();
		}

		// linked axis gets the extremes from the parent axis
		if (isLinked) {
			axis.linkedParent = chart[axis.coll][options.linkedTo];
			linkedParentExtremes = axis.linkedParent.getExtremes();
			axis.min = pick(linkedParentExtremes.min, linkedParentExtremes.dataMin);
			axis.max = pick(linkedParentExtremes.max, linkedParentExtremes.dataMax);
			if (options.type !== axis.linkedParent.options.type) {
				error(11, 1); // Can't link axes of different type
			}
		} else { // initial min and max from the extreme data values
			axis.min = pick(axis.userMin, options.min, axis.dataMin);
			axis.max = pick(axis.userMax, options.max, axis.dataMax);
		}

		if (isLog) {
			if (!secondPass && mathMin(axis.min, pick(axis.dataMin, axis.min)) <= 0) { // #978
				error(10, 1); // Can't plot negative values on log axis
			}
			axis.min = correctFloat(log2lin(axis.min)); // correctFloat cures #934
			axis.max = correctFloat(log2lin(axis.max));
		}

		// handle zoomed range
		if (axis.range && defined(axis.max)) {
			axis.userMin = axis.min = mathMax(axis.min, axis.max - axis.range); // #618
			axis.userMax = axis.max;

			axis.range = null;  // don't use it when running setExtremes
		}

		// Hook for adjusting this.min and this.max. Used by bubble series.
		if (axis.beforePadding) {
			axis.beforePadding();
		}

		// adjust min and max for the minimum range
		axis.adjustForMinRange();

		// Pad the values to get clear of the chart's edges. To avoid tickInterval taking the padding
		// into account, we do this after computing tick interval (#1337).
		if (!categories && !axis.axisPointRange && !axis.usePercentage && !isLinked && defined(axis.min) && defined(axis.max)) {
			length = axis.max - axis.min;
			if (length) {
				if (!defined(options.min) && !defined(axis.userMin) && minPadding && (axis.dataMin < 0 || !axis.ignoreMinPadding)) {
					axis.min -= length * minPadding;
				}
				if (!defined(options.max) && !defined(axis.userMax)  && maxPadding && (axis.dataMax > 0 || !axis.ignoreMaxPadding)) {
					axis.max += length * maxPadding;
				}
			}
		}

		// Stay within floor and ceiling
		if (isNumber(options.floor)) {
			axis.min = mathMax(axis.min, options.floor);
		}
		if (isNumber(options.ceiling)) {
			axis.max = mathMin(axis.max, options.ceiling);
		}

		// get tickInterval
		if (axis.min === axis.max || axis.min === undefined || axis.max === undefined) {
			axis.tickInterval = 1;
		} else if (isLinked && !tickIntervalOption &&
				tickPixelIntervalOption === axis.linkedParent.options.tickPixelInterval) {
			axis.tickInterval = tickIntervalOption = axis.linkedParent.tickInterval;
		} else {
			axis.tickInterval = pick(
				tickIntervalOption,
				this.tickAmount ? ((axis.max - axis.min) / mathMax(this.tickAmount - 1, 1)) : undefined,
				categories ? // for categoried axis, 1 is default, for linear axis use tickPix
					1 :
					// don't let it be more than the data range
					(axis.max - axis.min) * tickPixelIntervalOption / mathMax(axis.len, tickPixelIntervalOption)
			);
		}

		// Now we're finished detecting min and max, crop and group series data. This
		// is in turn needed in order to find tick positions in ordinal axes.
		if (isXAxis && !secondPass) {
			each(axis.series, function (series) {
				series.processData(axis.min !== axis.oldMin || axis.max !== axis.oldMax);
			});
		}

		// set the translation factor used in translate function
		axis.setAxisTranslation(true);

		// hook for ordinal axes and radial axes
		if (axis.beforeSetTickPositions) {
			axis.beforeSetTickPositions();
		}

		// hook for extensions, used in Highstock ordinal axes
		if (axis.postProcessTickInterval) {
			axis.tickInterval = axis.postProcessTickInterval(axis.tickInterval);
		}

		// In column-like charts, don't cramp in more ticks than there are points (#1943)
		if (axis.pointRange) {
			axis.tickInterval = mathMax(axis.pointRange, axis.tickInterval);
		}

		// Before normalizing the tick interval, handle minimum tick interval. This applies only if tickInterval is not defined.
		minTickInterval = pick(options.minTickInterval, axis.isDatetimeAxis && axis.closestPointRange);
		if (!tickIntervalOption && axis.tickInterval < minTickInterval) {
			axis.tickInterval = minTickInterval;
		}

		// for linear axes, get magnitude and normalize the interval
		if (!isDatetimeAxis && !isLog && !tickIntervalOption) {
			axis.tickInterval = normalizeTickInterval(
				axis.tickInterval, 
				null, 
				getMagnitude(axis.tickInterval), 
				// If the tick interval is between 0.5 and 5 and the axis max is in the order of
				// thousands, chances are we are dealing with years. Don't allow decimals. #3363.
				pick(options.allowDecimals, !(axis.tickInterval > 0.5 && axis.tickInterval < 5 && axis.max > 1000 && axis.max < 9999)),
				!!this.tickAmount
			);
		}
		
		// Prevent ticks from getting so close that we can't draw the labels
		if (!this.tickAmount && this.len) { // Color axis with disabled legend has no length
			axis.tickInterval = axis.unsquish();
		}

		this.setTickPositions();
	},

	/**
	 * Now we have computed the normalized tickInterval, get the tick positions
	 */
	setTickPositions: function () {

		var options = this.options,
			tickPositions,
			tickPositionsOption = options.tickPositions,
			tickPositioner = options.tickPositioner,
			startOnTick = options.startOnTick,
			endOnTick = options.endOnTick,
			single;

		// Set the tickmarkOffset
		this.tickmarkOffset = (this.categories && options.tickmarkPlacement === 'between' && 
			this.tickInterval === 1) ? 0.5 : 0; // #3202


		// get minorTickInterval
		this.minorTickInterval = options.minorTickInterval === 'auto' && this.tickInterval ?
			this.tickInterval / 5 : options.minorTickInterval;

		// Find the tick positions
		this.tickPositions = tickPositions = tickPositionsOption && tickPositionsOption.slice(); // Work on a copy (#1565)
		if (!tickPositions) {

			if (this.isDatetimeAxis) {
				tickPositions = this.getTimeTicks(
					this.normalizeTimeTickInterval(this.tickInterval, options.units),
					this.min,
					this.max,
					options.startOfWeek,
					this.ordinalPositions,
					this.closestPointRange,
					true
				);
			} else if (this.isLog) {
				tickPositions = this.getLogTickPositions(this.tickInterval, this.min, this.max);
			} else {
				tickPositions = this.getLinearTickPositions(this.tickInterval, this.min, this.max);
			}

			this.tickPositions = tickPositions;

			// Run the tick positioner callback, that allows modifying auto tick positions.
			if (tickPositioner) {
				tickPositioner = tickPositioner.apply(this, [this.min, this.max]);
				if (tickPositioner) {
					this.tickPositions = tickPositions = tickPositioner;
				}
			}

		}

		if (!this.isLinked) {

			// reset min/max or remove extremes based on start/end on tick
			this.trimTicks(tickPositions, startOnTick, endOnTick);

			// When there is only one point, or all points have the same value on this axis, then min
			// and max are equal and tickPositions.length is 0 or 1. In this case, add some padding
			// in order to center the point, but leave it with one tick. #1337.
			if (this.min === this.max && defined(this.min) && !this.tickAmount) {
				// Substract half a unit (#2619, #2846, #2515, #3390)
				single = true;
				this.min -= 0.5;
				this.max += 0.5;
			}
			this.single = single;

			if (!tickPositionsOption && !tickPositioner) {
				this.adjustTickAmount();
			}
		}
	},

	/**
	 * Handle startOnTick and endOnTick by either adapting to padding min/max or rounded min/max
	 */
	trimTicks: function (tickPositions, startOnTick, endOnTick) {
		var roundedMin = tickPositions[0],
			roundedMax = tickPositions[tickPositions.length - 1],
			minPointOffset = this.minPointOffset || 0;
			
		if (startOnTick) {
			this.min = roundedMin;
		} else if (this.min - minPointOffset > roundedMin) {
			tickPositions.shift();
		}

		if (endOnTick) {
			this.max = roundedMax;
		} else if (this.max + minPointOffset < roundedMax) {
			tickPositions.pop();
		}

		// If no tick are left, set one tick in the middle (#3195) 
		if (tickPositions.length === 0 && defined(roundedMin)) {
			tickPositions.push((roundedMax + roundedMin) / 2);
		}		
	},

	/**
	 * Set the max ticks of either the x and y axis collection
	 */
	getTickAmount: function () {
		var others = {}, // Whether there is another axis to pair with this one
			hasOther,
			options = this.options,
			tickAmount = options.tickAmount,
			tickPixelInterval = options.tickPixelInterval;

		if (!defined(options.tickInterval) && this.len < tickPixelInterval && !this.isRadial &&
				!this.isLog && options.startOnTick && options.endOnTick) {
			tickAmount = 2;
		}

		if (!tickAmount && this.chart.options.chart.alignTicks !== false && options.alignTicks !== false) {
			// Check if there are multiple axes in the same pane
			each(this.chart[this.coll], function (axis) {
				var options = axis.options,
					horiz = axis.horiz,
					key = [horiz ? options.left : options.top, horiz ? options.width : options.height, options.pane].join(',');
				
				if (others[key]) {
					if (axis.series.length) {
						hasOther = true; // #4201
					}
				} else {
					others[key] = 1;
				}
			});

			if (hasOther) {
				// Add 1 because 4 tick intervals require 5 ticks (including first and last)
				tickAmount = mathCeil(this.len / tickPixelInterval) + 1;
			}
		}

		// For tick amounts of 2 and 3, compute five ticks and remove the intermediate ones. This
		// prevents the axis from adding ticks that are too far away from the data extremes.
		if (tickAmount < 4) {
			this.finalTickAmt = tickAmount;
			tickAmount = 5;
		}
		
		this.tickAmount = tickAmount;
	},

	/**
	 * When using multiple axes, adjust the number of ticks to match the highest
	 * number of ticks in that group
	 */
	adjustTickAmount: function () {
		var tickInterval = this.tickInterval,
			tickPositions = this.tickPositions,
			tickAmount = this.tickAmount,
			finalTickAmt = this.finalTickAmt,
			currentTickAmount = tickPositions && tickPositions.length,
			i,
			len;

		if (currentTickAmount < tickAmount) { // TODO: Check #3411
			while (tickPositions.length < tickAmount) {
				tickPositions.push(correctFloat(
					tickPositions[tickPositions.length - 1] + tickInterval
				));
			}
			this.transA *= (currentTickAmount - 1) / (tickAmount - 1);
			this.max = tickPositions[tickPositions.length - 1];

		// We have too many ticks, run second pass to try to reduce ticks
		} else if (currentTickAmount > tickAmount) {
			this.tickInterval *= 2;
			this.setTickPositions();
		}

		// The finalTickAmt property is set in getTickAmount
		if (defined(finalTickAmt)) {
			i = len = tickPositions.length;
			while (i--) {
				if (
					(finalTickAmt === 3 && i % 2 === 1) || // Remove every other tick
					(finalTickAmt <= 2 && i > 0 && i < len - 1) // Remove all but first and last
				) {
					tickPositions.splice(i, 1);
				}	
			}
			this.finalTickAmt = UNDEFINED;
		}
	},

	/**
	 * Set the scale based on data min and max, user set min and max or options
	 *
	 */
	setScale: function () {
		var axis = this,
			stacks = axis.stacks,
			type,
			i,
			isDirtyData,
			isDirtyAxisLength;

		axis.oldMin = axis.min;
		axis.oldMax = axis.max;
		axis.oldAxisLength = axis.len;

		// set the new axisLength
		axis.setAxisSize();
		//axisLength = horiz ? axisWidth : axisHeight;
		isDirtyAxisLength = axis.len !== axis.oldAxisLength;

		// is there new data?
		each(axis.series, function (series) {
			if (series.isDirtyData || series.isDirty ||
					series.xAxis.isDirty) { // when x axis is dirty, we need new data extremes for y as well
				isDirtyData = true;
			}
		});

		// do we really need to go through all this?
		if (isDirtyAxisLength || isDirtyData || axis.isLinked || axis.forceRedraw ||
			axis.userMin !== axis.oldUserMin || axis.userMax !== axis.oldUserMax) {

			// reset stacks
			if (!axis.isXAxis) {
				for (type in stacks) {
					for (i in stacks[type]) {
						stacks[type][i].total = null;
						stacks[type][i].cum = 0;
					}
				}
			}

			axis.forceRedraw = false;

			// get data extremes if needed
			axis.getSeriesExtremes();

			// get fixed positions based on tickInterval
			axis.setTickInterval();

			// record old values to decide whether a rescale is necessary later on (#540)
			axis.oldUserMin = axis.userMin;
			axis.oldUserMax = axis.userMax;

			// Mark as dirty if it is not already set to dirty and extremes have changed. #595.
			if (!axis.isDirty) {
				axis.isDirty = isDirtyAxisLength || axis.min !== axis.oldMin || axis.max !== axis.oldMax;
			}
		} else if (!axis.isXAxis) {
			if (axis.oldStacks) {
				stacks = axis.stacks = axis.oldStacks;
			}

			// reset stacks
			for (type in stacks) {
				for (i in stacks[type]) {
					stacks[type][i].cum = stacks[type][i].total;
				}
			}
		}
	},

	/**
	 * Set the extremes and optionally redraw
	 * @param {Number} newMin
	 * @param {Number} newMax
	 * @param {Boolean} redraw
	 * @param {Boolean|Object} animation Whether to apply animation, and optionally animation
	 *    configuration
	 * @param {Object} eventArguments
	 *
	 */
	setExtremes: function (newMin, newMax, redraw, animation, eventArguments) {
		var axis = this,
			chart = axis.chart;

		redraw = pick(redraw, true); // defaults to true

		each(axis.series, function (serie) {
			delete serie.kdTree;
		});

		// Extend the arguments with min and max
		eventArguments = extend(eventArguments, {
			min: newMin,
			max: newMax
		});

		// Fire the event
		fireEvent(axis, 'setExtremes', eventArguments, function () { // the default event handler

			axis.userMin = newMin;
			axis.userMax = newMax;
			axis.eventArgs = eventArguments;

			// Mark for running afterSetExtremes
			axis.isDirtyExtremes = true;

			// redraw
			if (redraw) {
				chart.redraw(animation);
			}
		});
	},

	/**
	 * Overridable method for zooming chart. Pulled out in a separate method to allow overriding
	 * in stock charts.
	 */
	zoom: function (newMin, newMax) {
		var dataMin = this.dataMin,
			dataMax = this.dataMax,
			options = this.options;

		// Prevent pinch zooming out of range. Check for defined is for #1946. #1734.
		if (!this.allowZoomOutside) {
			if (defined(dataMin) && newMin <= mathMin(dataMin, pick(options.min, dataMin))) {
				newMin = UNDEFINED;
			}
			if (defined(dataMax) && newMax >= mathMax(dataMax, pick(options.max, dataMax))) {
				newMax = UNDEFINED;
			}
		}

		// In full view, displaying the reset zoom button is not required
		this.displayBtn = newMin !== UNDEFINED || newMax !== UNDEFINED;

		// Do it
		this.setExtremes(
			newMin,
			newMax,
			false,
			UNDEFINED,
			{ trigger: 'zoom' }
		);
		return true;
	},

	/**
	 * Update the axis metrics
	 */
	setAxisSize: function () {
		var chart = this.chart,
			options = this.options,
			offsetLeft = options.offsetLeft || 0,
			offsetRight = options.offsetRight || 0,
			horiz = this.horiz,
			width = pick(options.width, chart.plotWidth - offsetLeft + offsetRight),
			height = pick(options.height, chart.plotHeight),
			top = pick(options.top, chart.plotTop),
			left = pick(options.left, chart.plotLeft + offsetLeft),
			percentRegex = /%$/;

		// Check for percentage based input values
		if (percentRegex.test(height)) {
			height = parseFloat(height) / 100 * chart.plotHeight;
		}
		if (percentRegex.test(top)) {
			top = parseFloat(top) / 100 * chart.plotHeight + chart.plotTop;
		}

		// Expose basic values to use in Series object and navigator
		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;
		this.bottom = chart.chartHeight - height - top;
		this.right = chart.chartWidth - width - left;

		// Direction agnostic properties
		this.len = mathMax(horiz ? width : height, 0); // mathMax fixes #905
		this.pos = horiz ? left : top; // distance from SVG origin
	},

	/**
	 * Get the actual axis extremes
	 */
	getExtremes: function () {
		var axis = this,
			isLog = axis.isLog;

		return {
			min: isLog ? correctFloat(lin2log(axis.min)) : axis.min,
			max: isLog ? correctFloat(lin2log(axis.max)) : axis.max,
			dataMin: axis.dataMin,
			dataMax: axis.dataMax,
			userMin: axis.userMin,
			userMax: axis.userMax
		};
	},

	/**
	 * Get the zero plane either based on zero or on the min or max value.
	 * Used in bar and area plots
	 */
	getThreshold: function (threshold) {
		var axis = this,
			isLog = axis.isLog,
			realMin = isLog ? lin2log(axis.min) : axis.min,
			realMax = isLog ? lin2log(axis.max) : axis.max;

		// With a threshold of null, make the columns/areas rise from the top or bottom 
		// depending on the value, assuming an actual threshold of 0 (#4233).
		if (threshold === null) {
			threshold = realMax < 0 ? realMax : realMin;
		} else if (realMin > threshold) {
			threshold = realMin;
		} else if (realMax < threshold) {
			threshold = realMax;
		}

		return axis.translate(threshold, 0, 1, 0, 1);
	},

	/**
	 * Compute auto alignment for the axis label based on which side the axis is on
	 * and the given rotation for the label
	 */
	autoLabelAlign: function (rotation) {
		var ret,
			angle = (pick(rotation, 0) - (this.side * 90) + 720) % 360;

		if (angle > 15 && angle < 165) {
			ret = 'right';
		} else if (angle > 195 && angle < 345) {
			ret = 'left';
		} else {
			ret = 'center';
		}
		return ret;
	},

	/**
	 * Prevent the ticks from getting so close we can't draw the labels. On a horizontal
	 * axis, this is handled by rotating the labels, removing ticks and adding ellipsis. 
	 * On a vertical axis remove ticks and add ellipsis.
	 */
	unsquish: function () {
		var chart = this.chart,
			ticks = this.ticks,
			labelOptions = this.options.labels,
			horiz = this.horiz,
			tickInterval = this.tickInterval,
			newTickInterval = tickInterval,
			slotSize = this.len / (((this.categories ? 1 : 0) + this.max - this.min) / tickInterval),
			rotation,
			rotationOption = labelOptions.rotation,
			labelMetrics = chart.renderer.fontMetrics(labelOptions.style.fontSize, ticks[0] && ticks[0].label),
			step,
			bestScore = Number.MAX_VALUE,
			autoRotation,
			// Return the multiple of tickInterval that is needed to avoid collision
			getStep = function (spaceNeeded) {
				var step = spaceNeeded / (slotSize || 1);
				step = step > 1 ? mathCeil(step) : 1;
				return step * tickInterval;
			};
		
		if (horiz) {
			autoRotation = defined(rotationOption) ? 
				[rotationOption] :
				slotSize < pick(labelOptions.autoRotationLimit, 80) && !labelOptions.staggerLines && !labelOptions.step && labelOptions.autoRotation;

			if (autoRotation) {

				// Loop over the given autoRotation options, and determine which gives the best score. The 
				// best score is that with the lowest number of steps and a rotation closest to horizontal.
				each(autoRotation, function (rot) {
					var score;

					if (rot === rotationOption || (rot && rot >= -90 && rot <= 90)) { // #3891
					
						step = getStep(mathAbs(labelMetrics.h / mathSin(deg2rad * rot)));

						score = step + mathAbs(rot / 360);

						if (score < bestScore) {
							bestScore = score;
							rotation = rot;
							newTickInterval = step;
						}
					}
				});
			}

		} else {
			newTickInterval = getStep(labelMetrics.h);
		}

		this.autoRotation = autoRotation;
		this.labelRotation = rotation;

		return newTickInterval;
	},

	renderUnsquish: function () {
		var chart = this.chart,
			renderer = chart.renderer,
			tickPositions = this.tickPositions,
			ticks = this.ticks,
			labelOptions = this.options.labels,
			horiz = this.horiz,
			margin = chart.margin,
			slotCount = this.categories ? tickPositions.length : tickPositions.length - 1,
			slotWidth = this.slotWidth = (horiz && !labelOptions.step && !labelOptions.rotation &&
				((this.staggerLines || 1) * chart.plotWidth) / slotCount) ||
				(!horiz && ((margin[3] && (margin[3] - chart.spacing[3])) || chart.chartWidth * 0.33)), // #1580, #1931,
			innerWidth = mathMax(1, mathRound(slotWidth - 2 * (labelOptions.padding || 5))),
			attr = {},
			labelMetrics = renderer.fontMetrics(labelOptions.style.fontSize, ticks[0] && ticks[0].label),
			textOverflowOption = labelOptions.style.textOverflow,
			css,
			labelLength = 0,
			label,
			i,
			pos;

		// Set rotation option unless it is "auto", like in gauges
		if (!isString(labelOptions.rotation)) {
			attr.rotation = labelOptions.rotation;
		}
		
		// Handle auto rotation on horizontal axis
		if (this.autoRotation) {

			// Get the longest label length
			each(tickPositions, function (tick) {
				tick = ticks[tick];
				if (tick && tick.labelLength > labelLength) {
					labelLength = tick.labelLength;
				}
			});
			
			// Apply rotation only if the label is too wide for the slot, and
			// the label is wider than its height.
			if (labelLength > innerWidth && labelLength > labelMetrics.h) {
				attr.rotation = this.labelRotation;
			} else {
				this.labelRotation = 0;
			}

		// Handle word-wrap or ellipsis on vertical axis
		} else if (slotWidth) {
			// For word-wrap or ellipsis
			css = { width: innerWidth + PX };

			if (!textOverflowOption) {
				css.textOverflow = 'clip';

				// On vertical axis, only allow word wrap if there is room for more lines.
				i = tickPositions.length;
				while (!horiz && i--) {
					pos = tickPositions[i];
					label = ticks[pos].label;
					if (label) {
						// Reset ellipsis in order to get the correct bounding box (#4070)
						if (label.styles.textOverflow === 'ellipsis') {
							label.css({ textOverflow: 'clip' });
						}
						if (label.getBBox().height > this.len / tickPositions.length - (labelMetrics.h - labelMetrics.f)) {
							label.specCss = { textOverflow: 'ellipsis' };
						}
					}
				}
			}
		}


		// Add ellipsis if the label length is significantly longer than ideal
		if (attr.rotation) {
			css = { 
				width: (labelLength > chart.chartHeight * 0.5 ? chart.chartHeight * 0.33 : chart.chartHeight) + PX
			};
			if (!textOverflowOption) {
				css.textOverflow = 'ellipsis';
			}
		}

		// Set the explicit or automatic label alignment
		this.labelAlign = attr.align = labelOptions.align || this.autoLabelAlign(this.labelRotation);

		// Apply general and specific CSS
		each(tickPositions, function (pos) {
			var tick = ticks[pos],
				label = tick && tick.label;
			if (label) {
				if (css) {
					label.css(merge(css, label.specCss));
				}
				delete label.specCss;
				label.attr(attr);
				tick.rotation = attr.rotation;
			}
		});

		// TODO: Why not part of getLabelPosition?
		this.tickRotCorr = renderer.rotCorr(labelMetrics.b, this.labelRotation || 0, this.side === 2);
	},

	/**
	 * Return true if the axis has associated data
	 */
	hasData: function () {
		return this.hasVisibleSeries || (defined(this.min) && defined(this.max) && !!this.tickPositions);
	},

	/**
	 * Render the tick labels to a preliminary position to get their sizes
	 */
	getOffset: function () {
		var axis = this,
			chart = axis.chart,
			renderer = chart.renderer,
			options = axis.options,
			tickPositions = axis.tickPositions,
			ticks = axis.ticks,
			horiz = axis.horiz,
			side = axis.side,
			invertedSide = chart.inverted ? [1, 0, 3, 2][side] : side,
			hasData,
			showAxis,
			titleOffset = 0,
			titleOffsetOption,
			titleMargin = 0,
			axisTitleOptions = options.title,
			labelOptions = options.labels,
			labelOffset = 0, // reset
			labelOffsetPadded,
			axisOffset = chart.axisOffset,
			clipOffset = chart.clipOffset,
			clip,
			directionFactor = [-1, 1, 1, -1][side],
			n,
			lineHeightCorrection;

		// For reuse in Axis.render
		hasData = axis.hasData();
		axis.showAxis = showAxis = hasData || pick(options.showEmpty, true);

		// Set/reset staggerLines
		axis.staggerLines = axis.horiz && labelOptions.staggerLines;

		// Create the axisGroup and gridGroup elements on first iteration
		if (!axis.axisGroup) {
			axis.gridGroup = renderer.g('grid')
				.attr({ zIndex: options.gridZIndex || 1 })
				.add();
			axis.axisGroup = renderer.g('axis')
				.attr({ zIndex: options.zIndex || 2 })
				.add();
			axis.labelGroup = renderer.g('axis-labels')
				.attr({ zIndex: labelOptions.zIndex || 7 })
				.addClass(PREFIX + axis.coll.toLowerCase() + '-labels')
				.add();
		}

		if (hasData || axis.isLinked) {
			
			// Generate ticks
			each(tickPositions, function (pos) {
				if (!ticks[pos]) {
					ticks[pos] = new Tick(axis, pos);
				} else {
					ticks[pos].addLabel(); // update labels depending on tick interval
				}
			});

			axis.renderUnsquish();

			each(tickPositions, function (pos) {
				// left side must be align: right and right side must have align: left for labels
				if (side === 0 || side === 2 || { 1: 'left', 3: 'right' }[side] === axis.labelAlign) {

					// get the highest offset
					labelOffset = mathMax(
						ticks[pos].getLabelSize(),
						labelOffset
					);
				}
			});

			if (axis.staggerLines) {
				labelOffset *= axis.staggerLines;
				axis.labelOffset = labelOffset;
			}


		} else { // doesn't have data
			for (n in ticks) {
				ticks[n].destroy();
				delete ticks[n];
			}
		}

		if (axisTitleOptions && axisTitleOptions.text && axisTitleOptions.enabled !== false) {
			if (!axis.axisTitle) {
				axis.axisTitle = renderer.text(
					axisTitleOptions.text,
					0,
					0,
					axisTitleOptions.useHTML
				)
				.attr({
					zIndex: 7,
					rotation: axisTitleOptions.rotation || 0,
					align:
						axisTitleOptions.textAlign ||
						{ low: 'left', middle: 'center', high: 'right' }[axisTitleOptions.align]
				})
				.addClass(PREFIX + this.coll.toLowerCase() + '-title')
				.css(axisTitleOptions.style)
				.add(axis.axisGroup);
				axis.axisTitle.isNew = true;
			}

			if (showAxis) {
				titleOffset = axis.axisTitle.getBBox()[horiz ? 'height' : 'width'];
				titleOffsetOption = axisTitleOptions.offset;
				titleMargin = defined(titleOffsetOption) ? 0 : pick(axisTitleOptions.margin, horiz ? 5 : 10);
			}

			// hide or show the title depending on whether showEmpty is set
			axis.axisTitle[showAxis ? 'show' : 'hide']();
		}

		// handle automatic or user set offset
		axis.offset = directionFactor * pick(options.offset, axisOffset[side]);

		axis.tickRotCorr = axis.tickRotCorr || { x: 0, y: 0 }; // polar
		lineHeightCorrection = side === 2 ? axis.tickRotCorr.y : 0;
		labelOffsetPadded = labelOffset + titleMargin +
			(labelOffset && (directionFactor * (horiz ? pick(labelOptions.y, axis.tickRotCorr.y + 8) : labelOptions.x) - lineHeightCorrection));
		axis.axisTitleMargin = pick(titleOffsetOption, labelOffsetPadded);

		axisOffset[side] = mathMax(
			axisOffset[side],
			axis.axisTitleMargin + titleOffset + directionFactor * axis.offset,
			labelOffsetPadded // #3027
		);

		// Decide the clipping needed to keep the graph inside the plot area and axis lines
		clip = mathFloor(options.lineWidth / 2) * 2;
		if (options.offset) {
			clip = mathMax(0, clip - options.offset);		
		}
		clipOffset[invertedSide] = mathMax(clipOffset[invertedSide], clip);
	},

	/**
	 * Get the path for the axis line
	 */
	getLinePath: function (lineWidth) {
		var chart = this.chart,
			opposite = this.opposite,
			offset = this.offset,
			horiz = this.horiz,
			lineLeft = this.left + (opposite ? this.width : 0) + offset,
			lineTop = chart.chartHeight - this.bottom - (opposite ? this.height : 0) + offset;

		if (opposite) {
			lineWidth *= -1; // crispify the other way - #1480, #1687
		}

		return chart.renderer.crispLine([
				M,
				horiz ?
					this.left :
					lineLeft,
				horiz ?
					lineTop :
					this.top,
				L,
				horiz ?
					chart.chartWidth - this.right :
					lineLeft,
				horiz ?
					lineTop :
					chart.chartHeight - this.bottom
			], lineWidth);
	},

	/**
	 * Position the title
	 */
	getTitlePosition: function () {
		// compute anchor points for each of the title align options
		var horiz = this.horiz,
			axisLeft = this.left,
			axisTop = this.top,
			axisLength = this.len,
			axisTitleOptions = this.options.title,
			margin = horiz ? axisLeft : axisTop,
			opposite = this.opposite,
			offset = this.offset,
			xOption = axisTitleOptions.x || 0,
			yOption = axisTitleOptions.y || 0,
			fontSize = pInt(axisTitleOptions.style.fontSize || 12),

			// the position in the length direction of the axis
			alongAxis = {
				low: margin + (horiz ? 0 : axisLength),
				middle: margin + axisLength / 2,
				high: margin + (horiz ? axisLength : 0)
			}[axisTitleOptions.align],

			// the position in the perpendicular direction of the axis
			offAxis = (horiz ? axisTop + this.height : axisLeft) +
				(horiz ? 1 : -1) * // horizontal axis reverses the margin
				(opposite ? -1 : 1) * // so does opposite axes
				this.axisTitleMargin +
				(this.side === 2 ? fontSize : 0);

		return {
			x: horiz ?
				alongAxis + xOption :
				offAxis + (opposite ? this.width : 0) + offset + xOption,
			y: horiz ?
				offAxis + yOption - (opposite ? this.height : 0) + offset :
				alongAxis + yOption
		};
	},

	/**
	 * Render the axis
	 */
	render: function () {
		var axis = this,
			chart = axis.chart,
			renderer = chart.renderer,
			options = axis.options,
			isLog = axis.isLog,
			isLinked = axis.isLinked,
			tickPositions = axis.tickPositions,
			axisTitle = axis.axisTitle,			
			ticks = axis.ticks,
			minorTicks = axis.minorTicks,
			alternateBands = axis.alternateBands,
			stackLabelOptions = options.stackLabels,
			alternateGridColor = options.alternateGridColor,
			tickmarkOffset = axis.tickmarkOffset,
			lineWidth = options.lineWidth,
			linePath,
			hasRendered = chart.hasRendered,
			slideInTicks = hasRendered && defined(axis.oldMin) && !isNaN(axis.oldMin),
			showAxis = axis.showAxis,
			from,
			to;

		// Reset
		axis.labelEdge.length = 0;
		//axis.justifyToPlot = overflow === 'justify';
		axis.overlap = false;

		// Mark all elements inActive before we go over and mark the active ones
		each([ticks, minorTicks, alternateBands], function (coll) {
			var pos;
			for (pos in coll) {
				coll[pos].isActive = false;
			}
		});

		// If the series has data draw the ticks. Else only the line and title
		if (axis.hasData() || isLinked) {

			// minor ticks
			if (axis.minorTickInterval && !axis.categories) {
				each(axis.getMinorTickPositions(), function (pos) {
					if (!minorTicks[pos]) {
						minorTicks[pos] = new Tick(axis, pos, 'minor');
					}

					// render new ticks in old position
					if (slideInTicks && minorTicks[pos].isNew) {
						minorTicks[pos].render(null, true);
					}

					minorTicks[pos].render(null, false, 1);
				});
			}

			// Major ticks. Pull out the first item and render it last so that
			// we can get the position of the neighbour label. #808.
			if (tickPositions.length) { // #1300
				each(tickPositions, function (pos, i) {

					// linked axes need an extra check to find out if
					if (!isLinked || (pos >= axis.min && pos <= axis.max)) {

						if (!ticks[pos]) {
							ticks[pos] = new Tick(axis, pos);
						}

						// render new ticks in old position
						if (slideInTicks && ticks[pos].isNew) {
							ticks[pos].render(i, true, 0.1);
						}

						ticks[pos].render(i);
					}

				});
				// In a categorized axis, the tick marks are displayed between labels. So
				// we need to add a tick mark and grid line at the left edge of the X axis.
				if (tickmarkOffset && (axis.min === 0 || axis.single)) {
					if (!ticks[-1]) {
						ticks[-1] = new Tick(axis, -1, null, true);
					}
					ticks[-1].render(-1);
				}

			}

			// alternate grid color
			if (alternateGridColor) {
				each(tickPositions, function (pos, i) {
					if (i % 2 === 0 && pos < axis.max) {
						if (!alternateBands[pos]) {
							alternateBands[pos] = new Highcharts.PlotLineOrBand(axis);
						}
						from = pos + tickmarkOffset; // #949
						to = tickPositions[i + 1] !== UNDEFINED ? tickPositions[i + 1] + tickmarkOffset : axis.max;
						alternateBands[pos].options = {
							from: isLog ? lin2log(from) : from,
							to: isLog ? lin2log(to) : to,
							color: alternateGridColor
						};
						alternateBands[pos].render();
						alternateBands[pos].isActive = true;
					}
				});
			}

			// custom plot lines and bands
			if (!axis._addedPlotLB) { // only first time
				each((options.plotLines || []).concat(options.plotBands || []), function (plotLineOptions) {
					axis.addPlotBandOrLine(plotLineOptions);
				});
				axis._addedPlotLB = true;
			}

		} // end if hasData

		// Remove inactive ticks
		each([ticks, minorTicks, alternateBands], function (coll) {
			var pos,
				i,
				forDestruction = [],
				delay = globalAnimation ? globalAnimation.duration || 500 : 0,
				destroyInactiveItems = function () {
					i = forDestruction.length;
					while (i--) {
						// When resizing rapidly, the same items may be destroyed in different timeouts,
						// or the may be reactivated
						if (coll[forDestruction[i]] && !coll[forDestruction[i]].isActive) {
							coll[forDestruction[i]].destroy();
							delete coll[forDestruction[i]];
						}
					}

				};

			for (pos in coll) {

				if (!coll[pos].isActive) {
					// Render to zero opacity
					coll[pos].render(pos, false, 0);
					coll[pos].isActive = false;
					forDestruction.push(pos);
				}
			}

			// When the objects are finished fading out, destroy them
			if (coll === alternateBands || !chart.hasRendered || !delay) {
				destroyInactiveItems();
			} else if (delay) {
				setTimeout(destroyInactiveItems, delay);
			}
		});

		// Static items. As the axis group is cleared on subsequent calls
		// to render, these items are added outside the group.
		// axis line
		if (lineWidth) {
			linePath = axis.getLinePath(lineWidth);
			if (!axis.axisLine) {
				axis.axisLine = renderer.path(linePath)
					.attr({
						stroke: options.lineColor,
						'stroke-width': lineWidth,
						zIndex: 7
					})
					.add(axis.axisGroup);
			} else {
				axis.axisLine.animate({ d: linePath });
			}

			// show or hide the line depending on options.showEmpty
			axis.axisLine[showAxis ? 'show' : 'hide']();
		}

		if (axisTitle && showAxis) {

			axisTitle[axisTitle.isNew ? 'attr' : 'animate'](
				axis.getTitlePosition()
			);
			axisTitle.isNew = false;
		}

		// Stacked totals:
		if (stackLabelOptions && stackLabelOptions.enabled) {
			axis.renderStackTotals();
		}
		// End stacked totals

		axis.isDirty = false;
	},

	/**
	 * Redraw the axis to reflect changes in the data or axis extremes
	 */
	redraw: function () {
		
		// render the axis
		this.render();

		// move plot lines and bands
		each(this.plotLinesAndBands, function (plotLine) {
			plotLine.render();
		});

		// mark associated series as dirty and ready for redraw
		each(this.series, function (series) {
			series.isDirty = true;
		});

	},

	/**
	 * Destroys an Axis instance.
	 */
	destroy: function (keepEvents) {
		var axis = this,
			stacks = axis.stacks,
			stackKey,
			plotLinesAndBands = axis.plotLinesAndBands,
			i;

		// Remove the events
		if (!keepEvents) {
			removeEvent(axis);
		}

		// Destroy each stack total
		for (stackKey in stacks) {
			destroyObjectProperties(stacks[stackKey]);

			stacks[stackKey] = null;
		}

		// Destroy collections
		each([axis.ticks, axis.minorTicks, axis.alternateBands], function (coll) {
			destroyObjectProperties(coll);
		});
		i = plotLinesAndBands.length;
		while (i--) { // #1975
			plotLinesAndBands[i].destroy();
		}

		// Destroy local variables
		each(['stackTotalGroup', 'axisLine', 'axisTitle', 'axisGroup', 'cross', 'gridGroup', 'labelGroup'], function (prop) {
			if (axis[prop]) {
				axis[prop] = axis[prop].destroy();
			}
		});

		// Destroy crosshair
		if (this.cross) {
			this.cross.destroy();
		}
	},

	/**
	 * Draw the crosshair
	 */
	drawCrosshair: function (e, point) { // docs: Missing docs for Axis.crosshair. Also for properties.

		var path,
			options = this.crosshair,
			animation = options.animation,
			pos,
			attribs,
			categorized;
		
		if (
			// Disabled in options
			!this.crosshair || 
			// Snap
			((defined(point) || !pick(this.crosshair.snap, true)) === false) || 
			// Not on this axis (#4095, #2888)
			(point && point.series && point.series[this.coll] !== this)
		) {
			this.hideCrosshair();
		
		} else {			

			// Get the path
			if (!pick(options.snap, true)) {
				pos = (this.horiz ? e.chartX - this.pos : this.len - e.chartY + this.pos);
			} else if (defined(point)) {
				/*jslint eqeq: true*/
				pos = this.isXAxis ? point.plotX : this.len - point.plotY; // #3834
				/*jslint eqeq: false*/
			}

			if (this.isRadial) {
				path = this.getPlotLinePath(this.isXAxis ? point.x : pick(point.stackY, point.y)) || null; // #3189
			} else {
				path = this.getPlotLinePath(null, null, null, null, pos) || null; // #3189
			}

			if (path === null) {
				this.hideCrosshair();
				return;
			}

			// Draw the cross
			if (this.cross) {
				this.cross
					.attr({ visibility: VISIBLE })[animation ? 'animate' : 'attr']({ d: path }, animation);
			} else {
				categorized = this.categories && !this.isRadial;
				attribs = {
					'stroke-width': options.width || (categorized ? this.transA : 1),
					stroke: options.color || (categorized ? 'rgba(155,200,255,0.2)' : '#C0C0C0'),
					zIndex: options.zIndex || 2
				};
				if (options.dashStyle) {
					attribs.dashstyle = options.dashStyle;
				}
				this.cross = this.chart.renderer.path(path).attr(attribs).add();
			}

		}

	},

	/**
	 *	Hide the crosshair.
	 */
	hideCrosshair: function () {
		if (this.cross) {
			this.cross.hide();
		}
	}
}; // end Axis

extend(Axis.prototype, AxisPlotLineOrBandExtension);

/**
 * Set the tick positions to a time unit that makes sense, for example
 * on the first of each month or on every Monday. Return an array
 * with the time positions. Used in datetime axes as well as for grouping
 * data on a datetime axis.
 *
 * @param {Object} normalizedInterval The interval in axis values (ms) and the count
 * @param {Number} min The minimum in axis values
 * @param {Number} max The maximum in axis values
 * @param {Number} startOfWeek
 */
Axis.prototype.getTimeTicks = function (normalizedInterval, min, max, startOfWeek) {
	var tickPositions = [],
		i,
		higherRanks = {},
		useUTC = defaultOptions.global.useUTC,
		minYear, // used in months and years as a basis for Date.UTC()
		minDate = new Date(min - getTZOffset(min)),
		interval = normalizedInterval.unitRange,
		count = normalizedInterval.count;

	if (defined(min)) { // #1300
		minDate[setMilliseconds](interval >= timeUnits.second ? 0 : // #3935
			count * mathFloor(minDate.getMilliseconds() / count)); // #3652, #3654

		if (interval >= timeUnits.second) { // second
			minDate[setSeconds](interval >= timeUnits.minute ? 0 : // #3935
				count * mathFloor(minDate.getSeconds() / count));
		}
	
		if (interval >= timeUnits.minute) { // minute
			minDate[setMinutes](interval >= timeUnits.hour ? 0 :
				count * mathFloor(minDate[getMinutes]() / count));
		}
	
		if (interval >= timeUnits.hour) { // hour
			minDate[setHours](interval >= timeUnits.day ? 0 :
				count * mathFloor(minDate[getHours]() / count));
		}
	
		if (interval >= timeUnits.day) { // day
			minDate[setDate](interval >= timeUnits.month ? 1 :
				count * mathFloor(minDate[getDate]() / count));
		}
	
		if (interval >= timeUnits.month) { // month
			minDate[setMonth](interval >= timeUnits.year ? 0 :
				count * mathFloor(minDate[getMonth]() / count));
			minYear = minDate[getFullYear]();
		}
	
		if (interval >= timeUnits.year) { // year
			minYear -= minYear % count;
			minDate[setFullYear](minYear);
		}
	
		// week is a special case that runs outside the hierarchy
		if (interval === timeUnits.week) {
			// get start of current week, independent of count
			minDate[setDate](minDate[getDate]() - minDate[getDay]() +
				pick(startOfWeek, 1));
		}
	
	
		// get tick positions
		i = 1;
		if (timezoneOffset || getTimezoneOffset) {
			minDate = minDate.getTime();
			minDate = new Date(minDate + getTZOffset(minDate));
		}
		minYear = minDate[getFullYear]();
		var time = minDate.getTime(),
			minMonth = minDate[getMonth](),
			minDateDate = minDate[getDate](),
			localTimezoneOffset = (timeUnits.day + 
					(useUTC ? getTZOffset(minDate) : minDate.getTimezoneOffset() * 60 * 1000)
				) % timeUnits.day; // #950, #3359
	
		// iterate and add tick positions at appropriate values
		while (time < max) {
			tickPositions.push(time);
	
			// if the interval is years, use Date.UTC to increase years
			if (interval === timeUnits.year) {
				time = makeTime(minYear + i * count, 0);
	
			// if the interval is months, use Date.UTC to increase months
			} else if (interval === timeUnits.month) {
				time = makeTime(minYear, minMonth + i * count);
	
			// if we're using global time, the interval is not fixed as it jumps
			// one hour at the DST crossover
			} else if (!useUTC && (interval === timeUnits.day || interval === timeUnits.week)) {
				time = makeTime(minYear, minMonth, minDateDate +
					i * count * (interval === timeUnits.day ? 1 : 7));
	
			// else, the interval is fixed and we use simple addition
			} else {
				time += interval * count;
			}
	
			i++;
		}
	
		// push the last time
		tickPositions.push(time);


		// mark new days if the time is dividible by day (#1649, #1760)
		each(grep(tickPositions, function (time) {
			return interval <= timeUnits.hour && time % timeUnits.day === localTimezoneOffset;
		}), function (time) {
			higherRanks[time] = 'day';
		});
	}


	// record information on the chosen unit - for dynamic label formatter
	tickPositions.info = extend(normalizedInterval, {
		higherRanks: higherRanks,
		totalRange: interval * count
	});

	return tickPositions;
};

/**
 * Get a normalized tick interval for dates. Returns a configuration object with
 * unit range (interval), count and name. Used to prepare data for getTimeTicks. 
 * Previously this logic was part of getTimeTicks, but as getTimeTicks now runs
 * of segments in stock charts, the normalizing logic was extracted in order to 
 * prevent it for running over again for each segment having the same interval. 
 * #662, #697.
 */
Axis.prototype.normalizeTimeTickInterval = function (tickInterval, unitsOption) {
	var units = unitsOption || [[
				'millisecond', // unit name
				[1, 2, 5, 10, 20, 25, 50, 100, 200, 500] // allowed multiples
			], [
				'second',
				[1, 2, 5, 10, 15, 30]
			], [
				'minute',
				[1, 2, 5, 10, 15, 30]
			], [
				'hour',
				[1, 2, 3, 4, 6, 8, 12]
			], [
				'day',
				[1, 2]
			], [
				'week',
				[1, 2]
			], [
				'month',
				[1, 2, 3, 4, 6]
			], [
				'year',
				null
			]],
		unit = units[units.length - 1], // default unit is years
		interval = timeUnits[unit[0]],
		multiples = unit[1],
		count,
		i;
		
	// loop through the units to find the one that best fits the tickInterval
	for (i = 0; i < units.length; i++) {
		unit = units[i];
		interval = timeUnits[unit[0]];
		multiples = unit[1];


		if (units[i + 1]) {
			// lessThan is in the middle between the highest multiple and the next unit.
			var lessThan = (interval * multiples[multiples.length - 1] +
						timeUnits[units[i + 1][0]]) / 2;

			// break and keep the current unit
			if (tickInterval <= lessThan) {
				break;
			}
		}
	}

	// prevent 2.5 years intervals, though 25, 250 etc. are allowed
	if (interval === timeUnits.year && tickInterval < 5 * interval) {
		multiples = [1, 2, 5];
	}

	// get the count
	count = normalizeTickInterval(
		tickInterval / interval, 
		multiples,
		unit[0] === 'year' ? mathMax(getMagnitude(tickInterval / interval), 1) : 1 // #1913, #2360
	);
	
	return {
		unitRange: interval,
		count: count,
		unitName: unit[0]
	};
};/**
 * Methods defined on the Axis prototype
 */

/**
 * Set the tick positions of a logarithmic axis
 */
Axis.prototype.getLogTickPositions = function (interval, min, max, minor) {
	var axis = this,
		options = axis.options,
		axisLength = axis.len,
		// Since we use this method for both major and minor ticks,
		// use a local variable and return the result
		positions = []; 
	
	// Reset
	if (!minor) {
		axis._minorAutoInterval = null;
	}
	
	// First case: All ticks fall on whole logarithms: 1, 10, 100 etc.
	if (interval >= 0.5) {
		interval = mathRound(interval);
		positions = axis.getLinearTickPositions(interval, min, max);
		
	// Second case: We need intermediary ticks. For example 
	// 1, 2, 4, 6, 8, 10, 20, 40 etc. 
	} else if (interval >= 0.08) {
		var roundedMin = mathFloor(min),
			intermediate,
			i,
			j,
			len,
			pos,
			lastPos,
			break2;
			
		if (interval > 0.3) {
			intermediate = [1, 2, 4];
		} else if (interval > 0.15) { // 0.2 equals five minor ticks per 1, 10, 100 etc
			intermediate = [1, 2, 4, 6, 8];
		} else { // 0.1 equals ten minor ticks per 1, 10, 100 etc
			intermediate = [1, 2, 3, 4, 5, 6, 7, 8, 9];
		}
		
		for (i = roundedMin; i < max + 1 && !break2; i++) {
			len = intermediate.length;
			for (j = 0; j < len && !break2; j++) {
				pos = log2lin(lin2log(i) * intermediate[j]);
				if (pos > min && (!minor || lastPos <= max) && lastPos !== UNDEFINED) { // #1670, lastPos is #3113
					positions.push(lastPos);
				}
				
				if (lastPos > max) {
					break2 = true;
				}
				lastPos = pos;
			}
		}
		
	// Third case: We are so deep in between whole logarithmic values that
	// we might as well handle the tick positions like a linear axis. For
	// example 1.01, 1.02, 1.03, 1.04.
	} else {
		var realMin = lin2log(min),
			realMax = lin2log(max),
			tickIntervalOption = options[minor ? 'minorTickInterval' : 'tickInterval'],
			filteredTickIntervalOption = tickIntervalOption === 'auto' ? null : tickIntervalOption,
			tickPixelIntervalOption = options.tickPixelInterval / (minor ? 5 : 1),
			totalPixelLength = minor ? axisLength / axis.tickPositions.length : axisLength;
		
		interval = pick(
			filteredTickIntervalOption,
			axis._minorAutoInterval,
			(realMax - realMin) * tickPixelIntervalOption / (totalPixelLength || 1)
		);
		
		interval = normalizeTickInterval(
			interval, 
			null, 
			getMagnitude(interval)
		);
		
		positions = map(axis.getLinearTickPositions(
			interval, 
			realMin,
			realMax	
		), log2lin);
		
		if (!minor) {
			axis._minorAutoInterval = interval / 5;
		}
	}
	
	// Set the axis-level tickInterval variable 
	if (!minor) {
		axis.tickInterval = interval;
	}
	return positions;
};/**
 * The tooltip object
 * @param {Object} chart The chart instance
 * @param {Object} options Tooltip options
 */
var Tooltip = Highcharts.Tooltip = function () {
	this.init.apply(this, arguments);
};

Tooltip.prototype = {

	init: function (chart, options) {

		var borderWidth = options.borderWidth,
			style = options.style,
			padding = pInt(style.padding);

		// Save the chart and options
		this.chart = chart;
		this.options = options;

		// Keep track of the current series
		//this.currentSeries = UNDEFINED;

		// List of crosshairs
		this.crosshairs = [];

		// Current values of x and y when animating
		this.now = { x: 0, y: 0 };

		// The tooltip is initially hidden
		this.isHidden = true;


		// create the label		
		this.label = chart.renderer.label('', 0, 0, options.shape || 'callout', null, null, options.useHTML, null, 'tooltip')
			.attr({
				padding: padding,
				fill: options.backgroundColor,
				'stroke-width': borderWidth,
				r: options.borderRadius,
				zIndex: 8
			})
			.css(style)
			.css({ padding: 0 }) // Remove it from VML, the padding is applied as an attribute instead (#1117)
			.add()
			.attr({ y: -9999 }); // #2301, #2657

		// When using canVG the shadow shows up as a gray circle
		// even if the tooltip is hidden.
		if (!useCanVG) {
			this.label.shadow(options.shadow);
		}

		// Public property for getting the shared state.
		this.shared = options.shared;
	},

	/**
	 * Destroy the tooltip and its elements.
	 */
	destroy: function () {
		// Destroy and clear local variables
		if (this.label) {
			this.label = this.label.destroy();
		}
		clearTimeout(this.hideTimer);
		clearTimeout(this.tooltipTimeout);
	},

	/**
	 * Provide a soft movement for the tooltip
	 *
	 * @param {Number} x
	 * @param {Number} y
	 * @private
	 */
	move: function (x, y, anchorX, anchorY) {
		var tooltip = this,
			now = tooltip.now,
			animate = tooltip.options.animation !== false && !tooltip.isHidden && 
				// When we get close to the target position, abort animation and land on the right place (#3056)
				(mathAbs(x - now.x) > 1 || mathAbs(y - now.y) > 1),
			skipAnchor = tooltip.followPointer || tooltip.len > 1;

		// Get intermediate values for animation
		extend(now, {
			x: animate ? (2 * now.x + x) / 3 : x,
			y: animate ? (now.y + y) / 2 : y,
			anchorX: skipAnchor ? UNDEFINED : animate ? (2 * now.anchorX + anchorX) / 3 : anchorX,
			anchorY: skipAnchor ? UNDEFINED : animate ? (now.anchorY + anchorY) / 2 : anchorY
		});

		// Move to the intermediate value
		tooltip.label.attr(now);

		
		// Run on next tick of the mouse tracker
		if (animate) {
		
			// Never allow two timeouts
			clearTimeout(this.tooltipTimeout);
			
			// Set the fixed interval ticking for the smooth tooltip
			this.tooltipTimeout = setTimeout(function () {
				// The interval function may still be running during destroy, so check that the chart is really there before calling.
				if (tooltip) {
					tooltip.move(x, y, anchorX, anchorY);
				}
			}, 32);
			
		}
	},

	/**
	 * Hide the tooltip
	 */
	hide: function (delay) {
		var tooltip = this,
			hoverPoints;
		
		clearTimeout(this.hideTimer); // disallow duplicate timers (#1728, #1766)
		if (!this.isHidden) {
			hoverPoints = this.chart.hoverPoints;

			this.hideTimer = setTimeout(function () {
				tooltip.label.fadeOut();
				tooltip.isHidden = true;
			}, pick(delay, this.options.hideDelay, 500));
		}
	},
	
	/** 
	 * Extendable method to get the anchor position of the tooltip
	 * from a point or set of points
	 */
	getAnchor: function (points, mouseEvent) {
		var ret,
			chart = this.chart,
			inverted = chart.inverted,
			plotTop = chart.plotTop,
			plotLeft = chart.plotLeft,
			plotX = 0,
			plotY = 0,
			yAxis,
			xAxis;
		
		points = splat(points);
		
		// Pie uses a special tooltipPos
		ret = points[0].tooltipPos;
		
		// When tooltip follows mouse, relate the position to the mouse
		if (this.followPointer && mouseEvent) {
			if (mouseEvent.chartX === UNDEFINED) {
				mouseEvent = chart.pointer.normalize(mouseEvent);
			}
			ret = [
				mouseEvent.chartX - chart.plotLeft,
				mouseEvent.chartY - plotTop
			];
		}
		// When shared, use the average position
		if (!ret) {
			each(points, function (point) {
				yAxis = point.series.yAxis;
				xAxis = point.series.xAxis;
				plotX += point.plotX  + (!inverted && xAxis ? xAxis.left - plotLeft : 0); 
				plotY += (point.plotLow ? (point.plotLow + point.plotHigh) / 2 : point.plotY) +
					(!inverted && yAxis ? yAxis.top - plotTop : 0); // #1151
			});
			
			plotX /= points.length;
			plotY /= points.length;
			
			ret = [
				inverted ? chart.plotWidth - plotY : plotX,
				this.shared && !inverted && points.length > 1 && mouseEvent ? 
					mouseEvent.chartY - plotTop : // place shared tooltip next to the mouse (#424)
					inverted ? chart.plotHeight - plotX : plotY
			];
		}

		return map(ret, mathRound);
	},
	
	/**
	 * Place the tooltip in a chart without spilling over
	 * and not covering the point it self.
	 */
	getPosition: function (boxWidth, boxHeight, point) {
		
		var chart = this.chart,
			distance = this.distance,
			ret = {},
			h = point.h || 0, // #4117
			swapped,
			first = ['y', chart.chartHeight, boxHeight, point.plotY + chart.plotTop],
			second = ['x', chart.chartWidth, boxWidth, point.plotX + chart.plotLeft],
			// The far side is right or bottom
			preferFarSide = pick(point.ttBelow, (chart.inverted && !point.negative) || (!chart.inverted && point.negative)),
			/**
			 * Handle the preferred dimension. When the preferred dimension is tooltip
			 * on top or bottom of the point, it will look for space there.
			 */
			firstDimension = function (dim, outerSize, innerSize, point) {
				var roomLeft = innerSize < point - distance,
					roomRight = point + distance + innerSize < outerSize,
					alignedLeft = point - distance - innerSize,
					alignedRight = point + distance;

				if (preferFarSide && roomRight) {
					ret[dim] = alignedRight;
				} else if (!preferFarSide && roomLeft) {
					ret[dim] = alignedLeft;
				} else if (roomLeft) {
					ret[dim] = alignedLeft - h < 0 ? alignedLeft : alignedLeft - h;
				} else if (roomRight) {
					ret[dim] = alignedRight + h + innerSize > outerSize ? alignedRight : alignedRight + h;
				} else {
					return false;
				}
			},
			/**
			 * Handle the secondary dimension. If the preferred dimension is tooltip
			 * on top or bottom of the point, the second dimension is to align the tooltip
			 * above the point, trying to align center but allowing left or right
			 * align within the chart box.
			 */
			secondDimension = function (dim, outerSize, innerSize, point) {
				// Too close to the edge, return false and swap dimensions
				if (point < distance || point > outerSize - distance) {
					return false;
				
				// Align left/top
				} else if (point < innerSize / 2) {
					ret[dim] = 1;
				// Align right/bottom
				} else if (point > outerSize - innerSize / 2) {
					ret[dim] = outerSize - innerSize - 2;
				// Align center
				} else {
					ret[dim] = point - innerSize / 2;
				}
			},
			/**
			 * Swap the dimensions 
			 */
			swap = function (count) {
				var temp = first;
				first = second;
				second = temp;
				swapped = count;
			},
			run = function () {
				if (firstDimension.apply(0, first) !== false) {
					if (secondDimension.apply(0, second) === false && !swapped) {
						swap(true);
						run();
					}
				} else if (!swapped) {
					swap(true);
					run();
				} else {
					ret.x = ret.y = 0;
				}
			};

		// Under these conditions, prefer the tooltip on the side of the point
		if (chart.inverted || this.len > 1) {
			swap();
		}
		run();

		return ret;
	
	},

	/**
	 * In case no user defined formatter is given, this will be used. Note that the context
	 * here is an object holding point, series, x, y etc.
	 */
	defaultFormatter: function (tooltip) {
		var items = this.points || splat(this),
			s;

		// build the header
		s = [tooltip.tooltipFooterHeaderFormatter(items[0])]; //#3397: abstraction to enable formatting of footer and header

		// build the values
		s = s.concat(tooltip.bodyFormatter(items));

		// footer
		s.push(tooltip.tooltipFooterHeaderFormatter(items[0], true)); //#3397: abstraction to enable formatting of footer and header

		return s.join('');
	},

	/**
	 * Refresh the tooltip's text and position.
	 * @param {Object} point
	 */
	refresh: function (point, mouseEvent) {
		var tooltip = this,
			chart = tooltip.chart,
			label = tooltip.label,
			options = tooltip.options,
			x,
			y,
			anchor,
			textConfig = {},
			text,
			pointConfig = [],
			formatter = options.formatter || tooltip.defaultFormatter,
			hoverPoints = chart.hoverPoints,
			borderColor,
			shared = tooltip.shared,
			currentSeries;
			
		clearTimeout(this.hideTimer);
		
		// get the reference point coordinates (pie charts use tooltipPos)
		tooltip.followPointer = splat(point)[0].series.tooltipOptions.followPointer;
		anchor = tooltip.getAnchor(point, mouseEvent);
		x = anchor[0];
		y = anchor[1];

		// shared tooltip, array is sent over
		if (shared && !(point.series && point.series.noSharedTooltip)) {
			
			// hide previous hoverPoints and set new
			
			chart.hoverPoints = point;
			if (hoverPoints) {
				each(hoverPoints, function (point) {
					point.setState();
				});
			}

			each(point, function (item) {
				item.setState(HOVER_STATE);

				pointConfig.push(item.getLabelConfig());
			});

			textConfig = {
				x: point[0].category,
				y: point[0].y
			};
			textConfig.points = pointConfig;
			this.len = pointConfig.length;
			point = point[0];

		// single point tooltip
		} else {
			textConfig = point.getLabelConfig();
		}
		text = formatter.call(textConfig, tooltip);

		// register the current series
		currentSeries = point.series;
		this.distance = pick(currentSeries.tooltipOptions.distance, 16);

		// update the inner HTML
		if (text === false) {
			this.hide();
		} else {

			// show it
			if (tooltip.isHidden) {
				stop(label);
				label.attr('opacity', 1).show();
			}

			// update text
			label.attr({
				text: text
			});

			// set the stroke color of the box
			borderColor = options.borderColor || point.color || currentSeries.color || '#606060';
			label.attr({
				stroke: borderColor
			});
			tooltip.updatePosition({ 
				plotX: x, 
				plotY: y, 
				negative: point.negative, 
				ttBelow: point.ttBelow, 
				h: anchor[2] || 0
			});
		
			this.isHidden = false;
		}
		fireEvent(chart, 'tooltipRefresh', {
				text: text,
				x: x + chart.plotLeft,
				y: y + chart.plotTop,
				borderColor: borderColor
			});
	},
	
	/**
	 *