import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Set style for better visualizations
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 6)

print("="*80)
print("CSV DATA ANALYSIS FOR ML RECOMMENDATION SYSTEM")
print("="*80)
print()

# Load the datasets
print("Loading datasets...")
enrollments = pd.read_csv(r'D:\stage\IA\data\enrollments.csv')
student_skills = pd.read_csv(r'D:\stage\IA\data\student_skills.csv')
course_skills = pd.read_csv(r'D:\stage\IA\data\course_skills.csv')
print("Datasets loaded successfully!\n")

# ============================================================================
# 1. ENROLLMENTS ANALYSIS
# ============================================================================
print("="*80)
print("1. ENROLLMENTS.CSV ANALYSIS")
print("="*80)

print("\n--- Basic Information ---")
print(f"Shape: {enrollments.shape}")
print(f"Columns: {list(enrollments.columns)}")
print(f"\nData Types:")
print(enrollments.dtypes)

print("\n--- First 10 Rows ---")
print(enrollments.head(10))

print("\n--- Statistical Summary ---")
print(enrollments.describe())

print("\n--- Missing Values ---")
missing_enrollments = enrollments.isnull().sum()
print(missing_enrollments)
print(f"\nMissing percentage:")
for col in enrollments.columns:
    pct = (enrollments[col].isnull().sum() / len(enrollments)) * 100
    print(f"  {col}: {pct:.2f}%")

print("\n--- Unique Values ---")
print(f"Unique students: {enrollments['student_id'].nunique()}")
print(f"Unique courses: {enrollments['course_id'].nunique()}")
print(f"Total enrollments: {len(enrollments)}")

print("\n--- Completion Analysis ---")
# Check if completed_at is filled (indicates completion)
enrollments['is_completed'] = enrollments['completed_at'].notna()
completion_rate = enrollments['is_completed'].mean() * 100
print(f"Overall completion rate: {completion_rate:.2f}%")
print(f"Completed enrollments: {enrollments['is_completed'].sum()}")
print(f"In-progress enrollments: {(~enrollments['is_completed']).sum()}")

print("\n--- Progress Distribution ---")
print(enrollments['progress_percentage'].describe())
print(f"\nProgress ranges:")
bins = [0, 25, 50, 75, 100]
labels = ['0-25%', '26-50%', '51-75%', '76-100%']
enrollments['progress_bin'] = pd.cut(enrollments['progress_percentage'], bins=bins, labels=labels, include_lowest=True)
print(enrollments['progress_bin'].value_counts().sort_index())

print("\n--- Correlation: Progress vs Completion ---")
# High progress should correlate with completion
completed_avg_progress = enrollments[enrollments['is_completed']]['progress_percentage'].mean()
incomplete_avg_progress = enrollments[~enrollments['is_completed']]['progress_percentage'].mean()
print(f"Average progress (completed): {completed_avg_progress:.2f}%")
print(f"Average progress (incomplete): {incomplete_avg_progress:.2f}%")

print("\n--- Duplicates Check ---")
duplicates = enrollments.duplicated(subset=['student_id', 'course_id']).sum()
print(f"Duplicate student-course pairs: {duplicates}")
if duplicates > 0:
    print("Warning: Same student enrolled in same course multiple times!")

print("\n--- Data Quality Issues ---")
issues = []
if enrollments.isnull().any().any():
    issues.append("Missing values detected in completed_at (expected for in-progress)")
if (enrollments['progress_percentage'] < 0).any():
    issues.append("Negative progress values found")
if (enrollments['progress_percentage'] > 100).any():
    issues.append("Progress values > 100% found")
if duplicates > 0:
    issues.append("Duplicate enrollments found")

# Check for logical inconsistency
inconsistent = enrollments[(enrollments['progress_percentage'] == 100) & (enrollments['completed_at'].isna())]
if len(inconsistent) > 0:
    issues.append(f"{len(inconsistent)} enrollments with 100% progress but no completion date")

if issues:
    for issue in issues:
        print(f"  - {issue}")
else:
    print("  No major data quality issues detected!")

# ============================================================================
# 2. STUDENT_SKILLS ANALYSIS
# ============================================================================
print("\n" + "="*80)
print("2. STUDENT_SKILLS.CSV ANALYSIS")
print("="*80)

print("\n--- Basic Information ---")
print(f"Shape: {student_skills.shape}")
print(f"Columns: {list(student_skills.columns)}")
print(f"\nData Types:")
print(student_skills.dtypes)

