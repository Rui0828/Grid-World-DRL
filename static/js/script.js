document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const gridSizeInput = document.getElementById('grid-size');
    const generateButton = document.getElementById('generate-grid');
    const gridContainer = document.getElementById('grid');
    const evaluateButton = document.getElementById('evaluate-button');
    const remainingObstaclesElement = document.getElementById('remaining-obstacles');
    const startStatusElement = document.getElementById('start-status');
    const endStatusElement = document.getElementById('end-status');
    
    // Grid state variables
    let gridSize = 5;
    let cells = [];
    let startPosition = null;
    let endPosition = null;
    let obstacles = [];
    let policy = [];
    let values = [];
    let maxObstacles = gridSize - 2;
    let remainingObstacles = maxObstacles;
    
    // Arrow characters for each direction
    const arrows = ['↑', '→', '↓', '←'];
    
    // Generate grid when button clicked
    generateButton.addEventListener('click', () => {
        gridSize = parseInt(gridSizeInput.value);
        
        // Validate grid size
        if (gridSize < 5 || gridSize > 9) {
            alert('Grid size must be between 5 and 9');
            return;
        }
        
        // Reset state
        startPosition = null;
        endPosition = null;
        obstacles = [];
        maxObstacles = gridSize - 2;
        remainingObstacles = maxObstacles;
        
        // Update status elements
        startStatusElement.textContent = 'Start: Not set';
        endStatusElement.textContent = 'End: Not set';
        remainingObstaclesElement.textContent = `Remaining obstacles: ${remainingObstacles}`;
        
        // Disable evaluate button until start and end are set
        evaluateButton.disabled = true;
        
        // Initialize grid
        initializeGrid();
    });
    
    // Evaluate policy button clicked
    evaluateButton.addEventListener('click', evaluatePolicy);
    
    // Initialize the grid with the specified size
    function initializeGrid() {
        // First, get random policy from server
        fetch('/init_grid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ n: gridSize })
        })
        .then(response => response.json())
        .then(data => {
            policy = data.policy;
            
            // Clear the grid
            gridContainer.innerHTML = '';
            cells = [];
            
            // Set grid dimensions
            gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`;
            
            // Create cells
            for (let i = 0; i < gridSize; i++) {
                cells[i] = [];
                for (let j = 0; j < gridSize; j++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                    
                    // Add arrow element
                    const arrow = document.createElement('div');
                    arrow.className = 'arrow';
                    arrow.textContent = arrows[policy[i][j]];
                    cell.appendChild(arrow);
                    
                    // Add value element
                    const valueElement = document.createElement('div');
                    valueElement.className = 'value';
                    cell.appendChild(valueElement);
                    
                    // Add click event
                    cell.addEventListener('click', () => handleCellClick(i, j));
                    
                    gridContainer.appendChild(cell);
                    cells[i][j] = cell;
                }
            }
        })
        .catch(error => console.error('Error initializing grid:', error));
    }
    
    // Handle cell click based on current state
    function handleCellClick(row, col) {
        // If this cell is already used, do nothing
        if (
            (startPosition && startPosition[0] === row && startPosition[1] === col) ||
            (endPosition && endPosition[0] === row && endPosition[1] === col) ||
            obstacles.some(obs => obs[0] === row && obs[1] === col)
        ) {
            return;
        }
        
        // Set start position if not set
        if (!startPosition) {
            startPosition = [row, col];
            cells[row][col].classList.add('start');
            startStatusElement.textContent = `Start: (${row}, ${col})`;
        }
        // Set end position if not set
        else if (!endPosition) {
            endPosition = [row, col];
            cells[row][col].classList.add('end');
            endStatusElement.textContent = `End: (${row}, ${col})`;
            evaluateButton.disabled = false;
        }
        // Set obstacles if there are remaining ones
        else if (remainingObstacles > 0) {
            obstacles.push([row, col]);
            cells[row][col].classList.add('obstacle');
            remainingObstacles--;
            remainingObstaclesElement.textContent = `Remaining obstacles: ${remainingObstacles}`;
        }
    }
    
    // Evaluate policy and update values
    function evaluatePolicy() {
        const data = {
            size: gridSize,
            policy: policy,
            start: startPosition,
            end: endPosition,
            obstacles: obstacles
        };
        
        fetch('/evaluate_policy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            values = data.values;
            
            // Update cell values
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    const valueElement = cells[i][j].querySelector('.value');
                    valueElement.textContent = values[i][j].toFixed(2);
                }
            }
        })
        .catch(error => console.error('Error evaluating policy:', error));
    }
    
    // Initialize a default 5x5 grid on page load
    gridSize = parseInt(gridSizeInput.value);
    maxObstacles = gridSize - 2;
    remainingObstacles = maxObstacles;
    remainingObstaclesElement.textContent = `Remaining obstacles: ${remainingObstacles}`;
    initializeGrid();
});
