import pickle
import numpy as np
from flask import Flask, render_template, request, jsonify
target_cols = ['Glycohemoglobin',
       'Insulin (pmol/L)', 'HDL cholesterol (mg/dL)',
       'Total cholesterol (mg/dL)', 'Triglycerides (mg/dL)',
       'LDL cholesterol (mg/dL)', 'Trunk Fat (%)','Total Fat (%)']

app = Flask(__name__)

with open('models.pkl', 'rb') as file:
    models = pickle.load(file)

with open('scaler.pkl', 'rb') as file:
    scaler = pickle.load(file)
    
# Create Flask application
app = Flask(__name__)

# Define route for the homepage
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = np.array(request.json)
    data_reshaped = data.reshape(1, -1)
    # Scale the input features using the loaded scaler
    sample_data_scaled = scaler.transform(data_reshaped)
    predictions = {}

    # Make predictions using the loaded XGBoost models for each target column
    for col in target_cols:
        xgb_model = models[col]
        y_pred = xgb_model.predict(sample_data_scaled)
        predictions[col] = y_pred

    # Convert the predictions to a list
    predictions_list = [predictions[col].tolist() for col in target_cols]

    # Return the predictions as JSON
    return jsonify(predictions_list)

# Define a new route to handle displaying the prediction result
@app.route('/result')
def show_result():
    # Get the prediction value from the URL parameters
    prediction = request.args.get('prediction')
    # Render the result.html template and pass the prediction value to it
    return render_template('result.html', prediction=prediction)

# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True)