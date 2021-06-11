import os

import django


def entry():
    print("Hallo")


if __name__ == '__main__':
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")
    django.setup()
    entry()

