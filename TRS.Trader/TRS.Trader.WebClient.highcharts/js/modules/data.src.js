/**
 * @license Highcharts JS v4.1.7 (2015-06-26)
 * Data module
 *
 * (c) 2012-2014 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */

// JSLint options:
/*global jQuery, HighchartsAdapter */

(function (Highcharts) {
	
	// Utilities
	var each = Highcharts.each,
		pick = Highcharts.pick,
		inArray = HighchartsAdapter.inArray,
		splat = Highcharts.splat,
		SeriesBuilder;
	
	
	// The Data constructor
	var Data = function (dataOptions, chartOptions) {
		this.init(dataOptions, chartOptions);
	};
	
	// Set the prototype properties
	Highcharts.extend(Data.prototype, {
		
	/**
	 * Initialize the Data object with the given options
	 */
	init: function (options, chartOptions) {
		this.options = options;
		this.chartOptions = chartOptions;
		this.columns = options.columns || this.rowsToColumns(options.rows) || [];
		this.firstRowAsNames = pick(options.firstRowAsNames, true);
		this.decimalRegex = options.decimalPoint && new RegExp('^([0-9]+)' + options.decimalPoint + '([0-9]+)$');

		// This is a two-dimensional array holding the raw, trimmed string values
		// with the same organisation as the columns array. It makes it possible
		// for example to revert from interpreted timestamps to string-based
		// categories.
		this.rawColumns = [];

		// No need to parse or interpret anything
		if (this.columns.length) {
			this.dataFound();

		// Parse and interpret
		} else {

			// Parse a CSV string if options.csv is given
			this.parseCSV();
			
			// Parse a HTML table if options.table is given
			this.parseTable();

			// Parse a Google Spreadsheet 
			this.parseGoogleSpreadsheet();	
		}

	},

	/**
	 * Get the column distribution. For example, a line series takes a single column for 
	 * Y values. A range series takes two columns for low and high values respectively,
	 * and an OHLC series takes four columns.
	 */
	getColumnDistribution: function () {
		var chartOptions = this.chartOptions,
			options = this.options,
			xColumns = [],
			getValueCount = function (type) {
				return (Highcharts.seriesTypes[type || 'line'].prototype.pointArrayMap || [0]).length;
			},
			getPointArrayMap = function (type) {
				return Highcharts.seriesTypes[type || 'line'].prototype.pointArrayMap;
			},
			globalType = chartOptions && chartOptions.chart && chartOptions.chart.type,
			individualCounts = [],
			seriesBuilders = [],
			seriesIndex = 0,
			i;

		each((chartOptions && chartOptions.series) || [], function (series) {
			individualCounts.push(getValueCount(series.type || globalType));
		});

		// Collect the x-column indexes from seriesMapping
		each((options && options.seriesMapping) || [], function (mapping) {
			xColumns.push(mapping.x || 0);
		});

		// If there are no defined series with x-columns, use the first column as x column
		if (xColumns.length === 0) {
			xColumns.push(0);
		}

		// Loop all seriesMappings and constructs SeriesBuilders from
		// the mapping options.
		each((options && options.seriesMapping) || [], function (mapping) {
			var builder = new SeriesBuilder(),
				name,
				numberOfValueColumnsNeeded = individualCounts[seriesIndex] || getValueCount(globalType),
				seriesArr = (chartOptions && chartOptions.series) || [],
				series = seriesArr[seriesIndex] || {},
				pointArrayMap = getPointArrayMap(series.type || globalType) || ['y'];

			// Add an x reader from the x property or from an undefined column
			// if the property is not set. It will then be auto populated later.
			builder.addColumnReader(mapping.x, 'x');

			// Add all column mappings
			for (name in mapping) {
				if (mapping.hasOwnProperty(name) && name !== 'x') {
					builder.addColumnReader(mapping[name], name);
				}
			}

			// Add missing columns
			for (i = 0; i < numberOfValueColumnsNeeded; i++) {
				if (!builder.hasReader(pointArrayMap[i])) {
					//builder.addNextColumnReader(pointArrayMap[i]);
					// Create and add a column reader for the next free column index
					builder.addColumnReader(undefined, pointArrayMap[i]);
				}
			}

			seriesBuilders.push(builder);
			seriesIndex++;
		});

		var globalPointArrayMap = getPointArrayMap(globalType);
		if (globalPointArrayMap === undefined) {
			globalPointArrayMap = ['y'];
		}

		this.valueCount = {
			global: getValueCount(globalType),
			xColumns: xColumns,
			individual: individualCounts,
			seriesBuilders: seriesBuilders,
			globalPointArrayMap: globalPointArrayMap
		};
	},

	/**
	 * When the data is parsed into columns, either by CSV, table, GS or direct input,
	 * continue with other operations.
	 */
	dataFound: function () {
		
		if (this.options.switchRowsAndColumns) {
			this.columns = this.rowsToColumns(this.columns);
		}

		// Interpret the info about series and columns
		this.getColumnDistribution();

		// Interpret the values into right types
		this.parseTypes();
		
		// Handle columns if a handleColumns callback is given
		if (this.parsed() !== false) {
		
			// Complete if a complete callback is given
			this.complete();
		}
		
	},
	
	/**
	 * Parse a CSV input string
	 */
	parseCSV: function () {
		var self = this,
			options = this.options,
			csv = options.csv,
			columns = this.columns,
			startRow = options.startRow || 0,
			endRow = options.endRow || Number.MAX_VALUE,
			startColumn = options.startColumn || 0,
			endColumn = options.endColumn || Number.MAX_VALUE,
			itemDelimiter,
			lines,
			activeRowNo = 0;
			
		if (csv) {
			
			lines = csv
				.replace(/\r\n/g, "\n") // Unix
				.replace(/\r/g, "\n") // Mac
				.split(options.lineDelimiter || "\n");

			itemDelimiter = options.itemDelimiter || (csv.indexOf('\t') !== -1 ? '\t' : ',');
			
			each(lines, function (line, rowNo) {
				var trimmed = self.trim(line),
					isComment = trimmed.indexOf('#') === 0,
					isBlank = trimmed === '',
					items;
				
				if (rowNo >= startRow && rowNo <= endRow && !isComment && !isBlank) {
					items = line.split(itemDelimiter);
					each(items, function (item, colNo) {
						if (colNo >= startColumn && colNo <= endColumn) {
							if (!columns[colNo - startColumn]) {
								columns[colNo - startColumn] = [];					
							}
							
							columns[colNo - startColumn][activeRowNo] = item;
						}
					});
					activeRowNo += 1;
				}
			});

			this.dataFound();
		}
	},
	
	/**
	 * Parse a HTML table
	 */
	parseTable: function () {
		var options = this.options,
			table = options.table,
			columns = this.columns,
			startRow = options.startRow || 0,
			endRow = options.endRow || Number.MAX_VALUE,
			startColumn = options.startColumn || 0,
			endColumn = options.endColumn || Number.MAX_VALUE;

		if (table) {
			
			if (typeof table === 'string') {
				table = document.getElementById(table);
			}
			
			each(table.getElementsByTagName('tr'), function (tr, rowNo) {
				if (rowNo >= startRow && rowNo <= endRow) {
					each(tr.children, function (item, colNo) {
						if ((item.tagName === 'TD' || item.tagName === 'TH') && colNo >= startColumn && colNo <= endColumn) {
							if (!columns[colNo - startColumn]) {
								columns[colNo - startColumn] = [];					
							}
							
							columns[colNo - startColumn][rowNo - startRow] = item.innerHTML;
						}
					});
				}
			});

			this.dataFound(); // continue
		}
	},

	/**
	 */
	parseGoogleSpreadsheet: function () {
		var self = this,
			options = this.options,
			googleSpreadsheetKey = options.googleSpreadsheetKey,
			columns = this.columns,
			startRow = options.startRow || 0,
			endRow = options.endRow || Number.MAX_VALUE,
			startColumn = options.startColumn || 0,
			endColumn = options.endColumn || Number.MAX_VALUE,
			gr, // google row
			gc; // google column

		if (googleSpreadsheetKey) {
			jQuery.ajax({
				dataType: 'json', 
				url: 'https://spreadsheets.google.com/feeds/cells/' + 
				  googleSpreadsheetKey + '/' + (options.googleSpreadsheetWorksheet || 'od6') +
					  '/public/values?alt=json-in-script&callback=?',
				error: options.error,
				success: function (json) {
					// Prepare the data from the spreadsheat
					var cells = json.feed.entry,
						cell,
						cellCount = cells.length,
						colCount = 0,
						rowCount = 0,
						i;
				
					// First, find the total number of columns and rows that 
					// are actually filled with data
					for (i = 0; i < cellCount; i++) {
						cell = cells[i];
						colCount = Math.max(colCount, cell.gs$cell.col);
						rowCount = Math.max(rowCount, cell.gs$cell.row);			
					}
				
					// Set up arrays containing the column data
					for (i = 0; i < colCount; i++) {
						if (i >= startColumn && i <= endColumn) {
							// Create new columns with the length of either end-start or rowCount
							columns[i - startColumn] = [];

							// Setting the length to avoid jslint warning
							columns[i - startColumn].length = Math.min(rowCount, endRow - startRow);
						}
					}
					
					// Loop over the cells and assign the value to the right
					// place in the column arrays
					for (i = 0; i < cellCount; i++) {
						cell = cells[i];
						gr = cell.gs$cell.row - 1; // rows start at 1
						gc = cell.gs$cell.col - 1; // columns start at 1

						// If both row and col falls inside start and end
						// set the transposed cell value in the newly created columns
						if (gc >= startColumn && gc <= endColumn &&
							gr >= startRow && gr <= endRow) {
							columns[gc - startColumn][gr - startRow] = cell.content.$t;
						}
					}
					self.dataFound();
				}
			});
		}
	},
	
	/**
	 * Trim a string from whitespace
	 */
	trim: function (str, inside) {
		if (typeof str === 'string') {
			str = str.replace(/^\s+|\s+$/g, '');

			// Clear white space insdie the string, like thousands separators
			if (inside && /^[0-9\s]+$/.test(str)) { 
				str = str.replace(/\s/g, '');
			}

			if (this.decimalRegex) {
				str = str.replace(this.decimalRegex, '$1.$2');
			}
		}
		return str;
	},
	
	/**
	 * Parse numeric cells in to number types and date types in to true dates.
	 */
	parseTypes: function () {
		var columns = this.columns,
			col = columns.length;

		while (col--) {
			this.parseColumn(columns[col], col);
		}

	},

	/**
	 * Parse a single column. Set properties like .isDatetime and .isN