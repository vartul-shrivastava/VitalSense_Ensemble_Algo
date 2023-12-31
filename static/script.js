document.addEventListener('DOMContentLoaded', function() {
  var overlay = document.getElementById('disclaimer-overlay');
  var closeBtn = document.getElementById('close-btn');

  closeBtn.addEventListener('click', function() {
      overlay.style.display = 'none';
  });
});

document.getElementById('submit-btn').addEventListener('click', function() {
  var checkbox = document.getElementById('checkbox-agree');
  if (!checkbox.checked) {
    alert('VitalSense says: Please tick the checkbox to proceed.');
    return;
  }
  // Add sliding animation
  var overlay = document.getElementById('disclaimer-overlay');
  overlay.classList.add('slide-out');
  setTimeout(function() {
    overlay.style.display = 'none';
  }, 500); // Adjust the duration of the animation as needed (in milliseconds)
});


document.getElementById('close-btn').addEventListener('click', function() {
  // Redirect to the Google homepage
  window.location.href = 'https://www.google.com';
});


var questionIndex = 0;
var questions = [
"Enter the body weight (kg)",
"Enter the height (cm)",
"Enter the leg length (cm)",
"Enter the arm length (cm)",
"Enter the arm circumference (cm)",
"Enter the waist circumference (cm)",
"What is your gender? (1 for Male / 2 for Female)",
"What is your age? (years)",
"Does your work involve vigorous-intensity activity that causes large increases in breathing or heart rate like carrying or lifting heavy loads, digging or construction work for at least 10 minutes continuously? (1 for yes / 2 for no)",
"How much time do you spend doing vigorous-intensity activities at work on a typical day? (minutes)",
"How much time do you spend doing moderate-intensity activities at work on a typical day? (minutes)",
"How much time do you spend walking or bicycling for travel on a typical day? (minutes)",
"How much time do you spend doing vigorous-intensity sports, fitness, or recreational activities on a typical day? (minutes)",
"How much time do you usually spend sitting on a typical day? (minutes)",
"How many hours do you watch TV or videos in the past 30 days? (hours)",
"How many hours do you use a computer in the past 30 days? (hours)"
];

var averageValues = [
70.2,   // Average body weight (kg)
180.3,  // Average height (cm)
55.6,   // Average leg length (cm)
30.7,   // Average arm length (cm)
25.6,   // Average arm circumference (cm)
86.8,   // Average waist circumference (cm)
1,    // Average gender (1 for Male / 2 for Female)
25,   // Average age (years)
2,      // Average work involvement in vigorous-intensity activity (1 for yes / 2 for no)
60.5,   // Average time spent in vigorous-intensity activities at work (minutes)
150,   // Average time spent in moderate-intensity activities at work (minutes)
20,   // Average time spent walking or bicycling for travel (minutes)
30,   // Average time spent in vigorous-intensity sports, fitness, or recreational activities (minutes)
200,  // Average time spent sitting (minutes)
60,    // Average hours watched TV or videos in the past 30 days (hours)
180     // Average hours used a computer in the past 30 days (hours)
];

var progressSlider = document.getElementById('progress-slider');
var progressPercent = document.getElementById('progress-percent');
var questionElement = document.getElementById('question');
var answerInput = document.getElementById('answer');
var nextButton = document.getElementById('next-btn');

var answers = [];

function showQuestion() {
questionElement.classList.remove('question-enter');
questionElement.classList.add('question-exit');
setTimeout(function() {
  questionElement.textContent = questions[questionIndex];
  answerInput.value = answers[questionIndex] || '';
  answerInput.placeholder = "Healthy Individual Corresponding Value: " + averageValues[questionIndex];
  updateProgress();
  questionElement.classList.remove('question-exit');
  questionElement.classList.add('question-enter');
}, 300);
}

answerInput.addEventListener('input', function() {
answerInput.placeholder = "Average Value: " + averageValues[questionIndex];
});

answerInput.addEventListener('keydown', function(event) {
if (event.key === 'Enter') {
  showNextQuestion();
}
});

function updateProgress() {
var progress = ((questionIndex + 1) / questions.length) * 100;
progressSlider.style.width = progress + '%';
progressPercent.textContent = Math.floor(progress) + '%';
}

function showNextQuestion() {
if (questionIndex < questions.length - 1) {
  // Store the user's answer for the current question
  answers[questionIndex] = parseFloat(answerInput.value);

  questionIndex++;
  showQuestion();
} else {
  // Handle the end of the questions
  // Store the user's answer for the last question
  answers[questionIndex] = parseFloat(answerInput.value);

  // Show the loading screen
  showLoadingScreen();

  // Pass the answers to the machine learning model for prediction
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/predict');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // Retrieve the array of predictions from the response
        var predictions = JSON.parse(xhr.responseText);
        // Convert the array of predictions to a string
        var predictionString = predictions.join(',');
        // Redirect to the result page with the predictions as a URL parameter
        window.location.href = '/result?predictions=' + encodeURIComponent(predictionString);
      } else {
        // Handle the error case
        alert('Error occurred during prediction. Please try again.');
      }

    }
  };
  xhr.send(JSON.stringify(answers));
}
}

function showLoadingScreen() {
// Create a loading screen element
var loadingScreen = document.createElement('div');
loadingScreen.className = 'loading-screen';

// Create an image element for the logo
var logoImage = document.createElement('img');
logoImage.src = ""; // Replace 'path/to/logo.png' with the actual path to your logo image
logoImage.className = 'logo-image';

// Create a text element for the loading message
var loadingText = document.createElement('div');
loadingText.innerHTML = 'Ensemble Model is Predicting...(ETA: 15s)';
loadingText.className = 'loading-text';

// Append the logo image and loading text to the loading screen element
loadingScreen.appendChild(logoImage);
loadingScreen.appendChild(loadingText);

// Append the loading screen to the body
document.body.appendChild(loadingScreen);
}

nextButton.addEventListener('click', showNextQuestion);

// Show the initial question
showQuestion();