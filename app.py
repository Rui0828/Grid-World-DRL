from flask import Flask, render_template, request, jsonify
import numpy as np
import random

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/grid', methods=['POST'])
def create_grid():
    data = request.get_json()
    n = data.get('n', 5)  # Default to 5 if not specified
    
    # Create a dictionary representing grid state
    grid_state = {
        'size': n,
        'start': None,
        'end': None,
        'obstacles': [],
        'policy': generate_random_policy(n),
        'values': [[0 for _ in range(n)] for _ in range(n)]
    }
    
    return jsonify(grid_state)

@app.route('/api/evaluate', methods=['POST'])
def evaluate_policy():
    data = request.get_json()
    grid_size = data.get('size')
    start = data.get('start')
    end = data.get('end')
    obstacles = data.get('obstacles', [])
    policy = data.get('policy')
    
    # Calculate state values based on policy evaluation
    values = policy_evaluation(grid_size, start, end, obstacles, policy)
    
    return jsonify({'values': values})

@app.route('/api/improve', methods=['POST'])
def improve_policy():
    data = request.get_json()
    grid_size = data.get('size')
    start = data.get('start')
    end = data.get('end')
    obstacles = data.get('obstacles', [])
    policy = data.get('policy')
    
    # Improve policy based on current values
    new_policy, values = policy_improvement(grid_size, start, end, obstacles, policy)
    
    return jsonify({'policy': new_policy, 'values': values})

@app.route('/api/value-iteration', methods=['POST'])
def run_value_iteration():
    data = request.get_json()
    grid_size = data.get('size')
    start = data.get('start')
    end = data.get('end')
    obstacles = data.get('obstacles', [])
    
    # Run value iteration
    optimal_policy, optimal_values = value_iteration(grid_size, start, end, obstacles)
    
    return jsonify({'policy': optimal_policy, 'values': optimal_values})

def generate_random_policy(n):
    # Generate a random policy (up, down, left, right) for each cell
    directions = ['up', 'down', 'left', 'right']
    policy = []
    for i in range(n):
        row = []
        for j in range(n):
            row.append(random.choice(directions))
        policy.append(row)
    return policy

def policy_evaluation(size, start, end, obstacles, policy):
    # Constants
    GAMMA = 0.9  # Discount factor
    THETA = 0.0001  # Convergence threshold
    REWARD_STEP = -0.04  # Reward for each step
    REWARD_GOAL = 1.0  # Reward for reaching the goal
    
    # Initialize values
    V = [[0 for _ in range(size)] for _ in range(size)]
    
    # Convert to coordinate format (x,y)
    if start:
        start = [start['row'], start['col']]
    if end:
        end = [end['row'], end['col']]
    obstacle_coords = [[o['row'], o['col']] for o in obstacles]
    
    # Create state transitions based on policy
    def get_next_state(state, action):
        i, j = state
        if action == 'up':
            next_i, next_j = i-1, j
        elif action == 'down':
            next_i, next_j = i+1, j
        elif action == 'left':
            next_i, next_j = i, j-1
        elif action == 'right':
            next_i, next_j = i, j+1
        
        # Check if next state is valid
        if (next_i < 0 or next_i >= size or next_j < 0 or next_j >= size or 
            [next_i, next_j] in obstacle_coords):
            # Stay in current state if hitting a wall or obstacle
            return (i, j)
        return (next_i, next_j)
    
    # Value iteration
    while True:
        delta = 0
        new_V = [[0 for _ in range(size)] for _ in range(size)]
        
        for i in range(size):
            for j in range(size):
                if [i, j] == end:  # Goal state
                    new_V[i][j] = REWARD_GOAL
                    continue
                if [i, j] in obstacle_coords:  # Obstacle
                    new_V[i][j] = 0
                    continue
                
                action = policy[i][j]
                next_i, next_j = get_next_state((i, j), action)
                
                # Update value
                reward = REWARD_GOAL if [next_i, next_j] == end else REWARD_STEP
                new_V[i][j] = reward + GAMMA * V[next_i][next_j]
                
                delta = max(delta, abs(new_V[i][j] - V[i][j]))
        
        V = new_V
        
        # Check convergence
        if delta < THETA:
            break
    
    return V