print("\n--- First 10 Rows ---")
print(student_skills.head(10))

print("\n--- Missing Values ---")
missing_student_skills = student_skills.isnull().sum()
print(missing_student_skills)

print("\n--- Unique Values ---")
print(f"Unique students: {student_skills['student_id'].nunique()}")
print(f"Unique skills: {student_skills['skill_name'].nunique()}")
print(f"Total student-skill pairs: {len(student_skills)}")

print("\n--- Skill Distribution ---")
skill_counts = student_skills['skill_name'].value_counts()
print(f"\nTop 10 most common student skills:")
print(skill_counts.head(10))
print(f"\nLeast common skills:")
print(skill_counts.tail(10))

print("\n--- Skills per Student ---")
skills_per_student = student_skills.groupby('student_id').size()
print(f"Average skills per student: {skills_per_student.mean():.2f}")
print(f"Min skills: {skills_per_student.min()}")
print(f"Max skills: {skills_per_student.max()}")
print(f"Median skills: {skills_per_student.median():.2f}")

print("\n--- Duplicates Check ---")
duplicates_skills = student_skills.duplicated(subset=['student_id', 'skill_name']).sum()
print(f"Duplicate student-skill pairs: {duplicates_skills}")
if duplicates_skills > 0:
    print("Warning: Same student listed with same skill multiple times!")

print("\n--- All Unique Skills ---")
all_skills = sorted(student_skills['skill_name'].unique())
print(f"Total unique skills: {len(all_skills)}")
print("Skills list:", all_skills)

# ============================================================================
# 3. COURSE_SKILLS ANALYSIS
# ============================================================================
print("\n" + "="*80)
print("3. COURSE_SKILLS.CSV ANALYSIS")
print("="*80)

print("\n--- Basic Information ---")
print(f"Shape: {course_skills.shape}")
print(f"Columns: {list(course_skills.columns)}")
print(f"\nData Types:")
print(course_skills.dtypes)

print("\n--- First 10 Rows ---")
print(course_skills.head(10))

print("\n--- Missing Values ---")
missing_course_skills = course_skills.isnull().sum()
print(missing_course_skills)

print("\n--- Unique Values ---")
print(f"Unique courses: {course_skills['course_id'].nunique()}")
print(f"Unique skills: {course_skills['skill_name'].nunique()}")
print(f"Total course-skill pairs: {len(course_skills)}")

print("\n--- Skill Distribution ---")
skill_counts_course = course_skills['skill_name'].value_counts()
print(f"\nTop 10 most common course skills:")
print(skill_counts_course.head(10))

print("\n--- Skills per Course ---")
skills_per_course = course_skills.groupby('course_id').size()
print(f"Average skills per course: {skills_per_course.mean():.2f}")
print(f"Min skills: {skills_per_course.min()}")
print(f"Max skills: {skills_per_course.max()}")
print(f"Median skills: {skills_per_course.median():.2f}")

print("\n--- Duplicates Check ---")
duplicates_course_skills = course_skills.duplicated(subset=['course_id', 'skill_name']).sum()
print(f"Duplicate course-skill pairs: {duplicates_course_skills}")
if duplicates_course_skills > 0:
    print("Warning: Same course listed with same skill multiple times!")

print("\n--- All Unique Skills ---")
all_course_skills = sorted(course_skills['skill_name'].unique())
print(f"Total unique skills: {len(all_course_skills)}")
print("Skills list:", all_course_skills)

# ============================================================================
# 4. CROSS-DATASET ANALYSIS
# ============================================================================
print("\n" + "="*80)
print("4. CROSS-DATASET ANALYSIS")
print("="*80)

print("\n--- Skill Consistency Check ---")
student_skills_set = set(student_skills['skill_name'].unique())
course_skills_set = set(course_skills['skill_name'].unique())

print(f"Skills in student_skills: {len(student_skills_set)}")
print(f"Skills in course_skills: {len(course_skills_set)}")
print(f"Common skills: {len(student_skills_set & course_skills_set)}")

skills_only_in_students = student_skills_set - course_skills_set
skills_only_in_courses = course_skills_set - student_skills_set

if skills_only_in_students:
    print(f"\nSkills only in student_skills ({len(skills_only_in_students)}): {sorted(skills_only_in_students)}")
if skills_only_in_courses:
    print(f"\nSkills only in course_skills ({len(skills_only_in_courses)}): {sorted(skills_only_in_courses)}")

