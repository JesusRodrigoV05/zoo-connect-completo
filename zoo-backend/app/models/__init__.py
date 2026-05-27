from .user import User
from .role import Role
from .risk_matrix import RiskMatrixEntry
from .permission import Permission
from .role_permission import RolePermission
from .user_permission import UserPermission
from .animal import Animal, Especie, Habitat, MediaAnimal, MediaHabitat, AnimalFavorito
from .survey import (
    Encuesta,
    EncuestaTema,
    PreguntaEncuesta,
    OpcionEncuesta,
    ParticipacionEncuesta,
    RespuestaUsuario,
)
from .refresh_token import RefreshToken
from .trivia import Trivia, ParticipacionTrivia
from .password_reset_token import PasswordResetToken
from .two_factor_codes import TwoFactorCodes
from .audit_log import AuditLog
from .inventario import (
    TipoProducto,
    UnidadMedida,
    Proveedor,
    Producto,
    StockLote,
    EntradaInventario,
    DetalleEntrada,
    Salida,
    DetalleSalida,
)
from .tarea import (
    TipoTarea,
    Tarea,
    DetalleAlimentacion,
    TareaRecurrente,
    Dieta,
    DetalleDieta,
    RegistroAlimentacion,
)
from .veterinario import (
    TipoAtencion,
    TipoExamen,
    HistorialMedico,
    OrdenExamen,
    ResultadoExamen,
    RecetaMedica,
    ProcedimientoMedico,
)
from .onboarding_tour_progress import OnboardingTourProgress
from .password_history import PasswordHistory
