# Generated by Django 3.2.6 on 2021-08-16 20:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('description', '0026_auto_20210808_0123'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='proxy',
            name='port',
        ),
        migrations.AddField(
            model_name='proxy',
            name='web_address',
            field=models.CharField(default='', max_length=255),
        ),
    ]