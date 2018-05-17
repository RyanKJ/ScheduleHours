from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.template import loader
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User, Group
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.forms import UserCreationForm
from ..models import (Department, DepartmentMembership, Employee, 
                      BusinessData, LiveCalendar, DayNoteHeader, DayNoteBody)       
from ..forms import (CalendarForm, LiveCalendarForm, LiveCalendarManagerForm, 
                     ViewLiveCalendarForm, 
                     SetStateLiveCalForm, AddScheduleForm, DayNoteHeaderForm, 
                     DayNoteBodyForm, ScheduleNoteForm)
from datetime import datetime, date
    
    
    
def front_or_cal_page(request):
    """Redirect to calendar if logged in, otherwise redirect to front page."""
    if request.user.is_authenticated():
        if manager_check(request.user):
            return redirect("/calendar/") # Manager calendar
        else:
            return redirect("/live_calendar/") # Employee calendar
    else:
        return redirect("/front/")
        

def front_page(request):
    """Display the front page for the website."""
    template = loader.get_template('schedulingcalendar/front.html')
    context = {}

    return HttpResponse(template.render(context, request))
    
    
def about_page(request):
    """Display the about page for the website."""
    template = loader.get_template('schedulingcalendar/about.html')
    context = {}

    return HttpResponse(template.render(context, request))
    
    
def contact_page(request):
    """Display the contact page for the website."""
    template = loader.get_template('schedulingcalendar/contact.html')
    context = {}

    return HttpResponse(template.render(context, request))
    

def manager_check(user):
    """Checks if user is a manager user or not."""
    return user.groups.filter(name="Managers").exists()
    
 
@login_required 
def login_success(request):
    """Redirect user based on if they are manager or employee."""
    if manager_check(request.user):
        return redirect("/calendar/") # Manager calendar
    else:
        return redirect("/live_calendar/") # Employee calendar

        
def register(request):
    """Signup form for manager users"""
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            # Create business logic for user
            business_data = BusinessData(user=user)
            business_data.save()
            department = Department(user=user, name="Main")
            department.save()
            # Add user to manager group for permissions
            manager_user_group = Group.objects.get(name="Managers")
            user.groups.add(manager_user_group)
            # Log user in and redirect to department page to create 1st dep
            login(request, user)
            return redirect('/calendar/')
    else:
        form = UserCreationForm()
    return render(request, 'registration/signUp.html', {'form': form})


@login_required
@user_passes_test(manager_check, login_url="/live_calendar/")
def calendar_page(request):
    """Display the schedule editing page for a managing user."""
    logged_in_user = request.user
    
    # Check that user has at least 1 department before loading calendar
    departments = Department.objects.filter(user=logged_in_user).order_by('name')
    if not departments:
        return redirect('/departments/')
    
    template = loader.get_template('schedulingcalendar/calendar.html')
    
    calendar_form = CalendarForm(logged_in_user)
    add_schedule_form = AddScheduleForm()
    view_live_form = ViewLiveCalendarForm()
    day_note_header_form = DayNoteHeaderForm()
    day_note_body_form = DayNoteBodyForm()
    schedule_note_form = ScheduleNoteForm()
    # If user has previously loaded a calendar, load that calendar. Otherwise,
    # load the current date and first department found in query
    business_data = BusinessData.objects.get(user=logged_in_user)
    if business_data.last_cal_date_loaded:
        date = business_data.last_cal_date_loaded
    else:
        date = datetime.now()
        
    if business_data.last_cal_department_loaded:
        department = business_data.last_cal_department_loaded
    else:
        department = departments.first()
        
    set_live_cal_form = SetStateLiveCalForm(logged_in_user, department)
        
    
    context = {'calendar_form': calendar_form, 
               'add_sch_form': add_schedule_form,
               'view_live_form': view_live_form,
               'set_live_cal_form': set_live_cal_form,
               'day_note_header_form': day_note_header_form,
               'day_note_body_form': day_note_body_form,
               'schedule_note_form': schedule_note_form,
               'date': date,
               'department': department.id,
               'departments': departments}

    return HttpResponse(template.render(context, request))
    
    
@login_required
def employee_calendar_page(request):
    """Display the live calendar page for an employee user."""
    logged_in_user = request.user
    # Get manager corresponding to employee
    employee = (Employee.objects.select_related('user')
                                .get(employee_user=logged_in_user))
    employee_only = employee.see_only_my_schedules
    manager_user = employee.user
    
    live_calendar_form = LiveCalendarForm(manager_user, employee)
    template = loader.get_template('schedulingcalendar/employeeCalendar.html')
    context = {'live_calendar_form': live_calendar_form, 'employee_only': employee_only}

    return HttpResponse(template.render(context, request))