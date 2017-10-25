# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-10-25 21:16
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedulingcalendar', '0043_auto_20171025_1441'),
    ]

    operations = [
        migrations.AlterField(
            model_name='liveschedule',
            name='hide_end_time',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='liveschedule',
            name='hide_start_time',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='schedule',
            name='hide_end_time',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='schedule',
            name='hide_start_time',
            field=models.BooleanField(default=False),
        ),
    ]
