from django.db import migrations

from description.models import CheckType


def add_default_check_types(*args):
    defaults = [
        "check",
        "notification"
    ]
    existing = [x.name for x in CheckType.objects.all()]
    for default in defaults:
        if default not in existing:
            c = CheckType(name=default)
            c.save()


class Migration(migrations.Migration):

    dependencies = [
        ('description', '0002_auto_20210615_1903'),
    ]

    operations = [
        migrations.RunPython(
            add_default_check_types
        )
    ]
