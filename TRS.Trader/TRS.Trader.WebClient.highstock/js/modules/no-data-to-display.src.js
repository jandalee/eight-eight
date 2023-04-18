/**
 * @license Highstock JS v2.1.7 (2015-06-26)
 * Plugin for displaying a message when there is no data visible in chart.
 *
 * (c) 2010-2014 Highsoft AS
 * Author: Oystein Moseng
 *
 * License: www.highcharts.com/license
 */

(function (H) {
	
	var seriesTypes = H.seriesTypes,
		chartPrototype = H.Chart.prototype,
		defaultOptions = H.getOptions(),
		extend = H.extend,
		each = H.each;

	// Add language option
	extend(defaultOptions.lang, {
		noData: 'No data to display'
	});
	
	// Add default display options for message
	defaultOptions.noData = {
		position: {
			x: 0,
			y: 0,			
			align: 'center',
			verticalAlign: 'middle'
		},
		attr: {						
		},
		style: {	
			fontWeight: 'bold',		
			fontSize: '12px',
			color: '#60606a'		
		}
		// useHTML: false // docs
	};

	/**
	 * Define hasData functions for series. These return true if there are data points on this series within the plot area
	 */	
	function hasDataPie() {
		return !!this.points.length; /* != 0 */
	}

	each(['pie', 'gauge', 'waterfall', 'bubble'], function (type) {
		if (seriesTypes[type]) {
			seriesTypes[type].prototype.hasData = hasDataPie;
		}
	});

	H.Series.prototype.hasData = function () {
		return this.visible && this.dataMax !== undefined && this.dataMin !== undefined; 