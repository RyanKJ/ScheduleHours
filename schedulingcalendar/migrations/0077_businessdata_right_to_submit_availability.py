# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2018-07-24 15:31
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedulingcalendar', '0076_businessdata_display_first_char_last_name_non_unique_first_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='businessdata',
            name='right_to_submit_availability',
            field=models.BooleanField(default=False),
        ),
    ]
