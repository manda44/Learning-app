#!/usr/bin/env python3
"""ÉTAPE 10: Flask API for Recommendations"""

from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import os
import pickle
from tensorflow import keras

app = Flask(__name__)

script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(os.path.dirname(script_dir), 'data')
models_dir = os.path.join(os.path.dirname(script_dir), 'models')

print("Loading model and data...")
model = keras.models.load_model(os.path.join(models_dir, 'recommendation_model.h5'))
with open(os.path.join(data_dir, 'scaler.pkl'), 'rb') as f:
    scaler = pickle.load(f)

enrollments = pd.read_csv(os.path.join(data_dir, 'enrollments.csv'))
student_skills = pd.read_csv(os.path.join(data_dir, 'student_skills.csv'))
course_skills = pd.read_csv(os.path.join(data_dir, 'course_skills.csv'))

# Prepare reference data
student_skills_dict = {int(sid): set() for sid in student_skills['student_id'].unique()}
for _, row in student_skills.iterrows():
    student_skills_dict[int(row['student_id'])].add(row['skill_name'])

course_skills_dict = {int(cid): set() for cid in course_skills['course_id'].unique()}
for _, row in course_skills.iterrows():
    course_skills_dict[int(row['course_id'])].add(row['skill_name'])

student_completion = enrollments.groupby('student_id').apply(
    lambda x: x['completed_at'].notna().sum() / len(x)
).to_dict()

course_completion = enrollments.groupby('course_id').apply(
    lambda x: x['completed_at'].notna().sum() / len(x)
).to_dict()

course_difficulty = {cid: 1 - comp for cid, comp in course_completion.items()}
student_experience = enrollments.groupby('student_id').size().to_dict()
course_popularity = enrollments.groupby('course_id').size().to_dict()
course_avg_progress = enrollments.groupby('course_id')['progress_percentage'].mean().to_dict()

print("✓ Model and data loaded\n")

def create_features(student_id, course_id):
    s_skills = student_skills_dict.get(student_id, set())
    c_skills = course_skills_dict.get(course_id, set())
    matching = len(s_skills.intersection(c_skills))
    course_count = len(c_skills)
    return np.array([
        course_avg_progress.get(course_id, 50),
        matching / course_count if course_count > 0 else 0.0,
        len(s_skills),
        course_count,
        matching,
        student_completion.get(student_id, 0.5),
        course_difficulty.get(course_id, 0.5),
        student_experience.get(student_id, 0),
        course_popularity.get(course_id, 0),
        course_avg_progress.get(course_id, 50)
    ])

def create_features_custom(student_skills, completion_rate, experience, course_id):
    """Create features for recommendations without student_id"""
    s_skills = set(student_skills)
    c_skills = course_skills_dict.get(course_id, set())
    matching = len(s_skills.intersection(c_skills))
    course_count = len(c_skills)
    return np.array([
        course_avg_progress.get(course_id, 50),
        matching / course_count if course_count > 0 else 0.0,
        len(s_skills),
        course_count,
        matching,
        completion_rate,
        course_difficulty.get(course_id, 0.5),
        experience,
        course_popularity.get(course_id, 0),
        course_avg_progress.get(course_id, 50)
    ])

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'service': 'Course Recommendation API',
        'version': '1.0',
        'endpoints': [
            'GET /health',
            'POST /predict (student_id, course_id)',
            'POST /recommend (student_id, top_n)',
            'POST /recommend-custom (skills, completion_rate, experience, top_n)',
            'GET /stats'
        ]
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK'})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        student_id = data.get('student_id')
        course_id = data.get('course_id')
        if not student_id or not course_id:
            return jsonify({'error': 'Missing student_id or course_id'}), 400
        features = create_features(student_id, course_id)
        features_scaled = scaler.transform([features])[0]
        prob = model.predict(np.array([features_scaled]), verbose=0)[0][0]
        return jsonify({
            'student_id': int(student_id),
            'course_id': int(course_id),
            'success_probability': float(prob),
            'success_percentage': f"{prob*100:.1f}%"
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json
        student_id = data.get('student_id')
        top_n = data.get('top_n', 5)
        if not student_id:
            return jsonify({'error': 'Missing student_id'}), 400

        completed = set(int(cid) for cid in enrollments[enrollments['student_id'] == student_id]['course_id'].unique())
        predictions = []
        all_courses = sorted(set(int(cid) for cid in enrollments['course_id'].unique()))

        for course_id in all_courses:
            if course_id not in completed:
                features = create_features(student_id, course_id)
                features_scaled = scaler.transform([features])[0]
                prob = model.predict(np.array([features_scaled]), verbose=0)[0][0]
                predictions.append({'course_id': int(course_id), 'success_probability': float(prob)})

        recs = sorted(predictions, key=lambda x: x['success_probability'], reverse=True)[:top_n]
        return jsonify({
            'student_id': int(student_id),
            'recommendations': [{'course_id': int(r['course_id']), 'success_probability': float(r['success_probability'])} for r in recs]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommend-custom', methods=['POST'])
def recommend_custom():
    try:
        data = request.json
        skills = data.get('skills')
        completion_rate = data.get('completion_rate')
        experience = data.get('experience')
        top_n = data.get('top_n', 5)

        if not skills or completion_rate is None or experience is None:
            return jsonify({'error': 'Missing skills, completion_rate, or experience'}), 400

        if not isinstance(skills, list):
            return jsonify({'error': 'skills must be a list'}), 400

        if not isinstance(completion_rate, (int, float)) or not 0 <= completion_rate <= 1:
            return jsonify({'error': 'completion_rate must be between 0 and 1'}), 400

        if not isinstance(experience, int) or experience < 0:
            return jsonify({'error': 'experience must be a non-negative integer'}), 400

        predictions = []
        all_courses = sorted(set(int(cid) for cid in enrollments['course_id'].unique()))

        for course_id in all_courses:
            features = create_features_custom(skills, completion_rate, experience, course_id)
            features_scaled = scaler.transform([features])[0]
            prob = model.predict(np.array([features_scaled]), verbose=0)[0][0]
            predictions.append({'course_id': int(course_id), 'success_probability': float(prob)})

        recs = sorted(predictions, key=lambda x: x['success_probability'], reverse=True)[:top_n]
        return jsonify({
            'input': {
                'skills': skills,
                'completion_rate': completion_rate,
                'experience': experience
            },
            'recommendations': [{'course_id': int(r['course_id']), 'success_probability': float(r['success_probability'])} for r in recs]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/stats', methods=['GET'])
def stats():
    try:
        return jsonify({
            'total_students': int(len(set(enrollments['student_id'].unique()))),
            'total_courses': int(len(set(enrollments['course_id'].unique()))),
            'total_enrollments': int(len(enrollments)),
            'completion_rate': f"{(enrollments['completed_at'].notna().sum() / len(enrollments) * 100):.1f}%",
            'unique_skills': int(len(set(student_skills['skill_name'].unique())))
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 80)
    print("ÉTAPE 10: FLASK API FOR RECOMMENDATIONS")
    print("=" * 80 + "\n")
    print("🚀 Starting API...")
    print("📍 URL: http://localhost:5000\n")
    print("Endpoints:")
    print("  POST /predict - Predict success probability")
    print("  POST /recommend - Get top courses recommendations (with student_id)")
    print("  POST /recommend-custom - Get recommendations without student_id")
    print("  GET  /stats - Global statistics\n")
    app.run(host='localhost', port=5000, debug=False)
