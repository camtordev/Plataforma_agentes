# Diagramas de Estados de los Tutoriales

Este archivo contiene los diagramas de estados en formato Mermaid para cada nivel de tutorial de la plataforma de agentes inteligentes.

---

## NIVEL 1: Fundamentos - Arquitectura de Agentes Inteligentes

### Diagrama del Ciclo Básico del Agente

```mermaid
stateDiagram-v2
    [*] --> Inicializar
    Inicializar --> Percibir: ciclo()
    Percibir --> Decidir: observación
    Decidir --> Actuar: acción seleccionada
    Actuar --> Percibir: nueva observación
    Actuar --> [*]: fin de episodio
    
    note right of Inicializar
        __init__(id, x, y)
        energy = 100
    end note
    
    note right of Percibir
        percibir(entorno)
        retorna observación
    end note
    
    note right of Decidir
        decidir(observación)
        retorna "STAY"
    end note
    
    note right of Actuar
        actuar(acción)
        ejecuta acción
    end note
```

### Descripción del Flujo
- **Inicializar**: El agente se crea con ID, posición (x,y) y energía inicial
- **Percibir**: Obtiene información del entorno (posición, energía, estado)
- **Decidir**: Aplica lógica de decisión (en nivel 1 retorna acción fija)
- **Actuar**: Ejecuta la acción seleccionada
- **Loop**: El ciclo se repite hasta que termine el episodio

---

## NIVEL 2: Agentes Reactivos - Arquitectura Estímulo-Respuesta

### Diagrama del Agente Limpiador Reactivo

```mermaid
stateDiagram-v2
    [*] --> PercibirSuciedad
    PercibirSuciedad --> EvaluarCondicion: percepción booleana
    
    state EvaluarCondicion <<choice>>
    EvaluarCondicion --> Limpiar: hay_suciedad == True
    EvaluarCondicion --> SeleccionarMovimiento: hay_suciedad == False
    
    SeleccionarMovimiento --> GenerarAleatorio: random.choice()
    GenerarAleatorio --> state_movimiento
    
    state state_movimiento {
        [*] --> Arriba
        [*] --> Abajo
        [*] --> Izquierda
        [*] --> Derecha
    }
    
    Limpiar --> RetornarAccion: return "limpiar"
    state_movimiento --> RetornarAccion: return dirección
    RetornarAccion --> [*]
    
    note right of EvaluarCondicion
        Decisión basada en
        percepción actual
        (sin memoria)
    end note
    
    note right of GenerarAleatorio
        Exploración aleatoria
        cuando no hay objetivo
    end note
```

### Descripción del Flujo
- **PercibirSuciedad**: Lee el estado booleano de la celda actual
- **EvaluarCondicion**: Punto de decisión basado en regla if/else
- **Limpiar**: Si detecta suciedad, ejecuta acción "limpiar"
- **SeleccionarMovimiento**: Si no hay suciedad, elige dirección aleatoria
- **RetornarAccion**: Devuelve la acción seleccionada al entorno

---

## NIVEL 3: Agentes con Estado Interno - Memoria y Exploración

### Diagrama del Agente con Memoria de Visitados

```mermaid
stateDiagram-v2
    [*] --> Inicializar
    
    state Inicializar {
        [*] --> CrearAgente
        CrearAgente --> InicializarMemoria: self.visitados = set()
        InicializarMemoria --> AgregarPosicionInicial: add((x, y))
        AgregarPosicionInicial --> [*]
    }
    
    Inicializar --> CicloDecision
    
    state CicloDecision {
        [*] --> ObtenerPosicionActual
        ObtenerPosicionActual --> MarcarVisitado: marcar_visitado()
        MarcarVisitado --> GenerarMovimientos: calcular vecinos válidos
        GenerarMovimientos --> FiltrarNoVisitados: excluir self.visitados
        
        state DecisionMovimiento <<choice>>
        FiltrarNoVisitados --> DecisionMovimiento
        DecisionMovimiento --> MoverNoVisitado: hay celdas sin visitar
        DecisionMovimiento --> MoverCualquiera: todas visitadas
        
        MoverNoVisitado --> ActualizarMemoria
        MoverCualquiera --> ActualizarMemoria
        ActualizarMemoria --> ActualizarPosicion: self.x, self.y
        ActualizarPosicion --> [*]
    }
    
    CicloDecision --> CicloDecision: continuar explorando
    CicloDecision --> [*]: objetivo alcanzado
    
    note right of InicializarMemoria
        set() permite búsqueda O(1)
        y evita duplicados
    end note
    
    note right of FiltrarNoVisitados
        Prioriza exploración
        de celdas nuevas
    end note
```

