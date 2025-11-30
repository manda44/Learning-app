#!/usr/bin/env python3
"""
============================================================================
ÉTAPE 6: Load and Inspect Data - 01_prepare_data.py
============================================================================

Charger les 3 fichiers CSV et afficher des statistiques de base
"""

import pandas as pd
import numpy as np
import os

print("=" * 80)
print("ÉTAPE 6: CHARGER ET INSPECTER LES DONNÉES")
print("=" * 80)
print()

# ============================================================================
# 1. CHARGER LES DONNÉES
# ============================================================================
print("1️⃣  Chargement des données...")
print("-" * 80)

# Déterminer le chemin du dossier data
script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
data_dir = os.path.join(project_dir, 'data')

# Charger les CSV
enrollments = pd.read_csv(os.path.join(data_dir, 'enrollments.csv'))
student_skills = pd.read_csv(os.path.join(data_dir, 'student_skills.csv'))
course_skills = pd.read_csv(os.path.join(data_dir, 'course_skills.csv'))

print(f"✓ enrollments.csv: {len(enrollments)} rows")
print(f"✓ student_skills.csv: {len(student_skills)} rows")
print(f"✓ course_skills.csv: {len(course_skills)} rows")
print()

# ============================================================================
# 2. AFFICHER LES PREMIERS ENREGISTREMENTS
# ============================================================================
print("2️⃣  Aperçu des données")
print("-" * 80)

print("\n📊 ENROLLMENTS:")
print(enrollments.head())
print(f"   Colonnes: {list(enrollments.columns)}")
print(f"   Types: {dict(enrollments.dtypes)}")

print("\n📊 STUDENT_SKILLS:")
print(student_skills.head())
print(f"   Colonnes: {list(student_skills.columns)}")

print("\n📊 COURSE_SKILLS:")
print(course_skills.head())
print(f"   Colonnes: {list(course_skills.columns)}")
print()

# ============================================================================
# 3. STATISTIQUES DESCRIPTIVES
# ============================================================================
print("3️⃣  Statistiques descriptives")
print("-" * 80)

print("\n📈 ENROLLMENTS Statistics:")
print(f"   - Total rows: {len(enrollments)}")
print(f"   - Unique students: {enrollments['student_id'].nunique()}")
print(f"   - Unique courses: {enrollments['course_id'].nunique()}")
print(f"   - Progress (min-max): {enrollments['progress_percentage'].min()}-{enrollments['progress_percentage'].max()}%")
print(f"   - Progress (mean): {enrollments['progress_percentage'].mean():.2f}%")
print(f"   - Completed enrollments: {enrollments['completed_at'].notna().sum()}")
print(f"   - In-progress enrollments: {enrollments['completed_at'].isna().sum()}")

completion_rate = enrollments['completed_at'].notna().sum() / len(enrollments) * 100
print(f"   - Completion rate: {completion_rate:.1f}%")

print("\n📈 STUDENT_SKILLS Statistics:")
print(f"   - Total pairs: {len(student_skills)}")
print(f"   - Unique students: {student_skills['student_id'].nunique()}")
print(f"   - Unique skills: {student_skills['skill_name'].nunique()}")
print(f"   - Skills per student (avg): {len(student_skills) / student_skills['student_id'].nunique():.2f}")

print("\n📈 COURSE_SKILLS Statistics:")
print(f"   - Total pairs: {len(course_skills)}")
print(f"   - Unique courses: {course_skills['course_id'].nunique()}")
print(f"   - Unique skills: {course_skills['skill_name'].nunique()}")
print(f"   - Skills per course (avg): {len(course_skills) / course_skills['course_id'].nunique():.2f}")
print()

# ============================================================================
# 4. VÉRIFIER LES VALEURS MANQUANTES
# ============================================================================
print("4️⃣  Vérification des valeurs manquantes")
print("-" * 80)

print("\n🔍 ENROLLMENTS Missing Values:")
for col in enrollments.columns:
    missing = enrollments[col].isna().sum()
    if missing > 0:
        print(f"   - {col}: {missing} missing ({missing/len(enrollments)*100:.1f}%)")
