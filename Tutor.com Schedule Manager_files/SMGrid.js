//week days columns
var week_days =
						[
							"", "SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"
						];

//hours row headers
var hours =
					[
						"", "12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM", "10PM", "11PM"
					];

//summary
var summary =
					[
						"Cost", "", "", "", "", "", "", ""
					];



var INTHEPAST = '#BBBBBB';
var NONOPERATING = '#DDDDDD';
var OPERATING = '#E5E5C3';
var UNFILLED = '#FFCC99';
var FILLED = '#99CC99';

var header_color = '#4682B4';
var row_header_color = '#B0C4DE';
var row_header_alternative_color = '#F0F8FF';
var summory_header_color = '#C9C9C9';
var gridRightMargin = 6;
var isMSIE = /*@cc_on!@*/0;

/*
*/
function SMGrid() {
	return {

		smg_parent: null,
		smg_selectable_container: null,
		row_count: 0,
		column_count: 0,
		max_cells: 208, /*all cells with headers, row's headers and summory row*/
		max_cols: 8, /*including 1 header*/
		max_rows: 26, /*including 2 headers*/
		smCells: [],
		smCellsSelected: [],
		isAdmin: false,
		init: function (parent, container, isAdmin) {

			this.smCells = [];
			this.smCellsSelected = [];
			var headerIndex = 0;
			var rowHeaderIndex = 0;
			var sumIndex = 0;
			var cellIndex = 0;

			//parent
			this.smg_parent = parent;
			//selectable
			this.smg_selectable_container = container;
			//is admin 
			this.isAdmin = isAdmin;

			/*When in quirks had to have this
			if (isMSIE) {
			gridRightMargin = 0;
			}*/

			if (!isAdmin) {

				this.max_cells = this.max_cells - 8;
				this.max_rows = this.max_rows - 1;
			}

			for (i = 0; i < this.max_cells; i++) {
				var cell;
				//header 
				if (i >= 0 && i < this.max_cols) {

					cell = new Cell(i, headerIndex, week_days[i], true, this.row_count, this.column_count, header_color);
					cell.setHTMLValue('<li id="cellDays' + i + '" class="ui-selectable-disabled gridcell header">' + cell.value + '</li>');
					this.column_count++;
					headerIndex++;

				}
				//row's header 
				else if (i % this.max_cols == 0) {

					this.row_count++;
					this.column_count = 0;
					var color = (this.row_count % 2 == 0) ? row_header_color : row_header_alternative_color;
					if (isAdmin && (this.row_count == this.max_rows - 1)) {
						color = summory_header_color;
					}
					cell = new Cell(i, rowHeaderIndex, ((isAdmin && (i == this.max_cells - this.max_cols)) ? summary[i - (this.max_cells - this.max_cols)] : hours[i / this.max_cols]), true, this.row_count, this.column_count, color);
					cell.setHTMLValue('<li id="cellHours' + i + '" class="ui-selectable-disabled gridcell rowheader">' + cell.value + '</li>');
					rowHeaderIndex++;

				}
				//summary 
				else if (isAdmin && (i >= (this.max_cells - this.max_cols + 1) && i < this.max_cells)) {

					this.column_count++;
					cell = new Cell(i, sumIndex, summary[i - (this.max_cells - this.max_cols)], true, this.row_count, this.column_count, summory_header_color);
					cell.setHTMLValue('<li id="cellSum' + sumIndex + '" class="ui-selectable-disabled gridcell sum">' + cell.value + '</li>');
					sumIndex++;

				}
				else {

					this.column_count++;
					cell = new Cell(i, cellIndex, hours[this.row_count], false, this.row_count, this.column_count, UNFILLED);
					cell.setHTMLValue('<li id="cell' + cellIndex + '" class="ui-state-default"></li>');
					cellIndex++;
				}

				this.smCells[i] = cell;

				$(this.smg_selectable_container).append(cell.htmlValue);
			}
		},

		getSelectedCells: function () {

			this.smCellsSelected = [];
			//
			for (i = 0; i < this.smCells.length; i++) {
				//not headers
				if (this.smCells[i].isHeader)
					continue;

				//only selected
				if (this.smCells[i].isSelected) {
					this.smCellsSelected.push(this.smCells[i]);
				}
			}

			return this.smCellsSelected;
		},

		resize: function () {
			var w = ($(this.smg_parent).width() / 8) - gridRightMargin;
			$(this.smg_selectable_container).find('li').css('width', w + 'px');
		}

	};
}

/*
*/
function Cell(index, specIndex, value, isHeader, row, col, backColor) {

	return {

		// Public properties		
		index: index,
		specIndex: specIndex,
		value: value,
		isHeader: isHeader,
		col: col,
		row: row,
		backColor: backColor,
		htmlValue: null,
		isSelected: false,
		providerGroups: [],
		providers: [],
		serializedCell: null,

		setValue: function (val) {
			this.value = val;
		},

		setHTMLValue: function (val) {
			this.htmlValue = val;
		},

		setSelected: function (val) {
			this.isSelected = val;
		},

		addProviderGroup: function (id, name, amountFilled, amountDesired) {

			if (this.providerGroups == null)
				this.providerGroups = new Array();

			var pg = new ProviderGroup(id, name, amountFilled, amountDesired);

			this.providerGroups.push(pg);

		},

		setProviderGroupAmountDesired: function (groupId, amount) {
			for (i = 0; i < this.providerGroups.length; i++) {
				if (this.providerGroups[i].id == groupId) {
					this.providerGroups[i].setAmountDesired(amount);
					break;
				}
			}
		},

		addProvider: function (id, name) {

			if (this.providers == null)
				this.providers = new Array();

			var p = new Provider(id, name);

			this.providers.push(p);

		},

		getHour: function () {
			return hours[row];
		},

		getWeekDay: function () {
			return col;
		},

		/*
		Serialized cell string format is:
		'index\trow_number\tcol_number\tvalue,color\t{{groupId,groupname,amountFilled,amountDesired}~{groupId,groupname,amountFilled,amountDesired}\t{{providerId,providerName}~{providerId,providerName}}}|'
		*/
		serialize: function () {
			var ser_val = this.specIndex + '\t' + this.row + '\t' + this.col + '\t' + this.value + '\t' + this.backColor + '\t';

			//provider groups			
			var pg = '{';
			if (this.providerGroups != null) {
				for (i = 0; i < this.providerGroups.length; i++) {
					pg += '{' + this.providerGroups[i].id + ',' + this.providerGroups[i].name + ',' + this.providerGroups[i].amountFilled + ',' + this.providerGroups[i].amountDesired + '}';
					if (i != this.providerGroups.length - 1) {
						pg += '~';
					}
				}
			}
			pg += '}';
			ser_val += pg + '\t';

			//providers
			var p = '{';
			if (this.providers != null) {
				for (i = 0; i < this.providers.length; i++) {
					p += '{' + this.providers[i].id + ',' + this.providers[i].name + '}';
					if (i != this.providers.length - 1) {
						p += '~';
					}
				}
			}
			p += '}';
			ser_val += p;

			ser_val += '\n';
			this.serializedCell = encodeURIComponent(ser_val);
			return this.serializedCell;
		}
	};
}

function ProviderGroup(id, name, amountFilled, amountDesired) {
	return {

		// Public properties		
		id: id,
		name: name,
		amountFilled: amountFilled,
		amountDesired: amountDesired,
		setAmountDesired: function (amount) {
			this.amountDesired = amount;
		}

	};
}

function Provider(id, name) {
	return {

		// Public properties		
		id: id,
		name: name
	};
} 