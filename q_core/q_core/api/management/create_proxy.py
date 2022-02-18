import secrets
import string

from api.models import Proxy


def create_proxy():
    alphabet = string.ascii_letters + string.digits
    if Proxy.objects.filter(name="local").exists():
        Proxy.objects.get(name="local").delete()
    proxy, _ = Proxy.objects.get_or_create(
        name="local",
        address="127.0.0.1",
        port=8443,
        secret="".join(secrets.choice(alphabet) for _ in range(255)),
        core_address="127.0.0.1",
        core_port=4443,
        core_secret="".join(secrets.choice(alphabet) for _ in range(255)),
    )
