let myChart;

// Chart configuration and common options
const getChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    color: '#94a3b8',
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f8fafc',
            bodyColor: '#f8fafc',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 16,
            displayColors: false,
            titleFont: {
                family: "'Outfit', sans-serif",
                size: 13,
                weight: 'normal'
            },
            bodyFont: {
                family: "'Outfit', sans-serif",
                size: 14,
                weight: 'bold'
            },
            callbacks: {
                label: function(context) {
                    return `$${context.parsed.y.toFixed(2)}`;
                }
            }
        }
    },
    scales: {
        x: {
            grid: {
                color: 'rgba(255, 255, 255, 0.03)',
                drawBorder: false,
            },
            ticks: {
                color: '#64748b',
                font: {
                    family: "'Outfit', sans-serif",
                    size: 11
                },
                maxTicksLimit: 10
            }
        },
        y: {
            grid: {
                color: 'rgba(255, 255, 255, 0.03)',
                drawBorder: false,
            },
            ticks: {
                color: '#64748b',
                font: {
                    family: "'Outfit', sans-serif",
                    size: 12
                },
                callback: function(value) {
                    return '$' + value;
                }
            }
        }
    },
    interaction: {
        intersect: false,
        mode: 'index',
    },
    animation: {
        duration: 800,
        easing: 'easeOutQuart'
    }
});

// Fetch data from the Express backend
async function fetchChartData() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.warn('Backend unavailable, falling back to local mock data generation.');
        return generateMockData();
    }
}

// Fallback function to generate data locally if Node.js server isn't running
function generateMockData() {
    const data = [];
    const now = new Date();
    let currentPrice = 150.00;
    
    for (let i = 20; i >= 1; i--) {
        const timestamp = new Date(now.getTime() - i * 60000); 
        const change = (Math.random() - 0.5) * 5;
        currentPrice += change;
        
        data.push({
            timestamp: timestamp.toLocaleString([], { hour: '2-digit', minute: '2-digit' }),
            value: Number(currentPrice.toFixed(2))
        });
    }
    return data;
}

// Render or update the Chart.js visualization
async function updateChart() {
    const btn = document.getElementById('refreshBtn');
    const svgIcon = btn.querySelector('svg');
    
    // UI Loading state
    btn.disabled = true;
    svgIcon.style.transition = 'transform 0.5s ease';
    svgIcon.style.transform = 'rotate(180deg)';

    // Fetch new mock data
    const rawData = await fetchChartData();
    
    // Reset UI state
    setTimeout(() => {
        svgIcon.style.transform = 'rotate(0deg)';
        btn.disabled = false;
    }, 500);

    if (!rawData) return;

    // Process data for Chart.js
    const labels = rawData.map(item => item.timestamp);
    const dataPoints = rawData.map(item => item.value);

    const chartType = document.getElementById('chartType').value;
    const canvas = document.getElementById('mainChart');
    const ctx = canvas.getContext('2d');

    // Gradient background for Line Chart
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.parentElement.clientHeight);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Market Price',
            data: dataPoints,
            backgroundColor: chartType === 'line' ? gradient : 'rgba(59, 130, 246, 0.8)',
            borderColor: '#3b82f6',
            borderWidth: 2,
            pointBackgroundColor: '#0f172a',
            pointBorderColor: '#3b82f6',
            pointBorderWidth: 2,
            pointRadius: chartType === 'line' ? 4 : 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#3b82f6',
            fill: true,
            borderRadius: chartType === 'bar' ? 6 : 0,
            tension: 0.4 // Bezier curve tension for smoothness
        }]
    };

    if (myChart) {
        myChart.data = chartData;
        myChart.config.type = chartType;
        // Adjust the dataset specific settings when switching dynamically
        if(chartType === 'line') {
            myChart.data.datasets[0].pointRadius = 4;
            myChart.data.datasets[0].backgroundColor = gradient;
        } else {
            myChart.data.datasets[0].pointRadius = 0;
            myChart.data.datasets[0].backgroundColor = 'rgba(59, 130, 246, 0.8)';
        }
        myChart.update();
    } else {
        myChart = new Chart(ctx, {
            type: chartType,
            data: chartData,
            options: getChartOptions()
        });
    }
}

// Initialization and Events
document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch and render
    updateChart();

    // Bind event listeners
    document.getElementById('refreshBtn').addEventListener('click', updateChart);
    document.getElementById('chartType').addEventListener('change', updateChart);
});
