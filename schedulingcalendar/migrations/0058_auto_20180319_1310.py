# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2018-03-19 18:10
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedulingcalendar', '0057_auto_20180319_1306'),
    ]

    operations = [
        migrations.AlterField(
            model_name='scheduleswappetition',
            name='approved',
            field=models.NullBooleanField(default=None),
        ),
    ]