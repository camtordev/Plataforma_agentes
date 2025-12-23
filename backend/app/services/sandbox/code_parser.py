import ast

class SecurityViolation(Exception):
    pass

class CodeParser:
    """
    Analiza estáticamente el código Python para detectar operaciones inseguras.
    """
    # Lista negra de módulos y funciones peligrosas
    FORBIDDEN_MODULES = {'os', 'sys', 'subprocess', 'shutil', 'builtins', 'importlib'}
    FORBIDDEN_FUNCTIONS = {'open', 'eval', 'exec', 'input', 'exit', 'quit'}

    @staticmethod
    def validate(code_str: str):
        try:
            tree = ast.parse(code_str)
        except SyntaxError as e:
            raise SecurityViolation(f"Error de sintaxis: {e}")

        for node in ast.walk(tree):
            # 1. Bloquear imports
            if isinstance(node, ast.Import):
                for alias in node.names:
                    if alias.name in CodeParser.FORBIDDEN_MODULES:
                        raise SecurityViolation(f"Importación prohibida: '{alias.name}'")
            # 2. Bloquear from ... import
            elif isinstance(node, ast.ImportFrom):
                if node.module in CodeParser.FORBIDDEN_MODULES:
                    raise SecurityViolation(f"Importación prohibida: '{node.module}'")
            # 3. Bloquear llamadas a funciones
            elif isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name):
                    if node.func.id in CodeParser.FORBIDDEN_FUNCTIONS:
                        raise SecurityViolation(f"Función prohibida: '{node.func.id}'")
        return True