### Descripción del Flujo
- **Inicializar**: Crea el agente y el conjunto de visitados con posición inicial
- **MarcarVisitado**: Agrega la posición actual al set de visitados
- **GenerarMovimientos**: Calcula las 4 direcciones cardinales posibles
- **FiltrarNoVisitados**: Separa movimientos a celdas no visitadas
- **DecisionMovimiento**: Prioriza celdas nuevas, con fallback a cualquiera
- **ActualizarMemoria**: Registra la nueva posición en visitados

---

## NIVEL 4: Agentes Basados en Objetivos - Planificación con BFS

### Diagrama del Algoritmo BFS para Planificación

```mermaid
stateDiagram-v2
    [*] --> VerificarObjetivo
    
    state VerificarObjetivo <<choice>>
    VerificarObjetivo --> RetornarVacio: objetivo == None
    RetornarVacio --> [*]
    VerificarObjetivo --> InicializarBFS: objetivo válido
    
    InicializarBFS --> CrearEstructuras
    
    state CrearEstructuras {
        [*] --> CrearCola: deque([(x0, y0, [])])
        CrearCola --> CrearVisitados: {(x0, y0)}
        CrearVisitados --> [*]
    }
    
    CrearEstructuras --> LoopPrincipal
    
    state LoopPrincipal {
        [*] --> VerificarCola
        
        state VerificarCola <<choice>>
        VerificarCola --> ExtraerNodo: cola no vacía
        VerificarCola --> [*]: cola vacía
        
        ExtraerNodo --> Desempaquetar: popleft()
        Desempaquetar --> VerificarMeta: (x, y, camino)
        
        state VerificarMeta <<choice>>
        VerificarMeta --> RetornarCamino: (x,y) == objetivo
        VerificarMeta --> ExpandirVecinos: no es meta
        
        state ExpandirVecinos {
            [*] --> GenerarVecinos
            GenerarVecinos --> IterarDirecciones: 4 direcciones
            
            state IterarDirecciones {
                [*] --> CalcularNuevaPosicion: (dx, dy, acción)
                CalcularNuevaPosicion --> ValidarVecino
                
                state ValidarVecino <<choice>>
                ValidarVecino --> AgregarACola: válido && no visitado && sin obstáculo
                ValidarVecino --> Descartar: inválido
                
                AgregarACola --> MarcarVisitado: visitados.add()
                MarcarVisitado --> EncolarEstado: append((nx, ny, camino+[acción]))
                EncolarEstado --> [*]
                Descartar --> [*]
            }
            
            IterarDirecciones --> [*]
        }
        
        ExpandirVecinos --> VerificarCola
        RetornarCamino --> [*]
    }
    
    LoopPrincipal --> RetornarCaminoExito: camino encontrado
    LoopPrincipal --> RetornarListaVacia: no hay camino
    
    RetornarCaminoExito --> [*]
    RetornarListaVacia --> [*]
    
    note right of CrearCola
        deque permite popleft() 
        en O(1) para FIFO
    end note
    
    note right of ExpandirVecinos
        Explora por niveles
        garantiza camino más corto
    end note
```

### Descripción del Flujo
- **InicializarBFS**: Crea cola FIFO con estado inicial y set de visitados
- **LoopPrincipal**: Mientras haya nodos por explorar
- **ExtraerNodo**: Toma el primer elemento de la cola (FIFO)
- **VerificarMeta**: Comprueba si llegó al objetivo
- **ExpandirVecinos**: Genera 4 vecinos (arriba, abajo, izquierda, derecha)
- **ValidarVecino**: Verifica límites, obstáculos y si no fue visitado
- **EncolarEstado**: Agrega vecino válido con camino acumulado
- **RetornarCamino**: Devuelve secuencia de acciones o lista vacía

