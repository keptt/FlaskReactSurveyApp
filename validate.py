"""
    Validation functions and classes for some user information
"""
import re


class EmailInvalid(BaseException):
    def __str__(self):
        return 'Email has invalid structure'


def validate_email(email):
    if not re.match(r'^[^@ ]+@[^@ ]+\.[^@ ]+$', email):
        raise EmailInvalid()
