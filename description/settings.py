import secrets
import string

from django.conf import settings
from staticconfig import Config, Namespace


class DescriptionConfig(Config):
    def __init__(self):
        super().__init__()
        self.description_path = ""
        self.database = Namespace()
        self.database.engine = "django.db.backends.mysql"
        self.database.host = "localhost"
        self.database.port = 3306
        self.database.name = "mon_description"
        self.database.user = "mon_user"
        alphabet = string.ascii_letters + string.digits + string.punctuation
        self.database.password = "".join(secrets.choice(alphabet) for i in range(16))


config = DescriptionConfig.from_json("description.json")
settings.configure(
    DATABASES={
        "default": {
            "ENGINE": config.database.engine,
            "NAME": config.database.name,
            "USER": config.database.user,
            "PASSWORD": config.database.password,
            "HOST": config.database.host,
            "PORT": config.databaseq.port
        }
    },
    INSTALLED_APPS=[
        "data",
    ],
    DEFAULT_AUTO_FIELD="django.db.models.BigAutoField"
)