if enrollments.isna().sum().sum() == 0:
    print("   ✓ No missing values (except expected nulls in completed_at)")

print("\n🔍 STUDENT_SKILLS Missing Values:")
if student_skills.isna().sum().sum() == 0:
    print("   ✓ No missing values")
else:
    print(student_skills.isna().sum())

print("\n🔍 COURSE_SKILLS Missing Values:")
if course_skills.isna().sum().sum() == 0:
    print("   ✓ No missing values")
else:
    print(course_skills.isna().sum())
print()

# ============================================================================
# 5. DISTRIBUTION DES DONNÉES
# ============================================================================
print("5️⃣  Distribution des données")
print("-" * 80)

print("\n📊 Progress Distribution:")
bins = [0, 25, 50, 75, 100]
labels = ['0-25%', '26-50%', '51-75%', '76-100%']
progress_dist = pd.cut(enrollments['progress_percentage'], bins=bins, labels=labels, right=True)
print(progress_dist.value_counts().sort_index())

print("\n📊 Completion Status:")
status = enrollments['completed_at'].notna()
print(f"   Completed: {status.sum()} ({status.sum()/len(enrollments)*100:.1f}%)")
print(f"   In-progress: {(~status).sum()} ({(~status).sum()/len(enrollments)*100:.1f}%)")

print("\n📊 Top 10 Skills:")
print(student_skills['skill_name'].value_counts().head(10))
print()

# ============================================================================
# 6. ANALYSE DE COUVERTURE
# ============================================================================
print("6️⃣  Analyse de couverture")
print("-" * 80)

# Students in both datasets
students_enrollments = set(enrollments['student_id'].unique())
students_skills = set(student_skills['student_id'].unique())
students_both = students_enrollments.intersection(students_skills)

print(f"\n👥 Student Coverage:")
print(f"   - In enrollments: {len(students_enrollments)}")
print(f"   - In skills: {len(students_skills)}")
print(f"   - In both: {len(students_both)} ({len(students_both)/len(students_enrollments)*100:.1f}%)")
print(f"   - Missing skills: {len(students_enrollments) - len(students_both)} students")

# Courses in both datasets
courses_enrollments = set(enrollments['course_id'].unique())
courses_skills = set(course_skills['course_id'].unique())
courses_both = courses_enrollments.intersection(courses_skills)

print(f"\n📚 Course Coverage:")
print(f"   - In enrollments: {len(courses_enrollments)}")
print(f"   - In skills: {len(courses_skills)}")
print(f"   - In both: {len(courses_both)} ({len(courses_both)/len(courses_enrollments)*100:.1f}%)")
print()

# ============================================================================
# 7. SAUVEGARDE POUR PROCHAINE ÉTAPE
# ============================================================================
print("7️⃣  Sauvegarde des données")
print("-" * 80)

# Sauvegarder pour feature engineering
enrollments.to_pickle(os.path.join(data_dir, 'enrollments.pkl'))
student_skills.to_pickle(os.path.join(data_dir, 'student_skills.pkl'))
course_skills.to_pickle(os.path.join(data_dir, 'course_skills.pkl'))

print("✓ Données sauvegardées en pickle format pour ÉTAPE 7")
print()

# ============================================================================
# 8. RÉSUMÉ
# ============================================================================
print("=" * 80)
print("✅ ÉTAPE 6 COMPLÉTÉE")
print("=" * 80)
print()
print("RÉSUMÉ:")
print(f"  • {len(enrollments)} enrollments chargés")
print(f"  • {len(student_skills)} student-skill pairs chargés")
print(f"  • {len(course_skills)} course-skill pairs chargés")
print(f"  • {len(students_enrollments)} étudiants uniques")
print(f"  • {len(courses_enrollments)} cours uniques")
print(f"  • {completion_rate:.1f}% des cours complétés")
print()
print("Prochaine étape: ÉTAPE 7 - 02_create_features.py")
print("  Créer les 10 features pour le modèle ML")
print()
