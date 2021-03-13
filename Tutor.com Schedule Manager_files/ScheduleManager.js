//set variable for grid to know we are manually handling the first column
m_RMGManualFirstColSelector = true;

//private:
var m_SomethingAvailable = false;
var selectedWeekDate;
var theScheduledProviders = new Object();
var thePartiallyScheduledProviders = new Object();

var INTHEPAST = '#bbbbbb';
var NONOPERATING = '#dddddd';
var OPERATING = '#e5e5c3';
var UNFILLED = '#ffcc99';
var FILLED = '#99cc99';
	
var appMode;

var selCells;

//public:
function SetMode(mode) {
	appMode = mode;
}

function ChangeWeek(date, daysToAdd) {

	showWait();

	if (date == null)
		selectedDate = selectedWeekDate;
	else
		selectedDate = date;
		
	append = '';
	if (daysToAdd != null)
		append = '&DaysToAdd=' + daysToAdd;
		
	this.location = 'default.aspx?SelectedDate=' + selectedDate + append;
}

function ClearSelected() {
	theScheduledProviders = new Object();
	thePartiallyScheduledProviders = new Object();
		
	for (j = document.getElementById("lstSelected").options.length - 1; j >= 0; j--)
		document.getElementById("lstSelected").options[j] = null;
}
		
function AddSelected(name, id) {
	theScheduledProviders[id] = theProviderGroups[-1].providers[id];
}
	
function AddPartiallySelected(name, id) {
	thePartiallyScheduledProviders[id] = theProviderGroups[-1].providers[id];
}
	
function RemoveSelected(name, id) {
	theScheduledProviders[id] = null;
}
	
function loadDefault(leaveSelected) {
	if (appMode == false)
		return;

	var groupID = '';
	//get selected group
	if ($('#cboGroup').val() >= 0)
		groupID = $('#cboGroup').val();

	if (groupID == '')
		groupID = -1;
		
	var posSelected = -1;
	var posAvailable = -1;
	var theSelectedOptions = new Array();
	var theAvailableOptions = new Array();
		
	var theGroup = theProviderGroups[groupID];

	var hasDegreeSelectProvider = 0;
	var voiceSelectApprovedProvider = 0;
	var hasDegreeProvider = 0;
	var voiceApprovedProvider = 0;
	
	//get list in alpha order
	var sorted = [];
	for (var j in theGroup.providers) {
		prov = theGroup.providers[j];
		
		sorted[sorted.length] = prov.name + '$' + prov.id;
	}
	sorted.sort();

	//restore available/selected lists for this group
	for (var i in sorted) {
		//find the id
		s = sorted[i];
		j = s.substring(s.indexOf('$') + 1);

		prov = theGroup.providers[j];

		//is this provider scheduled?
		if (theScheduledProviders[prov.id] != null) {
			theSelectedOptions[++posSelected] = '<OPTION VALUE="' + prov.id + '">' + prov.name + '</OPTION>';

			if (Number(prov.hasDegree) == 1) {
				hasDegreeSelectProvider = hasDegreeSelectProvider + 1;
			};

			if (Number(prov.voiceApproved) == 1) {
				voiceSelectApprovedProvider = voiceSelectApprovedProvider + 1;
			}

		}
		else {
			theAvailableOptions[++posAvailable] = '<OPTION VALUE="' + prov.id + '" ' + ((thePartiallyScheduledProviders[prov.id] != null) ? ' selected ' : '') + '>' + prov.name + '</OPTION>';

			if (Number(prov.hasDegree) == 1) {
				hasDegreeProvider = hasDegreeProvider + 1;
			};

			if (Number(prov.voiceApproved) == 1) {
				voiceApprovedProvider = voiceApprovedProvider + 1;
			}

		}
	}

	document.getElementById("lstSelected").outerHTML = '<SELECT id="lstSelected" class="smallerText" style="WIDTH:175px" multiple size=7 name="lstSelected" onchange="setScheduleButtons();">' + theSelectedOptions.join() + '</SELECT>';
	document.getElementById("lstAvailable").outerHTML = '<SELECT id="lstAvailable" class="smallerText" style="WIDTH:175px" multiple size=7 name="lstAvailable" onchange="setScheduleButtons();">' + theAvailableOptions.join() + '</SELECT>';
	if (Number(ProgramId) == 4) {
		document.getElementById("divAvailableCount").innerHTML = 'AVAILABLE ' + '<lable class="smallerText">' + '(' + document.getElementById("lstAvailable").options.length + ', d:' + hasDegreeProvider + ', v:' + voiceApprovedProvider + ')' + '</lable>';
		document.getElementById("divSelectedCount").innerHTML = '<a href="javascript:alertScheduled();">SCHEDULED ' + '<lable class="smallerText">' + '(' + document.getElementById("lstSelected").options.length + ', d:' + hasDegreeSelectProvider + ', v:' + voiceSelectApprovedProvider + ')' + '</lable></a>';
	}
	else {
		document.getElementById("divAvailableCount").innerHTML = 'AVAILABLE (' + document.getElementById("lstAvailable").options.length +  ')';
		document.getElementById("divSelectedCount").innerHTML = '<a href="javascript:alertScheduled();">SCHEDULED (' + document.getElementById("lstSelected").options.length +')</a>';	
	}

	//set the desired count for this group
	document.getElementById("txtAmountDesired").value = theGroup.amountDesired;

	if (leaveSelected) {
		for (j = document.getElementById("lstSelected").options.length - 1; j >= 0; j--)
			document.getElementById("lstSelected").options[j].selected = false;
	}
}
	
