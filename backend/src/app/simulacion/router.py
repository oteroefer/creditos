"""Ruta de simulación de créditos. Requiere sesión iniciada."""

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.simulacion.schemas import SimulacionIn, SimulacionOut
from app.simulacion.servicio import calcular_plan
from app.usuarios.models import User

router = APIRouter(prefix="/simulacion", tags=["simulacion"])


@router.post("/", response_model=SimulacionOut)
def simular(datos: SimulacionIn, _: User = Depends(get_current_user)):
    """Calcula la cuota mensual fija (sistema francés), el total, los intereses y el plan.

    No guarda nada en la base de datos. Responde 422 si los datos no son válidos.
    """
    resultado = calcular_plan(datos.monto, datos.tasa_anual, datos.cuotas)
    return {"monto": datos.monto, "tasa_anual": datos.tasa_anual, "cuotas": datos.cuotas, **resultado}
