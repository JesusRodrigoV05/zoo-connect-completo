from enum import Enum


class UserRole(str, Enum):
    ADMINISTRADOR = "administrador"
    OSI = "osi"
    VETERINARIO = "veterinario"
    CUIDADOR = "cuidador"
    VISITANTE = "visitante"


class PermissionCode(str, Enum):
    MANAGE_USERS = "manage_users"
    MANAGE_PERMISSIONS = "manage_permissions"
    VIEW_AUDIT_LOGS = "view_audit_logs"
    VIEW_ADMIN_DASHBOARD = "view_admin_dashboard"
    MANAGE_ANIMALS = "manage_animals"
    MANAGE_ANIMAL_CATALOG = "manage_animal_catalog"
    MANAGE_VETERINARY_MODULE = "manage_veterinary_module"
    MANAGE_TASKS = "manage_tasks"
    VIEW_INVENTORY = "view_inventory"
    MANAGE_INVENTORY = "manage_inventory"
    MANAGE_SURVEYS = "manage_surveys"


class AnimalState(str, Enum):
    SALUDABLE = "Saludable"
    EN_TRATAMIENTO = "En tratamiento"
    EN_CUARENTENA = "En cuarentena"
    TRASLADADO = "Trasladado"
    FALLECIDO = "Fallecido"


class AuditEvent(str, Enum):
    LOGIN_SUCCESS = "login_exitoso"
    LOGIN_FAILURE = "login_fallido"
    V2P_SUCCESS = "login_2fa_exitoso"
    PERMISSION_UPDATE = "permission_update"
    ROLE_CREATED = "role_created"
    ROLE_UPDATED = "role_updated"
    ROLE_DELETED = "role_deleted"
    ROLE_PERMISSIONS_UPDATED = "role_permissions_updated"
