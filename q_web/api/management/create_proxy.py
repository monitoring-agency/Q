from description.models import Proxy


def create_proxy():
    proxy, _ = Proxy.objects.get_or_create(
        name="local",
        address="127.0.0.1",
        port=8443,
    )
