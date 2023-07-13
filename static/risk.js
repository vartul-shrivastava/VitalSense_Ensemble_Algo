var urlParams = new URLSearchParams(window.location.search);
var predictionsParam = urlParams.get('predictions');
var predictionsArray = predictionsParam.split(',');

var performanceMetrics = [
  { target: 'Glycohemoglobin', unit: '%', MAE: 0.5, weight: 0.4, range: [5.5, 6.3] },
  { target: 'Insulin (pmol/L)', unit: 'pmol/L', MAE: 20, RMSE: 25, weight: 1, range: [25, 35] },
  { target: 'HDL cholesterol (mg/dL)', unit: 'mg/dL', MAE: 5, RMSE: 8, weight: 0.2, range: [60, 70] },
  { target: 'Total cholesterol (mg/dL)', unit: 'mg/dL', MAE: 20, RMSE: 30, weight: 0.2, range: [200, 250] },
  { target: 'Triglycerides (mg/dL)', unit: 'mg/dL', MAE: 30, RMSE: 40, weight: 0.2, range: [170, 210] },
  { target: 'LDL cholesterol (mg/dL)', unit: 'mg/dL', MAE: 20, RMSE: 30, weight: 0.2, range: [90, 120] },
  { target: 'Trunk Fat (%)', unit: '%', MAE: 2, RMSE: 5, weight: 0.2, range: [25, 35] },
  { target: 'Total Fat (%)', unit: '%', MAE: 2, RMSE: 5, weight: 0.2, range: [25, 35] }
];

var diseases = [
  { 
    name: 'Diabetes Type 2', 
    targets: [
      { target: 'Glycohemoglobin', weight: 1 },
    ],
    influencingParams: 'Glycohemoglobin'
  },
  { 
    name: 'Metabolic Syndrome', 
    targets: [
      { target: 'Triglycerides (mg/dL)', weight: 0.2 },
      { target: 'HDL cholesterol (mg/dL)', weight: -0.1 },
      { target: 'Total cholesterol (mg/dL)', weight: 0.4 },
      { target: 'LDL cholesterol (mg/dL)', weight: 0.2 }
    ],
    influencingParams: 'Triglyceride levels, HDL cholesterol levels, Total cholesterol levels, LDL cholesterol levels'
  },
  { 
    name: 'Cardiovascular Disease', 
    targets: [
      { target: 'HDL cholesterol (mg/dL)', weight: -0.1 },
      { target: 'Total cholesterol (mg/dL)', weight: 0.2 },
      { target: 'LDL cholesterol (mg/dL)', weight: 0.3 },
      { target: 'Triglycerides (mg/dL)', weight: 0.4 }
    ],
    influencingParams: 'HDL cholesterol levels, Total cholesterol levels, Triglyceride levels, LDL cholesterol levels'
  },
  {
    name: 'Hyperlipidemia',
    targets: [
      { target: 'Total cholesterol (mg/dL)', weight: 0.4 },
      { target: 'LDL cholesterol (mg/dL)', weight: 0.4 },
      { target: 'Triglycerides (mg/dL)', weight: 0.2 }
    ],
    influencingParams: 'Total cholesterol levels, LDL cholesterol levels, Triglyceride levels'
  },
  {
    name: 'Non-Alcoholic Fatty Liver Disease',
    targets: [
      { target: 'Triglycerides (mg/dL)', weight: 0.3 },
      { target: 'HDL cholesterol (mg/dL)', weight: -0.2 },
      { target: 'Insulin (pmol/L)', weight: 0.3 },
      { target: 'Total Fat (%)', weight: 0.2 }
    ],
    influencingParams: 'Triglyceride levels, HDL cholesterol levels, Insulin levels, Total fat percentage'
  }
];

// Calculate risk scores based on predictions and performance metrics
function calculateRisk(predictionsArray, performanceMetrics) {
  const riskScores = performanceMetrics.map(metric => {
    const prediction = parseFloat(predictionsArray.shift());
    let riskScore = 0;

    const [minRange, maxRange] = metric.range;

    if (prediction < minRange) {
      riskScore = 0;
    } else if (prediction > maxRange) {
      riskScore = 100;
    } else {
      const rangeDifference = maxRange - minRange;
      const normalizedDeviation = (prediction - minRange) / rangeDifference;
      riskScore = normalizedDeviation * 100;
    }
    return { target: metric.target, weight: metric.weight, riskScore: Math.abs(riskScore) };
  });

  return riskScores;
}

var riskScores = calculateRisk(predictionsArray, performanceMetrics);
var overallRiskScores = [];
diseases.forEach(function(disease) {
  var overallRiskScore = 0;
  var totalWeight = 0;

  disease.targets.forEach(function(target) {
    var score = riskScores.find(function(score) {
      return score.target === target.target;
    });

    if (score) {
      var weightedRiskScore = score.riskScore * target.weight;
      overallRiskScore += weightedRiskScore;
      totalWeight += target.weight;
    }
  });

  overallRiskScores.push({ 
    name: disease.name, 
    overallRiskScore: (overallRiskScore / totalWeight) || 0, 
    influencingParams: disease.influencingParams 
  });
});