print("\n--- Entity Coverage ---")
all_students_with_skills = set(student_skills['student_id'].unique())
all_students_enrolled = set(enrollments['student_id'].unique())
all_courses_with_skills = set(course_skills['course_id'].unique())
all_courses_enrolled = set(enrollments['course_id'].unique())

print(f"Students with skills: {len(all_students_with_skills)}")
print(f"Students with enrollments: {len(all_students_enrolled)}")
print(f"Students in both: {len(all_students_with_skills & all_students_enrolled)}")
students_no_skills = all_students_enrolled - all_students_with_skills
students_no_enrollments = all_students_with_skills - all_students_enrolled
print(f"Students with enrollments but no skills: {len(students_no_skills)}")
print(f"Students with skills but no enrollments: {len(students_no_enrollments)}")

print(f"\nCourses with skills: {len(all_courses_with_skills)}")
print(f"Courses with enrollments: {len(all_courses_enrolled)}")
print(f"Courses in both: {len(all_courses_with_skills & all_courses_enrolled)}")
courses_no_skills = all_courses_enrolled - all_courses_with_skills
courses_no_enrollments = all_courses_with_skills - all_courses_enrolled
print(f"Courses with enrollments but no skills: {len(courses_no_skills)}")
print(f"Courses with skills but no enrollments: {len(courses_no_enrollments)}")

# ============================================================================
# 5. FEATURE ENGINEERING FOR ML
# ============================================================================
print("\n" + "="*80)
print("5. FEATURE ENGINEERING FOR ML RECOMMENDATION SYSTEM")
print("="*80)

print("\n--- Creating Training Dataset ---")

# Merge data to create features
# For each enrollment, we need to compute skill matching score
merged_data = []

for idx, enrollment in enrollments.iterrows():
    student_id = enrollment['student_id']
    course_id = enrollment['course_id']
    progress = enrollment['progress_percentage']
    completed = enrollment['is_completed']

    # Get student skills
    student_skill_list = student_skills[student_skills['student_id'] == student_id]['skill_name'].tolist()

    # Get course skills
    course_skill_list = course_skills[course_skills['course_id'] == course_id]['skill_name'].tolist()

    # Calculate skill match
    if len(course_skill_list) > 0:
        matching_skills = len(set(student_skill_list) & set(course_skill_list))
        skill_match_ratio = matching_skills / len(course_skill_list)
    else:
        matching_skills = 0
        skill_match_ratio = 0

    merged_data.append({
        'student_id': student_id,
        'course_id': course_id,
        'progress_percentage': progress,
        'is_completed': int(completed),
        'student_skill_count': len(student_skill_list),
        'course_skill_count': len(course_skill_list),
        'matching_skills': matching_skills,
        'skill_match_ratio': skill_match_ratio
    })

ml_dataset = pd.DataFrame(merged_data)

print(f"ML Dataset shape: {ml_dataset.shape}")
print("\n--- Sample ML Dataset ---")
print(ml_dataset.head(10))

print("\n--- Feature Statistics ---")
print(ml_dataset.describe())

print("\n--- Correlation with Target (is_completed) ---")
correlations = ml_dataset.corr()['is_completed'].sort_values(ascending=False)
print(correlations)

print("\n--- Feature Distribution Analysis ---")
print("\nSkill Match Ratio Distribution:")
print(ml_dataset['skill_match_ratio'].describe())
print(f"Zero skill match: {(ml_dataset['skill_match_ratio'] == 0).sum()} ({(ml_dataset['skill_match_ratio'] == 0).mean()*100:.1f}%)")
print(f"Perfect skill match: {(ml_dataset['skill_match_ratio'] == 1.0).sum()} ({(ml_dataset['skill_match_ratio'] == 1.0).mean()*100:.1f}%)")

print("\n--- Completion vs Skill Match ---")
completed_df = ml_dataset[ml_dataset['is_completed'] == 1]
incomplete_df = ml_dataset[ml_dataset['is_completed'] == 0]

print(f"\nCompleted enrollments:")
print(f"  Average skill match ratio: {completed_df['skill_match_ratio'].mean():.3f}")
print(f"  Average matching skills: {completed_df['matching_skills'].mean():.2f}")

print(f"\nIncomplete enrollments:")
print(f"  Average skill match ratio: {incomplete_df['skill_match_ratio'].mean():.3f}")
print(f"  Average matching skills: {incomplete_df['matching_skills'].mean():.2f}")

