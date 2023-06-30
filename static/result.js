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

// Risk levels and associated diseases
var riskLevels = [
  { label: 'Very High Risk', diseases: ['Type 2 Diabetes', 'Cardiovascular Disease'] },
  { label: 'High Risk', diseases: ['Cardiovascular Disease'] },
  { label: 'Moderate Risk', diseases: ['Metabolic Syndrome'] },
  { label: 'Low Risk', diseases: [] },
  { label: 'Not Available', diseases: [] },
  { label: 'Unknown', diseases: [] }
];

// Function to calculate the risk assessment based on the predicted value and thresholds
function calculateRiskAssessment(predictedValue, thresholds) {
  if (predictedValue >= thresholds.veryHigh) {
    return riskLevels[0]; // Very High Risk
  } else if (predictedValue >= thresholds.high) {
    return riskLevels[1]; // High Risk
  } else if (predictedValue >= thresholds.moderate) {
    return riskLevels[2]; // Moderate Risk
  } else if (predictedValue > 0) {
    return riskLevels[3]; // Low Risk
  } else if (predictedValue === 'NA') {
    return riskLevels[4]; // Not Available
  } else {
    return riskLevels[5]; // Unknown
  }
}

// Display the predictions, errors, and risk assessment in a table
var predictionsTable = document.getElementById('predictions-table');
performanceMetrics.forEach(function (metric) {
  var row = document.createElement('tr');

  // Target column cell
  var targetColCell = document.createElement('td');
  targetColCell.textContent = metric.target;
  row.appendChild(targetColCell);

  // Predicted ± Error cell
  var predictedCell = document.createElement('td');
  var index = performanceMetrics.indexOf(metric);
  var predictedValue = parseFloat(predictionsArray[index]).toFixed(3);
  var errorValue = metric.MAE.toFixed(3);
  var combinedValue = predictedValue + " ± " + errorValue + " " + metric.unit;
  predictedCell.textContent = combinedValue;
  row.appendChild(predictedCell);

  // Risk assessment cell
  var riskCell = document.createElement('td');
  var riskAssessment = calculateRiskAssessment(predictedValue, metric.thresholds);
  riskCell.textContent = riskAssessment.label;
  riskCell.classList.add(riskAssessment.label.toLowerCase().replace(/\s+/g, '-'));
  row.appendChild(riskCell);

  // Range cell
  var rangeCell = document.createElement('td');
  rangeCell.textContent = metric.range;
  row.appendChild(rangeCell);

  predictionsTable.appendChild(row);
});