var diseasesHtml = '<table>';
diseasesHtml += '<tr><th>Disease</th><th>Risk Score</th><th>Influencing Parameters</th></tr>';

overallRiskScores.forEach(function(score) {
  var riskScoreColor = getRiskScoreColor(score.overallRiskScore);
  diseasesHtml += '<tr>';
  diseasesHtml += '<td>' + score.name + '</td>';
  diseasesHtml += '<td style="background-color:' + riskScoreColor + ';">' + score.overallRiskScore.toFixed(2) + '</td>';
  diseasesHtml += '<td>' + score.influencingParams + '</td>';
  diseasesHtml += '</tr>';
});

diseasesHtml += '</table>';

// Append the HTML to an element in the document
var outputElement = document.getElementById('output');
if (outputElement) {
  outputElement.innerHTML = diseasesHtml;
}

// Helper function to get the color based on the risk score
function getRiskScoreColor(riskScore) {
  var gradientColors = [
    { score: 0, color: '#00FF00' }, // Green
    { score: 35, color: '#FFFF00' }, // Yellow
    { score: 65, color: '#FFA500' }, // Orange
    { score: 100, color: '#FF0000' } // Red
  ];

  for (var i = 0; i < gradientColors.length - 1; i++) {
    var currColor = gradientColors[i];
    var nextColor = gradientColors[i + 1];
    if (riskScore >= currColor.score && riskScore < nextColor.score) {
      var range = nextColor.score - currColor.score;
      var percent = (riskScore - currColor.score) / range;
      return interpolateColor(currColor.color, nextColor.color, percent);
    }
  }

  return gradientColors[gradientColors.length - 1].color; // Default to the last color
}

function interpolateColor(color1, color2, percent) {
  var color1Hex = color1.slice(1); // Remove the '#' from the color string
  var color2Hex = color2.slice(1);
  var r1 = parseInt(color1Hex.substr(0, 2), 16);
  var g1 = parseInt(color1Hex.substr(2, 2), 16);
  var b1 = parseInt(color1Hex.substr(4, 2), 16);
  var r2 = parseInt(color2Hex.substr(0, 2), 16);
  var g2 = parseInt(color2Hex.substr(2, 2), 16);
  var b2 = parseInt(color2Hex.substr(4, 2), 16);

  var r = Math.round(r1 + (r2 - r1) * percent);
  var g = Math.round(g1 + (g2 - g1) * percent);
  var b = Math.round(b1 + (b2 - b1) * percent);

  return '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}
// Assuming you have included the Chart.js library in your HTML file

// Assuming you have included the Chart.js library in your HTML file

// Extract the disease names and risk scores from the overallRiskScores array
var diseaseNames = overallRiskScores.map(function(score) {
  return score.name;
});

var riskScores = overallRiskScores.map(function(score) {
  return score.overallRiskScore;
});

// Create a container element for the canvas
var container = document.createElement('div');
container.style.width = '900px'; // Set the desired width
container.style.height = '400px'; // Set the desired height
container.style.position = 'relative'; // Add positioning
container.style.margin = '0 auto'; // Center the container horizontally
container.style.display = 'flex';
container.style.justifyContent = 'center';
container.style.alignItems = 'center';

// Create the canvas element
var canvas = document.createElement('canvas');
canvas.id = 'barChart';
canvas.style.height = '400px';
canvas.style.width = '900px';

// Append the canvas to the container
container.appendChild(canvas);
// Append the container to the document body
document.body.appendChild(container);

// Create a bar chart using Chart.js
var ctx = canvas.getContext('2d');

// Get the risk score colors for each disease
var riskScoreColors = overallRiskScores.map(function(score) {
  return getRiskScoreColor(score.overallRiskScore);
});



var maxRange = Math.max(...riskScores) > 50 ? null : 50;

var chart = new Chart(ctx, {
  type: 'bar', // Set the chart type to bar
  data: {
    labels: diseaseNames,
    datasets: [{
      label: 'Risk Scores',
      data: riskScores,
      backgroundColor: riskScoreColors, // Set the background color of the bars
      borderColor: 'rgba(0, 123, 255, 1)', // Set the border color of the bars
      borderWidth: 1 // Set the border width of the bars
    }]
  },
  options: {
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        suggestedMax: maxRange, // Set the maximum value for the x-axis // Start the y-axis at zero
        ticks: {
          font: {
            size: 10 // Set the font size for the y-axis labels
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: 10 // Set the font size for the x-axis labels
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false // Hide the legend
      }
    }
  }
  
});
