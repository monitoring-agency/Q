import json
import logging
import os
import time
from collections import ChainMap
from typing import Union

from django.contrib.contenttypes.models import ContentType

from description.models import Host, Metric, Check, GlobalVariable, GenericKVP, Label, TimePeriod, SchedulingInterval, \
    HostTemplate, MetricTemplate
from q_web import settings

logger = logging.getLogger("export")

def export_description():
    start = time.time()

    # ContentTypes
    chost = ContentType.objects.get_for_model(Host).id
    cmetric = ContentType.objects.get_for_model(Metric).id
    chost_template = ContentType.objects.get_for_model(HostTemplate).id
    cmetric_template = ContentType.objects.get_for_model(MetricTemplate).id

    # Prefetched data
    hosts = Host.objects.filter(disabled=False)
    host_dict = {x.id: x for x in hosts}
    host_templates = {x.id: x for x in HostTemplate.objects.all()}
    host_template_relations = {}
    host_template_recursions = {}
    metrics = [x for x in Metric.objects.filter(disabled=False)]
    metric_templates = {x.id: x for x in MetricTemplate.objects.all()}
    metric_template_relations = {}
    metric_template_recursions = {}
    label = {x.id: x.label for x in Label.objects.all()}
    kvp = {}
    time_periods = {x.id: x.to_dict() for x in TimePeriod.objects.all()}
    scheduling_intervals = {x.id: x.interval for x in SchedulingInterval.objects.all()}
    variables = [{
        label[x.variable.first().key_id]: label[x.variable.first().value_id]
    } for x in GlobalVariable.objects.all()] if len(GlobalVariable.objects.all()) > 0 else [{}]
    checks = {
        x.id: x for x in Check.objects.filter(id__in=[
            y.linked_check_id for y in [*metrics, *hosts, *metric_templates.values(), *host_templates.values()]
        ])
    }

    # m2m relations
    for x in Host.host_templates.through.objects.values_list('host_id', 'hosttemplate_id'):
        if (x[0], chost) in host_template_relations:
            host_template_relations[(x[0], chost)].append(x[1])
        else:
            host_template_relations[(x[0], chost)] = [x[1]]
    for x in HostTemplate.host_templates.through.objects.values_list('from_hosttemplate_id', 'to_hosttemplate_id'):
        if (x[0], chost_template) in host_template_relations:
            host_template_relations[(x[0], chost_template)].append(x[1])
        else:
            host_template_relations[(x[0], chost_template)] = [x[1]]
    for x in Metric.metric_templates.through.objects.values_list('metric_id', 'metrictemplate_id'):
        if (x[0], cmetric) in metric_template_relations:
            metric_template_relations[(x[0], cmetric)].append(x[1])
        else:
            metric_template_relations[(x[0], cmetric)] = [x[1]]
    for x in MetricTemplate.metric_templates.through.objects.values_list('from_metrictemplate_id', 'to_metrictemplate_id'):
        if (x[0], cmetric_template) in metric_template_relations:
            metric_template_relations[(x[0], cmetric_template)].append(x[1])
        else:
            metric_template_relations[(x[0], cmetric_template)] = [x[1]]

    for x in GenericKVP.objects.filter(object_id__in=[x.id for x in [*metrics, *hosts]]):
        if (x.object_id, x.content_type_id) in kvp:
            kvp[(x.object_id, x.content_type_id)].update({label[x.key_id]: label[x.value_id]})
        else:
            kvp[(x.object_id, x.content_type_id)] = {label[x.key_id]: label[x.value_id]}

    # Helper functions
    def retrieve_kvp(object_id, content_type_id):
        return kvp[(object_id, content_type_id)] if (object_id, content_type_id) in kvp else {}

    def retrieve_variables(obj, content_type_id: int, var_list: list):
        var_list.append(retrieve_kvp(obj.id, content_type_id))
        if chost == content_type_id:
            if (obj.id, content_type_id) in host_template_relations:
                for x in host_template_relations[(obj.id, content_type_id)]:
                    return retrieve_variables(host_templates[x], chost_template, var_list)
        if chost_template == content_type_id:
            if (obj.id, content_type_id) in host_template_relations:
                for x in host_template_relations[(obj.id, content_type_id)]:
                    return retrieve_variables(host_templates[x], content_type_id, var_list)
        if cmetric == content_type_id:
            if (obj.id, content_type_id) in metric_template_relations:
                for x in metric_template_relations[(obj.id, content_type_id)]:
                    return retrieve_variables(metric_templates[x], cmetric_template, var_list)
        if cmetric_template == content_type_id:
            if (obj.id, content_type_id) in metric_template_relations:
                for x in metric_template_relations[(obj.id, content_type_id)]:
                    return retrieve_variables(metric_templates[x], content_type_id, var_list)
        return dict(ChainMap(*var_list[::-1]))

    def retrieve_check(obj, content_type_id, var_list):
        if obj.linked_check_id:
            return obj.to_export(dict(ChainMap(*var_list)))
        else:
            if (obj.id, content_type_id) in host_template_relations:
                for ht in host_template_relations[(obj.id, content_type_id)]:
                    return retrieve_check(host_templates[ht], content_type_id, var_list)
            else:
                return ""

    def retrieve_attr(
            obj: Union[Host, HostTemplate, Metric, MetricTemplate], attr_name, attr_default, content_type_id,
            attr_dict=None, attr_is_id=False
    ):
        if obj.__getattribute__(attr_name):
            if attr_is_id:
                return attr_dict[obj.__getattribute__(attr_name)]
            else:
                return obj.__getattribute__(attr_name)
        if content_type_id == chost:
            if (obj.id, chost) in host_template_relations:
                for ht in host_template_relations[(obj.id, chost)]:
                    return retrieve_attr(
                        host_templates[ht], attr_name, attr_default, chost_template, attr_dict, attr_is_id
                    )
            else:
                return attr_default
        if content_type_id == chost_template:
            if (obj.id, chost_template) in host_template_relations:
                for ht in host_template_relations[(obj.id, chost_template)]:
                    return retrieve_attr(
                        host_templates[ht], attr_name, attr_default, content_type_id, attr_dict, attr_is_id
                    )
            else:
                return attr_default
        if content_type_id == cmetric:
            if (obj.id, cmetric) in metric_template_relations:
                for mt in metric_template_relations[(obj.id, cmetric)]:
                    return retrieve_attr(
                        metric_templates[mt], attr_name, attr_default, cmetric_template, attr_dict, attr_is_id
                    )
            else:
                return attr_default
        elif content_type_id == cmetric_template:
            if (obj.id, cmetric_template) in metric_template_relations:
                for mt in metric_template_relations[(obj.id, cmetric_template)]:
                    return retrieve_attr(
                        metric_templates[mt], attr_name, attr_default, content_type_id, attr_dict, attr_is_id
                    )
            else:
                return attr_default

    def retrieve_hosttemplate(host_template_id: int) -> dict:
        return {
            "address": retrieve_attr(
                host_templates[host_template_id], "address", "", chost_template
            ),
            "linked_check": retrieve_attr(
                host_templates[host_template_id], "linked_check_id", "", chost_template, checks, True
            ),
            "scheduling_interval": retrieve_attr(
                host_templates[host_template_id], "scheduling_interval_id", "", chost_template, scheduling_intervals, True
            ),
            "scheduling_period": retrieve_attr(
                host_templates[host_template_id], "scheduling_period_id", "", chost_template, time_periods, True
            )
        }

    def retrieve_metrictemplate(metric_template_id) -> dict:
        return {
            "linked_check": retrieve_attr(
                metric_templates[metric_template_id], "linked_check_id", "", cmetric_template, checks, True
            ),
            "scheduling_interval": retrieve_attr(
                metric_templates[metric_template_id], "scheduling_interval_id", "", cmetric_template,
                scheduling_intervals, True
            ),
            "scheduling_period": retrieve_attr(
                metric_templates[metric_template_id], "scheduling_period_id", "", cmetric_template, time_periods, True
            )
        }

    # Generate hosttemplate recursions
    for x in host_templates:
        host_template_recursions[x] = retrieve_hosttemplate(host_templates[x].id)
    # Generate metrictemplate recursions
    for x in metric_templates:
        metric_template_recursions[x] = retrieve_metrictemplate(metric_templates[x].id)

    a = time.time()
    description = {}
    for host in hosts:
        h = {
            "id": host.id,
            "metrics": [],
            "linked_check": "",
        }
        if (host.id, chost) in host_template_relations:
            for x in host_template_relations[(host.id, chost)]:
                h.update(retrieve_hosttemplate(x))
        if host.scheduling_interval_id:
            h["scheduling_interval"] = scheduling_intervals[host.scheduling_interval_id]
        if host.scheduling_period_id:
            h["scheduling_period"] = time_periods[host.scheduling_period_id]
        if host.linked_check_id:
            h["linked_check"] = checks[host.linked_check_id]
        if h["linked_check"]:
            logger.error(f"Test {type(variables)} {retrieve_variables(host, chost, [])}")
            h["linked_check"] = h["linked_check"].to_export(
                dict(ChainMap(*variables, retrieve_variables(host, chost, [])))
            )
        description[host.id] = h

    for metric in metrics:
        m = {
            "id": metric.id,
            "linked_check": "",
        }
        if (metric.id, cmetric) in metric_template_relations:
            for x in metric_template_relations[(metric.id, cmetric)]:
                m.update(retrieve_metrictemplate(x))
        host = host_dict[metric.linked_host_id]
        if metric.scheduling_interval_id:
            m["scheduling_interval"] = scheduling_intervals[metric.scheduling_interval_id]
        if metric.scheduling_period_id:
            m["scheduling_period"] = time_periods[metric.scheduling_period_id]
        if metric.linked_check_id:
            m["linked_check"] = checks[metric.linked_check_id]
        host_vars = retrieve_variables(host, chost, [])
        metric_vars = retrieve_variables(metric, cmetric, [])
        if m["linked_check"]:
            m["linked_check"] = m["linked_check"].to_export(dict(ChainMap(
                *variables, metric_vars, host_vars
            )))
        description[metric.linked_host_id]["metrics"].append(m)
    return description


def export():
    t = time.time()
    desc = export_description()
    with open(os.path.join(settings.DESCRIPTION_DIRECTORY, "declaration.json"), "w") as fh:
        json.dump(desc, fh)

    return time.time()-t


def test():
    a = []
    for i in range(100):
        a.append(export())
    print(sum(a)/100)

