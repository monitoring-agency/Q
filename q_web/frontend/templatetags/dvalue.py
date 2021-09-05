from django import template

register = template.Library()


@register.filter
def dvalue(value, arg):
    return value[arg]
