import certifi


def append_ca_bundle():
    ca_bundle = certifi.where()
    with open("/var/lib/q/certs/q-ca.pem", "rb") as fh:
        q_ca = fh.read()
    with open(ca_bundle, "rb") as fh:
        if fh.read().endswith(q_ca):
            return
    with open(ca_bundle, "ab") as fh:
        fh.write(q_ca)