//private:		
function loadWeek(firstDayOfWeek, date, weekText) {
	
	selectedWeekDate = firstDayOfWeek;
		
	document.getElementById("txtSelectedDate").value = date;
		
	document.getElementById("fraCalendar").src = 'Calendar.aspx?SelectedDate=' + date;
	document.getElementById("divSelectedWeek").innerHTML = '<a href="javascript:doRefresh();">' + weekText + '</a>';
}

function setButtonState(disabled) {
	if (disabled)
		showWait();
			
	document.getElementById("butSetDesiredGroupAmount").disabled = disabled;
	document.getElementById("butScheduleSelectedServer").disabled = disabled;
	document.getElementById("butUnscheduleSelected").disabled = disabled;
}

function setProviderButtonState(disabled) {
	document.getElementById("butProviderSchedule").disabled = disabled;
	document.getElementById("butProviderUnschedule").disabled = disabled;
}

function loadScheduledProvidersFromSelectedCells(setVarsOnly) {
	
	m_SomethingAvailable = false;

	var somethingAddable = false;
	var somethingRemovable = false;

	selCells = smGrid.getSelectedCells();	

	for (i = 0; i < selCells.length; i++) {
		
		var color = selCells[i].backColor;
		
		if (color != NONOPERATING && color != INTHEPAST)
			m_SomethingAvailable = true;

		if (color == OPERATING)
			somethingAddable = true;

		else if (color == FILLED)
			somethingRemovable = true;		
	}	

	if (setVarsOnly)
		return;

	if (appMode == false) {
		
		//enable/disable schedule/remove buttons\
		if (document.getElementById('butProviderSchedule'))
			document.getElementById('butProviderSchedule').disabled = !somethingAddable;

		if (document.getElementById('butProviderUnschedule'))
			document.getElementById('butProviderUnschedule').disabled = !somethingRemovable;
		
		return;
	}

	//if (!setVarsOnly)
	//	setButtonState(true);

	//build QS of all selected cells
	pos = 0;
	qs = '';

	for (i = 0; i < selCells.length; i++) {

		qs += 'sc' + pos + '=' + (selCells[i].col) + '-' + selCells[i].value + '&';
		pos++;
		
	}

	url = 'SchedulerWorker.aspx?Type=Get&Week=' + selectedWeekDate + '&' + qs;
	
	showWait();
	setTimeout('loadUrl("' + url + '");', 250);
}
			
function isDigit(num) {
	if (num.length > 1)
		return false;
			
	var string = "1234567890";
	if (string.indexOf(num) != -1)
		return true;
	
	return false;
}

function isInteger(val) {
	if (val == '') return false;
		
	for (var i = 0; i < val.length; i++) {
		if (!isDigit(val.charAt(i)))
			return false;
	}

	return true;
}


function butSetDesiredGroupAmountClick(isPercent, desiredFoo) {

	if (isPercent) {
		//allow negative sign in front
		parseVal = document.getElementById("txtAdjustAmountDesired").value;
		if (parseVal.substring(0, 1) == "-")
			parseVal = parseVal.substring(1);

		if (isInteger(parseVal) == false) {
			alert('Please specify a valid integer.');
			return false;
		}
	}
	else {
		if (isInteger(document.getElementById("txtAmountDesired").value) == false) {
			alert('Please specify a valid integer.');
			return false;
		}
	}

	if (window.confirm('Are you sure you want to change the desired ' + desiredFoo + '?') == false)
		return false;

	//ED NOTE: when disabling button it won't fire onclick handler in asp.net code behind.
	//document.getElementById("butAdjustAmountDesired").disabled = true;
	//setButtonState(true);
	
	return true;
}

function butSetIncreaseAmountClick(desiredFoo) {

	if (isInteger(document.getElementById("txtIncreaseAmountDesired").value) == false) {
		alert('Please specify a valid integer.');
		return false;
	}

	if (window.confirm('Are you sure you want to change the desired ' + desiredFoo + '?') == false)
		return false;

	return true;
}

