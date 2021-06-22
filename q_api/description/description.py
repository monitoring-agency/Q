import json
import os

from description.models import Check, Metric
from q_api import settings


def export_metrics():
    with open(os.path.join(settings.DESCRIPTION_DIRECTORY, "metrics.json"), "w") as fh:
        metrics = Metric.objects.all()
        for metric in metrics:
            fh.write(json.dumps(metric, indent=4))


def export_checks():
    with open(os.path.join(settings.DESCRIPTION_DIRECTORY, "checks.json"), "w") as fh:
        checks = Check.objects.all()
        for check in checks:
            fh.write(json.dumps(check, indent=4))


def export():
    export_checks()
    export_metrics()
