# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2018-03-21 16:52
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedulingcalendar', '0058_auto_20180319_1310'),
    ]

    operations = [
        migrations.AlterField(
            model_name='scheduleswapapplication',
            name='approved',
            field=models.NullBooleanField(default=None),
        ),
    ]
