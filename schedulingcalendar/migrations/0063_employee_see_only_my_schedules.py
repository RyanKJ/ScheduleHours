# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2018-04-09 16:23
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedulingcalendar', '0062_auto_20180409_1104'),
    ]

    operations = [
        migrations.AddField(
            model_name='employee',
            name='see_only_my_schedules',
            field=models.BooleanField(default=False),
        ),
    ]