function butApplyForNextXWeeksClick()
{
	if (isInteger(document.getElementById("txtApplyForNextXWeeks").value) == false)
	{
		alert('Please specify a valid integer.');
		return false;
	}
	    	        
	//don't allow more than 1 year at a time
	if (parseInt(document.getElementById("txtApplyForNextXWeeks").value) > 52)
	{
		alert('You can only apply this schedule up to 1 year at a time.');
		return false;
	}
	        
	if (window.confirm('Are you sure you want to apply this week\'s schedule to the next ' + document.getElementById("txtApplyForNextXWeeks").value + ' week(s)? This will replace any existing schedule.') == false)
		return false;

	//ED NOTE: when disabling button it won't fire onclick handler in asp.net code behind.
	//document.getElementById("butApplyForNextXWeeks").disabled = true;
	//setButtonState(true);
			
	return true;	
}

function setScheduleButtons() {

	if (appMode == false)
		return;

	loadScheduledProvidersFromSelectedCells(true);
	
	showWait(true);
			
	if (document.getElementById("cboGroup").selectedIndex >= 0)
		groupID = document.getElementById("cboGroup").options[document.getElementById("cboGroup").selectedIndex].value;
	else
		groupID = -1;
		
	/*
	if (groupID == -1) {
		document.getElementById("txtAmountDesired").disabled = true;
		document.getElementById("butSetDesiredGroupAmount").disabled = true;
	}
	else {
		document.getElementById("txtAmountDesired").disabled = !m_SomethingAvailable;
		document.getElementById("butSetDesiredGroupAmount").disabled = !m_SomethingAvailable;
	}*/

	document.getElementById("butScheduleSelectedServer").disabled = !m_SomethingAvailable || !containsSelected(document.getElementById("lstAvailable"));
	document.getElementById("butUnscheduleSelected").disabled = !containsSelected(document.getElementById("lstSelected"));
}
		
function containsSelected(sel) {
	for (j = sel.options.length - 1; j >= 0; j--) {
		if (sel.options[j].selected == true)
			return true;
	}

	return false;
}

function highlightCell(cell, color) {
	document.getElementById(cell).bgColor = color;
}
			
//client-side scheduling functions for provider scheduling
var continueScheduling = true;
var scheduleNextSelectedHours;
var lastSelectedHour = -1;
var previousResult = 0;
var m_Type;
var m_TimeoutTime = 100;
			
function scheduleSelected(schedule) {
	
	if (schedule)
		m_Type = 'Set';
	else
		m_Type = 'Remove';
	
	setProviderButtonState(true);
		
	//store selected day/hours
	scheduleNextSelectedHours = new Array(168);
	
	selCells = smGrid.getSelectedCells();

	counter = 0;

	for (i = 0; i < selCells.length; i++) {

		var color = selCells[i].backColor;
		
		//check if we should process this cell
		if (schedule)
			processIt = (color == OPERATING);
		else
			processIt = (color == FILLED);

		if (processIt) {
			scheduleNextSelectedHours[counter] = selCells[i];
			counter++;
		}

	}

	lastSelectedHour = -1;

	continueScheduling = true;

	scheduleNextSelected();

}

