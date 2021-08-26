from django import template

register = template.Library()


@register.filter
def time(value):
    padded = str(value).zfill(4)
    if padded == "2400":
        padded = "0000"
    return padded[0:2] + ":" + padded[2:4]
