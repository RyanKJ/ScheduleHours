/*
 * JavaScript code for processing customized fullCalendar for ReScheduler
 * 
 * Author: Ryan Johnson
 */

$(document).ready(function() {
  /**
   * Selectors And Variables
   */
  // Constant variables
  var WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday",
                  "Friday", "Saturday", "Sunday"]
                  
  // General state variables
  var calDate = null;
  var calDepartment = null;
  var calActive = null;
  var displaySettings = {};
  var departmentCosts = {};
  var avgMonthlyRev = -1;
  
  // Jquery object variables
  var $fullCal = $("#calendar");
  var $scheduleInfo = $("#schedule-info");
  var $eligableList = $("#eligable-list");
  var $calendarLoaderForm = $("#load-calendar-form");
  var $conflictAssignBtn = $("#conflict-assign-btn");
  var $removeScheduleBtn = $("#remove-btn");
  var $removeScheduleAfterWarningBtn = $("#remove-schedule-btn");
  var $costList =  $("#cost-list");
  var $addScheduleDate = $("#add-date");
  var $addScheduleDep = $("#new-schedule-dep");
  var $viewLiveDate = $("#view-live-date");
  var $viewLiveDep = $("#view-live-department");
  var $pushLive = $("#push-live");
  var $pushLiveAfterWarning = $("#push-calendar-after-warning-btn");
  var $deactivateLiveAfterWarning = $("#deactivate-warning-btn");
  var $reactivateLiveAfterWarning = $("#reactivate-warning-btn");
  var $successfulLiveCalMsg = $("#successful-live-cal-change");
  var $setActiveLive = $("#active-live-set");
  var $viewLive = $("#view-live");
  var $printDraftBtn = $("#print-draft");
  var $printDraftBtnWarning = $("#print-draft-calendar-warning");
  var $printLiveBtn = $("#print-live-calendar");
  var $eligibleLegendSelector = $("#legend-selector");
  var $startTimePicker = $("#start-timepicker").pickatime();
  var $endTimePicker = $("#end-timepicker").pickatime();
  var $hideStart = $("#start-checkbox");
  var $hideEnd = $("#end-checkbox");
  var $dayNoteBtn = $("#day-note");
  
  // Start and end schedule time pickers
  var st_picker = $startTimePicker.pickatime("picker");
  var et_picker = $endTimePicker.pickatime("picker");
    
  $conflictAssignBtn.click(_assignEmployeeAfterWarning);
  $removeScheduleBtn.click(removeSchedule);
  $removeScheduleAfterWarningBtn.click(_removeScheduleAfterWarning);
  $pushLive.click(pushCalendarLive);
  $pushLiveAfterWarning.click(_pushCalendarAfterWarning);
  $deactivateLiveAfterWarning.click(_SetActivityAfterWarning);
  $reactivateLiveAfterWarning.click(_SetActivityAfterWarning);
  $setActiveLive.click(SetActiveLiveCalendar);
  $printDraftBtn.click(printCalendar);
  $printDraftBtnWarning.click(_printAfterWarning);
  $printLiveBtn.click(_goToLiveAfterPrintWarning);
  $dayNoteBtn.click(showDayNoteModal);
  $eligibleLegendSelector.click(showEligibleLegend);
  
  $fullCal.fullCalendar({
    editable: false,
    events: [],
    eventBackgroundColor: "transparent",
    eventTextColor: "black",
    eventBorderColor: "transparent",  
    header: {
      left: "",
      center: "title",
      right: "printCalendar"
    },
    
    /**
     * Highlight the current clicked event, the day it belongs to, then fetch
     * the eligable list corresponding to this schedule. Also ensure the hidden
     * input add-date for adding schedules corresponds to potentially new 
     * highlighted day.
     */
    eventClick: function(calEvent, jsEvent, view) {
      // Remove any previous highlight class before highlighting this event
      $(".fc-event-clicked").removeClass("fc-event-clicked");
      $(this).find("div").addClass("fc-event-clicked");
      $(".fc-day-clicked").removeClass("fc-day-clicked");
      var date = calEvent.start.format("YYYY-MM-DD");
      $("td[data-date="+date+"]").addClass("fc-day-clicked");
      $addScheduleDate.val(date);
      
      var pk = calEvent.id;
      $.get("get_schedule_info", {pk: pk}, displayEligables);
    },
        
    /** Highlight event when mouse hovers over event. */
    eventMouseover: function(calEvent, jsEvent, view) {
      var date = calEvent.start.format("YYYY-MM-DD");
      $("td[data-date="+date+"]").addClass("fc-days-event-mouseover");
    },
        
    /** De-highlight event when mouse stops hovering over event. */
    eventMouseout: function(calEvent, jsEvent, view) {
      var date = calEvent.start.format("YYYY-MM-DD");
      $("td[data-date="+date+"]").removeClass("fc-days-event-mouseover");
    },
        
    /** Mark the html elements of event with event id for later queries. */
    eventRender: function (event, element, view) {
      element.attr("id", "event-id-" + event.id);
      element.data("event-id", event.id);
    }, 
        
    /**
     * Highlight day when clicked, de-highlighted previous clicked day. Update
     * schedule adding form for date parameter to match date of the day that 
     * has just been clicked.
     */
    dayClick: function(date, jsEvent, view) {
      $curr_day_clicked = $("td[data-date="+date.format('YYYY-MM-DD')+"]");
      $prev_day_clicked = $(".fc-day-clicked");
          
      if (!$curr_day_clicked.is($prev_day_clicked)) {
        $prev_day_clicked.removeClass("fc-day-clicked");
        $curr_day_clicked.addClass("fc-day-clicked");
        
        $addScheduleDate.val(date.format("YYYY-MM-DD"));
            
        $(".fc-event-clicked").removeClass("fc-event-clicked");
        clearEligables();
      }
    }
  });
    
  // Turn loadSchedules into a callback function for the load-calendar-form
  $("#load-calendar-form").ajaxForm(loadSchedules); 
  
      
  /**
   * Callback for load-calendar-form which is a html get form that asks for a 
   * calendar. loadSchedules then uses the received HTTP response to update the
   * fullCalendar view, title, and events.
   */
  function loadSchedules(json_data) {
    // Clear out eligable list incase previous calendar was loaded
    $eligableList.empty();
    $scheduleInfo.css("display", "none");
    
    var info = JSON.parse(json_data);
    // Save display settings for calendar events
    displaySettings = info["display_settings"]
    
    // Set default start and end time for time-pickers
    st_picker.set("select", displaySettings["schedule_start"], { format: 'HH:i' });
    et_picker.set("select", displaySettings["schedule_end"], { format: 'HH:i' });
    $hideStart.prop('checked', displaySettings["hide_start"]);
    $hideEnd.prop('checked', displaySettings["hide_end"]);
    
    // Get new calendar month view via date
    var FORMAT = "YYYY-MM-DD";
    calDate = moment(info["date"], FORMAT);
    $fullCal.fullCalendar("gotoDate", calDate);
    $viewLiveDate.val(calDate.format(FORMAT));
    
    // Change calendar title and schedule adding form title to new department
    calDepartment = info['department']
    var depName = $("#id_department option[value='"+calDepartment+"']").text();
    $addScheduleDep.val(calDepartment);
    $viewLiveDep.val(calDepartment);
    $(".fc-center").find("h2").text(depName + " Calendar: " + calDate.format("MMMM, YYYY"));
        
    // Delete any previously loaded events before displaying new events
    $fullCal.fullCalendar("removeEvents");
        
    // Get schedules and employees for loading into calendar
    var schedules = info["schedules"];
    var employees = info["employees"];
    var employeeNameDict = _employeePkToName(employees);

    // Collection of events to be rendered together
    var events = [];   
    for (var i=0;i<schedules.length;i++) {  
      var schedulePk = schedules[i]["id"];
      var startDateTime = schedules[i]["start_datetime"]; 
      var endDateTime = schedules[i]["end_datetime"];
      var hideStart = schedules[i]["hide_start_time"]; 
      var hideEnd = schedules[i]["hide_end_time"];
          
      // Get employee name for event title string
      var firstName = "";
      var lastName = "";
      var schEmployePk = schedules[i]["employee"]
      if (schEmployePk != null) {
        firstName = employeeNameDict[schEmployePk]["firstName"];
        lastName = employeeNameDict[schEmployePk]["lastName"];
      }
      var str = getEventStr(startDateTime, endDateTime, 
                            hideStart, hideEnd,
                            firstName, lastName); 
      // Create fullcalendar event corresponding to schedule
      var event = {
        id: schedulePk,
        title: str,
        start: startDateTime,
        end: endDateTime,
        allDay: true
        }       
      events.push(event);
    }
    // Render event collection
    $fullCal.fullCalendar("renderEvents", events);
    
    //Calculate and display calendar costs
    departmentCosts = info["department_costs"];
    avgMonthlyRev = info["avg_monthly_revenue"];
    displayCalendarCosts();
    
    //Set activate/deactivate to state of live_calendar
    calActive = info["is_active"];
    setCalLiveButtonStyles();
    
    // TEST
    var date = '2017-11-07'
    var $dayHeader = $("thead td[data-date="+date+"]");
    var dayNumber = $dayHeader.text();
    
    var HTML = "<span class='fc-day-number fright'>" + dayNumber + "</span>" +
               "<span class='fc-day-number fleft'><b>" + "Thanksgiving" + "</b></span>"
    $dayHeader.html(HTML);
    
    // Ensure calendar is visible once fully loaded
    $fullCal.css("visibility", "visible");
  }


  // Load schedule upon loading page relative to current date
  var liveCalDate = new Date($calendarLoaderForm.data("date"));
  var m = liveCalDate.getMonth() + 1; //Moment uses January as 0, Python as 1
  var y = liveCalDate.getFullYear();
  var dep = $calendarLoaderForm.data("department");
  
  $("#id_month").val(m + 1);
  $("#id_year").val(y);
  $("#id_department").val(dep);
  $("#get-calendar-button").trigger("click"); 
  
  
  /** Show user modal asking if they want to make current calendar state live. */
  function pushCalendarLive(event) {
    $pushModal = $("#pushModal");
    $pushModal.css("margin-top", Math.max(0, ($(window).height() - $pushModal.height()) / 2));
    $pushModal.modal('show');
  }
  
  
  /** Tell server to make current calendar state live for employee queries */
  function _pushCalendarAfterWarning(event) {
    var FORMAT = "YYYY-MM-DD";
    $.post("push_live",
           {department: calDepartment, date: calDate.format(FORMAT)},
            successfulCalendarPush);
  }
  
  
  /** Inform user that the calendar was succesfully pushed. */
  function successfulCalendarPush(data) {
    var info = JSON.parse(data);
    calActive = true;
    // Set styles of View Live and De/Reactivate buttons depending on state
    setCalLiveButtonStyles();
    var msg = info["message"];
    successfulLiveCalStateChange(msg);
  }
  
  
  /** Show user modal to indicate successful change to live calendar */
  function successfulLiveCalStateChange(msg) {
    $successfulLiveCalMsg.text(msg);
    $successfulPushModal = $("#successfulPushModal");
    $successfulPushModal.css("margin-top", Math.max(0, ($(window).height() - $successfulPushModal.height()) / 2));
    $successfulPushModal.modal('show');
  }
  
  
  /** 
   * Warn user about changing active state of live calendar. If user still
   * clicks okay, commit change to the activity state of the live calendar.
   */
  function SetActiveLiveCalendar(event) {
    // Check to see if live calendar exists for date/dep
    if(calActive !== null) {
      // Show user warning modal before committing to change with live calendar
      if (calActive) {
        $deactivateModal = $("#deactivateLive");
        $deactivateModal.css("margin-top", Math.max(0, ($(window).height() - $deactivateModal.height()) / 2));
        $deactivateModal.modal('show');
      } else {
        $reactivateModal = $("#reactivateLive");
        $reactivateModal.css("margin-top", Math.max(0, ($(window).height() - $reactivateModal.height()) / 2));
        $reactivateModal.modal('show');
      }
    }
  }
  
  
  /** Set the activity state of live calendar after warning. */
  function _SetActivityAfterWarning(event) {
    if(calActive !== null) {
      var newCalActive = true;
      // Live calendar exists, so set newCalActive to opposite of current state
      if (calActive) {
        newCalActive = false;
      }
      var FORMAT = "YYYY-MM-DD";
      $.post("set_active_state",
             {department: calDepartment, date: calDate.format(FORMAT), active: newCalActive},
              successfulActiveStateSet);
    }
  }
  
  
  /** 
   * Inform user that the active state of live calendar was set and update
   * styles and state of variables representing the live calendar's state.
   */
  function successfulActiveStateSet(data) {
    var info = JSON.parse(data);
    var msg = info["message"];
    calActive = info["is_active"];
    // Set styles of View Live and De/Reactivate buttons depending on state
    setCalLiveButtonStyles();
    successfulLiveCalStateChange(msg);
  }
  
  
  /** Set styles of view live and De/Reactivate Live buttons given active state */
  function setCalLiveButtonStyles() {
    if (calActive == null) {
      $setActiveLive.addClass("unactive-live");
      $setActiveLive.text("Reactivate Live");
      $viewLive.addClass("unactive-live");
      $viewLive.prop('disabled', true);
    }
    if (!calActive && calActive !== null) {
      $setActiveLive.removeClass("unactive-live");
      $setActiveLive.text("Reactivate Live");
      $viewLive.addClass("unactive-live");
      $viewLive.prop('disabled', true);
    }
    if (calActive) {
      $setActiveLive.removeClass("unactive-live");
      $setActiveLive.text("Deactivate Live");
      $viewLive.removeClass("unactive-live");
      $viewLive.prop('disabled', false);
    }
  }
    
  
  /** Display calendar cost li elements. */
  function displayCalendarCosts() {
    $costList.empty();
    if (avgMonthlyRev == -1) { // -1 means no sales data currently exists
        var $li = $("<li>", {
        "id": "no-calendar-cost-data",
        "text": "There is no sales data",
        "class": "cost-list",
        }
      ).appendTo("#cost-list");
    } else {
        for (department_key in departmentCosts) { 
          var department = departmentCosts[department_key]
          var percentage = _getPercentage(department['cost'], avgMonthlyRev);
          var $li = $("<li>", {
            "id": "calendar-cost-" + department_key,
            "text": department['name'] + ": " + percentage + "%",
            "class": "cost-list",
            }
          ).appendTo("#cost-list");
        }
    }
  }

    
  /** Compute percentage of two numbers and convert to integer format. */ 
  function _getPercentage(numerator, denominator) {
    return Math.round((numerator / denominator) * 100);
  }
  
  
  /** Calculate the change of cost to a calendar */
  function addCostChange(costChange) {
    if (avgMonthlyRev != -1) { // -1 means no sales data currently exists
      for (department_key in costChange) { 
        // Get new cost of department
        var department = departmentCosts[department_key];
        var oldCost = department['cost'];
        var newCost = oldCost + costChange[department_key];
        department['cost'] = newCost;
        // Set new cost and text for appropriate cost-li
        percentage = _getPercentage(newCost, avgMonthlyRev);
        var $departmentCostLi = $("#calendar-cost-" + department_key);
        $departmentCostLi.text(department['name'] + ": " + percentage + "%");
      }
    }
  }
    
  
  /**
   * Given an HTTP response of employee objects, create a mapping from employee
   * pk to employee name for quick access for employee names.
   */
  function _employeePkToName(employees) {
    var EmployeePkDict = {};
    for (var i=0; i < employees.length; i++) {
      var employeePk = employees[i]["id"];
      var firstName = employees[i]["first_name"];
      var lastName = employees[i]["last_name"];
      EmployeePkDict[employeePk] = {"firstName": firstName,
                                    "lastName": lastName};
    }
    return EmployeePkDict;
  }
  
  
  /**
   * Concatenate strings for start time, end time, and employee name (if the
   * the schedule has an employee assigned). start and end are javascript 
   * moment objects.
   */
  function getEventStr(start, end, hideStart, hideEnd, firstName, lastName) {
    // Construct time string based off of display settings
    var displayMinutes = displaySettings["display_minutes"];
    var displayNonzeroMinutes = displaySettings["display_nonzero_minutes"];
    var displayAMPM = displaySettings["display_am_pm"];
    
    timeFormat = "h"
    if (displayMinutes && !displayNonzeroMinutes) { timeFormat += ":mm"; }
    if (displayAMPM) { timeFormat += " a"; }
     
    // Construct time strings
    var startStr = "?";
    if (!hideStart) {
      var startDateTime = moment(start);
      if (displayNonzeroMinutes && startDateTime.minute() != 0) {
        onlyNonZeroTimeFormat = "h:mm";
        if (displayAMPM) { onlyNonZeroTimeFormat += " a"; }
        startStr = startDateTime.format(onlyNonZeroTimeFormat);
      } else {
        startStr = startDateTime.format(timeFormat);
      }
    }
    var endStr = "?";
    if (!hideEnd) {
       var endDateTime = moment(end);
       if (displayNonzeroMinutes && endDateTime.minute() != 0) {
          onlyNonZeroTimeFormat = "h:mm";
          if (displayAMPM) { onlyNonZeroTimeFormat += " a"; }
          endStr = endDateTime.format(onlyNonZeroTimeFormat);
       } else {
          endStr = endDateTime.format(timeFormat);
       }
    }
    
    // Construct employee name string based off of display settings
    var displayLastNames = displaySettings["display_last_names"]; 
    var displayLastNameFirstChar = displaySettings["display_first_char_last_name"]; 
    
    var employeeStr = "";
    if (firstName) {
      employeeStr = ": " + firstName;
      if (displayLastNameFirstChar && lastName) {
        employeeStr += " " + lastName.charAt(0);
      }
      if (displayLastNames && lastName && !displayLastNameFirstChar) {
        employeeStr += " " + lastName;
      }
    }
    
    // Combine time and name strings to full construct event string title
    var str = startStr + " - " + endStr + employeeStr;
    return str;
  }
      
      
  /** 
   * Given HTTP response, process eligable list data and create eligable list
   * of employees. If schedule has an employee already assigned, highlight that
   * employee as clicked in the eligable list.
   */    
  function displayEligables(data) {
    clearEligables();
    $scheduleInfo.css("display", "block");
    
    var info = JSON.parse(data);
    var eligableList = info["eligable_list"];
    if (displaySettings["sort_by_names"]) {
      console.log("Sort by names");
      eligableList.sort(compareEmployeeName);
    }
    // Get schedule pk, employee, and schedule duration
    var schedule = info["schedule"]
    var schedulePk = schedule["id"];
    var currAssignedEmployeeID = schedule["employee"];
    var start = moment(schedule['start_datetime']);
    var end = moment(schedule['end_datetime']);
    var duration = moment.duration(end.diff(start));
    var schedule_hours = duration.asHours();
    // Create li corresponding to eligable employees for selected schedule
    for (var i=0;i<eligableList.length;i++) {  
      var warningStr = _compileConflictWarnings(eligableList[i]['availability']);
      var warningFlag = _compileConflictFlags(eligableList[i]['availability']);
      var eligableColorClasses = _compileColorClasses(eligableList[i]['employee'], 
                                                      eligableList[i]['availability']);
      var name = eligableList[i]['employee'].first_name + " " +  eligableList[i]['employee'].last_name  + " " +  warningFlag;  
      var $li = $("<li>", {
        "id": eligableList[i]['employee']['id'], 
        "class": eligableColorClasses,
        "data-employee-pk": eligableList[i]['employee'].id,
        "data-schedule-pk": schedulePk,
        "data-warning-str": warningStr,
        "click": eligableClick,
        }
      ).appendTo("#eligable-list");
      // Create content inside each eligible li
      var desired_hours_title = "Desired Hours: " + eligableList[i]['employee']['desired_hours'];
      var curr_hours = eligableList[i]['availability']['Hours Scheduled'];
      if (currAssignedEmployeeID != eligableList[i]['employee']['id']) {
        curr_hours -= schedule_hours;
      }
      var liHTML = "<div class='eligible-name'>" + name + "</div>" +
                   "<div title='" + desired_hours_title + "' class='eligible-hours'>" + curr_hours + "</div>"
      $li.html(liHTML);
    }
    
    // If employee assigned to schedule add highlight class to appropriate li
    _highlightAssignedEmployee(currAssignedEmployeeID);
  }
  
  /** Comparator function for sorting employees by last name, then first name */
  function compareEmployeeName(e1, e2) {
    e1Name = e1['employee'].last_name.toLowerCase() + e1['employee'].first_name.toLowerCase()
    e2Name = e2['employee'].last_name.toLowerCase() + e2['employee'].first_name.toLowerCase()
    
    return e1Name > e2Name
  }
  
  
  /** Given availability object, compile all conflict flags */
  function _compileConflictFlags(availability) {
    var warningFlagList = [];
    
    if (availability['(S)'].length > 0) {
      warningFlagList.push("S")
    }
    if (availability['(V)'].length > 0) {
      warningFlagList.push("V")
    }
    if (availability['(A)'].length > 0) {
      warningFlagList.push("A")
    }
    if (availability['(U)'].length > 0) {
      warningFlagList.push("U")
    }
    if (availability['(O)']) {
      warningFlagList.push("O")
    }
    if (warningFlagList.length > 0) {
      var warningFlag = "("
      
      for (i = 0; i < warningFlagList.length - 1; i++) {
        warningFlag += warningFlagList[i] + ", ";
      }
      warningFlag = warningFlag + warningFlagList[warningFlagList.length-1] + ")"
      return warningFlag;
    } else {
      return "";
    }
  }
  
  
  /** Given availability object, compile all conflicts into readable string. */
  function _compileConflictWarnings(availability) {
    var warningStr = "";
    
    if (availability['(S)'].length > 0) {
      warningStr += "<h4>Schedules That Overlap:</h4>";
      for (schedule of availability['(S)']) {
        var str = _scheduleConflictToStr(schedule);
        warningStr += "<p>" + str + "</p>";
      }
    }
    if (availability['(V)'].length > 0) {
      warningStr += "<h4>Vacations That Overlap:</h4>";
      for (vacation of availability['(V)']) {
        var str = _timeOffConflictToStr(vacation);
        warningStr += "<p>" + str + "</p>";
      }
    }
    if (availability['(A)'].length > 0) {
      warningStr += "<h4>Absences That Overlap:</h4>";
      for (absences of availability['(A)']) {
        var str = _timeOffConflictToStr(absences);
        warningStr += "<p>" + str + "</p>";
      }
    }
    if (availability['(U)'].length > 0) {
      warningStr += "<h4>Repeating Unavailabilities That Overlap:</h4>";
      for (repeat_unav of availability['(U)']) {
        var str = _repeatUnavConflictToStr(repeat_unav);
        warningStr += "<p>" + str + "</p>";
      }
    }
    if (availability['(O)']) {
      warningStr += "<h4>Assignment Will Put Employee In Overtime:</h4>";
      warningStr += "<p>" + "Employee Will Be Working " 
      warningStr += availability['Hours Scheduled']
      warningStr += " Hours This Workweek If Assigned." + "</p>";
    }
    return warningStr;
  }
  
  
  /** Create string of classes that color an eligable li according to availability. */
  function _compileColorClasses(employee, availability) {
    var classes = "";
    
    // Select background color of eligible li corresponding to availability
    if ((availability['(S)'].length > 0) || (availability['(V)'].length > 0) || 
        (availability['(A)'].length > 0) || (availability['(U)'].length > 0)) {
      classes += "red-bg-eligible";
    } else if (availability['(O)'] || (availability['Hours Scheduled'] >
                                       employee['desired_hours'] + displaySettings["desired_hours_overshoot_alert"])) {
      classes += "orange-bg-eligible";
    } else if (availability['Desired Times'].length > 0) {
      classes += "green-bg-eligible"
    }
    
    return classes;
  }
  
  
  /** Helper function to translate a schedule into warning string. */ 
  function _scheduleConflictToStr(schedule) {
    var str = $("#id_department > option:nth-child("+schedule.department+")").text();
    str += " Department"
    
    var startDate = moment(schedule.start_datetime);
    str += startStr = startDate.format(" on MMMM Do, YYYY: ");
    
    time_and_employee = getEventStr(schedule.start_datetime, schedule.end_datetime, 
                                    false, false, null, null);              
    str += time_and_employee;
    return str
  }
  
  
  /** Helper function to translate a vacation or absence into warning string. */ 
  function _timeOffConflictToStr(time_off) {
    var startDate = moment(time_off.start_datetime);
    var str = startDate.format("MMMM Do, YYYY to ");

    var endDate = moment(time_off.end_datetime);
    str += endDate.format("MMMM Do, YYYY");

    return str
  }
  
  
  /** Helper function to repeating unavailability into warning string. */ 
  function _repeatUnavConflictToStr(repeat_unav) {
    var str = WEEKDAYS[repeat_unav.weekday] + "s from "
    
    TIME_FORMAT = "HH:mm:ss"
    var startTime = moment(repeat_unav.start_time, TIME_FORMAT);
    str += startTime.format("h:mm to ");

    var endTime = moment(repeat_unav.end_time, TIME_FORMAT);
    str += endTime.format("h:mm");

    return str
  }
  
  
  /** Clear out eligable list and hide the schedule info section */
  function clearEligables() {
    $eligableList.empty();
    $scheduleInfo.css("display", "none");
  }
    
    
  /** 
   * Given an employee id, highlight eligable li element with corresponding
   * employee id, de-highlighting all other eligable li.
   */     
  function _highlightAssignedEmployee(employeeID) {
    $(".curr-assigned-employee").removeClass("curr-assigned-employee");
    $("#" + employeeID).addClass("curr-assigned-employee");
  }
  
  
  /** 
   * Given an employee id and schedule length, add hours to newly selected
   * employee, and if previously selected different employee, subtract hours
   */ 
  function _updateCurrHours(employeeID, scheduleLength) {
    var $newlyAssignedEmployee = $("#" + employeeID + " .eligible-hours");
    var oldHours = $newlyAssignedEmployee.text();
    var newHours = parseInt(oldHours) + scheduleLength;
    $newlyAssignedEmployee.text(newHours);
    var $previousAssignedEmployee = $(".curr-assigned-employee");
    if ($previousAssignedEmployee.length) {
      var $PreviousEmployeeHours = $previousAssignedEmployee.children(" .eligible-hours");
      var oldHours = $PreviousEmployeeHours.text();
      var newHours = parseInt(oldHours) - scheduleLength;
      $PreviousEmployeeHours.text(newHours);
    }
  }

    
  /**
   * Tell server to assign employee to schedule, create warning if conflict 
   * exists to inform user of any conflicts and allow a dialog for user to
   * decide if they wish to assign employee to schedule or not.
   */       
  function eligableClick(event) {
    //TODO: Assert that empPk != schedule.employee_id, if so, do nothing.
    var $eligableLi = $(this);
    var warningStr = $eligableLi.attr("data-warning-str");
    
    if (warningStr) {
      _eligableWarning(this, warningStr);
    } else {
      var empPk = $eligableLi.attr("data-employee-pk");
      var schPk = $eligableLi.attr("data-schedule-pk");
      var calendarDate = $("#add-date").val();
      $.post("add_employee_to_schedule",
             {employee_pk: empPk, schedule_pk: schPk, cal_date: calendarDate},
             updateScheduleView);
    }
  }
  
  
  /** Display yes/no dialogue displaying all conflicts between employee & schedules */
  function _eligableWarning(eligableLi, warningStr) {
    // Set the data-employee-pk and data-schedule-pk in button for callback
    var empPk = $(eligableLi).attr("data-employee-pk");
    var schPk = $(eligableLi).attr("data-schedule-pk");
    $conflictAssignBtn.data("schedule-pk", schPk);
    $conflictAssignBtn.data("employee-pk", empPk);
    
    // Display conflicts between schedule and employee in modal body
    $conflictManifest = $("#conflict-manifest");
    $conflictManifest.empty();
    $conflictManifest.append(warningStr);
    
    // Show conflict warning modal
    $conflictModal = $("#confirmationModal");
    $conflictModal.css("margin-top", Math.max(0, ($(window).height() - $conflictModal.height()) / 2));
    $conflictModal.modal('show');
  }
  
  
  /** Assign employee to schedule after user clicks okay for warning modal */
  function _assignEmployeeAfterWarning(event) { 
    var empPk = $(this).data("employee-pk");
    var schPk = $(this).data("schedule-pk");
    var calendarDate = $("#add-date").val();
    $.post("add_employee_to_schedule",
           {employee_pk: empPk, schedule_pk: schPk, cal_date: calendarDate},
           updateScheduleView);
  }
    

  /**
   * Given a successful HTTP response update event string to reflect newly
   * assigned employee.
   */
  function updateScheduleView(data) {
    var info = JSON.parse(data);
    var schedulePk = info["schedule"]["id"];
    var startDateTime = info["schedule"]["start_datetime"]; 
    var endDateTime = info["schedule"]["end_datetime"];
    var hideStart = info["schedule"]["hide_start_time"];
    var hideEnd = info["schedule"]["hide_end_time"];
    var firstName = info["employee"]["first_name"];
    var lastName = info["employee"]["last_name"];
    var str = getEventStr(startDateTime, endDateTime,
                          hideStart, hideEnd,
                          firstName, lastName);
    // Update the select eligible employee highlight and also update hours 
    // worked by new employee, and previous assigned employee (if applicable).
    var start = moment(startDateTime);
    var end = moment(endDateTime);
    var duration = moment.duration(end.diff(start));
    var hours = duration.asHours();
    _updateCurrHours(info["employee"]["id"], hours);
    _highlightAssignedEmployee(info["employee"]["id"]);
    // Update title string to reflect changes to schedule
    $event = $fullCal.fullCalendar("clientEvents", schedulePk);
    $event[0].title = str;
    // Update then rehighlight edited schedule
    $fullCal.fullCalendar("updateEvent", $event[0]);
    var $event_div = $("#event-id-" + $event[0].id).find(".fc-content");
    $event_div.addClass("fc-event-clicked"); 
    // Update cost display to reflect any cost changes
    addCostChange(info["cost_delta"]);
  }
    
    
  // Turn addNewSchedules into a callback function for the schedule-add-form
  $("#schedule-add-form").ajaxForm(addNewSchedule); 
     
     
  /**
   * Callback for schedule-add-form which is an html post form that tells the
   * server to create a new schedule given its form values. addNewSchedule
   * parses the successful HTTP response and creates a corresponding
   * fullCalendar event.
   */
  function addNewSchedule(json_schedule) {
    var json_schedule = JSON.parse(json_schedule);
    var schedulePk = json_schedule["id"];
    var startDateTime = json_schedule["start_datetime"]; 
    var endDateTime = json_schedule["end_datetime"];
    var hideStart = json_schedule["hide_start_time"];
    var hideEnd = json_schedule["hide_end_time"];
    var str = getEventStr(startDateTime, endDateTime,
                          hideStart, hideEnd,
                          null, null);
      
    var event = {
      id: schedulePk,
      title: str,
      start: startDateTime,
      end: endDateTime,
      allDay: true
    }       
    $fullCal.fullCalendar("renderEvent", event);
    //Highlight newly created event
    $(".fc-event-clicked").removeClass("fc-event-clicked");
    var $event_div = $("#event-id-" + schedulePk).find(".fc-content");
    $event_div.addClass("fc-event-clicked"); 
    // Get eligables for this new schedule
    $.get("get_schedule_info", {pk: schedulePk}, displayEligables);
  }
  

  /** Give user warning dialog to choose if they want to remove schedule. */
  function removeSchedule() {
    $removeModal = $("#removeModal");
    $removeModal.css("margin-top", Math.max(0, ($(window).height() - $removeModal.height()) / 2));
    $removeModal.modal('show');
  }
  
  
  /** Remove selected schedule after user has clicked okay on warning dialog. */
  function _removeScheduleAfterWarning(event) {
    var event_id = $(".fc-event-clicked").parent().data("event-id");
    var calendarDate = $("#add-date").val();
    if (event_id) {
      $.post("remove_schedule", 
             {schedule_pk: event_id, cal_date: calendarDate}, 
             removeEventAfterDelete);
    }
  }
    
    
  /**
   * Given successful response for deleting schedule, remove corresponding
   * event from fullCalendar.
   */
  function removeEventAfterDelete(data) {
    var info = JSON.parse(data);
    var schedulePk = info["schedule_pk"];
    $fullCal.fullCalendar("removeEvents", schedulePk);
    // Clear out eligable list
    $eligableList.empty();
    $scheduleInfo.css("display", "none");
    // Update cost display to reflect any cost changes
    addCostChange(info["cost_delta"]);
  }
    
  
  /** Callback function for user to print calendar via print button on page */
  function printCalendar() {
    if(calActive) { 
      // Show print warning modal
      $printModal = $("#printModal");
      $printModal.css("margin-top", Math.max(0, ($(window).height() - $printModal.height()) / 2));
      $printModal.modal('show');
    } else {
      window.print();
    }
  }
  
  
  /** Print draft calendar after user has been warned live version exists. */
  function _printAfterWarning(event) {
    window.print();
  }
  
  
  /** Redirect user to live calendar to print most up to date live calendar. */
  function _goToLiveAfterPrintWarning(event) {
    $viewLive.click();
  }
  
  
  /** Callback function to show user the eligible legend */
  function showEligibleLegend(event) {
    $legendModal = $("#legendModal");
    $legendModal.css("margin-top", Math.max(0, ($(window).height() - $legendModal.height()) / 2));
    $legendModal.modal('show');
  }
  
  
  /** Callback function to show user the date note modal */
  function showDayNoteModal(event) {
    $prev_day_clicked = $(".fc-day-clicked"); // Check if a date has been clicked
    if ($prev_day_clicked.length) {
      $dayNoteModal = $("#noteModal");
      $dayNoteModal.css("margin-top", Math.max(0, ($(window).height() - $dayNoteModal.height()) / 2));
      $dayNoteModal.modal('show');
    } else {
      $alertDayNoteModal = $("#noteAlertModal");
      $alertDayNoteModal.css("margin-top", Math.max(0, ($(window).height() - $alertDayNoteModal.height()) / 2));
      $alertDayNoteModal.modal('show');
    }
  }
  
  
}); 
    

/** 
 * Validate request to add a new schedule. All schedules should have a date 
 * assigned. All schedules should also have its start time before its end time.
 */    
function validateAddScheduleForm() {
  var date = document.forms["addingScheduleForm"]["add_date"].value;
  if (date == "") {
    alert("Day must be selected to add schedule");
    return false;
  }
      
  var format = "YYYY-MM-DD hh:mm A"
  var start_time_str = document.forms["addingScheduleForm"]["start-timepicker"].value;
  var end_time_str = document.forms["addingScheduleForm"]["end-timepicker"].value;
  var startDateTime = moment(date + " " + start_time_str, format);
  var endDateTime = moment(date + " " + end_time_str, format);
      
  if (endDateTime.isSameOrBefore(startDateTime)) {
    alert("Schedule start time must be before its end time");
    return false;
  }
}
    
    
/** Validate request get a calendar and associated data */
function validateGetCalendarForm() {
  //TODO: Check valid years, etc.
}