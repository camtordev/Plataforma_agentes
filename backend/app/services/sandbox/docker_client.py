import logging

# Nota: En un futuro, aquí importarías 'docker' (pip install docker)
# import docker 

logger = logging.getLogger(__name__)

class DockerSandboxClient:
    """
    Maneja la ejecución de código en contenedores aislados.
    Útil para producción donde la seguridad es crítica.
    """
    
    def __init__(self):
        self.client = None
        # self.client = docker.from_env() # Descomentar cuando se instale Docker SDK

    def execute_in_container(self, code: str, inputs: dict):
        """
        Ejecuta el código dentro de un contenedor efímero.
        """
        logger.info("Iniciando ejecución en Docker Sandbox...")
        
        # Lógica simulada de lo que haría:
        # 1. Crear contenedor con imagen python:alpine
        # 2. Inyectar código y inputs
        # 3. Ejecutar y capturar stdout
        # 4. Destruir contenedor
        
        # Por ahora, lanzamos error porque estamos en modo local
        raise NotImplementedError(
            "El modo Docker no está activo. Usa 'executor.py' para ejecución local."
        )

# Instancia global para usar en otros lados si fuera necesario
docker_sandbox = DockerSandboxClient()