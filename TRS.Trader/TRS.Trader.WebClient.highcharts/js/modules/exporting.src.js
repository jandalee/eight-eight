/**
 * @license Highcharts JS v4.1.7 (2015-06-26)
 * Exporting module
 *
 * (c) 2010-2014 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */

// JSLint options:
/*global Highcharts, HighchartsAdapter, document, window, Math, setTimeout */

(function (Highcharts) { // encapsulate

// create shortcuts
var Chart = Highcharts.Chart,
	addEvent = Highcharts.addEvent,
	removeEvent = Highcharts.removeEvent,
	fireEvent = HighchartsAdapter.fireEvent,
	createElement = Highcharts.createElement,
	discardElement = Highcharts.discardElement,
	css = Highcharts.css,
	merge = Highcharts.merge,
	each = Highcharts.each,
	extend = Highcharts.extend,
	splat = Highcharts.splat,
	math = Math,
	mathMax = math.max,
	doc = document,
	win = window,
	isTouchDevice = Highcharts.isTouchDevice,
	M = 'M',
	L = 'L',
	DIV = 'div',
	HIDDEN = 'hidden',
	NONE = 'none',
	PREFIX = 'highcharts-',
	ABSOLUTE = 'absolute',
	PX = 'px',
	UNDEFINED,
	symbols = Highcharts.Renderer.prototype.symbols,
	defaultOptions = Highcharts.getOptions(),
	buttonOffset;

	// Add language
	extend(defaultOptions.lang, {
		printChart: 'Print chart',
		downloadPNG: 'Download PNG image',
		downloadJPEG: 'Download JPEG image',
		downloadPDF: 'Download PDF document',
		downloadSVG: 'Download SVG vector image',
		contextButtonTitle: 'Chart context menu'
	});

// Buttons and menus are collected in a separate config option set called 'navigation'.
// This can be extended later to add control buttons like zoom and pan right click menus.
defaultOptions.navigation = {
	menuStyle: {
		border: '1px solid #A0A0A0',
		background: '#FFFFFF',
		padding: '5px 0'
	},
	menuItemStyle: {
		padding: '0 10px',
		background: NONE,
		color: '#303030',
		fontSize: isTouchDevice ? '14px' : '11px'
	},
	menuItemHoverStyle: {
		background: '#4572A5',
		color: '#FFFFFF'
	},

	buttonOptions: {
		symbolFill: '#E0E0E0',
		symbolSize: 14,
		symbolStroke: '#666',
		symbolStrokeWidth: 3,
		symbolX: 12.5,
		symbolY: 10.5,
		align: 'right',
		buttonSpacing: 3,
		height: 22,
		// text: null,
		theme: {
			fill: 'white', // capture hover
			stroke: 'none'
		},
		verticalAlign: 'top',
		width: 24
	}
};



// Add the export related options
defaultOptions.exporting = {
	//enabled: true,
	//filename: 'chart',
	type: 'image/png',
	url: 'http://export.highcharts.com/',
	//width: undefined,
	//scale: 2
	buttons: {
		contextButton: {
			menuClassName: PREFIX + 'contextmenu',
			//x: -10,
			symbol: 'menu',
			_titleKey: 'contextButtonTitle',
			menuItems: [{
				textKey: 'printChart',
				onclick: function () {
					this.print();
				}
			}, {
				separator: true
			}, {
				textKey: 'downloadPNG',
				onclick: function () {
					this.exportChart();
				}
			}, {
				textKey: 'downloadJPEG',
				onclick: function () {
					this.exportChart({
						type: 'image/jpeg'
					});
				}
			}, {
				textKey: 'downloadPDF',
				onclick: function () {
					this.exportChart({
						type: 'application/pdf'
					});
				}
			}, {
				textKey: 'downloadSVG',
				onclick: function () {
					this.exportChart({
						type: 'image/svg+xml'
					});
				}
			}
			// Enable this block to add "View SVG" to the dropdown menu
			/*
			,{

				text: 'View SVG',
				onclick: function () {
					var svg = this.getSVG()
						.replace(/</g, '\n&lt;')
						.replace(/>/g, '&gt;');

					doc.body.innerHTML = '<pre>' + svg + '</pre>';
				}
			} // */
			]
		}
	}
};

// Add the Highcharts.post utility
Highcharts.post = function (url, data, formAttributes) {
	var name,
		form;

	// create the form
	form = createElement('form', merge({
		method: 'post',
		action: url,
		enctype: 'multipart/form-data'
	}, formAttributes), {
		display: NONE
	}, doc.body);

	// add the data
	for (name in data) {
		createElement('input', {
			type: HIDDEN,
			name: name,
			value: data[name]
		}, null, form);
	}

	// submit
	form.submit();

	// clean up
	discardElement(form);
};

extend(Chart.prototype, {

	/**
	 * A collection of regex fixes on the produces SVG to account for expando properties,
	 * browser bugs, VML problems and other. Returns a cleaned SVG.
	 */
	sanitizeSVG: function (svg) {
		return svg
			.replace(/zIndex="[^"]+"/g, '')
			.replace(/isShadow="[^"]+"/g, '')
			.replace(/symbolName="[^"]+"/g, '')
			.replace(/jQuery[0-9]+="[^"]+"/g, '')
			.replace(/url\([^#]+#/g, 'url(#')
			.replace(/<svg /, '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ')
			.replace(/ (NS[0-9]+\:)?href=/g, ' xlink:href=') // #3567
			.replace(/\n/, ' ')
			// Any HTML added to the container after the SVG (#894)
			.replace(/<\/svg>.*?$/, '</svg>') 
			// Batik doesn't support rgba fills and strokes (#3095)
			.replace(/(fill|stroke)="rgba\(([ 0-9]+,[ 0-9]+,[ 0-9]+),([ 0-9\.]+)\)"/g, '$1="rgb($2)" $1-opacity="$3"')
			/* This fails in IE < 8
			.replace(/([0-9]+)\.([0-9]+)/g, function(s1, s2, s3) { // round off to save weight
				return s2 +'.'+ s3[0];
			})*/

			// Replace HTML entities, issue #347
			.replace(/&nbsp;/g, '\u00A0') // no-break space
			.replace(/&shy;/g,  '\u00AD') // soft hyphen

			// IE specific
			.replace(/<IMG /g, '<image ')
			.replace(/<(\/?)TITLE>/g, '<$1title>')
			.replace(/height=([^" ]+)/g, 'height="$1"')
			.replace(/width=([^" ]+)/g, 'width="$1"')
			.replace(/hc-svg-href="([^"]+)">/g, 'xlink:href="$1"/>')
			.replace(/ id=([^" >]+)/g, ' id="$1"') // #4003
			.replace(/class=([^" >]+)/g, 'class="$1"')
			.replace(/ transform /g, ' ')
			.replace(/:(path|rect)/g, '$1')
			.replace(/style="([^"]+)"/g, function (s) {
				return s.toLowerCase();
			});
	},

	/**
	 * Return an SVG representation of the chart
	 *
	 * @param additionalOptions {Object} Additional chart options for the generated SVG representation
	 */
	getSVG: function (additionalOptions) {
		var chart = this,
			chartCopy,
			sandbox,
			svg,
			seriesOptions,
			sourceWidth,
			sourceHeight,
			cssWidth,
			cssHeight,
			options = merge(chart.options, additionalOptions); // copy the options and add extra options

		// IE compatibility hack for generating SVG content that it doesn't really understand
		if (!doc.createElementNS) {
			/*jslint unparam: true*//* allow unused parameter ns in function below */
			doc.createElementNS = function (ns, tagName) {
				return doc.createElement(tagName);
			};
			/*jslint unparam: false*/
		}

		// create a sandbox where a new chart will be generated
		sandbox = createElement(DIV, null, {
			position: ABSOLUTE,
			top: '-9999em',
			width: chart.chartWidth + PX,
			height: chart.chartHeight + PX
		}, doc.body);

		// get the source size
		cssWidth = chart.renderTo.style.width;
		cssHeight = chart.renderTo.style.height;
		sourceWidth = options.exporting.sourceWidth ||
			options.chart.width ||
			(/px$/.test(cssWidth) && parseInt(cssWidth, 10)) ||
			600;
		sourceHeight = options.exporting.sourceHeight ||
			options.chart.height ||
			(/px$/.test(cssHeight) && parseInt(cssHeight, 10)) ||
			400;

		// override some options
		extend(options.chart, {
			animation: false,
			renderTo: sandbox,
			forExport: true,
			width: sourceWidth,
			height: sourceHeight
		});
		options.exporting.enabled = false; // hide buttons in print
		delete options.data; // #3004

		// prepare for replicating the chart
		options.series = [];
		each(chart.series, function (serie) {
			seriesOptions = merge(serie.options, {
				animation: false, // turn off animation
				enableMouseTracking: false,
				showCheckbox: false,
				visible: serie.visible
			});

			if (!seriesOptions.isInternal) { // used for the navigator series that has its own option set
				options.series.push(seriesOptions);
			}
		});

		// Axis options must be merged in one by one, since it may be an array or an object (#2022, #3900)
		if (additionalOptions) {
			each(['xAxis', 'yAxis'], function (axisType) {
				each(splat(additionalOptions[axisType]), function (axisOptions, i) {
					options[axisType][i] = merge(options[axisType][i], axisOptions);
				});
			});
		}

		// generate the chart copy
		chartCopy = new Highcharts.Chart(options, chart.callback);

		// reflect axis extremes in the export
		each(['xAxis', 'yAxis'], function (axisType) {
			each(chart[axisType], function (axis, i) {
				var axisCopy = chartCopy[axisType][i],
					extremes = axis.getExtremes(),
					userMin = extremes.userMin,
					userMax = extremes.userMax;

				if (axisCopy && (userMin !== UNDEFINED || userMax !== UNDEFINED)) {
					axisCopy.setExtremes(userMin, userMax, true, false);
				}
			});
		});

		// get the SVG from the container's innerHTML
		svg = chartCopy.container.innerHTML;

		// free up memory
		options = null;
		chartCopy.destroy();
		discardElement(sandbox);

		// sanitize
		svg = this.sanitizeSVG(svg);

		// IE9 beta bugs with innerHTML. Test again with final IE9.
		svg = svg.replace(/(url\(#highcharts-[0-9]+)&quot;/g, '$1')
			.replace(/&quot;/g, "'");

		return svg;
	},

	getSVGForExport: function (options, chartOptions) {
		var chartExportingOptions = this.options.exporting;

		return this.getSVG(merge(
			{ chart: { borderRadius: 0 } },
			chartExportingOptions.chartOptions,
			chartOptions,
			{
				exporting: {
					sourceWidth: (options && options.sourceWidth) || chartExportingOptions.sourceWidth,
					sourceHeight: (options && options.sourceHeight) || chartExportingOptions.sourceHeight
				}
			}
		));
	},

	/**
	 * Submit the SVG representation of the chart to the server
	 * @param {Object} options Exporting options. Possible members are url, type, width and formAttributes.
	 * @param {Object} chartOptions Additional chart options for the SVG representation of the chart
	 */
	exportChart: function (options, chartOptions) {
		
		var svg = this.getSVGForExport(options, chartOptions);

		// merge the options
		options = merge(this.options.exporting, options);

		// do the post
		Highcharts.post(options.url, {
			filename: options.filename || 'chart',
			type: options.type,
			width: options.width || 0, // IE8 fails to post undefined correctly, so use 0
			scale: options.scale || 2,
			svg: svg
		}, options.formAttributes);

	},

	/**
	 * Print the chart
	 */
	print: function () {

		var chart = this,
			container = chart.container,
			origDisplay = [],
			origParent = container.parentNode,
			body = doc.body,
			childNodes = body.childNodes;

		if (chart.isPrinting) { // block the button while in printing mode
			return;
		}

		chart.isPrinting = true;

		fireEvent(chart, 'beforePrint');

		// hide all body content
		each(childNodes, function (node, i) {
			if (node.nodeType === 1) {
				origDisplay[i] = node.style.display;
				node.style.display = NONE;
			}
		});

		// pull out the chart
		body.appendChild(container);

		// print
		win.focus(); // #1510
		win.print();

		// allow the browser to prepare before reverting
		setTimeout(function () {

			// put the chart back in
			origParent.appendChild(container);

			// restore all body content
			each(childNodes, function (node, i) {
				if (node.nodeType === 1) {
					node.style.display = origDisplay[i];
				}
			});

			chart.isPrinting = false;

			fireEvent(chart, 'afterPrint');

		}, 1000);

	},

	/**
	 * Display a popup menu for choosing the export type
	 *
	 * @param {String} className An identifier for the menu
	 * @param {Array} items A collection with tex