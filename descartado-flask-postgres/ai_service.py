# Speaksy — servicio de IA conversacional (sección 12/22 del PRD)
# Estado: ESTRUCTURA LISTA, SIN CONECTAR A UN PROVEEDOR DE IA TODAVÍA.
#
# Reglas de comportamiento para el prompt del sistema del tutor conversacional
# (aplicar cuando se conecte a la API real):
#   - Acompañante de práctica, nunca un médico ni un diagnosticador.
#   - No decir "habla más rápido", no burlarse, no penalizar pausas.
#   - Feedback siempre positivo y constructivo (ver sección 13 del PRD).
#   - Nunca la API key en el frontend: se usa solo aquí, en el backend.

import os

AI_API_KEY = os.environ.get("AI_API_KEY")

SYSTEM_PROMPT = """
Eres el acompañante de práctica de conversación de Speaksy. No eres un
profesional de la salud ni das diagnósticos. Tu función es sostener una
conversación tranquila, hacer preguntas sencillas, esperar la respuesta del
usuario sin presionar, y dar feedback breve y positivo. Nunca comentes la
velocidad del habla del usuario, nunca menciones tartamudez como algo a
corregir, y nunca uses un tono evaluador.
""".strip()


def get_ai_response(conversation_history: list[dict], topic: str) -> str:
    """
    Devuelve la siguiente respuesta del tutor de conversación.

    TODO: conectar con la API de Anthropic (u otro proveedor) usando AI_API_KEY.
    Por ahora lanza NotImplementedError para que nunca se sirva una respuesta
    simulada como si fuera real.
    """
    if not AI_API_KEY:
        raise NotImplementedError(
            "AI_API_KEY no configurada. Este servicio todavía no está conectado."
        )
    raise NotImplementedError("Integración con el proveedor de IA pendiente (fase 8).")