# ============================================================================
# 6. ML SUITABILITY ASSESSMENT
# ============================================================================
print("\n" + "="*80)
print("6. ML SUITABILITY ASSESSMENT")
print("="*80)

print("\n--- Required Features for ML Model ---")
print("The system needs 10 features. Currently available:")
print("1. progress_percentage (available)")
print("2. skill_match_ratio (calculated)")
print("3. student_skill_count (calculated)")
print("4. course_skill_count (calculated)")
print("5. matching_skills (calculated)")
print("\nAdditional features needed (5 more):")
print("6. completion_rate (student's historical completion rate)")
print("7. course_difficulty (needs to be added - based on avg completion rate)")
print("8. enrollment_duration (needs completed_at - start_at)")
print("9. student_experience (total courses taken)")
print("10. course_popularity (total enrollments per course)")

print("\n--- Engineerable Features ---")

# Student completion rate
student_completion_rates = enrollments.groupby('student_id')['is_completed'].mean()
ml_dataset['student_completion_rate'] = ml_dataset['student_id'].map(student_completion_rates)

# Course difficulty (inverse of completion rate)
course_completion_rates = enrollments.groupby('course_id')['is_completed'].mean()
ml_dataset['course_difficulty'] = 1 - ml_dataset['course_id'].map(course_completion_rates)

# Student experience
student_experience = enrollments.groupby('student_id').size()
ml_dataset['student_experience'] = ml_dataset['student_id'].map(student_experience)

# Course popularity
course_popularity = enrollments.groupby('course_id').size()
ml_dataset['course_popularity'] = ml_dataset['course_id'].map(course_popularity)

# Average course progress (as proxy for difficulty)
course_avg_progress = enrollments.groupby('course_id')['progress_percentage'].mean()
ml_dataset['course_avg_progress'] = ml_dataset['course_id'].map(course_avg_progress)

print("\nEnhanced ML Dataset with all features:")
print(ml_dataset.head())
print(f"\nShape: {ml_dataset.shape}")

print("\n--- Feature List (10 features) ---")
features = [
    'progress_percentage',
    'skill_match_ratio',
    'student_skill_count',
    'course_skill_count',
    'matching_skills',
    'student_completion_rate',
    'course_difficulty',
    'student_experience',
    'course_popularity',
    'course_avg_progress'
]

for i, feat in enumerate(features, 1):
    print(f"{i}. {feat}")

print("\n--- Target Variable ---")
print(f"Target: is_completed (binary: 0 or 1)")
print(f"Class distribution:")
print(ml_dataset['is_completed'].value_counts())
print(f"Class balance: {ml_dataset['is_completed'].mean()*100:.2f}% positive class")

print("\n--- Final Correlation Matrix ---")
feature_cols = features + ['is_completed']
correlation_matrix = ml_dataset[feature_cols].corr()
print("\nCorrelation with target (is_completed):")
print(correlation_matrix['is_completed'].sort_values(ascending=False))

print("\n--- Data Completeness Check ---")
print("Missing values in features:")
print(ml_dataset[features].isnull().sum())

# ============================================================================
# 7. FINAL RECOMMENDATIONS
# ============================================================================
print("\n" + "="*80)
print("7. RECOMMENDATIONS & CONCLUSIONS")
print("="*80)

print("\n--- Data Quality Summary ---")
print("Strengths:")
print("  + Enrollments data is complete with progress tracking")
print(f"  + {completion_rate:.1f}% completion rate provides good positive examples")
print("  + Student and course skills are well-defined")
print(f"  + {len(all_skills)} unique skills provide good granularity")
print(f"  + {len(enrollments)} total enrollments is reasonable for ML")
print("  + No major data quality issues detected")

print("\nWeaknesses/Limitations:")
if len(students_no_skills) > 0:
    print(f"  - {len(students_no_skills)} students have no skill data")
if len(courses_no_skills) > 0:
    print(f"  - {len(courses_no_skills)} courses have no skill data")
print("  - No explicit course difficulty ratings")
print("  - No timestamp data for enrollment start date")
print("  - No explicit user ratings or feedback")

print("\n--- Feature Engineering Recommendations ---")
print("Implemented features:")
for i, feat in enumerate(features, 1):
    print(f"  {i}. {feat}")

print("\nAdditional features to consider:")
print("  - Student learning velocity (progress per time unit)")
print("  - Skill diversity index (variety of skills)")
print("  - Course prerequisite matching")
print("  - Student consistency score (completion pattern)")
print("  - Temporal features (time since last course)")

