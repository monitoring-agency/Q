from api.models import ACLModel, ACLGroupModel


def append_acl(acl_list, endpoint):
    acl_list.append(":".join(["API", "GET", endpoint]))
    acl_list.append(":".join(["API", "POST", endpoint]))
    acl_list.append(":".join(["API", "PUT", endpoint + "/<int>"]))
    acl_list.append(":".join(["API", "DELETE", endpoint + "/<int>"]))


def create_acl_models():
    api_endpoints = [
        "/api/v1/check",
        "/api/v1/metric",
        "/api/v1/metrictemplate",
        "/api/v1/host",
        "/api/v1/hosttemplate",
        "/api/v1/aclgroup",
        "/api/v1/globalvariable",
        "/api/v1/schedulinginterval",
        "/api/v1/timeperiod",
        "/api/v1/contact",
        "/api/v1/contactgroup",
        "/api/v1/proxy"
    ]

    acl_list = [
        "API:POST:/api/v1/authenticate",
        "API:POST:/api/v1/reloadDeclaration"
    ]
    [append_acl(acl_list, x) for x in api_endpoints]

    allow_list = []
    deny_list = []
    for x in acl_list:
        allow_list.append(ACLModel.objects.get_or_create(name=x, allow=True)[0])
        deny_list.append(ACLModel.objects.get_or_create(name=x, allow=False)[0])

    allow_all, _ = ACLGroupModel.objects.get_or_create(name="allow_all")
    allow_all.linked_acls.clear()
    deny_all, _ = ACLGroupModel.objects.get_or_create(name="deny_all")
    deny_all.linked_acls.clear()
    for x in allow_list:
        allow_all.linked_acls.add(x)
    for x in deny_list:
        deny_all.linked_acls.add(x)
    allow_all.save()
    deny_all.save()
