# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2017-11-06 17:44
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedulingcalendar', '0045_auto_20171031_1408'),
    ]

    operations = [
        migrations.AddField(
            model_name='businessdata',
            name='desired_hours_overshoot_alert',
            field=models.IntegerField(default=5, verbose_name='Desired Hours Overshoot Alert'),
        ),
    ]