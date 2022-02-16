import base64
import logging
import time
from collections import ChainMap
from typing import Union

import httpx
from django.contrib.contenttypes.models import ContentType

from api.models import Host, HostTemplate, ObservableTemplate, Observable, Proxy, Label, TimePeriod, \
    SchedulingInterval, GlobalVariable, Check, GenericKVP

logger = logging.getLogger("export")


def generate_declaration(proxy_id_list):
    """This function generates the description to be forwarded to the specific proxies"""
    # ContentTypes
    chost = ContentType.objects.get_for_model(Host).id
    cobservable = ContentType.objects.get_for_model(Observable).id
    chost_template = ContentType.objects.get_for_model(HostTemplate).id
    coberservable_template = ContentType.objects.get_for_model(ObservableTemplate).id

    # Prefetched data
    proxies = [x for x in Proxy.objects.filter(id__in=proxy_id_list, disabled=False)]
    hosts = Host.objects.filter(disabled=False, linked_proxy_id__in=proxy_id_list)
    host_templates = {x.id: x for x in HostTemplate.objects.all()}
    host_template_relations = {}
    host_template_recursions = {}
    observables = [x for x in Observable.objects.filter(
        disabled=False, linked_host__disabled=False, linked_proxy_id__in=proxy_id_list
    )]
    observable_templates = {x.id: x for x in ObservableTemplate.objects.all()}
    observable_template_relations = {}
    observable_template_recursions = {}
    label = {x.id: x.label for x in Label.objects.all()}
    kvp = {}
    time_periods = {x.id: x.to_dict() for x in TimePeriod.objects.all()}
    scheduling_intervals = {x.id: x.interval for x in SchedulingInterval.objects.all()}
    variables = [{
        label[x.variable.first().key_id]: label[x.variable.first().value_id]
    } for x in GlobalVariable.objects.all()] if len(GlobalVariable.objects.all()) > 0 else [{}]
    checks = {
        x.id: x for x in Check.objects.filter(id__in=[
            y.linked_check_id for y in [*observables, *hosts, *observable_templates.values(), *host_templates.values()]
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
    for x in Observable.observable_templates.through.objects.values_list('metric_id', 'metrictemplate_id'):
        if (x[0], cobservable) in observable_template_relations:
            observable_template_relations[(x[0], cobservable)].append(x[1])
        else:
            observable_template_relations[(x[0], cobservable)] = [x[1]]
    for x in ObservableTemplate.observable_templates.through.objects.values_list('from_observabletemplate_id',
                                                                                 'to_observabletemplate_id'):
        if (x[0], coberservable_template) in observable_template_relations:
            observable_template_relations[(x[0], coberservable_template)].append(x[1])
        else:
            observable_template_relations[(x[0], coberservable_template)] = [x[1]]

    for x in GenericKVP.objects.filter(object_id__in=[x.id for x in [*observables, *hosts]]):
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
        if cobservable == content_type_id:
            if (obj.id, content_type_id) in observable_template_relations:
                for x in observable_template_relations[(obj.id, content_type_id)]:
                    return retrieve_variables(observable_templates[x], coberservable_template, var_list)
        if coberservable_template == content_type_id:
            if (obj.id, content_type_id) in observable_template_relations:
                for x in observable_template_relations[(obj.id, content_type_id)]:
                    return retrieve_variables(observable_templates[x], content_type_id, var_list)
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
            obj: Union[Host, HostTemplate, ObservableTemplate, Observable], attr_name, attr_default, content_type_id,
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
        if content_type_id == cobservable:
            if (obj.id, cobservable) in observable_template_relations:
                for mt in observable_template_relations[(obj.id, cobservable)]:
                    return retrieve_attr(
                        observable_templates[mt], attr_name, attr_default, coberservable_template, attr_dict, attr_is_id
                    )
            else:
                return attr_default
        elif content_type_id == coberservable_template:
            if (obj.id, coberservable_template) in observable_template_relations:
                for mt in observable_template_relations[(obj.id, coberservable_template)]:
                    return retrieve_attr(
                        observable_templates[mt], attr_name, attr_default, content_type_id, attr_dict, attr_is_id
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
                host_templates[host_template_id], "scheduling_interval_id", "", chost_template, scheduling_intervals,
                True
            ),
            "scheduling_period": retrieve_attr(
                host_templates[host_template_id], "scheduling_period_id", "", chost_template, time_periods, True
            )
        }

    def retrieve_observable_template(observable_template_id) -> dict:
        return {
            "linked_check": retrieve_attr(
                observable_templates[observable_template_id],
                "linked_check_id",
                "",
                coberservable_template,
                checks,
                True
            ),
            "scheduling_interval": retrieve_attr(
                observable_templates[observable_template_id],
                "scheduling_interval_id",
                "",
                coberservable_template,
                scheduling_intervals,
                True
            ),
            "scheduling_period": retrieve_attr(
                observable_templates[observable_template_id],
                "scheduling_period_id",
                "",
                coberservable_template,
                time_periods,
                True
            )
        }

    # Generate hosttemplate recursions
    for x in host_templates:
        host_template_recursions[x] = retrieve_hosttemplate(host_templates[x].id)
    # Generate metrictemplate recursions
    for x in observable_templates:
        observable_template_recursions[x] = retrieve_observable_template(observable_templates[x].id)

    # Has to have the following structure:
    """
    {
        proxy_id: 
        {
            address: "",
            port: "",
            proxy_secret: "",
            hosts:
            [
            
            ],
            observables:
            [
            
            ],
            scheduling_periods:
            {
                scheduling_period_id: scheduling_period
            }
        }
    }
    """
    declaration = {}
    for proxy in proxies:
        declaration[proxy.id] = {
            "address": proxy.address,
            "port": proxy.port,
            "proxy_secret": proxy.secret,
            "hosts": [],
            "observables": [],
            "scheduling_periods": {}
        }

    host_vars = {}
    for host in hosts:
        h = {"linked_check": "", "address": "", "scheduling_period": "", "scheduling_interval": ""}
        export_host = {"id": host.id, "linked_check": ""}
        additional_host_vars = {}

        # Get reverse attributes
        if (host.id, chost) in host_template_relations:
            for x in host_template_relations[(host.id, chost)]:
                h.update(retrieve_hosttemplate(x))

        # Check host attributes
        if host.address:
            h["address"] = host.address
        if host.linked_check_id:
            h["linked_check"] = checks[host.linked_check_id]
        if host.scheduling_interval_id:
            h["scheduling_interval"] = scheduling_intervals[host.scheduling_interval_id]
        if host.scheduling_period_id:
            h["scheduling_period"] = time_periods[host.scheduling_period_id]

        # Set host_vars
        additional_host_vars["$host_address$"] = h["address"]
        additional_host_vars.update(dict(ChainMap(*variables, retrieve_variables(host, chost, []))))
        host_vars[host.id] = additional_host_vars

        # Fill export dict
        if h["linked_check"] and h["scheduling_period"] and h["scheduling_interval"]:
            export_host["linked_check"] = h["linked_check"].to_export(additional_host_vars)
            export_host["scheduling_interval"] = h["scheduling_interval"]
            export_host["scheduling_period"] = h["scheduling_period"]["id"]
            declaration[host.linked_proxy_id]["hosts"].append(export_host)
            if h["scheduling_period"]["id"] not in declaration[host.linked_proxy_id]["scheduling_periods"]:
                declaration[host.linked_proxy_id]["scheduling_periods"][h["scheduling_period"]["id"]] = h[
                    "scheduling_period"]

    for metric in observables:
        m = {"linked_check": ""}
        export_metric = {"id": metric.id, "linked_check": "", "scheduling_period": "", "scheduling_interval": ""}
        # Get reverse attributes
        if (metric.id, cobservable) in observable_template_relations:
            for x in observable_template_relations[(metric.id, cobservable)]:
                m.update(retrieve_observable_template(x))

        # Check metric attributes
        if metric.scheduling_interval_id:
            m["scheduling_interval"] = scheduling_intervals[metric.scheduling_interval_id]
        if metric.scheduling_period_id:
            m["scheduling_period"] = time_periods[metric.scheduling_period_id]
        if metric.linked_check_id:
            m["linked_check"] = checks[metric.linked_check_id]

        # Set metric vars
        metric_vars = dict(ChainMap(host_vars[metric.linked_host_id], retrieve_variables(metric, cobservable, [])))

        # Fill export dict
        if m["linked_check"] and m["scheduling_period"] and m["scheduling_interval"]:
            export_metric["linked_check"] = m["linked_check"].to_export(metric_vars)
            export_metric["scheduling_interval"] = m["scheduling_interval"]
            export_metric["scheduling_period"] = m["scheduling_period"]["id"]
            declaration[metric.linked_proxy_id]["metrics"].append(export_metric)
            if m["scheduling_period"]["id"] not in declaration[metric.linked_proxy_id]["scheduling_periods"]:
                declaration[metric.linked_proxy_id]["scheduling_periods"][m["scheduling_period"]["id"]] = m[
                    "scheduling_period"]
    return declaration

'''
def generate_scheduled_objects(declaration):
    """This method is used to create instances of scheduled objects if not existent yet"""
    creation = []
    host_content_type = ContentType.objects.get_for_model(Host)
    metric_content_type = ContentType.objects.get_for_model(Observable)
    existing_hosts = [x.object_id for x in ScheduledObject.objects.filter(content_type=host_content_type)]
    existing_metrics = [x.object_id for x in ScheduledObject.objects.filter(content_type=metric_content_type)]
    intermediate = []
    [intermediate.extend(declaration[x]["hosts"]) for x in declaration]
    [
        creation.append(ScheduledObject(
            content_type=host_content_type,
            object_id=x["id"]
        ))
        for x in intermediate if x["id"] not in existing_hosts
    ]
    intermediate.clear()
    [intermediate.extend(declaration[x]["metrics"]) for x in declaration]
    [
        creation.append(ScheduledObject(
            content_type=metric_content_type,
            object_id=x["id"]
        ))
        for x in intermediate if x["id"] not in existing_metrics
    ]
    ScheduledObject.objects.bulk_create(creation)
'''


def export_to_proxy(declaration: dict):
    client = httpx.Client(cert=("/var/lib/q/certs/q-core-fullchain.pem", "/var/lib/q/certs/q-core-privkey.pem"))
    status_list = []
    for x in declaration:
        proxy = declaration[x]
        ret = client.post(
            f"https://{proxy['address']}:{proxy['port']}/api/v1/updateDeclaration",
            json={
                "hosts": proxy["hosts"],
                "metrics": proxy["metrics"],
                "scheduling_periods": proxy["scheduling_periods"]
            }, headers={
                "Authentication":
                    base64.urlsafe_b64encode(proxy["proxy_secret"].encode("utf-8")).decode("utf-8")
            }
        )
        status_list.append(ret)
    return status_list


def export(proxy_id_list: list):
    t = time.time()
    declaration = generate_declaration(proxy_id_list)
    #generate_scheduled_objects(declaration)
    try:
        status = export_to_proxy(declaration)
    except FileNotFoundError:
        logger.error("Could not read certificate files in /var/lib/q/certs/")
        return {
            "elapsed_time": round(time.time() - t, 2),
            "status": "Could not export configuration to due certificate errors. For further information, check logs.."
        }

    return {
        "elapsed_time": round(time.time() - t, 2),
        "status": [{"return_code": x.status_code, "message": x.text} for x in status]
    }
