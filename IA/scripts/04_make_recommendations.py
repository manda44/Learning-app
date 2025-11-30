#!/usr/bin/env python3
"""ÉTAPE 9: Make Recommendations"""

import pandas as pd
import numpy as np
import os
import pickle
from tensorflow import keras

print("=" * 80)
print("ÉTAPE 9: FAIRE DES RECOMMANDATIONS AVEC LE MODÈLE")
print("=" * 80 + "\n")

script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(os.path.dirname(script_dir), 'data')
models_dir = os.path.join(os.path.dirname(script_dir), 'models')

# Load data
enrollments = pd.read_csv(os.path.join(data_dir, 'enrollments.csv'))
student_skills = pd.read_csv(os.path.join(data_dir, 'student_skills.csv'))
course_skills = pd.read_csv(os.path.join(data_dir, 'course_skills.csv'))
model = keras.models.load_model(os.path.join(models_dir, 'recommendation_model.h5'))
with open(os.path.join(data_dir, 'scaler.pkl'), 'rb') as f:
    scaler = pickle.load(f)

print(f"✓ Model and data loaded\n")

# Prepare reference data
student_skills_dict = {}
for _, row in student_skills.iterrows():
    sid = row['student_id']
    if sid not in student_skills_dict:
        student_skills_dict[sid] = set()
    student_skills_dict[sid].add(row['skill_name'])

course_skills_dict = {}
for _, row in course_skills.iterrows():
    cid = row['course_id']
    if cid not in course_skills_dict:
        course_skills_dict[cid] = set()
    course_skills_dict[cid].add(row['skill_name'])

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

# Generate recommendations
all_students = sorted(set(enrollments['student_id'].unique()) | set(student_skills['student_id'].unique()))
all_courses = sorted(set(enrollments['course_id'].unique()) | set(course_skills['course_id'].unique()))

recommendations_list = []
print(f"Generating predictions for {len(all_students)} students...\n")

for i, student_id in enumerate(all_students):
    if (i + 1) % 100 == 0:
        print(f"  Progress: {i + 1}/{len(all_students)}")

    completed_courses = set(enrollments[enrollments['student_id'] == student_id]['course_id'].unique())

    for course_id in all_courses:
        if course_id not in completed_courses:
            features = create_features(student_id, course_id)
            features_scaled = scaler.transform([features])[0]
            prediction = model.predict(np.array([features_scaled]), verbose=0)[0][0]
            recommendations_list.append({'student_id': student_id, 'course_id': course_id, 'success_probability': float(prediction)})

print(f"Progress: {len(all_students)}/{len(all_students)}\n")

recommendations_df = pd.DataFrame(recommendations_list)
recommendations_df.to_csv(os.path.join(data_dir, 'all_recommendations.csv'), index=False)

# Top recommendations
summary_list = []
for student_id in all_students:
    student_recs = recommendations_df[recommendations_df['student_id'] == student_id]
    top_3 = student_recs.nlargest(3, 'success_probability')
    for rank, (_, row) in enumerate(top_3.iterrows(), 1):
        summary_list.append({'student_id': student_id, 'rank': rank, 'course_id': row['course_id'], 'success_probability': row['success_probability']})

summary_df = pd.DataFrame(summary_list)
summary_df.to_csv(os.path.join(data_dir, 'top_recommendations.csv'), index=False)

print(f"✓ {len(recommendations_df)} recommendations generated")
print(f"✓ Avg success probability: {recommendations_df['success_probability'].mean()*100:.1f}%")
print(f"\n✓ all_recommendations.csv saved")
print(f"✓ top_recommendations.csv saved")
print("✅ ÉTAPE 9 COMPLÉTÉE\n")
