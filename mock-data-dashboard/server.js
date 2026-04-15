const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint to generate mock data
app.get('/api/data', (req, res) => {
    const data = [];
    const now = new Date();
    let currentPrice = 150.00;
    
    // Generate 20 data points
    for (let i = 20; i >= 1; i--) {
        // Create 1 minute intervals for timestamps
        const timestamp = new Date(now.getTime() - i * 60000); 
        
        // Simulate market volatility with a random value change
        const change = (Math.random() - 0.5) * 5;
        currentPrice += change;
        
        data.push({
            timestamp: timestamp.toLocaleString([], { hour: '2-digit', minute: '2-digit' }),
            value: Number(currentPrice.toFixed(2))
        });
    }
    
    res.json(data);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
