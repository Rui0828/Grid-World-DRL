document.addEventListener('DOMContentLoaded', function() {
    const gridSizeInput = document.getElementById('grid-size');
    const createGridBtn = document.getElementById('create-grid');
    const generatePolicyBtn = document.getElementById('generate-policy');
    const evaluatePolicyBtn = document.getElementById('evaluate-policy');
    const gridContainer = document.getElementById('grid');
    const obstacleCountElem = document.getElementById('obstacle-count');
    
    let gridSize = 5;
    let gridState = {
        size: 5,
        start: null,
        end: null,
        obstacles: [],
        policy: [],
        values: []
    };
    
    // Initialize grid when page loads
    createGrid();
    
    createGridBtn.addEventListener('click', function() {
        gridSize = parseInt(gridSizeInput.value);
        if (gridSize < 5) gridSize = 5;
        if (gridSize > 9) gridSize = 9;
        gridSizeInput.value = gridSize;
        createGrid();
    });
    
    generatePolicyBtn.addEventListener('click', function() {
        if (!gridState.start || !gridState.end) {
            alert("Please set start and end points first!");
            return;
        }
        fetch('/api/grid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                n: gridSize
            })
        })
        .then(response => response.json())
        .then(data => {
            // Keep current state but update policy
            gridState.policy = data.policy;
            updateGridDisplay();
        })
        .catch(error => console.error('Error:', error));
    });
    
    evaluatePolicyBtn.addEventListener('click', function() {
        if (!gridState.start || !gridState.end || !gridState.policy.length) {
            alert("Please set start and end points, and generate a policy first!");
            return;
        }
        
        fetch('/api/evaluate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gridState)
        })
        .then(response => response.json())
        .then(data => {
            gridState.values = data.values;
            updateGridDisplay();
        })
        .catch(error => console.error('Error:', error));
    });
    
    function createGrid() {
        // Reset grid state
        gridState = {
            size: gridSize,
            start: null,
            end: null,
            obstacles: [],
            policy: [],
            values: []
        };
        
        // Create grid cells
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('click', handleCellClick);
                
                gridContainer.appendChild(cell);
            }
        }
        
        updateObstacleCount();
        
        // Initialize with random policy
        fetch('/api/grid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                n: gridSize
            })
        })
        .then(response => response.json())
        .then(data => {
            gridState.policy = data.policy;
        })
        .catch(error => console.error('Error:', error));
    }
    
    function handleCellClick(e) {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        
        // Check if cell already has a role
        const isStart = gridState.start && gridState.start.row === row && gridState.start.col === col;
        const isEnd = gridState.end && gridState.end.row === row && gridState.end.col === col;
        const isObstacle = gridState.obstacles.some(o => o.row === row && o.col === col);
        
        // If cell already has a role, remove it
        if (isStart) {
            gridState.start = null;
            e.target.classList.remove('start');
        } else if (isEnd) {
            gridState.end = null;
            e.target.classList.remove('end');
        } else if (isObstacle) {
            gridState.obstacles = gridState.obstacles.filter(o => !(o.row === row && o.col === col));
            e.target.classList.remove('obstacle');
        } else {
            // Assign a new role based on priority: start > end > obstacle
            if (!gridState.start) {
                gridState.start = {row, col};
                e.target.classList.add('start');
            } else if (!gridState.end) {
                gridState.end = {row, col};
                e.target.classList.add('end');
            } else if (gridState.obstacles.length < (gridSize - 2)) {
                gridState.obstacles.push({row, col});
                e.target.classList.add('obstacle');
            }
        }
        
        updateObstacleCount();
        updateGridDisplay();
    }
    
    function updateObstacleCount() {
        const maxObstacles = gridSize - 2;
        obstacleCountElem.textContent = `Obstacles: ${gridState.obstacles.length}/${maxObstacles}`;
    }
    
    function updateGridDisplay() {
        // Update cells with policy and value information
        const cells = gridContainer.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            // Clear previous policy and value
            const arrowElem = cell.querySelector('.arrow');
            if (arrowElem) cell.removeChild(arrowElem);
            
            const valueElem = cell.querySelector('.value');
            if (valueElem) cell.removeChild(valueElem);
            
            // Skip if this is an obstacle
            const isObstacle = gridState.obstacles.some(o => o.row === row && o.col === col);
            if (isObstacle) return;
            
            // Add policy arrow
            if (gridState.policy[row] && gridState.policy[row][col]) {
                const arrowDiv = document.createElement('div');
                arrowDiv.className = 'arrow';
                
                switch(gridState.policy[row][col]) {
                    case 'up': arrowDiv.innerHTML = '↑'; break;
                    case 'down': arrowDiv.innerHTML = '↓'; break;
                    case 'left': arrowDiv.innerHTML = '←'; break;
                    case 'right': arrowDiv.innerHTML = '→'; break;
                }
                
                cell.appendChild(arrowDiv);
            }
            
            // Add value
            if (gridState.values[row] && typeof gridState.values[row][col] !== 'undefined') {
                const valueDiv = document.createElement('div');
                valueDiv.className = 'value';
                valueDiv.textContent = gridState.values[row][col].toFixed(2);
                cell.appendChild(valueDiv);
            }
        });
    }
});
