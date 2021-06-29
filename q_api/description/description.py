import json
import os

from description.models import Check, Metric
from q_api import settings


def export_description():
    checks = Check.objects.all()
    metrics = Metric.objects.all()
    with open(os.path.join(settings.DESCRIPTION_DIRECTORY, "description.json"), "w") as fh:
        for check in checks:
            fh.write(json.dumps(check, indent=4))


def export():
    export_description()
