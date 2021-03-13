/*******************
  Utility Functions
********************/
// day of week of month's first day
function getFirstDay(theYear, theMonth){
    var firstDate = new Date(theYear,theMonth,1);
    return firstDate.getDay( );
}
   
// number of days in the month
function getMonthLen(theYear, theMonth) {
    var nextMonth = new Date(theYear, theMonth + 1, 1);
    nextMonth.setHours(nextMonth.getHours( ) - 3);
    return nextMonth.getDate( );
}
  
function getMonthYearString( month, year )
{
	var monthString;
	switch( month )
	{
		case 0:
			monthString = "January";
			break;
		case 1:
			monthString = "February";		
			break;
		case 2:
			monthString = "March";		
			break;
		case 3:
			monthString = "April";		
			break;
		case 4:
			monthString = "May";		
			break;
		case 5:
			monthString = "June";		
			break;
		case 6:
			monthString = "July";		
			break;
		case 7:
			monthString = "August";		
			break;
		case 8:
			monthString = "September";		
			break;
		case 9:
			monthString = "October";		
			break;
		case 10:
			monthString = "November";		
			break;
		case 11:
			monthString = "December";		
			break;
	}
	
	monthString = monthString.substr(0, 3) + " " + year;
	
	return monthString;
}

function prepopulateCalendar(date)
{
    var dateToPopulate = new Date(date);	

 	
	if(date== "")
		return;	
   
	populateCalendar(dateToPopulate.getMonth(), dateToPopulate.getFullYear());
	
	var monthName = getMonthYearString(dateToPopulate.getMonth(), dateToPopulate.getFullYear());
	document.getElementById("monthName").innerHTML = monthName;

	document.forms[0].monthCounter.Value = dateToPopulate.getMonth();
	document.forms[0].yearCounter.Value = dateToPopulate.getFullYear();
	
	document.forms[0].selectedMonth.Value = dateToPopulate.getMonth();
	document.forms[0].selectedYear.Value = dateToPopulate.getFullYear();
	
	rowNum = getDayRow(dateToPopulate.getDate());
	
	document.forms[0].selectedWeek.Value = rowNum;
	
	highlightRow(rowNum, 'low');
}

function changeMonth(dir)
{
	if (dir == 1)
	{
		monthToCheck = 11;
		newMonthAfterCheck = 0;
	}
	else
	{
		monthToCheck = 0;
		newMonthAfterCheck = 11;
	}
	
	if (document.forms[0].monthCounter.Value == monthToCheck)
	{
		document.forms[0].monthCounter.Value = newMonthAfterCheck;
		document.forms[0].yearCounter.Value = document.forms[0].yearCounter.Value + dir;
	}
	else
	{
		document.forms[0].monthCounter.Value = document.forms[0].monthCounter.Value + dir;
	}

	var tempMonth = document.forms[0].monthCounter.Value;
	var tempYear = document.forms[0].yearCounter.Value;

	populateCalendar( tempMonth, tempYear );
	
	var monthName = getMonthYearString( tempMonth, tempYear );
	document.getElementById("monthName").innerHTML = monthName;
	
	clearSelection();
}

////////////////////////////
// Draw Calendar Contents //
////////////////////////////
function populateCalendar(monthNum, yearNum)
{
    // pick up date form choices
    var theMonth = monthNum;
    var theYear = yearNum;
    
    // initialize date-dependent variables
    var firstDay = getFirstDay(theYear, theMonth);
    var howMany = getMonthLen(theYear, theMonth);
    var today = new Date( );
    
    // initialize vars for table creation
    var dayCounter = 1;
    var TBody = document.getElementById("tableBody");

 	/////////////////////////////
    // clear any existing rows //
	/////////////////////////////
    for (i = 1; i < TBody.rows.length; i++) 
	{
		TBody.rows[i].className = "none";
			
        for (j = 0; j < TBody.rows[i].cells.length; j++) 
		{
			TBody.rows[i].cells[j].innerHTML = ""; //&nbsp;";
		}
    }

	//////////////////////////////
	// populate rows with dates //
	//////////////////////////////
    for (i = 1; i < TBody.rows.length; i++) 
	{
		if (i == 1)
		{
			for ( j = firstDay; j < 7; j++ ) 
			{		
				TBody.rows[i].className = "trCal";
				TBody.rows[i].cells[j].innerHTML = dayCounter;
				dayCounter++;
			}		
		}
		else
		{
			for ( j = 0; j < 7; j++ ) 
			{	
				if ( dayCounter <= howMany )	
				{
					TBody.rows[i].className = "trCal";
					TBody.rows[i].cells[j].innerHTML = dayCounter;
				}
					
				dayCounter++;				
			}		
		}
    }
	
	// set calendar row highlights
	clearSelection();	
}
 
function highlightRow(rowNum, stateIndicator)
{
	var highColor 		= "#B4ECB4";
	var lowColor 		= "#FFFFFF";
	var selectedColor 	= "#CCFFCC";
	
	var currColor		= "#FFFFFF"; //"#DDDDDD";

	//make sure there is something in the row
	if (isRowFilled(rowNum))
	{		
		switch ( stateIndicator )
		{
			case "high":
				currColor = highColor;
				break;
			case "low":
				//make sure that the month and year being displayed match the selected
				if (document.forms[0].selectedWeek.Value == rowNum && document.forms[0].monthCounter.Value == document.forms[0].selectedMonth.Value && document.forms[0].yearCounter.Value == document.forms[0].selectedYear.Value)
					currColor = selectedColor;
				else 
					currColor = lowColor;			
				break;			
		}
	}	
	
	document.getElementById('trWeek' + rowNum ).bgColor = currColor;
}

function selectRow( rowNum )
{
	if (isRowFilled(rowNum) == false)
		return;

	selMonth = document.forms[0].monthCounter.Value;
	selYear = document.forms[0].yearCounter.Value;
	
	document.forms[0].selectedWeek.Value = rowNum;
	document.forms[0].selectedMonth.Value = selMonth;
	document.forms[0].selectedYear.Value = selYear;

	clearSelection();
	
	selDate = (selMonth + 1) + '/' + getFirstDayInRow(rowNum) + '/' + selYear;
		
	parent.ChangeWeek(selDate);	
}

function clearSelection()
{
	for (i = 1; i <= 6; i++) 
	{	
		highlightRow(i, 'low')
	}
}

function isRowFilled(rowNum)
{
    var TBody = document.getElementById("tableBody");

	row = TBody.rows[rowNum];
	
	return (row.cells[0].innerHTML != '' || row.cells[6].innerHTML != '');	
	//return (row.cells[0].innerHTML.indexOf("&nbsp;") == -1 || row.cells[6].innerHTML.indexOf("&nbsp;") == -1);
}

function getDayRow(day)
{
	//find the row that contains the selected day
	var TBody = document.getElementById("tableBody");

    for (i = 1; i < TBody.rows.length; i++)
	{
		row = TBody.rows[i];
		for (j = 0; j < row.cells.length; j++)
		{	
			curDay = row.cells[j].innerHTML;
			
			if (curDay == day)
				return i;
		}		
    }
    
    return -1;
}

function getFirstDayInRow(rowNum)
{
	//get the first day in the selected row
	var TBody = document.getElementById("tableBody");	
	var row = TBody.rows[rowNum];
	
	for (i = 0; i < row.cells.length; i++)
	{
		if (row.cells[i].innerHTML != '')
			return row.cells[i].innerHTML;
	}
	
	return "-1";
}