---

## NIVEL 5: Búsqueda Informada - A* con Heurística Manhattan

### Diagrama del Algoritmo A* con Priorización

```mermaid
stateDiagram-v2
    [*] --> InicializarAstar
    
    state InicializarAstar {
        [*] --> CrearHeap: heapq []
        CrearHeap --> CrearVisitados: {}
        CrearVisitados --> CalcularHeuristica: h = manhattan(inicio, objetivo)
        CalcularHeuristica --> PushInicial: heappush((f=0+h, g=0, inicio, []))
        PushInicial --> [*]
    }
    
    InicializarAstar --> LoopBusqueda
    
    state LoopBusqueda {
        [*] --> VerificarHeap
        
        state VerificarHeap <<choice>>
        VerificarHeap --> ExtraerMenorF: heap no vacío
        VerificarHeap --> [*]: heap vacío
        
        ExtraerMenorF --> Desempaquetar: heappop()
        Desempaquetar --> ExtraerEstado: (f, g, pos, camino)
        ExtraerEstado --> VerificarObjetivo
        
        state VerificarObjetivo <<choice>>
        VerificarObjetivo --> RetornarSolucion: pos == objetivo
        VerificarObjetivo --> VerificarVisitado: pos != objetivo
        
        state VerificarVisitado <<choice>>
        VerificarVisitado --> ExpandirVecinos: pos no visitado
        VerificarVisitado --> VerificarHeap: ya visitado (skip)
        
        state ExpandirVecinos {
            [*] --> MarcarVisitado: visitados[pos] = True
            MarcarVisitado --> IterarDirecciones
            
            state IterarDirecciones {
                [*] --> CalcularNuevaPosicion: (dx, dy, acción)
                CalcularNuevaPosicion --> ValidarVecino
                
                state ValidarVecino <<choice>>
                ValidarVecino --> CalcularCostos: válido
                ValidarVecino --> [*]: inválido
                
                state CalcularCostos {
                    [*] --> CalcularG: g_nuevo = g + 1
                    CalcularG --> CalcularH: h = manhattan(nueva_pos, objetivo)
                    CalcularH --> CalcularF: f = g_nuevo + h
                    CalcularF --> [*]
                }
                
                CalcularCostos --> VerificarMejorCosto
                
                state VerificarMejorCosto <<choice>>
                VerificarMejorCosto --> AgregarAHeap: no visitado || mejor costo
                VerificarMejorCosto --> [*]: peor costo
                
                AgregarAHeap --> PushHeap: heappush((f, g, pos, camino+[acción]))
                PushHeap --> [*]
            }
            
            IterarDirecciones --> [*]
        }
        
        ExpandirVecinos --> VerificarHeap
        RetornarSolucion --> [*]
    }
    
    LoopBusqueda --> RetornarCamino: solución encontrada
    LoopBusqueda --> RetornarVacio: no hay camino
    
    RetornarCamino --> [*]
    RetornarVacio --> [*]
    
    note right of CalcularHeuristica
        Manhattan: |dx| + |dy|
        Admisible para grids
    end note
    
    note right of ExtraerMenorF
        heap garantiza
        explorar primero
        menor f = g + h
    end note
    
    note right of CalcularF
        f = costo actual (g) +
        estimación restante (h)
    end note
```

### Descripción del Flujo
- **InicializarAstar**: Crea heap vacío y calcula h inicial con Manhattan
- **ExtraerMenorF**: Toma el nodo con menor f del heap (prioridad)
- **VerificarObjetivo**: Si encontró la meta, retorna el camino
- **ExpandirVecinos**: Para cada vecino válido
- **CalcularCostos**: g_nuevo = g + costo_movimiento, h = Manhattan, f = g + h
- **VerificarMejorCosto**: Solo agrega si es nuevo o mejora costo previo
- **PushHeap**: Inserta vecino con prioridad f en el heap

---

## NIVEL 6: Sistemas Multi-Agente - Comunicación y Cooperación

### Diagrama de Comunicación entre Agentes

