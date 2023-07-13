// Retrieve the predictions from the URL parameter
var urlParams = new URLSearchParams(window.location.search);
var predictionsParam = urlParams.get('predictions');
// Split the predictions string into an array
var predictionsArray = predictionsParam.split(',');

// Performance metrics with updated risk assessment
var performanceMetrics = [
  { target: 'Glycohemoglobin', unit: '%', MAE: 0.240, thresholds: { veryHigh: 6.8, high: 6.4, moderate: 5.7 }, range: '4 - 5.7' },
  { target: 'Insulin (pmol/L)', unit: 'pmol/L', MAE: 1.383, RMSE: 1.1545773173638372, thresholds: { veryHigh: 100, high: 50, moderate: 20 }, range: '5 - 25' },
  { target: 'HDL cholesterol (mg/dL)', unit: 'mg/dL', MAE: 2.044, RMSE: 1.9784903164896723, thresholds: { veryHigh: 80, high: 70, moderate: 60 }, range: '35 - 55 (higher is better)' },
  { target: 'Total cholesterol (mg/dL)', unit: 'mg/dL', MAE: 0.4806, RMSE: 5.217620150083706, thresholds: { veryHigh: 240, high: 220, moderate: 200 }, range: '< 200' },
  { target: 'Triglycerides (mg/dL)', unit: 'mg/dL', MAE: 0.13175, RMSE: 0.08145638755300426, thresholds: { veryHigh: 400, high: 200, moderate: 175 }, range: ' < 175' },
  { target: 'LDL cholesterol (mg/dL)', unit: 'mg/dL', MAE: 12.729, RMSE: 6.078107751797688, thresholds: { veryHigh: 190, high: 160, moderate: 130 }, range: '< 100' },
  { target: 'Trunk Fat (%)', unit: '%', MAE: 0.515, RMSE: 460.7133074799416, thresholds: { veryHigh: 35, high: 30, moderate: 27 }, range: '< 27' },
  { target: 'Total Fat (%)', unit: '%', MAE: 0.528, RMSE: 0.9578235092286134, thresholds: { veryHigh: 35, high: 30, moderate: 27 }, range: '< 27' }
];

// Mapping of risk level labels
var riskLevelLabels = {
  0: 'Very High Risk',
  1: 'High Risk',
  2: 'Moderate Risk',
  3: 'Low Risk',
  4: 'Not Available',
  5: 'Unknown'
};

// Function to calculate the risk assessment based on the predicted value and thresholds
function calculateRiskAssessment(predictedValue, thresholds) {
  if (predictedValue === 'NA') {
    return riskLevelLabels[4]; // Not Available
  }

  if (predictedValue < 0) {
    return riskLevelLabels[5]; // Unknown
  }

  if (predictedValue >= thresholds.veryHigh) {
    return riskLevelLabels[0]; // Very High Risk
  } else if (predictedValue >= thresholds.high) {
    return riskLevelLabels[1]; // High Risk
  } else if (predictedValue >= thresholds.moderate) {
    return riskLevelLabels[2]; // Moderate Risk
  } else {
    return riskLevelLabels[3]; // Low Risk
  }
}

// Display the predictions, errors, and risk assessment in a table
var predictionsTable = document.getElementById('predictions-table');

// Create the header row
var headerRow = document.createElement('tr');
headerRow.innerHTML = '<th>Target</th><th>Predicted ± Error</th><th>Risk Assessment</th><th>Normal Range</th>';
predictionsTable.appendChild(headerRow);

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
  riskCell.textContent = riskAssessment;
  riskCell.classList.add(riskAssessment.toLowerCase().replace(/\s+/g, '-'));
  row.appendChild(riskCell);

  // Range cell
  var rangeCell = document.createElement('td');
  rangeCell.textContent = metric.range;
  row.appendChild(rangeCell);

  predictionsTable.appendChild(row);
});

// Retrieve the canvas element
// Retrieve the canvas element
var canvas = document.getElementById('lineChart');

// Create an array to store the labels for the x-axis (biomarkers)
var labels = [];

// Create an array to store the biomarker values
var biomarkerData = [];

// Iterate over the performanceMetrics array to populate the labels and biomarkerData arrays
performanceMetrics.forEach(function(metric) {
  labels.push(metric.target);
  var predictedValue = parseFloat(predictionsArray[performanceMetrics.indexOf(metric)]);
  biomarkerData.push(predictedValue);
});

// Create an array to store the datasets for the line chart
var datasets = [{
  label: 'Biomarkers',
  data: biomarkerData,
  fill: false
}];

// Calculate the high range values
var highRangeData = performanceMetrics.map(function(metric) {
  var thresholds = metric.thresholds;
  return thresholds.high;
});

// Add the high range dataset
datasets.push({
  label: 'Moderated Area Distribution',
  data: highRangeData,
  borderColor: 'rgba(255, 0, 0, 0)', // Set border color to transparent
  backgroundColor: 'rgba(152, 255, 153, 0.8)', // Set background color for the area above high range line
  fill: 'start' // Fill the area from the start point
});

// Create the chart
var lineChart = new Chart(canvas, {
  type: 'line',
  data: {
    labels: labels,
    datasets: datasets
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Biomarker Value'
        }
      }
    }
  }
});
