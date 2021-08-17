from description.models import Proxy


def create_proxy():
    if Proxy.objects.filter(name="local").exists():
        Proxy.objects.get(name="local").delete()
    proxy, _ = Proxy.objects.get_or_create(
        name="local",
        address="127.0.0.1",
        port=8443,
        web_address="127.0.0.1",
        web_port=4443
    )
