<<<<<<< HEAD
from enum import Enum

class UserRole(str, Enum):
    ADMINISTRADOR = "administrador"
    VETERINARIO = "veterinario"
    CUIDADOR = "cuidador"
    VISITANTE = "visitante"

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
=======
from enum import Enum

class UserRole(str, Enum):
    ADMINISTRADOR = "administrador"
    VETERINARIO = "veterinario"
    CUIDADOR = "cuidador"
    VISITANTE = "visitante"

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

class TipoTareaId(int, Enum):
    ALIMENTACION = 1
    TRATAMIENTO_MEDICO = 2

class TipoSalidaId(int, Enum):
    CONSUMO_ALIMENTACION = 1
    CONSUMO_TRATAMIENTO = 2

class RolId(int, Enum):
    ADMIN = 1
    VISITANTE = 2
    CUIDADOR = 3
    VETERINARIO = 4

class UnidadMedidaNombre(str, Enum):
    KILOGRAMO = "kg"
    GRAMO = "g"
    LITRO = "L"
    UNIDAD = "u"

class TipoProductoNombre(str, Enum):
    SIN_CLASIFICAR = "Sin Clasificar"
    ALIMENTO = "Alimento"
    SUPLEMENTO = "Suplemento"
    MEDICAMENTO = "Medicamento"
>>>>>>> 8585d29f67065f84845a9a98969c45d34d0ed0be