function scheduleNextSelected() {

	//if our previous call has not come back or we are not finished processing all selected tutors, continueScheduling will still be false
	if (continueScheduling == false)
		setTimeout('scheduleNextSelected()', m_TimeoutTime);
	else {
	
		continueScheduling = false;

		//update last processed cell if this is not our first time through
		if (lastSelectedHour != -1) {
			
			cell = scheduleNextSelectedHours[lastSelectedHour];
					
			//update cell to reflect result of operation
			if (m_Type == 'Set') {
				
				//previousResult: 0 = scheduled; 1 = no longer available ; -1 = cap
			    if (previousResult == 1) {

			        cell.backColor = FILLED;
			        $("#cell" + cell.specIndex).replaceWith("<li class='ui-state-default ui-selecting-finished-FILLED' style='CURSOR: pointer;' id='cell" + cell.specIndex + "'>Scheduled!</li>");

			        curSched = $('#lblScheduledHours').html();
			        curSched++;
			        $('#lblScheduledHours').html(curSched);
			    }
			    else if (previousResult == -1) {
			        cell.backColor = OPERATING;

			        $("#cell" + cell.specIndex).replaceWith("<li class='ui-state-default ui-selecting-finished-UNFILLED' style='CURSOR: pointer;' id='cell" + cell.specIndex + "'>Available</li>");															
			    }
			    else {

			        cell.backColor = UNFILLED;
			        $("#cell" + cell.specIndex).replaceWith("<li class='ui-state-default ui-selecting-finished-UNFILLED' style='CURSOR: pointer;' id='cell" + cell.specIndex + "'>Unavailable</li>");
			    }

			}
			else {
				//previousResult: 0 = could not unschedule (in the past); 1 = unscheduled + available; 2 = unscheduled + not available
				if (previousResult == 0) {

					$("#cell" + cell.specIndex).replaceWith("<li class='ui-state-default ui-selecting-finished-FILLED' style='CURSOR: pointer;' id='cell" + cell.specIndex + "'>Unremovable</li>");															

				}
				else if (previousResult == 1) {
					
					cell.backColor = OPERATING;
					$("#cell" + cell.specIndex).replaceWith("<li class='ui-state-default ui-selecting-finished-OPERATING' style='CURSOR: pointer;' id='cell" + cell.specIndex + "'>Available</li>");															

				}
				else if (previousResult == 2) {
									
					cell.backColor = NONOPERATING;
					$("#cell" + cell.specIndex).replaceWith("<li class='ui-state-default ui-selecting-finished-NONOPERATING' style='CURSOR: pointer;' id='cell" + cell.specIndex + "'></li>");															

				}
					
				if (previousResult == 1 || previousResult == 2) {
					curSched = $('#lblScheduledHours').html();
					curSched--;
					$('#lblScheduledHours').html(curSched);
				}
			}

			smGrid.resize();
		}
			
		//iterate selected hours in grid
		lastSelectedHour++;
					
		//check if we have finished adding all selected cells
		if (scheduleNextSelectedHours[lastSelectedHour] == null) {			
			loadScheduledProvidersFromSelectedCells(false);
		}
		else {
			
			//make sure that we haven't hit the limit if we are adding
			if (m_Type == 'Set') {
				curSched = $('#lblScheduledHours').html() * 1.0;
				maxAvail = $('#lblAvailableHours').html() * 1.0;
				if (curSched >= maxAvail) {
					alert('You are already scheduled for the maximum hours available this week.');
					setProviderButtonState(false);
					return;
				}
			}
			
			cell = scheduleNextSelectedHours[lastSelectedHour];
			$("#cell" + cell.specIndex).html('Processing...');

			weekDay = cell.getWeekDay();
			hour = cell.getHour();

			//schedule selected provider for the indicated week/day/scheduleNextHour
			url = 'SchedulerWorker.aspx?Type=' + m_Type + '&Week=' + selectedWeekDate + '&WeekDay=' + weekDay + '&Hour=' + hour;

			if ($('#removeReasons').length > 0 && $('#removeReasons').val() != "")
				url += "&RemoveReason=" + $('#removeReasons').val();

			loadUrl(url);

			//call this function again to process the next selected cell (when previous is finished)
			setTimeout('scheduleNextSelected()', m_TimeoutTime);
		}			
	}
}

function ScheduleSelectedComplete(result) {
	previousResult = result;
	continueScheduling = true;
}

function showWait(hide) {
	var div = document.getElementById('divPleaseWait');
	div.style.display = (hide) ? 'none' : 'inline';
	div.style.zIndex = 1;
			
	var tbl = document.getElementById('Table1');
	if (tbl) {
		/*
		if (hide)
		{
		tbl.filters.alpha.opacity=0;
				
		for (i = 0; i < 10; i++)
		setTimeout("document.getElementById('Table1').filters.alpha.opacity=" + (i * 10), (i * 75));
		}
		*/
		tbl.style.visibility = (hide) ? 'visible' : 'hidden';
	}
	
	//--ED: 
	var tbl2 = document.getElementById('Table2');
	if (tbl2) {
		tbl2.style.visibility = (hide) ? 'visible' : 'hidden';
	}
}
		
function loadUrl(url) {
	var xmlhttp;
	try { xmlhttp = new ActiveXObject("Msxml2.XMLHTTP"); }
	catch (e) {
		try { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); }
		catch (E) {
			xmlhttp = false;
		}
	}
		
	if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
		xmlhttp = new XMLHttpRequest();
	}

	if (!xmlhttp)
		alert('Your browser is not supported!!!');

	xmlhttp.open("POST", url, true);
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			eval(xmlhttp.responseText);
		}
	}	
	xmlhttp.send(null);
}
	
function clearSelectedText() {
	//clear selected text in IE
	if (document.selection && document.selection.createRange) {
		range = document.selection.createRange();
			
		if (range) {
			range.collapse(false);
			range.select();
		}		
	}
}
	
function alertScheduled() {
	alert('The following tutors are scheduled during the selected block(s):\n(hit ctrl-c to copy to clipboard)\n\n' + document.getElementById("lstSelected").innerHTML.replace(/<OPTION value=(\d*)>/g, '').replace(/<\/OPTION>,*/g, '\n'));
}