def policy_improvement(size, start, end, obstacles, policy):
    # Constants
    GAMMA = 0.9  # Discount factor
    THETA = 0.0001  # Convergence threshold
    REWARD_STEP = -0.04  # Reward for each step
    REWARD_GOAL = 1.0  # Reward for reaching the goal
    
    # Convert to coordinate format
    if start:
        start = [start['row'], start['col']]
    if end:
        end = [end['row'], end['col']]
    obstacle_coords = [[o['row'], o['col']] for o in obstacles]
    
    # Initialize policy and values
    V = [[0 for _ in range(size)] for _ in range(size)]
    
    # Define possible actions and their effects
    actions = ['up', 'down', 'left', 'right']
    action_effects = {
        'up': (-1, 0),
        'down': (1, 0),
        'left': (0, -1),
        'right': (0, 1)
    }
    
    def is_valid_state(i, j):
        return (0 <= i < size and 0 <= j < size and [i, j] not in obstacle_coords)
    
    def get_next_state(state, action):
        i, j = state
        di, dj = action_effects[action]
        next_i, next_j = i + di, j + dj
        
        if is_valid_state(next_i, next_j):
            return (next_i, next_j)
        return (i, j)  # Stay in current state if invalid
    
    # Policy evaluation
    while True:
        delta = 0
        for i in range(size):
            for j in range(size):
                if [i, j] == end:  # Goal state
                    V[i][j] = REWARD_GOAL
                    continue
                if [i, j] in obstacle_coords:  # Obstacle
                    V[i][j] = 0
                    continue
                
                old_v = V[i][j]
                
                action = policy[i][j]
                next_i, next_j = get_next_state((i, j), action)
                
                # Calculate new value
                reward = REWARD_GOAL if [next_i, next_j] == end else REWARD_STEP
                V[i][j] = reward + GAMMA * V[next_i][next_j]
                
                delta = max(delta, abs(V[i][j] - old_v))
        
        if delta < THETA:
            break
    
    # Policy improvement
    policy_stable = True
    new_policy = [row[:] for row in policy]
    
    for i in range(size):
        for j in range(size):
            if [i, j] == end or [i, j] in obstacle_coords:
                continue
                
            old_action = policy[i][j]
            
            # Find the best action
            action_values = {}
            for action in actions:
                next_i, next_j = get_next_state((i, j), action)
                reward = REWARD_GOAL if [next_i, next_j] == end else REWARD_STEP
                action_values[action] = reward + GAMMA * V[next_i][next_j]
            
            best_action = max(action_values, key=action_values.get)
            new_policy[i][j] = best_action
            
            if old_action != best_action:
                policy_stable = False
    
    return new_policy, V

def value_iteration(size, start, end, obstacles):
    # Constants
    GAMMA = 0.9  # Discount factor
    THETA = 0.0001  # Convergence threshold
    REWARD_STEP = -0.04  # Reward for each step
    REWARD_GOAL = 1.0  # Reward for reaching the goal
    
    # Convert to coordinate format
    if start:
        start = [start['row'], start['col']]
    if end:
        end = [end['row'], end['col']]
    obstacle_coords = [[o['row'], o['col']] for o in obstacles]
    
    # Initialize values
    V = [[0 for _ in range(size)] for _ in range(size)]
    
    # Define possible actions and their effects
    actions = ['up', 'down', 'left', 'right']
    action_effects = {
        'up': (-1, 0),
        'down': (1, 0),
        'left': (0, -1),
        'right': (0, 1)
    }
    
    def is_valid_state(i, j):
        return (0 <= i < size and 0 <= j < size and [i, j] not in obstacle_coords)
    
    def get_next_state(state, action):
        i, j = state
        di, dj = action_effects[action]
        next_i, next_j = i + di, j + dj
        
        if is_valid_state(next_i, next_j):
            return (next_i, next_j)
        return (i, j)  # Stay in current state if invalid
    
    # Value iteration
    while True:
        delta = 0
        for i in range(size):
            for j in range(size):
                if [i, j] == end:  # Goal state
                    V[i][j] = REWARD_GOAL
                    continue
                if [i, j] in obstacle_coords:  # Obstacle
                    V[i][j] = 0
                    continue
                
                old_v = V[i][j]
                
                # Calculate maximum expected value across all actions
                max_value = float('-inf')
                for action in actions:
                    next_i, next_j = get_next_state((i, j), action)
                    reward = REWARD_GOAL if [next_i, next_j] == end else REWARD_STEP
                    value = reward + GAMMA * V[next_i][next_j]
                    max_value = max(max_value, value)
                
                V[i][j] = max_value
                delta = max(delta, abs(V[i][j] - old_v))
        
        if delta < THETA:
            break
    
    # Extract optimal policy from optimal value function
    optimal_policy = [['' for _ in range(size)] for _ in range(size)]
    
    for i in range(size):
        for j in range(size):
            if [i, j] == end or [i, j] in obstacle_coords:
                optimal_policy[i][j] = 'none'
                continue
            
            # Find best action based on values
            action_values = {}
            for action in actions:
                next_i, next_j = get_next_state((i, j), action)
                reward = REWARD_GOAL if [next_i, next_j] == end else REWARD_STEP
                action_values[action] = reward + GAMMA * V[next_i][next_j]
            
            optimal_policy[i][j] = max(action_values, key=action_values.get)
    
    return optimal_policy, V

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
