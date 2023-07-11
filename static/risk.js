var urlParams = new URLSearchParams(window.location.search);
var predictionsParam = urlParams.get('predictions');
var predictionsArray = predictionsParam.split(',');

var performanceMetrics = [
  { target: 'Glycohemoglobin', unit: '%', MAE: 0.5, weight: 0.4, range: [4, 5.7] },
  { target: 'Insulin (pmol/L)', unit: 'pmol/L', MAE: 20, RMSE: 25, weight: 1, range: [75, 115] },
  { target: 'HDL cholesterol (mg/dL)', unit: 'mg/dL', MAE: 5, RMSE: 8, weight: 0.2, range: [35, 55] },
  { target: 'Total cholesterol (mg/dL)', unit: 'mg/dL', MAE: 20, RMSE: 30, weight: 0.2, range: [0, 200] },
  { target: 'Triglycerides (mg/dL)', unit: 'mg/dL', MAE: 30, RMSE: 40, weight: 0.2, range: [0, 200] },
  { target: 'LDL cholesterol (mg/dL)', unit: 'mg/dL', MAE: 20, RMSE: 30, weight: 0.2, range: [0, 140] },
  { target: 'Trunk Fat (%)', unit: '%', MAE: 2, RMSE: 5, weight: 0.2, range: [0, 27] },
  { target: 'Total Fat (%)', unit: '%', MAE: 2, RMSE: 5, weight: 0.2, range: [0, 27] }
];

// Calculate risk scores based on predictions and performance metrics
function calculateRisk(predictionsArray, performanceMetrics) {
  const riskScores = performanceMetrics.map(metric => {
    const prediction = parseFloat(predictionsArray.shift());
    let riskScore = 0;

    const [minRange, maxRange] = metric.range;
    const rangeDifference = maxRange - minRange;
    const optimalValue = (minRange + maxRange) / 2;

    if (prediction <= minRange) {
      riskScore = 0;
    } else if (prediction >= maxRange) {
      const deviation = Math.abs(prediction - maxRange);
      const normalizedDeviation = deviation / (rangeDifference / 2);
      riskScore = 100 + (normalizedDeviation * 100);
    } else {
      const deviation = Math.abs(prediction - optimalValue);
      const normalizedDeviation = deviation / (rangeDifference / 2);
      riskScore = (normalizedDeviation * 20);
    }

    return { target: metric.target, weight: metric.weight, riskScore };
  });

  return riskScores;
}

var riskScores = calculateRisk(predictionsArray, performanceMetrics);
var diseases = [
  { 
    name: 'Diabetes Type 2', 
    targets: [
      { target: 'Glycohemoglobin', weight: 0.4 },
    ],
    influencingParams: 'Glycohemoglobin, Fasting glucose levels'
  },
  { 
    name: 'Metabolic Syndrome', 
    targets: [
      { target: 'Triglycerides (mg/dL)', weight: 0.2 },
      { target: 'HDL cholesterol (mg/dL)', weight: 0.2 },
      { target: 'Total cholesterol (mg/dL)', weight: 0.2 },
      { target: 'LDL cholesterol (mg/dL)', weight: 0.2 }
    ],
    influencingParams: 'Triglyceride levels, HDL cholesterol levels, Total cholesterol levels, LDL cholesterol levels'
  },
  { 
    name: 'Cardiovascular Disease', 
    targets: [
      { target: 'HDL cholesterol (mg/dL)', weight: 0.2 },
      { target: 'Total cholesterol (mg/dL)', weight: 0.2 },
      { target: 'LDL cholesterol (mg/dL)', weight: 0.2 },
      { target: 'Triglycerides (mg/dL)', weight: 0.2 }
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
      { target: 'HDL cholesterol (mg/dL)', weight: 0.2 },
      { target: 'Insulin (pmol/L)', weight: 0.3 },
      { target: 'Total Fat (%)', weight: 0.2 }
    ],
    influencingParams: 'Triglyceride levels, HDL cholesterol levels, Insulin levels, Total fat percentage'
  }
];


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
    overallRiskScore: overallRiskScore / totalWeight, 
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
    { score: 70, color: '#FF0000' } // Red
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

// Function to save the current page as a PDF
