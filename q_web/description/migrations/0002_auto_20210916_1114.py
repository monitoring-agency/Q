# Generated by Django 3.2.6 on 2021-09-16 11:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('description', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='host',
            name='linked_contact_groups',
            field=models.ManyToManyField(blank=True, to='description.ContactGroup'),
        ),
        migrations.AddField(
            model_name='host',
            name='linked_contacts',
            field=models.ManyToManyField(blank=True, to='description.Contact'),
        ),
        migrations.AddField(
            model_name='hosttemplate',
            name='linked_contact_groups',
            field=models.ManyToManyField(blank=True, to='description.ContactGroup'),
        ),
        migrations.AddField(
            model_name='hosttemplate',
            name='linked_contacts',
            field=models.ManyToManyField(blank=True, to='description.Contact'),
        ),
        migrations.AddField(
            model_name='metric',
            name='linked_contact_groups',
            field=models.ManyToManyField(blank=True, to='description.ContactGroup'),
        ),
        migrations.AddField(
            model_name='metric',
            name='linked_contacts',
            field=models.ManyToManyField(blank=True, to='description.Contact'),
        ),
        migrations.AddField(
            model_name='metrictemplate',
            name='linked_contact_groups',
            field=models.ManyToManyField(blank=True, to='description.ContactGroup'),
        ),
        migrations.AddField(
            model_name='metrictemplate',
            name='linked_contacts',
            field=models.ManyToManyField(blank=True, to='description.Contact'),
        ),
    ]
