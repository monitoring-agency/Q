from staticconfig import Config


class SchedulerConfig(Config):
    def __init__(self):
        super().__init__()
        self.declaration_path = "/var/lib/q/declaration.json"
        self.workers = 10