```mermaid
stateDiagram-v2
    [*] --> InicializarAgente
    
    state InicializarAgente {
        [*] --> CrearID: self.id
        CrearID --> CrearBandeja: self.mensajes = []
        CrearBandeja --> [*]
    }
    
    InicializarAgente --> CicloDeVida
    
    state CicloDeVida {
        [*] --> PercibirEntorno
        PercibirEntorno --> DetectarEvento
        
        state DetectarEvento <<choice>>
        DetectarEvento --> EnviarMensaje: evento importante
        DetectarEvento --> ProcesarMensajes: sin evento
        
        state EnviarMensaje {
            [*] --> CrearMensaje: {tipo, contenido}
            CrearMensaje --> IterarDestinatarios
            
            state IterarDestinatarios {
                [*] --> ObtenerSiguiente: for agente in destinatarios
                ObtenerSiguiente --> LlamarRecibir: agente.recibir_mensaje()
                LlamarRecibir --> VerificarMas
                
                state VerificarMas <<choice>>
                VerificarMas --> ObtenerSiguiente: hay más
                VerificarMas --> [*]: fin
            }
            
            IterarDestinatarios --> [*]
        }
        
        state RecibirMensaje {
            [*] --> CrearDict: {"de": remitente, "tipo": tipo, "contenido": contenido}
            CrearDict --> AgregarABandeja: self.mensajes.append()
            AgregarABandeja --> [*]
        }
        
        state ProcesarMensajes {
            [*] --> LeerBandeja: iterar self.mensajes
            LeerBandeja --> FiltrarPorTipo: mensajes relevantes
            FiltrarPorTipo --> ExtraerContenido: acceder a información
            ExtraerContenido --> ActualizarEstado: usar información
            ActualizarEstado --> LimpiarBandeja: self.mensajes = []
            LimpiarBandeja --> [*]
        }
        
        EnviarMensaje --> TomarDecision
        ProcesarMensajes --> TomarDecision
        
        state TomarDecision {
            [*] --> EvaluarInformacion: info propia + mensajes
            EvaluarInformacion --> SeleccionarAccion: decidir
            SeleccionarAccion --> [*]
        }
        
        TomarDecision --> EjecutarAccion
        EjecutarAccion --> PercibirEntorno
    }
    
    CicloDeVida --> [*]: fin de episodio
    
    note right of EnviarMensaje
        Broadcast a múltiples
        agentes para cooperar
    end note
    
    note right of RecibirMensaje
        Recepción asíncrona
        acumula en bandeja
    end note
    
    note right of ProcesarMensajes
        Filtrado por tipo
        permite coordinación
    end note
```

### Descripción del Flujo
- **InicializarAgente**: Crea ID único y bandeja de mensajes vacía
- **DetectarEvento**: Identifica información relevante para compartir
- **EnviarMensaje**: Itera sobre destinatarios llamando recibir_mensaje
- **RecibirMensaje**: Almacena mensaje estructurado en bandeja
- **ProcesarMensajes**: Filtra, extrae información y limpia bandeja
- **TomarDecision**: Integra percepción local con mensajes recibidos

---

## NIVEL 7: Competencia y Resolución de Conflictos

### Diagrama de Resolución de Conflictos por Recursos