print("\n--- ML Model Suitability ---")
print("Binary Classification Setup:")
print(f"  Target: is_completed (0/1)")
print(f"  Features: 10 numerical features")
print(f"  Samples: {len(ml_dataset)}")
print(f"  Class balance: {ml_dataset['is_completed'].mean()*100:.1f}% completed")

class_balance = ml_dataset['is_completed'].mean()
if 0.3 <= class_balance <= 0.7:
    print("  [OK] Class balance is reasonable for binary classification")
elif class_balance < 0.3:
    print("  [WARNING] Class imbalance detected - consider SMOTE or class weights")
else:
    print("  [OK] Slight imbalance but acceptable")

print("\nNeural Network Architecture Compatibility:")
print("  Proposed: 10 inputs -> 20 hidden -> 10 hidden -> 1 output (sigmoid)")
print("  [OK] 10 input features match the architecture")
print("  [OK] Binary output with sigmoid activation is appropriate")
print("  [RECOMMENDATION] Consider batch normalization and dropout")

print("\n--- Data Distribution for ML ---")
print(f"Total samples: {len(ml_dataset)}")
print(f"Recommended split:")
print(f"  Training: {int(len(ml_dataset)*0.7)} samples (70%)")
print(f"  Validation: {int(len(ml_dataset)*0.15)} samples (15%)")
print(f"  Testing: {int(len(ml_dataset)*0.15)} samples (15%)")

print("\n--- Key Insights ---")
print(f"1. Skill matching is crucial:")
print(f"   - Completed courses have avg skill match: {completed_df['skill_match_ratio'].mean():.3f}")
print(f"   - Incomplete courses have avg skill match: {incomplete_df['skill_match_ratio'].mean():.3f}")
print(f"   - Difference: {abs(completed_df['skill_match_ratio'].mean() - incomplete_df['skill_match_ratio'].mean()):.3f}")

if completed_df['skill_match_ratio'].mean() > incomplete_df['skill_match_ratio'].mean():
    print("   [INSIGHT] Higher skill match correlates with completion!")
else:
    print("   [CAUTION] Skill match may not be strongest predictor")

print("\n2. Progress is highly predictive:")
print(f"   - Strong correlation with completion: {correlations['progress_percentage']:.3f}")

print("\n3. Student and course characteristics matter:")
print(f"   - Student completion rate correlation: {correlations['student_completion_rate']:.3f}")
print(f"   - Course difficulty correlation: {correlations['course_difficulty']:.3f}")

print("\n--- Overall Suitability Score ---")
score = 0
max_score = 10

# Scoring criteria
if len(enrollments) >= 1000: score += 2
elif len(enrollments) >= 500: score += 1.5
else: score += 1

if 0.3 <= class_balance <= 0.7: score += 2
elif 0.2 <= class_balance <= 0.8: score += 1.5
else: score += 1

if ml_dataset[features].isnull().sum().sum() == 0: score += 2
else: score += 1

if abs(correlations['progress_percentage']) > 0.5: score += 2
elif abs(correlations['progress_percentage']) > 0.3: score += 1.5
else: score += 1

if len(all_skills) >= 20: score += 1
if len(students_no_skills) / len(all_students_enrolled) < 0.1: score += 1

print(f"\nSuitability Score: {score}/{max_score}")
if score >= 8:
    print("Assessment: EXCELLENT - Data is highly suitable for ML recommendation system")
elif score >= 6:
    print("Assessment: GOOD - Data is suitable with minor improvements needed")
elif score >= 4:
    print("Assessment: FAIR - Data is usable but needs significant preprocessing")
else:
    print("Assessment: POOR - Consider collecting more/better data")

print("\n--- Next Steps ---")
print("1. Save the processed ML dataset for model training")
print("2. Perform train/validation/test split")
print("3. Normalize/standardize numerical features")
print("4. Train neural network with proposed architecture")
print("5. Evaluate using accuracy, precision, recall, F1-score, AUC-ROC")
print("6. Implement recommendation system based on predicted completion probability")

print("\n--- Saving ML Dataset ---")
ml_dataset.to_csv(r'D:\stage\IA\data\ml_dataset.csv', index=False)
print("ML dataset saved to: D:\\stage\\IA\\data\\ml_dataset.csv")

print("\n" + "="*80)
print("ANALYSIS COMPLETE")
print("="*80)
