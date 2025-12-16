import heapq
import collections
import math

class Pathfinding:
    @staticmethod
    def get_neighbors(x, y, width, height, obstacles):
        # Movimiento en 4 direcciones (Up, Down, Left, Right)
        directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        neighbors = []
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            # Verificar límites y obstáculos
            if 0 <= nx < width and 0 <= ny < height:
                is_obstacle = False
                for obs in obstacles:
                    if obs['x'] == nx and obs['y'] == ny and not obs.get('destructible', False):
                        is_obstacle = True
                        break
                if not is_obstacle:
                    neighbors.append((nx, ny))
        return neighbors

    @staticmethod
    def bfs(start, goal, width, height, obstacles):
        queue = collections.deque([start])
        came_from = {start: None}
        
        while queue:
            current = queue.popleft()
            if current == goal:
                break
            
            for next_node in Pathfinding.get_neighbors(current[0], current[1], width, height, obstacles):
                if next_node not in came_from:
                    queue.append(next_node)
                    came_from[next_node] = current
        
        return Pathfinding.reconstruct_path(came_from, start, goal)

    @staticmethod
    def dfs(start, goal, width, height, obstacles):
        stack = [start]
        came_from = {start: None}
        
        while stack:
            current = stack.pop()
            if current == goal:
                break
            
            for next_node in Pathfinding.get_neighbors(current[0], current[1], width, height, obstacles):
                if next_node not in came_from:
                    stack.append(next_node)
                    came_from[next_node] = current
        
        return Pathfinding.reconstruct_path(came_from, start, goal)

    @staticmethod
    def dijkstra(start, goal, width, height, obstacles, grid_costs=None):
        # Priority Queue: (cost, (x, y))
        queue = [(0, start)]
        came_from = {start: None}
        cost_so_far = {start: 0}
        
        while queue:
            current_cost, current = heapq.heappop(queue)
            
            if current == goal:
                break
            
            for next_node in Pathfinding.get_neighbors(current[0], current[1], width, height, obstacles):
                # Costo base 1, más costo del terreno si existiera
                new_cost = cost_so_far[current] + 1 
                if next_node not in cost_so_far or new_cost < cost_so_far[next_node]:
                    cost_so_far[next_node] = new_cost
                    priority = new_cost
                    heapq.heappush(queue, (priority, next_node))
                    came_from[next_node] = current
                    
        return Pathfinding.reconstruct_path(came_from, start, goal)

    @staticmethod
    def a_star(start, goal, width, height, obstacles):
        queue = [(0, start)]
        came_from = {start: None}
        cost_so_far = {start: 0}
        
        while queue:
            _, current = heapq.heappop(queue)
            
            if current == goal:
                break
            
            for next_node in Pathfinding.get_neighbors(current[0], current[1], width, height, obstacles):
                new_cost = cost_so_far[current] + 1
                if next_node not in cost_so_far or new_cost < cost_so_far[next_node]:
                    cost_so_far[next_node] = new_cost
                    # Heurística Manhattan
                    priority = new_cost + abs(goal[0] - next_node[0]) + abs(goal[1] - next_node[1])
                    heapq.heappush(queue, (priority, next_node))
                    came_from[next_node] = current
                    
        return Pathfinding.reconstruct_path(came_from, start, goal)

    @staticmethod
    def reconstruct_path(came_from, start, goal):
        if goal not in came_from:
            return []
        current = goal
        path = []
        while current != start:
            path.append(current)
            current = came_from[current]
        # Retorna el siguiente paso inmediato (dx, dy)
        if path:
            next_step = path[-1]
            return next_step[0] - start[0], next_step[1] - start[1]
        return 0, 0