```mermaid
stateDiagram-v2
    [*] --> IdentificarRecurso
    
    state IdentificarRecurso {
        [*] --> DetectarObjetivo: agente detecta recurso
        DetectarObjetivo --> AnunciarInteres: registrar candidatura
        AnunciarInteres --> [*]
    }
    
    IdentificarRecurso --> RecolectarCandidatos
    
    state RecolectarCandidatos {
        [*] --> CrearLista: candidatos = []
        CrearLista --> IterarAgentes
        
        state IterarAgentes {
            [*] --> VerificarInteres: for agente in sistema
            
            state VerificarInteres <<choice>>
            VerificarInteres --> CalcularDistancia: interesado en recurso
            VerificarInteres --> [*]: no interesado
            
            CalcularDistancia --> AgregarTupla: (id_agente, distancia)
            AgregarTupla --> VerificarMas
            
            state VerificarMas <<choice>>
            VerificarMas --> VerificarInteres: más agentes
            VerificarMas --> [*]: fin
        }
        
        IterarAgentes --> [*]
    }
    
    RecolectarCandidatos --> VerificarConflicto
    
    state VerificarConflicto <<choice>>
    VerificarConflicto --> AsignarDirecto: 1 candidato
    VerificarConflicto --> ResolverConflicto: múltiples candidatos
    
    state ResolverConflicto {
        [*] --> AplicarMinimo: min(candidatos, key=lambda)
        
        state AplicarMinimo {
            [*] --> CompararDistancia: criterio primario
            
            state CompararDistancia <<choice>>
            CompararDistancia --> DecidirPorDistancia: distancias diferentes
            CompararDistancia --> CompararID: empate en distancia
            
            state CompararID {
                [*] --> SeleccionarMenorID: criterio secundario
                SeleccionarMenorID --> [*]
            }
            
            DecidirPorDistancia --> [*]
            CompararID --> [*]
        }
        
        AplicarMinimo --> ExtraerGanador: (id_ganador, dist)
        ExtraerGanador --> [*]
    }
    
    AsignarDirecto --> OtorgarRecurso
    ResolverConflicto --> OtorgarRecurso
    
    state OtorgarRecurso {
        [*] --> AsignarAGanador: agente recibe recurso
        AsignarAGanador --> NotificarPerdedores: actualizar estado
        NotificarPerdedores --> ActualizarEntorno: remover recurso
        ActualizarEntorno --> [*]
    }
    
    OtorgarRecurso --> [*]
    
    note right of CompararDistancia
        Gana el más cercano
        (menor distancia)
    end note
    
    note right of CompararID
        Desempate determinista
        garantiza reproducibilidad
    end note
```

### Descripción del Flujo
- **IdentificarRecurso**: Cada agente detecta y anuncia interés en recurso
- **RecolectarCandidatos**: Construye lista de tuplas (id_agente, distancia)
- **VerificarConflicto**: Determina si hay competencia (múltiples candidatos)
- **ResolverConflicto**: Aplica función min con key lambda
- **CompararDistancia**: Primer criterio: menor distancia gana
- **CompararID**: Criterio de desempate: menor ID gana (determinista)
- **OtorgarRecurso**: Asigna recurso al ganador y actualiza sistema

---

## NIVEL 8: Aprendizaje por Refuerzo - Q-Learning Básico

### Diagrama del Loop de Entrenamiento con Q-Learning

