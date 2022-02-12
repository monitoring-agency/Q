from proxy.models import CheckState


def create_check_states():
    check_state_list = [
        "ok",
        "warn",
        "critical",
        "unknown"
    ]
    for state in check_state_list:
        CheckState.objects.get_or_create(state=state)
