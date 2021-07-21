# Generated by Django 3.2.4 on 2021-06-30 16:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_alter_accountmodel_linked_acl_group'),
    ]

    operations = [
        migrations.CreateModel(
            name='APIToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('expire', models.DateTimeField()),
                ('token', models.CharField(default='', max_length=255)),
            ],
        ),
        migrations.AddField(
            model_name='accountmodel',
            name='linked_api_tokens',
            field=models.ManyToManyField(blank=True, to='api.APIToken'),
        ),
    ]