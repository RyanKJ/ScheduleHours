# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2018-04-18 21:16
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedulingcalendar', '0065_auto_20180415_1134'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='businessdata',
            name='break_time_in_min',
        ),
        migrations.RemoveField(
            model_name='businessdata',
            name='min_time_for_break',
        ),
        migrations.AddField(
            model_name='employee',
            name='break_time_in_min',
            field=models.IntegerField(default=30, verbose_name='Average Break Length In Minutes Per Eligable Schedule'),
        ),
        migrations.AddField(
            model_name='employee',
            name='min_time_for_break',
            field=models.FloatField(default=5, verbose_name='Minimum Schedule Duration In Hours For Break Eligability'),
        ),
    ]