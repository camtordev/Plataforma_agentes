import math
import random
# Importamos el parser de seguridad (ahora sí funcionará porque creamos el archivo arriba)
from .code_parser import CodeParser, SecurityViolation

def execute_custom_agent_code(code_str: str, perception_data: dict) -> tuple[int, int]:
    """
    Ejecuta código Python personalizado en un entorno local restringido.
    Versión PRO: Con validación de seguridad y wrapping.
    """
    
    # 0. Validación básica
    if not code_str or not code_str.strip():
        return 0, 0

    # --- 1. SEGURIDAD ---
    try:
        CodeParser.validate(code_str)
    except SecurityViolation as e:
        print(f"🚫 [Security] Código bloqueado: {e}")
        return 0, 0 
    except SyntaxError as e:
        print(f"⚠️ [Parser] Error de sintaxis: {e}")
        return 0, 0
    except Exception as e:
        print(f"⚠️ [Parser] Error desconocido: {e}")
        return 0, 0

    # --- 2. ENTORNO (SANDBOX) ---
    allowed_globals = {
        "__builtins__": {
            "abs": abs, "min": min, "max": max, "len": len, 
            "range": range, "enumerate": enumerate, "int": int, "float": float,
            "list": list, "dict": dict, "set": set, "tuple": tuple,
            "True": True, "False": False, "None": None, 
            "print": print, 
            "str": str
        },
        "math": math,
        "random": random,
    }

    locals_scope = {
        "perception": perception_data
    }

    # --- 3. ENVOLTURA (WRAPPING) ---
    # Indentamos el código del usuario para meterlo en una función
    indented_user_code = "\n".join(["    " + line for line in code_str.splitlines()])

    wrapped_code = f"""
def user_logic(perception):
    # --- Inicio Código Usuario ---
{indented_user_code}
    # --- Fin Código Usuario ---
    return (0, 0)

# Ejecutamos
execution_result = user_logic(perception)
"""

    # --- 4. EJECUCIÓN ---
    try:
        exec(wrapped_code, allowed_globals, locals_scope)
        
        # --- 5. RESULTADO ---
        result = locals_scope.get("execution_result")
        
        if isinstance(result, (tuple, list)) and len(result) >= 2:
            dx = int(result[0])
            dy = int(result[1])
            
            # Clamp (Opcional: Limitar velocidad a 1 casilla por turno)
            dx = max(-1, min(1, dx))
            dy = max(-1, min(1, dy))
            
            return dx, dy
            
        print(f"⚠️ [Sandbox] Formato inválido retornado: {result}")
        return 0, 0

    except Exception as e:
        print(f"❌ [Sandbox] Runtime Error: {e}")
        return 0, 0