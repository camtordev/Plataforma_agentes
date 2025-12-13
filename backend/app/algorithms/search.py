# backend/app/algorithms/search.py
import heapq
from collections import deque

class SearchAlgorithms:
    
    @staticmethod
    def bfs(start, goal, grid_width, grid_height, obstacles):
        """Búsqueda en Amplitud (Breadth-First Search)"""
        queue = deque([[start]])
        visited = set((start[0], start[1]))
        obs_set = set((o['x'], o['y']) for o in obstacles)

        while queue:
            path = queue.popleft()
            x, y = path[-1]

            if (x, y) == goal:
                return path # Devuelve el camino completo

            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]: # Vecinos
                nx, ny = x + dx, y + dy
                if 0 <= nx < grid_width and 0 <= ny < grid_height:
                    if (nx, ny) not in visited and (nx, ny) not in obs_set:
                        visited.add((nx, ny))
                        new_path = list(path)
                        new_path.append((nx, ny))
                        queue.append(new_path)
        return []

    @staticmethod
    def a_star(start, goal, grid_width, grid_height, obstacles):
        """Algoritmo A* (A Star)"""
        def heuristic(a, b):
            return abs(a[0] - b[0]) + abs(a[1] - b[1]) # Distancia Manhattan

        # Cola de prioridad: (costo_f, x, y, camino)
        pq = [(0, start[0], start[1], [start])]
        visited = set()
        obs_set = set((o['x'], o['y']) for o in obstacles)

        while pq:
            cost, x, y, path = heapq.heappop(pq)

            if (x, y) == goal:
                return path

            if (x, y) in visited: continue
            visited.add((x, y))

            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < grid_width and 0 <= ny < grid_height:
                    if (nx, ny) not in obs_set:
                        new_cost = len(path) + heuristic((nx, ny), goal)
                        new_path = list(path)
                        new_path.append((nx, ny))
                        heapq.heappush(pq, (new_cost, nx, ny, new_path))
        return []