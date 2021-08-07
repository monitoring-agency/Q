from staticconfig import Config


class SchedulerConfig(Config):
    def __init__(self):
        super().__init__()
        self.description_path = "/var/lib/q/declaration.json"
