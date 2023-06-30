// Step 1: Calculate the average error for each prediction
// Retrieve the predictions from the URL parameter
var urlParams = new URLSearchParams(window.location.search);
var predictionsParam = urlParams.get('predictions');
// Split the predictions string into an array
var predictionsArray = predictionsParam.split(',');

// Performance metrics (errors) array
var performanceMetrics = [
  { target: 'Glycohemoglobin', unit: '%', MAE: 0.240, thresholds: { veryHigh: 6.8, high: 6.4, moderate: 5.8 }, range: '4 - 5.7' },
  { target: 'Fasting glucose (mg/dL)', unit: 'mg/dL', MAE: 2.985, thresholds: { veryHigh: 126, high: 110, moderate: 100 }, range: '50 - 100' },
  { target: 'Fasting glucose (mmol/L)', unit: 'mmol/L', MAE: 0.235,thresholds: { veryHigh: 6.1, high: 7.8, moderate: 5.7 }, range: '3.9 - 5.7' },
  { target: 'Insulin (pmol/L)', unit: 'pmol/L', MAE: 1.383, RMSE: 1.1545773173638372, thresholds: { veryHigh: 174, high: 140, moderate: 115 }, range: '75 - 115' },
  { target: 'HDL cholesterol (mg/dL)', unit: 'mg/dL', MAE: 2.044, RMSE: 1.9784903164896723, thresholds: { veryHigh: 80, high: 65, moderate: 55 }, range: '35 - 55' },
  { target: 'HDL cholesterol (mmol/L)', unit: 'mmol/L', MAE: 0.0917, RMSE: 0.0448478631816505, thresholds: { veryHigh: 5.5, high: 4, moderate: 2 }, range: '0.8 - 2' },
  { target: 'Total cholesterol (mg/dL)', unit: 'mg/dL', MAE: 0.4806, RMSE: 5.217620150083706, thresholds: { veryHigh: 240, high: 220, moderate: 200 }, range: '< 200' },
  { target: 'Triglycerides (mmol/L)', unit: 'mmol/L', MAE: 0.13175, RMSE: 0.08145638755300426, thresholds: { veryHigh: 6, high: 2, moderate: 1.7 }, range: ' < 1.7' },
  { target: 'LDL cholesterol (mg/dL)', unit: 'mg/dL', MAE: 12.729, RMSE: 6.078107751797688, thresholds: { veryHigh: 160, high: 130, moderate: 100 }, range: '< 100' },
  { target: 'Trunk Fat (%)', unit: '%', MAE: 0.515, RMSE: 460.7133074799416, thresholds: { veryHigh: 35, high: 30, moderate: 25 }, range: '< 25' },
  { target: 'Total Fat (%)', unit: '%', MAE: 0.528, RMSE: 0.9578235092286134, thresholds: { veryHigh: 35, high: 30, moderate: 25 }, range: '< 25' }
];
function calculateRisk(predictionsArray, performanceMetrics) {
  var riskScores = [];

  performanceMetrics.forEach(function(metric) {
    var prediction = parseFloat(predictionsArray.shift());
    var riskScore = 0;

    if (prediction > metric.thresholds.veryHigh) {
      riskScore = 100;
    } else if (prediction > metric.thresholds.high) {
      var range = metric.thresholds.veryHigh - metric.thresholds.high;
      var predictionRange = metric.thresholds.veryHigh - prediction;
      riskScore = 100 - (predictionRange / range) * 100;
    } else if (prediction > metric.thresholds.moderate) {
      var range = metric.thresholds.high - metric.thresholds.moderate;
      var predictionRange = metric.thresholds.high - prediction;
      riskScore = 100 - (predictionRange / range) * 100;
    }

    riskScores.push({ target: metric.target, weight: metric.weight, riskScore: riskScore, influencingParams: metric.influencingParams });
  });

  return riskScores;
}

// Call the calculateRisk function
var riskScores = calculateRisk(predictionsArray, performanceMetrics);

// Define the diseases with their associated targets, weights, and influencing parameters
var diseases = [
  { 
    name: 'Diabetes Type 2', 
    targets: [
      { target: 'Glycohemoglobin', weight: 0.4 },
      { target: 'Fasting glucose (mg/dL)', weight: 0.3 },
      { target: 'Fasting glucose (mmol/L)', weight: 0.3 }
    ],
    influencingParams: 'Glycohemoglobin, Fasting glucose levels'
  },
  { 
    name: 'Metabolic Syndrome', 
    targets: [
      { target: 'Triglycerides (mmol/L)', weight: 0.2 },
      { target: 'HDL cholesterol (mg/dL)', weight: 0.2 },
      { target: 'HDL cholesterol (mmol/L)', weight: 0.2 },
      { target: 'Total cholesterol (mg/dL)', weight: 0.2 },
      { target: 'LDL cholesterol (mg/dL)', weight: 0.2 }
    ],
    influencingParams: 'Triglyceride levels, HDL cholesterol levels, Total cholesterol levels, LDL cholesterol levels'
  },
  { 
    name: 'Insulin Resistance', 
    targets: [
      { target: 'Insulin (pmol/L)', weight: 1 }
    ],
    influencingParams: 'Insulin levels'
  },
  { 
    name: 'Obesity', 
    targets: [
      { target: 'Trunk Fat (%)', weight: 0.5 },
      { target: 'Total Fat (%)', weight: 0.5 }
    ],
    influencingParams: 'Trunk fat percentage, Total fat percentage'
  },
  { 
    name: 'Cardiovascular Disease', 
    targets: [
      { target: 'HDL cholesterol (mg/dL)', weight: 0.2 },
      { target: 'HDL cholesterol (mmol/L)', weight: 0.2 },
      { target: 'Total cholesterol (mg/dL)', weight: 0.2 },
      { target: 'Triglycerides (mmol/L)', weight: 0.2 },
      { target: 'LDL cholesterol (mg/dL)', weight: 0.2 }
    ],
    influencingParams: 'HDL cholesterol levels, Total cholesterol levels, Triglyceride levels, LDL cholesterol levels'
  }
  // Add other diseases with their targets, weights, and influencing parameters
];

// Calculate overall risk for each disease
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
    overallRiskScore: overallRiskScore, 
    influencingParams: disease.influencingParams 
  });
});

// Generate HTML string for diseases table
var diseasesHtml = '<table>';
diseasesHtml += '<tr><th>Disease</th><th>Risk Score</th><th>Influencing Parameters</th></tr>';

overallRiskScores.forEach(function(score) {
  diseasesHtml += '<tr><td>' + score.name + '</td><td>' + score.overallRiskScore.toFixed(2) + '</td><td>' + score.influencingParams + '</td></tr>';
});

diseasesHtml += '</table>';

// Append the HTML to an element in the document
var outputElement = document.getElementById('output');
if (outputElement) {
  outputElement.innerHTML = diseasesHtml;
}