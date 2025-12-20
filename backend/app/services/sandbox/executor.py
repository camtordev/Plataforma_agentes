import math
import random
# Importamos el parser de seguridad que acabamos de definir
from .code_parser import CodeParser, SecurityViolation

class SandboxExecutionError(Exception):
    pass

def execute_custom_agent_code(code_str: str, perception_data: dict) -> tuple[int, int]:
    """
    Ejecuta código Python personalizado en un entorno local restringido.
    
    1. Valida el código estáticamente (busca imports prohibidos).
    2. Envuelve el código en una función.
    3. Ejecuta con exec() en un alcance limitado.
    """
    
    # 0. Validación básica de entrada
    if not code_str or not code_str.strip():
        return 0, 0

    # --- 1. ANÁLISIS DE SEGURIDAD (Estático) ---
    try:
        CodeParser.validate(code_str)
    except SecurityViolation as e:
        print(f"🚫 [Security] Código bloqueado: {e}")
        return 0, 0 # Agente se detiene si es inseguro
    except SyntaxError as e:
        print(f"⚠️ [Parser] Error de sintaxis previo a ejecución: {e}")
        return 0, 0
    except Exception as e:
        print(f"⚠️ [Parser] Error desconocido al analizar: {e}")
        return 0, 0

    # --- 2. PREPARACIÓN DEL ENTORNO DE EJECUCIÓN ---
    
    # Lista blanca de globales permitidos (Sandbox)
    allowed_globals = {
        "__builtins__": {
            "abs": abs, "min": min, "max": max, "len": len, 
            "range": range, "enumerate": enumerate, "int": int, "float": float,
            "list": list, "dict": dict, "set": set, "tuple": tuple,
            "True": True, "False": False, "None": None, 
            "print": print, # Permitimos print para debug en consola del server
            "str": str
        },
        "math": math,
        "random": random,
    }

    # Alcance local (Inputs)
    locals_scope = {
        "perception": perception_data
    }

    # --- 3. ENVOLTURA DEL CÓDIGO (Wrapping) ---
    # Para que el usuario pueda usar 'return (dx, dy)', debemos meter su código
    # dentro de una función real. Esto requiere indentar su texto.
    
    # Indentamos cada línea del usuario con 4 espacios
    indented_user_code = "\n".join(["    " + line for line in code_str.splitlines()])

    wrapped_code = f"""
def user_logic(perception):
    # --- Inicio Código Usuario ---
{indented_user_code}
    # --- Fin Código Usuario ---
    
    # Si el usuario no retorna nada, devolvemos quieto por defecto
    return (0, 0)

# Ejecutamos la función pasando la percepción
execution_result = user_logic(perception)
"""

    # --- 4. EJECUCIÓN ---
    try:
        # Ejecutamos el string construido
        exec(wrapped_code, allowed_globals, locals_scope)
        
        # --- 5. VALIDACIÓN DEL RESULTADO ---
        result = locals_scope.get("execution_result")
        
        # Esperamos una tupla o lista de 2 elementos (dx, dy)
        if isinstance(result, (tuple, list)) and len(result) >= 2:
            try:
                dx = int(result[0])
                dy = int(result[1])
                
                # Opcional: Clamp (limitar) el movimiento a -1, 0, 1
                # Si quieres permitir saltos más grandes (velocidad), quita estos max/min
                dx = max(-1, min(1, dx))
                dy = max(-1, min(1, dy))
                
                return dx, dy
            except (ValueError, TypeError):
                pass # Fallback abajo si la conversión a int falla
            
        print(f"⚠️ [Sandbox] El código devolvió un formato inválido: {result}")
        return 0, 0

    except SyntaxError as e:
        # Este error ocurre si la indentación o estructura del wrapped_code falla
        print(f"❌ [Sandbox] Error de sintaxis en runtime: {e}")
        return 0, 0
    except Exception as e:
        # Cualquier otro error en la lógica del usuario (ej: división por cero, key error)
        print(f"❌ [Sandbox] Error de ejecución (Runtime Error): {e}")
        return 0, 0