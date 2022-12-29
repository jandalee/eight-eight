/**
 * Gray theme for Highcharts JS
 * @author Torstein Honsi
 */

Highcharts.theme = {
	colors: ["#DDDF0D", "#7798BF", "#55BF3B", "#DF5353", "#aaeeee", "#ff0066", "#eeaaee",
		"#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
	chart: {
		backgroundColor: {
			linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
			stops: [
				[0, 'rgb(96, 96, 96)'],
				[1, 'rgb(16, 16, 16)']
			]
		},
		borderWidth: 0,
		borderRadius: 0,
		plotBackgroundColor: null,
		plotShadow: false,
		plotBorderWidth: 0
	},
	title: {
		style: {
			color: '#FFF',
			font: '16px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
		}
	},
	subtitle: {
		style: {
			color: '#DDD',
			font: '12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
		}
	},
	xAxis: {
		gridLineWidth: 0,
		lineColor: '#999',
		tickColor: '#999',
		labels: {
			style: {
				color: '#999',
				fontWeight: 'bold'
			}
		},
		title: {
			style: {
				color: '#AAA',
				font: 'bold 12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
			}
		}
	},
	yAxis: {
		alternateGridColor: null,
		minorTickInterval: null,
		gridLineColor: 'rgba(255, 255, 255, .1)',
		minorGridLineColor: 'rgba(255,255,255,0.07)',
		lineWidth: 0,
		tickWidth: 0,
		labels: {
			style: {
				color: '#999',
				fontWeight: 'bold'
			}
		},
		title: {
			style: {
				color: '#AAA',
				font: 'bold 12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
			}
		}
	},
	legend: {
		itemStyle: {
			color: '#CCC'
		},
		itemHoverStyle: {
			color: '#FFF'
		},
		itemHiddenStyle: {
			color: '#333'
		}