# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-10-24 19:43
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedulingcalendar', '0040_auto_20171023_1330'),
    ]

    operations = [
        migrations.AddField(
            model_name='liveschedule',
            name='version',
            field=models.IntegerField(default=1, verbose_name='Version'),
        ),
    ]