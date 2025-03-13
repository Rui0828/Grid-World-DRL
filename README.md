# Reinforcement Learning Grid World

[繁體中文](README_zh.md) | [English](README.md)

This repository contains the implementation of my homework assignment (HW1) for the Master's level **Deep Reinforcement Learning (深度強化學習)** course at **National Chung Hsing University (NCHU)**. The project implements and visualizes fundamental reinforcement learning algorithms in a Grid World environment, allowing users to interact with and compare the performance of different methods including policy evaluation, policy improvement, and value iteration.

## Features

- Create a grid world with customizable size (5-9)
- Place start position (green), end position (red), and obstacles (gray)
- Run and visualize three reinforcement learning algorithms:
  - Random Policy Evaluation
  - Policy Improvement
  - Value Iteration
- Interactive UI with real-time feedback
- Visual representation of policies (arrows) and state values

## Setup Instructions

### Option 1: Standard Setup

1. Install required dependencies:

```bash
pip install -r requirements.txt
```

2. Run the Flask application:

```bash
python app.py
```

3. Open your browser and navigate to http://localhost:5000

### Option 2: Docker Setup

1. Make sure you have Docker and Docker Compose installed

2. Build and run the container:

```bash
docker-compose up
```

3. Open your browser and navigate to http://localhost:5000

## How to Use

1. Choose a grid size (5-9) and click "Create Grid"
2. Click on a cell to set the start position (green)
3. Click on another cell to set the end position (red)
4. Click on other cells to add obstacles (gray)
5. Choose one of the algorithms to run:
   - "Random Policy" to generate and evaluate a random policy
   - "Improve Policy" to optimize the current policy
   - "Value Iteration" to directly compute the optimal policy

## Reinforcement Learning Algorithms

### Random Policy Evaluation

This algorithm evaluates the effectiveness of a randomly generated policy:

- Generates a random initial policy (up, down, left, or right action for each cell)
- Calculates the expected return (value) for each state under this policy
- Displays action directions (arrows) and their corresponding value numbers

### Policy Improvement

This algorithm optimizes an existing policy:

- Uses the current policy evaluation results as a foundation
- For each cell, identifies the action that maximizes expected return
- Updates the policy based on these optimal actions
- Displays the improved policy with updated arrows and values

### Value Iteration

This algorithm directly computes the optimal policy:

- Doesn't require an initial policy
- Calculates the optimal value for each state using the Bellman optimality equation
- Extracts the optimal policy from the converged values
- Displays the optimal policy and state values

## Algorithm Comparison

| Feature | Random Policy | Policy Improvement | Value Iteration |
|---------|------------------|-------------------|-----------------|
| **Purpose** | Evaluate existing policy | Improve policy based on evaluation | Directly find optimal policy |
| **Input** | Random policy | Evaluated policy | No initial policy required |
| **Output** | State values | Improved policy and values | Optimal policy and values |
| **Process** | Single evaluation pass | May require multiple improvement iterations | Converges to optimal solution |

## Implementation Details

- Backend: Flask web framework
- Algorithms implemented in Python with NumPy
- Reward structure:
  - Goal state: +1.0
  - Step cost: -0.04
- Discount factor (gamma): 0.9

## References

- Sutton, R. S., & Barto, A. G. (2018). Reinforcement learning: An introduction. MIT press.
