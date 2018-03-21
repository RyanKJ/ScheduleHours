from django.conf.urls import url

from . import views

app_name = 'schedulingcalendar'
urlpatterns = [
    url(r'^$', views.front_page, name='front_page'),
    url(r'login_success/$', views.login_success, name='login_success'),
    url(r'register/$', views.register, name='register'),
    url(r'^calendar/$', views.calendar_page, name='calendar_page'),
    url(r'^calendar/add_schedule$', views.add_schedule, name='add_schedule'),
    url(r'^calendar/get_schedules$', views.get_schedules, name='get_schedules'),
    url(r'^calendar/get_schedule_info$', views.get_schedule_info, name='get_schedule_info'),
    url(r'^calendar/add_employee_to_schedule$', views.add_employee_to_schedule, name='add_employee_to_schedule'),
    url(r'^calendar/remove_schedule$', views.remove_schedule, name='remove_schedule'),
    url(r'^calendar/push_live$', views.push_live, name='push_live'),
    url(r'^calendar/set_active_state$', views.set_active_state, name='set_active_state'),
    url(r'^calendar/get_live_schedules$', views.get_live_schedules, name='get_live_schedules'),
    url(r'^calendar/view_live_schedules$', views.view_live_schedules, name='view_live_schedules'),
    url(r'^calendar/add_edit_day_note_header$', views.add_edit_day_note_header, name='add_edit_day_note_header'),
    url(r'^calendar/add_edit_day_note_body$', views.add_edit_day_note_body, name='add_edit_day_note_body'),
    url(r'^calendar/edit_schedule_note$', views.edit_schedule_note, name='edit_schedule_note'),
    url(r'^employees/$', views.EmployeeListView.as_view(), name='employee_list'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/info/$', views.EmployeeUpdateView.as_view(), name='employee_info'),
    url(r'^employees/employee_create$', views.EmployeeCreateView.as_view(), name='employee_create'),
    url(r'^employees/(?P<pk>[0-9]+)/employee_delete$', views.EmployeeDeleteView.as_view(), name='employee_delete'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/employee_user_pw/(?P<employee_user_pk>[0-9]+)$', views.change_employee_pw_as_manager, name='employee_user_pw_update'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/employee_username/(?P<employee_user_pk>[0-9]+)$', views.EmployeeUsernameUpdateView.as_view(), name='employee_username_update'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/employee_user_delete/(?P<pk>[0-9]+)$', views.EmployeeUserDeleteView.as_view(), name='employee_user_delete'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/employee_user_create$', views.EmployeeUserCreateView.as_view(), name='employee_user_create'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/vacation/(?P<vacation_pk>[0-9]+)$', views.VacationUpdateView.as_view(), name='vacation_update'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/vacation_delete/(?P<pk>[0-9]+)$', views.VacationDeleteView.as_view(), name='vacation_delete'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/vacation_create$', views.VacationCreateView.as_view(), name='vacation_create'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/absent/(?P<absent_pk>[0-9]+)$', views.AbsentUpdateView.as_view(), name='absent_update'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/absent_delete/(?P<pk>[0-9]+)$', views.AbsentDeleteView.as_view(), name='absent_delete'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/absent_create$', views.AbsentCreateView.as_view(), name='absent_create'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/repeat_unavailable/(?P<repeat_unav_pk>[0-9]+)$', views.RepeatUnavailableUpdateView.as_view(), name='repeat_unav_update'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/repeat_unavailable_delete/(?P<pk>[0-9]+)$', views.RepeatUnavailableDeleteView.as_view(), name='repeat_unav_delete'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/repeat_unavailable_create$', views.RepeatUnavailableCreateView.as_view(), name='repeat_unav_create'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/desired_time/(?P<desired_time_pk>[0-9]+)$', views.DesiredTimeUpdateView.as_view(), name='desired_time_update'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/desired_time_delete/(?P<pk>[0-9]+)$', views.DesiredTimeDeleteView.as_view(), name='desired_time_delete'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/desired_time_create$', views.DesiredTimeCreateView.as_view(), name='desired_time_create'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/department_membership/(?P<dep_mem_pk>[0-9]+)$', views.DepartmentMembershipUpdateView.as_view(), name='dep_mem_update'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/department_membership_delete/(?P<pk>[0-9]+)$', views.DepartmentMembershipDeleteView.as_view(), name='dep_mem_delete'),
    url(r'^employees/(?P<employee_pk>[0-9]+)/department_membership_create$', views.DepartmentMembershipCreateView.as_view(), name='dep_mem_create'),
    url(r'^departments/$', views.DepartmentListView.as_view(), name='department_list'),
    url(r'^departments/department_create$', views.DepartmentCreateView.as_view(), name='department_create'),
    url(r'^departments/(?P<department_pk>[0-9]+)/department_update$', views.DepartmentUpdateView.as_view(), name='department_update'),
    url(r'^departments/(?P<pk>[0-9]+)/department_delete$', views.DepartmentDeleteView.as_view(), name='department_delete'),
    url(r'^monthly_revenue/$', views.MonthlyRevenueListView.as_view(), name='monthly_revenue_list'),
    url(r'^monthly_revenue/monthly_revenue_create$', views.MonthlyRevenueCreateView.as_view(), name='monthly_revenue_create'),
    url(r'^monthly_revenue/(?P<monthly_rev_pk>[0-9]+)/monthly_revenue_update$', views.MonthlyRevenueUpdateView.as_view(), name='monthly_revenue_update'),
    url(r'^monthly_revenue/(?P<pk>[0-9]+)/monthly_revenue_delete$', views.MonthlyRevenueDeleteView.as_view(), name='monthly_revenue_delete'),
    url(r'^business_settings$', views.BusinessDataUpdateView.as_view(), name='business_update'),
    url(r'^live_calendar/$', views.employee_calendar_page, name='employee_calendar_page'),
    url(r'^live_calendar/create_schedule_swap_petition$', views.create_schedule_swap_petition, name='create_schedule_swap_petition'),
    url(r'pending_approvals/$', views.pending_approvals_page, name='pending_approvals'),
    url(r'pending_approvals/schedule_swap_disapproval$', views.schedule_swap_disapproval, name='schedule_swap_disapproval'),
    url(r'^.well-known/pki-validation/735B730461563A26284BCE64D8EE12C5.txt$', views.ssl_http, name='ssl_http'),
]