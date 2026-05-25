from enum import Enum


class SecurityEventType(str, Enum):
    LOGIN_FAILED = "LOGIN_FAILED"
    ACCOUNT_LOCKED = "ACCOUNT_LOCKED"
    PASSWORD_CHANGED = "PASSWORD_CHANGED"
    ROLE_CHANGED = "ROLE_CHANGED"
    PERMISSION_CHANGED = "PERMISSION_CHANGED"
    MASS_EXPORT = "MASS_EXPORT"


class SecuritySeverity(str, Enum):
    INFO = "INFO"
    WARN = "WARN"
    CRITICAL = "CRITICAL"


class SecurityCategory(str, Enum):
    AUTH = "auth"
    AUTHORIZATION = "authorization"
    REPORTING = "reporting"
    DATA = "data"


EVENT_CATEGORY = {
    SecurityEventType.LOGIN_FAILED: SecurityCategory.AUTH,
    SecurityEventType.ACCOUNT_LOCKED: SecurityCategory.AUTH,
    SecurityEventType.PASSWORD_CHANGED: SecurityCategory.AUTH,
    SecurityEventType.ROLE_CHANGED: SecurityCategory.AUTHORIZATION,
    SecurityEventType.PERMISSION_CHANGED: SecurityCategory.AUTHORIZATION,
    SecurityEventType.MASS_EXPORT: SecurityCategory.REPORTING,
}


IGNORABLE_EVENT_TYPES = {"LOGIN_SUCCESS", "LOGIN_2FA_SUCCESS"}