```mermaid
stateDiagram-v2
    [*] --> InicializarSistema
    
    state InicializarSistema {
        [*] --> CrearQTable: Q = {}
        CrearQTable --> DefinirParametros: α, γ, ε
        DefinirParametros --> DefinirAcciones: ACTIONS = [...]
        DefinirAcciones --> [*]
    }
    
    InicializarSistema --> LoopEpisodios
    
    state LoopEpisodios {
        [*] --> IniciarEpisodio
        
        state IniciarEpisodio {
            [*] --> ResetEntorno: state = reset()
            ResetEntorno --> DefinirDone: done = False
            DefinirDone --> [*]
        }
        
        IniciarEpisodio --> LoopPasos
        
        state LoopPasos {
            [*] --> VerificarDone
            
            state VerificarDone <<choice>>
            VerificarDone --> SeleccionarAccion: not done
            VerificarDone --> [*]: done
            
            state SeleccionarAccion {
                [*] --> GenerarAleatorio: random.random()
                GenerarAleatorio --> DecisionEpsilonGreedy
                
                state DecisionEpsilonGreedy <<choice>>
                DecisionEpsilonGreedy --> Explorar: rand < ε
                DecisionEpsilonGreedy --> Explotar: rand >= ε
                
                state Explorar {
                    [*] --> AccionAleatoria: random.choice(ACTIONS)
                    AccionAleatoria --> [*]
                }
                
                state Explotar {
                    [*] --> ObtenerValoresQ: get_q(state, a) para todas las acciones
                    ObtenerValoresQ --> SeleccionarMaximo: max(ACTIONS, key=lambda)
                    SeleccionarMaximo --> [*]
                }
                
                Explorar --> [*]
                Explotar --> [*]
            }
            
            SeleccionarAccion --> EjecutarAccion
            
            state EjecutarAccion {
                [*] --> LlamarStep: entorno.step(action)
                LlamarStep --> RecibirRespuesta: (next_state, reward, done)
                RecibirRespuesta --> [*]
            }
            
            EjecutarAccion --> ActualizarQTable
            
            state ActualizarQTable {
                [*] --> ObtenerQActual: q_actual = get_q(state, action)
                ObtenerQActual --> CalcularMaxFuturo: max_q_next = max[get_q(next_state, a)]
                CalcularMaxFuturo --> AplicarBellman: Q[s,a] = Q + α*(R + γ*max_q - Q)
                
                state AplicarBellman {
                    [*] --> CalcularTarget: target = reward + γ * max_q_next
                    CalcularTarget --> CalcularDelta: delta = target - q_actual
                    CalcularDelta --> ActualizarValor: Q[(state, action)] = q_actual + α * delta
                    ActualizarValor --> [*]
                }
                
                AplicarBellman --> [*]
            }
            
            ActualizarQTable --> ActualizarEstado: state = next_state
            ActualizarEstado --> VerificarDone
        }
        
        LoopPasos --> VerificarMasEpisodios
        
        state VerificarMasEpisodios <<choice>>
        VerificarMasEpisodios --> IniciarEpisodio: más episodios
        VerificarMasEpisodios --> [*]: fin entrenamiento
    }
    
    LoopEpisodios --> PoliticaAprendida
    PoliticaAprendida --> [*]
    
    note right of DecisionEpsilonGreedy
        ε controla balance
        exploración-explotación
    end note
    
    note right of AplicarBellman
        Ecuación de Bellman:
        actualiza estimación Q
        con experiencia real
    end note
    
    note right of CalcularMaxFuturo
        Bootstrapping: usa
        estimación actual del
        mejor valor futuro
    end note
```

### Descripción del Flujo
- **InicializarSistema**: Crea Q-table vacía y define hiperparámetros
- **LoopEpisodios**: Itera sobre múltiples episodios de entrenamiento
- **SeleccionarAccion**: Implementa ε-greedy (explorar vs explotar)
- **Explorar**: Elige acción aleatoria con probabilidad ε
- **Explotar**: Elige acción con mayor Q(state, action)
- **EjecutarAccion**: Interactúa con entorno, recibe reward y next_state
- **ActualizarQTable**: Aplica ecuación de Bellman para actualizar Q
- **CalcularTarget**: target = reward + γ * max(Q(next_state, a'))
- **ActualizarValor**: Q(s,a) ← Q(s,a) + α * (target - Q(s,a))

---

## Resumen de Patrones Comunes

### Estados Transversales
```mermaid
stateDiagram-v2
    [*] --> Inicializar: setup inicial
    Inicializar --> Percibir: obtener información
    Percibir --> Decidir: procesar y razonar
    Decidir --> Actuar: ejecutar acción
    Actuar --> Actualizar: modificar estado
    Actualizar --> Percibir: nuevo ciclo
    Actualizar --> [*]: condición terminal
```

### Niveles de Complejidad
1. **Nivel 1-2**: Ciclo simple sin estado (reactivo)
2. **Nivel 3**: Añade memoria interna (visitados)
3. **Nivel 4-5**: Planificación con búsqueda (BFS/A*)
4. **Nivel 6-7**: Interacción multi-agente (comunicación/competencia)
5. **Nivel 8**: Aprendizaje adaptativo (Q-Learning)

---

## Notas de Implementación

- **Estructuras de Datos Clave**: 
  - `set` para visitados (O(1) lookup)
  - `deque` para BFS (O(1) popleft)
  - `heapq` para A* (cola de prioridad)
  - `dict` para Q-table (almacenamiento disperso)

- **Patrones de Control**:
  - Reactivos: if/else simple
  - Con memoria: actualización de estado interno
  - Planificación: while loop hasta encontrar solución
  - Multi-agente: iteración sobre colección de agentes
  - RL: loop episodios × loop pasos

- **Optimizaciones**:
  - Validación temprana (early return)
  - Verificación de visitados antes de encolar
  - Limpieza de estructuras temporales
  - Epsilon decay en RL para convergencia
