#!/usr/bin/env python3
"""
============================================================================
ÉTAPE 7: Engineer Features - 02_create_features.py
============================================================================

Créer les 10 features pour le modèle de recommandation
Feature Engineering + Normalisation + Train/Val/Test Split
"""

import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

print("=" * 80)
print("ÉTAPE 7: CRÉER LES 10 FEATURES POUR LE MODÈLE ML")
print("=" * 80)
print()

# ============================================================================
# 1. CHARGER LES DONNÉES
# ============================================================================
print("1️⃣  Chargement des données...")
print("-" * 80)

script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
data_dir = os.path.join(project_dir, 'data')

enrollments = pd.read_csv(os.path.join(data_dir, 'enrollments.csv'))
student_skills = pd.read_csv(os.path.join(data_dir, 'student_skills.csv'))
course_skills = pd.read_csv(os.path.join(data_dir, 'course_skills.csv'))

print(f"✓ Chargé {len(enrollments)} enrollments")
print(f"✓ Chargé {len(student_skills)} student skills")
print(f"✓ Chargé {len(course_skills)} course skills")
print()

# ============================================================================
# 2. CRÉER LA TARGET VARIABLE (is_completed)
# ============================================================================
print("2️⃣  Créer la variable target: is_completed")
print("-" * 80)

enrollments['is_completed'] = enrollments['completed_at'].notna().astype(int)

print(f"✓ Target créée")
print(f"  - Completed (1): {(enrollments['is_completed'] == 1).sum()}")
print(f"  - In-progress (0): {(enrollments['is_completed'] == 0).sum()}")
print()

# ============================================================================
# 3. CRÉER LES 10 FEATURES
# ============================================================================
print("3️⃣  Créer les 10 features")
print("-" * 80)

data = enrollments[['student_id', 'course_id', 'progress_percentage', 'is_completed']].copy()

# Feature 1: progress_percentage
data['feature_1_progress'] = enrollments['progress_percentage']

# Créer dictionnaires
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

# Features 2-5: Skill matching
data['feature_2_skill_match_ratio'] = 0.0
data['feature_3_student_skill_count'] = 0
data['feature_4_course_skill_count'] = 0
data['feature_5_matching_skills'] = 0

for idx, row in data.iterrows():
    student_id = row['student_id']
    course_id = row['course_id']
    s_skills = student_skills_dict.get(student_id, set())
    c_skills = course_skills_dict.get(course_id, set())
    matching = len(s_skills.intersection(c_skills))
    course_count = len(c_skills)

    if course_count > 0:
        data.at[idx, 'feature_2_skill_match_ratio'] = matching / course_count
    else:
        data.at[idx, 'feature_2_skill_match_ratio'] = 0.0

    data.at[idx, 'feature_3_student_skill_count'] = len(s_skills)
    data.at[idx, 'feature_4_course_skill_count'] = course_count
    data.at[idx, 'feature_5_matching_skills'] = matching

print(f"✓ Features 1-5 créées")

# Feature 6: student_completion_rate
student_completion = enrollments.groupby('student_id').apply(
    lambda x: x['is_completed'].sum() / len(x) if len(x) > 0 else 0
).to_dict()
data['feature_6_student_completion_rate'] = data['student_id'].map(
    lambda x: student_completion.get(x, 0)
)

# Feature 7: course_difficulty
course_completion = enrollments.groupby('course_id').apply(
    lambda x: x['is_completed'].sum() / len(x) if len(x) > 0 else 0
).to_dict()
course_difficulty = {cid: 1 - comp_rate for cid, comp_rate in course_completion.items()}
data['feature_7_course_difficulty'] = data['course_id'].map(
    lambda x: course_difficulty.get(x, 0.5)
)

# Feature 8: student_experience
student_experience = enrollments.groupby('student_id').size().to_dict()
data['feature_8_student_experience'] = data['student_id'].map(
    lambda x: student_experience.get(x, 0)
)

# Feature 9: course_popularity
course_popularity = enrollments.groupby('course_id').size().to_dict()
data['feature_9_course_popularity'] = data['course_id'].map(
    lambda x: course_popularity.get(x, 0)
)

# Feature 10: course_avg_progress
course_avg_progress = enrollments.groupby('course_id')['progress_percentage'].mean().to_dict()
data['feature_10_course_avg_progress'] = data['course_id'].map(
    lambda x: course_avg_progress.get(x, 50)
)

print(f"✓ Features 6-10 créées")
print()

# ============================================================================
# 4. NORMALISER LES FEATURES
# ============================================================================
print("4️⃣  Normaliser les features")
print("-" * 80)

feature_cols = [
    'feature_1_progress',
    'feature_2_skill_match_ratio',
    'feature_3_student_skill_count',
    'feature_4_course_skill_count',
    'feature_5_matching_skills',
    'feature_6_student_completion_rate',
    'feature_7_course_difficulty',
    'feature_8_student_experience',
    'feature_9_course_popularity',
    'feature_10_course_avg_progress'
]

X = data[feature_cols].copy()
y = data['is_completed'].copy()

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_scaled = pd.DataFrame(X_scaled, columns=feature_cols)

print(f"✓ Features normalisées avec StandardScaler")
print()

# ============================================================================
# 5. SPLIT TRAIN/VALIDATION/TEST
# ============================================================================
print("5️⃣  Split Train/Validation/Test (70/15/15)")
print("-" * 80)

X_train, X_temp, y_train, y_temp = train_test_split(
    X_scaled, y, test_size=0.30, random_state=42, stratify=y
)

X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
)

print(f"✓ Data split complété")
print(f"  - Training: {len(X_train)} ({len(X_train)/len(X_scaled)*100:.1f}%)")
print(f"  - Validation: {len(X_val)} ({len(X_val)/len(X_scaled)*100:.1f}%)")
print(f"  - Test: {len(X_test)} ({len(X_test)/len(X_scaled)*100:.1f}%)")
print()

# ============================================================================
# 6. SAUVEGARDER
# ============================================================================
print("6️⃣  Sauvegarder les données préparées")
print("-" * 80)

np.save(os.path.join(data_dir, 'X_train.npy'), X_train)
np.save(os.path.join(data_dir, 'X_val.npy'), X_val)
np.save(os.path.join(data_dir, 'X_test.npy'), X_test)
np.save(os.path.join(data_dir, 'y_train.npy'), y_train)
np.save(os.path.join(data_dir, 'y_val.npy'), y_val)
np.save(os.path.join(data_dir, 'y_test.npy'), y_test)

import pickle
with open(os.path.join(data_dir, 'scaler.pkl'), 'wb') as f:
    pickle.dump(scaler, f)

print("✓ Données sauvegardées")
print()

print("=" * 80)
print("✅ ÉTAPE 7 COMPLÉTÉE")
print("=" * 80)
print()
