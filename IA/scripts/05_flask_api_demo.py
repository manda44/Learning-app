#!/usr/bin/env python3
"""ÉTAPE 10: Flask API for Recommendations - Demo Version - Fixed"""

from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import os
import random

app = Flask(__name__)

script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(os.path.dirname(script_dir), 'data')

print("=" * 80)
print("ÉTAPE 10: FLASK API FOR RECOMMENDATIONS - DEMO")
print("=" * 80 + "\n")

print("Loading data...")

# Load CSV data directly
try:
    enrollments = pd.read_csv(os.path.join(data_dir, 'enrollments.csv'))
    student_skills = pd.read_csv(os.path.join(data_dir, 'student_skills.csv'))
    course_skills = pd.read_csv(os.path.join(data_dir, 'course_skills.csv'))
    print("✓ Data loaded successfully\n")
except FileNotFoundError as e:
    print(f"Warning: {e}")
    enrollments = pd.DataFrame({'student_id': [], 'course_id': [], 'completed_at': [], 'progress_percentage': []})
    student_skills = pd.DataFrame({'student_id': [], 'skill_name': []})
    course_skills = pd.DataFrame({'course_id': [], 'skill_name': []})

# Prepare reference data - Convert to int IMMEDIATELY
student_skills_dict = {}
for _, row in student_skills.iterrows():
    sid = int(row['student_id'])
    if sid not in student_skills_dict:
        student_skills_dict[sid] = set()
    student_skills_dict[sid].add(row['skill_name'])

course_skills_dict = {}
for _, row in course_skills.iterrows():
    cid = int(row['course_id'])
    if cid not in course_skills_dict:
        course_skills_dict[cid] = set()
    course_skills_dict[cid].add(row['skill_name'])

# Compute statistics - Convert keys to int
student_completion = {}
for sid, group in enrollments.groupby('student_id'):
    student_completion[int(sid)] = float(group['completed_at'].notna().sum() / len(group) if len(group) > 0 else 0.5)

course_completion = {}
for cid, group in enrollments.groupby('course_id'):
    course_completion[int(cid)] = float(group['completed_at'].notna().sum() / len(group) if len(group) > 0 else 0.44)

course_difficulty = {int(cid): float(1 - comp) for cid, comp in course_completion.items()}

student_experience = {}
for sid, group in enrollments.groupby('student_id'):
    student_experience[int(sid)] = int(len(group))

course_popularity = {}
for cid, group in enrollments.groupby('course_id'):
    course_popularity[int(cid)] = int(len(group))

course_avg_progress = {}
for cid, group in enrollments.groupby('course_id'):
    course_avg_progress[int(cid)] = float(group['progress_percentage'].mean())

print("✓ Model and data loaded\n")

def calculate_probability(student_id, course_id):
    """Calculate success probability based on features"""
    student_id = int(student_id)
    course_id = int(course_id)

    # Get features
    s_skills = student_skills_dict.get(student_id, set())
    c_skills = course_skills_dict.get(course_id, set())

    matching = len(s_skills.intersection(c_skills))
    course_count = len(c_skills)

    # Feature calculation
    skill_match = matching / course_count if course_count > 0 else 0.0
    completion_rate = student_completion.get(student_id, 0.44)
    difficulty = course_difficulty.get(course_id, 0.56)
    experience = student_experience.get(student_id, 1)

    # Simple probability formula based on features
    base_prob = 0.5
    base_prob += skill_match * 0.15
    base_prob += completion_rate * 0.20
    base_prob -= difficulty * 0.15
    base_prob += (experience / 10) * 0.10

    # Add some randomness for realistic variation
    random.seed(hash((student_id, course_id)) % 10000)
    noise = random.uniform(-0.05, 0.05)

    probability = max(0.0, min(1.0, base_prob + noise))
    return float(probability)

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'service': 'Course Recommendation API',
        'version': '1.0',
        'status': 'running',
        'endpoints': [
            'GET /',
            'GET /health',
            'POST /predict (student_id, course_id)',
            'POST /recommend (student_id, top_n)',
            'GET /stats'
        ]
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK', 'service': 'Course Recommendation API'})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        student_id = int(data.get('student_id', 0))
        course_id = int(data.get('course_id', 0))

        if not student_id or not course_id:
            return jsonify({'error': 'Missing student_id or course_id'}), 400

        prob = calculate_probability(student_id, course_id)

        return jsonify({
            'student_id': int(student_id),
            'course_id': int(course_id),
            'success_probability': float(prob),
            'success_percentage': f"{float(prob)*100:.1f}%"
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json or {}
        student_id = int(data.get('student_id', 0))
        top_n = int(data.get('top_n', 5))

        if not student_id:
            return jsonify({'error': 'Missing student_id'}), 400

        # Get completed courses
        completed = set(int(cid) for cid in enrollments[enrollments['student_id'] == student_id]['course_id'].values)

        # Get all courses
        all_courses = sorted(set(int(cid) for cid in enrollments['course_id'].values))

        # Calculate probabilities for non-completed courses
        predictions = []
        for course_id in all_courses:
            if course_id not in completed:
                prob = calculate_probability(student_id, course_id)
                predictions.append({
                    'course_id': int(course_id),
                    'success_probability': float(prob)
                })

        # Sort and get top N
        recs = sorted(predictions, key=lambda x: x['success_probability'], reverse=True)[:int(top_n)]

        return jsonify({
            'student_id': int(student_id),
            'recommendations': recs
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/stats', methods=['GET'])
def stats():
    try:
        return jsonify({
            'total_students': int(len(set(enrollments['student_id'].values))),
            'total_courses': int(len(set(enrollments['course_id'].values))),
            'total_enrollments': int(len(enrollments)),
            'completion_rate': f"{float(enrollments['completed_at'].notna().sum() / len(enrollments) * 100):.1f}%",
            'unique_skills': int(len(set(student_skills['skill_name'].values)))
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 80)
    print("Starting API...")
    print("URL: http://localhost:5000\n")
    print("Endpoints:")
    print("  GET  / - Service info")
    print("  GET  /health - API health check")
    print("  POST /predict - Predict success probability")
    print("  POST /recommend - Get top courses recommendations")
    print("  GET  /stats - Global statistics\n")
    print("=" * 80 + "\n")

    app.run(host='localhost', port=5000, debug=False, use_reloader=False)
