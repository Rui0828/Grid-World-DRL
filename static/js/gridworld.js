document.addEventListener('DOMContentLoaded', function() {
    // State variables
    let gridState = {
        size: 5,
        start: null,
        end: null,
        obstacles: [],
        policy: [],
        values: [],
        isLocked: false
    };
    
    let grid = []; // DOM elements for the grid cells
    
    const createGridBtn = document.getElementById('createGridBtn');
    const evaluateBtn = document.getElementById('evaluateBtn');
    const improveBtn = document.getElementById('improveBtn');
    const valueIterationBtn = document.getElementById('valueIterationBtn');
    const editBtn = document.getElementById('editBtn');
    const clearBtn = document.getElementById('clearBtn');
    const gridContainer = document.getElementById('gridContainer');
    const statusText = document.getElementById('statusText');
    let legend = document.querySelector('.legend'); // Get reference to legend
    const algorithmInfo = document.getElementById('algorithmInfo');
    
    // Initially hide the edit buttons
    editBtn.style.display = 'none';
    clearBtn.style.display = 'none';
    
    // Event handlers
    createGridBtn.addEventListener('click', initializeGrid);
    evaluateBtn.addEventListener('click', function(e) {
        if (!gridState.start || !gridState.end) {
            e.preventDefault();
            showWarning('Please set both start and end positions before generating a policy.');
            return;
        }
        evaluatePolicy();
    });
    
    improveBtn.addEventListener('click', function(e) {
        if (!gridState.start || !gridState.end) {
            e.preventDefault();
            showWarning('Please set both start and end positions before improving the policy.');
            return;
        }
        improvePolicy();
    });
    
    valueIterationBtn.addEventListener('click', function(e) {
        if (!gridState.start || !gridState.end) {
            e.preventDefault();
            showWarning('Please set both start and end positions before running value iteration.');
            return;
        }
        runValueIteration();
    });
    
    editBtn.addEventListener('click', enableGridEditing);
    clearBtn.addEventListener('click', clearAll);
    
    // Initialize grid based on user input
    function initializeGrid() {
        const gridSizeInput = document.getElementById('gridSize');
        const size = parseInt(gridSizeInput.value);
        
        if (isNaN(size) || size < 5 || size > 9) {
            alert('Please enter a grid size between 5 and 9');
            return;
        }
        
        // Reset grid state
        gridState = {
            size: size,
            start: null,
            end: null,
            obstacles: [],
            policy: [],
            values: Array(size).fill().map(() => Array(size).fill(0)),
            isLocked: false
        };
        
        // Create grid table
        createGridTable(size);
        
        // Show the legend when grid is created
        legend.classList.add('visible');
        
        // Update status
        statusText.textContent = 'Click on cells to set start (green), end (red), and obstacles (gray).';
        
        // Disable the evaluate button until start and end are set
        evaluateBtn.disabled = true;
        improveBtn.disabled = true;
        valueIterationBtn.disabled = true;
        
        // Show appropriate buttons
        evaluateBtn.disabled = true;
        improveBtn.disabled = true;
        valueIterationBtn.disabled = true;
        editBtn.style.display = 'none';
        clearBtn.style.display = 'none';
    }
    
    // Create HTML table for the grid
    function createGridTable(size) {
        grid = [];
        gridContainer.innerHTML = '';
        
        // Create table
        const table = document.createElement('table');
        
        for (let i = 0; i < size; i++) {
            const row = document.createElement('tr');
            const gridRow = [];
            
            for (let j = 0; j < size; j++) {
                const cell = document.createElement('td');
                const cellContent = document.createElement('div');
                cellContent.className = 'cell-content';
                cell.appendChild(cellContent);
                
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('click', function() {
                    handleCellClick(parseInt(this.dataset.row), parseInt(this.dataset.col));
                });
                
                row.appendChild(cell);
                gridRow.push(cell);
            }
            
            table.appendChild(row);
            grid.push(gridRow);
        }
        
        gridContainer.appendChild(table);
        
        // Create legend in the grid container instead of outside
        const legendDiv = document.createElement('div');
        legendDiv.className = 'legend';
        
        // Create legend items
        const legendItems = [
            { color: '#a0ffa0', text: 'Start' },
            { color: '#ffa0a0', text: 'End' },
            { color: '#808080', text: 'Obstacle' }
        ];
        
        legendItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'legend-item';
            
            const colorDiv = document.createElement('div');
            colorDiv.className = 'legend-color';
            colorDiv.style.backgroundColor = item.color;
            
            const textSpan = document.createElement('span');
            textSpan.textContent = item.text;
            
            itemDiv.appendChild(colorDiv);
            itemDiv.appendChild(textSpan);
            legendDiv.appendChild(itemDiv);
        });
        
        gridContainer.appendChild(legendDiv);
        
        // Store reference to the newly created legend
        legend = legendDiv;
    }
    
    // Handle cell clicks to set start, end, and obstacles
    function handleCellClick(row, col) {
        // Don't allow edits if grid is locked
        if (gridState.isLocked) {
            statusText.innerHTML = '<div class="alert-message">Grid is locked for editing. Click "Edit Grid" to modify the grid.</div>';
            return;
        }
        
        const cell = grid[row][col];
        
        // If cell is already selected, unselect it
        if (cell.classList.contains('start')) {
            cell.classList.remove('start');
            gridState.start = null;
            updateStatusText();
            checkAndEnableButtons();
            return;
        }
        
        if (cell.classList.contains('end')) {
            cell.classList.remove('end');
            gridState.end = null;
            updateStatusText();
            checkAndEnableButtons();
            return;
        }
        
        if (cell.classList.contains('obstacle')) {
            cell.classList.remove('obstacle');
            gridState.obstacles = gridState.obstacles.filter(obs => 
                obs.row !== row || obs.col !== col
            );
            updateStatusText();
            return;
        }
        
        // Set new state based on current grid status
        if (gridState.start === null) {
            gridState.start = { row, col };
            cell.classList.add('start');
        } else if (gridState.end === null) {
            gridState.end = { row, col };
            cell.classList.add('end');
        } else {
            // Check if adding another obstacle would exceed the limit
            const maxObstacles = gridState.size - 2;
            
            if (gridState.obstacles.length >= maxObstacles) {
                showWarning(`Maximum ${maxObstacles} obstacles allowed for a ${gridState.size}x${gridState.size} grid.`);
                return;
            }
            
            gridState.obstacles.push({ row, col });
            cell.classList.add('obstacle');
        }
        
        updateStatusText();
        checkAndEnableButtons();
    }
    
    // Update status text based on current grid state
    function updateStatusText() {
        if (gridState.start === null) {
            statusText.textContent = 'Click a cell to set the start position (green).';
        } else if (gridState.end === null) {
            statusText.textContent = 'Click a cell to set the end position (red).';
        } else {
            const maxObstacles = gridState.size - 2;
            const remainingObstacles = maxObstacles - gridState.obstacles.length;
            
            if (remainingObstacles > 0) {
                statusText.textContent = `Click cells to add obstacles (gray). ${remainingObstacles} obstacles remaining. Click again to remove. When ready, click "Random Policy".`;
            } else {
                statusText.textContent = 'Maximum number of obstacles reached. Click on obstacles to remove them. When ready, click "Random Policy".';
            }
        }
    }
    
    // Enable buttons if start and end are set
    function checkAndEnableButtons() {
        const buttonsEnabled = gridState.start !== null && gridState.end !== null;
        evaluateBtn.disabled = !buttonsEnabled;
        improveBtn.disabled = !buttonsEnabled;
        valueIterationBtn.disabled = !buttonsEnabled;
    }
    
    // Lock grid after policy display
    function lockGrid() {
        gridState.isLocked = true;
        
        // Show edit and clear buttons
        editBtn.style.display = 'inline-block';
        clearBtn.style.display = 'inline-block';
        
        // Keep all policy buttons enabled
        evaluateBtn.disabled = false;
        improveBtn.disabled = false;
        valueIterationBtn.disabled = false;
    }
    
    // Enable grid editing
    function enableGridEditing() {
        console.log("Edit Grid button clicked"); // Add debugging
        gridState.isLocked = false;
        
        // Clear policy display but keep grid settings
        for (let i = 0; i < gridState.size; i++) {
            for (let j = 0; j < gridState.size; j++) {
                const cell = grid[i][j];
                const content = cell.querySelector('.cell-content');
                content.innerHTML = '';
            }
        }
        
        // Reset policy and values arrays but keep grid configuration
        gridState.policy = [];
        gridState.values = Array(gridState.size).fill().map(() => Array(gridState.size).fill(0));
        
        // Hide edit buttons, enable policy buttons
        editBtn.style.display = 'none';
        clearBtn.style.display = 'none';
        
        // Re-enable policy buttons if start and end are set
        checkAndEnableButtons(); // Replace the if-statement with this function call
        
        statusText.textContent = 'Grid is now editable. You can modify start, end, and obstacles.';
    }
    
    // Clear all and start fresh
    function clearAll() {
        console.log("Clear All button clicked"); // Add debugging
        const size = gridState.size;
        gridState = {
            size: size,
            start: null,
            end: null,
            obstacles: [],
            policy: [],
            values: Array(size).fill().map(() => Array(size).fill(0)),
            isLocked: false
        };
        
        // Recreate grid table
        createGridTable(size);
        
        // Show legend since grid will be displayed
        legend.classList.add('visible');
        
        // Reset UI buttons
        editBtn.style.display = 'none';
        clearBtn.style.display = 'none';
        evaluateBtn.disabled = true;
        improveBtn.disabled = true;
        valueIterationBtn.disabled = true;
        
        statusText.textContent = 'Grid cleared. Click on cells to set start (green), end (red), and obstacles (gray).';
    }
    
    // Generate random policy and evaluate it
    function evaluatePolicy() {
        statusText.textContent = 'Generating random policy and evaluating...';
        
        // First call API to create a grid with random policy
        fetch('/api/grid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ n: gridState.size })
        })
        .then(response => response.json())
        .then(data => {
            gridState.policy = data.policy;
            
            // Then evaluate the policy
            return fetch('/api/evaluate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gridState)
            });
        })
        .then(response => response.json())
        .then(data => {
            gridState.values = data.values;
            updateGridDisplay();
            statusText.innerHTML = '<div style="text-align:center">Random policy generated and evaluated.<br>You can click "Improve Policy" to optimize it or use "Value Iteration" to find the optimal policy directly.</div>';
            lockGrid();
        })
        .catch(error => {
            console.error('Error:', error);
            statusText.textContent = 'Error generating random policy. Check console for details.';
        });
    }
    
    // Improve the current policy
    function improvePolicy() {
        // Don't allow policy improvement if there's no policy to improve
        if (!gridState.policy || gridState.policy.length === 0) {
            statusText.textContent = 'Please generate a random policy first before improving.';
            return;
        }
        
        statusText.textContent = 'Improving policy...';
        
        fetch('/api/improve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gridState)
        })
        .then(response => response.json())
        .then(data => {
            gridState.policy = data.policy;
            gridState.values = data.values;
            updateGridDisplay();
            statusText.textContent = 'Policy improved. The arrows show the optimal action in each state.';
            // Don't call lockGrid() again as the grid is already locked
        })
        .catch(error => {
            console.error('Error:', error);
            statusText.textContent = 'Error improving policy. Check console for details.';
        });
    }
    
    // Run value iteration to find optimal policy
    function runValueIteration() {
        statusText.textContent = 'Running value iteration...';
        
        fetch('/api/value-iteration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gridState)
        })
        .then(response => response.json())
        .then(data => {
            gridState.policy = data.policy;
            gridState.values = data.values;
            updateGridDisplay();
            statusText.textContent = 'Value iteration complete. The arrows show the optimal policy.';
            // Lock grid if not already locked
            if (!gridState.isLocked) {
                lockGrid();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            statusText.textContent = 'Error running value iteration. Check console for details.';
        });
    }
    
    // Update grid display with policy arrows and values
    function updateGridDisplay() {
        for (let i = 0; i < gridState.size; i++) {
            for (let j = 0; j < gridState.size; j++) {
                const cell = grid[i][j];
                const content = cell.querySelector('.cell-content');
                
                // Clear existing content
                content.innerHTML = '';
                
                // Skip if cell is start, end or obstacle
                if (
                    (gridState.start && gridState.start.row === i && gridState.start.col === j) ||
                    (gridState.end && gridState.end.row === i && gridState.end.col === j) ||
                    gridState.obstacles.some(obs => obs.row === i && obs.col === j)
                ) {
                    continue;
                }
                
                // Add policy arrow
                const arrowDiv = document.createElement('div');
                arrowDiv.className = 'arrow';
                
                if (gridState.policy && gridState.policy[i] && gridState.policy[i][j]) {
                    const policy = gridState.policy[i][j];
                    let arrow = '•';
                    
                    if (policy === 'up') arrow = '↑';
                    else if (policy === 'down') arrow = '↓';
                    else if (policy === 'left') arrow = '←';
                    else if (policy === 'right') arrow = '→';
                    
                    arrowDiv.textContent = arrow;
                }
                content.appendChild(arrowDiv);
                
                // Add state value
                if (gridState.values && gridState.values[i] && gridState.values[i][j] !== undefined) {
                    const valueDiv = document.createElement('div');
                    valueDiv.className = 'value';
                    valueDiv.textContent = gridState.values[i][j].toFixed(2);
                    content.appendChild(valueDiv);
                }
            }
        }
    }
    
    // Show warning in status text with red color and shake animation
    function showWarning(message) {
        statusText.innerHTML = `<div class="alert-message">${message}</div>`;
    }
});
