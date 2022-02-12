/**
 * @license Data plugin for Highcharts
 *
 * (c) 2012-2013 Torstein Hønsi
 * Last revision 2012-11-27
 *
 * License: www.highcharts.com/license
 */

/*
 * The Highcharts Data plugin is a utility to ease parsing of input sources like
 * CSV, HTML tables or grid views into basic configuration options for use 
 * directly in the Highcharts constructor.
 *
 * Demo: http://jsfiddle.net/highcharts/SnLFj/
 *
 * --- OPTIONS ---
 *
 * - columns : Array<Array<Mixed>>
 * A two-dimensional array representing the input data on tabular form. This input can
 * be used when the data is already parsed, for example from a grid view component.
 * Each cell can be a string or number. If not switchRowsAndColumns is set, the columns
 * are interpreted as series. See also the rows option.
 *
 * - complete : Function(chartOptions)
 * The callback that is evaluated when the data is finished loading, optionally from an 
 * external source, and parsed. The first argument passed is a finished chart options
 * object, containing series and an xAxis with categories if applicable. Thise options
 * can be extended with additional options and passed directly to the chart constructor.
 *
 * - csv : String
 * A comma delimited string to be parsed. Related options are startRow, endRow, startColumn
 * and endColumn to delimit what part of the table is used. The lineDelimiter and 
 * itemDelimiter options define the CSV delimiter formats.
 * 
 * - endColumn : Integer
 * In tabular input data, the first row (indexed by 0) to use. Defaults to the last 
 * column containing data.
 *
 * - endRow : Integer
 * In tabular input data, the last row (indexed by 0) to use. Defaults to the last row
 * containing data.
 *
 * - googleSpreadsheetKey : String 
 * A Google Spreadsheet key. See https://developers.google.com/gdata/samples/spreadsheet_sample
 * for general information on GS.
 *
 * - googleSpreadsheetWorksheet : String 
 * The Google Spreadsheet worksheet. The available id's can be read from 
 * https://spreadsheets.google.com/feeds/worksheets/{key}/public/basic
 *
 * - itemDelimiter : String
 * Item or cell delimiter for parsing CSV. Defaults to ",".
 *
 * - lineDelimiter : String
 * Line delimiter for parsing CSV. Defaults to "\n".
 *
 * - parsed : Function
 * A callback function to access the parsed columns, the two-dimentional input data
 * array directly, before they are interpreted into series data and categories.
 *
 * - parseDate : Function
 * A callback function to parse string representations of dates into JavaScript timestamps.
 * Return an integer on success.
 *
 * - rows : Array<Array<Mixed>>
 * The same as the columns input option, but defining rows intead of columns.
 *
 * - startColumn : Integer
 * In tabular input data, the first column (indexed by 0) to use. 
 *
 * - startRow : Integer
 * In tabular input data, the first row (indexed by 0) to use.
 *
 * - table : String|HTMLElement
 * A HTML table or the id of such to be parsed as input data. Related options ara startRow,
 * endRow, startColumn and endColumn to delimit what part of the table is used.
 */

// JSLint options:
/*global jQuery */

(function (Highcharts) {	
	
	// Utilities
	var each = Highcharts.each;
	
	
	// The Data constructor
	var Data = function (options) {
		this.init(options);
	};
	
	// Set the prototype properties
	Highcharts.extend(Data.prototype, {
		
	/**
	 * Initialize the Data object with the given options
	 */
	init: function (options) {
		this.options = options;
		this.columns = options.columns || this.rowsToColumns(options.rows) || [];

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

	dataFound: function () {
		// Interpret the values into right types
		this.parseTypes();
		
		// Use first row for series names?
		this.findHeaderRow();
		
		// Handle columns if a handleColumns callback is given
		this.parsed();
		
		// Complete if a complete callback is given
		this.complete();
		
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
			lines,
			activeRowNo = 0;
			
		if (csv) {
			
			lines = csv
				.replace(/\r\n/g, "\n") // Unix
				.replace(/\r/g, "\n") // Mac
				.split(options.lineDelimiter || "\n");
			
			each(lines, function (line, rowNo) {
				var trimmed = self.trim(line),
					isComment = trimmed.indexOf('#') === 0,
					isBlank = trimmed === '',
					items;
				
				if (rowNo >= startRow && rowNo <= endRow && !isComment && !isBlank) {
					items = line.split(options.itemDelimiter || ',');
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
			endColumn = options.endColumn || Number.MAX_VALUE,
			colNo;
			
		if (table) {
			
			if (typeof table === 'string') {
				table = document.getElementById(table);
			}
			
			each(table.getElementsByTagName('tr'), function (tr, rowNo) {
				colNo = 0; 
				if (rowNo >= startRow && rowNo <= endRow) {
					each(tr.childNodes, function (item) {
						if ((item.tagName === 'TD' || item.tagName === 'TH') && colNo >= startColumn && colNo <= endColumn) {
							if (!columns[colNo]) {
								columns[colNo] = [];					
							}
							columns[colNo][rowNo - startRow] = item.innerHTML;
							
							colNo += 1;
						}
					});
				}
			});

			this.dataFound(); // continue
		}
	},

	/**
	 * TODO: 
	 * - switchRowsAndColumns
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
			jQuery.getJSON('https://spreadsheets.google.com/feeds/cells/' + 
				  googleSpreadsheetKey + '/' + (options.googleSpreadsheetWorksheet || 'od6') +
					  '/public/values?alt=json-in-script&callback=?',
					  function (json) {
					
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
			});
		}
	},
	
	/**
	 * Find the header row. For now, we just check whether the first row contains
	 * numbers or strings. Later we could loop down and find the first row with 
	 * numbers.
	 */
	findHeaderRow: function () {
		var headerRow = 0;
		each(this.columns, function (column) {
			if (typeof column[0] !== 'string') {
				headerRow = null;
			}
		});
		this.headerRow = 0;			
	},
	
	/**
	 * Trim a string from whitespace
	 */
	trim: function (str) {
		return typeof str === 'string' ? str.replace(/^\s+|\s+$/g, '') : str;
	},
	
	/**
	 * Parse numeric cells in to number types and date types in to true dates.
	 * @param {Object} columns
	 */
	parseTypes: function () {
		var columns = this.columns,
			col = columns.length, 
			row,
			val,
			floatVal,
			trimVal,
			dateVal;
			
		while (col--) {
			row = columns[col].length;
			while (row--) {
				val = columns[col][row];
				floatVal = parseFloat(val);
				trimVal = this.trim(val);

				/*jslint eqeq: true*/
				if (trimVal == floatVal) { // is numeric
				/*jslint eqeq: false*/
					columns[col][row] = floatVal;
					
					// If the number is greater than m