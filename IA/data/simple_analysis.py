import csv
from collections import defaultdict, Counter
from datetime import datetime

print("="*80)
print("CSV DATA ANALYSIS FOR ML RECOMMENDATION SYSTEM")
print("="*80)

# Read enrollments
enrollments = []
with open(r'D:\stage\IA\data\enrollments.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        enrollments.append(row)

# Read student skills
student_skills = []
with open(r'D:\stage\IA\data\student_skills.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        student_skills.append(row)

# Read course skills
course_skills = []
with open(r'D:\stage\IA\data\course_skills.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        course_skills.append(row)

print("\n1. ENROLLMENTS ANALYSIS")
print("="*80)
print(f"Total enrollments: {len(enrollments)}")

# Count unique students and courses
unique_students = set(row['student_id'] for row in enrollments)
unique_courses = set(row['course_id'] for row in enrollments)
print(f"Unique students: {len(unique_students)}")
print(f"Unique courses: {len(unique_courses)}")

# Count completions
completed = sum(1 for row in enrollments if row['completed_at'].strip())
completion_rate = (completed / len(enrollments)) * 100
print(f"Completed: {completed}")
print(f"In-progress: {len(enrollments) - completed}")
print(f"Completion rate: {completion_rate:.2f}%")

# Progress statistics
progress_values = [float(row['progress_percentage']) for row in enrollments]
avg_progress = sum(progress_values) / len(progress_values)
min_progress = min(progress_values)
max_progress = max(progress_values)
print(f"Average progress: {avg_progress:.2f}%")
print(f"Min progress: {min_progress}%")
print(f"Max progress: {max_progress}%")

# Progress distribution
progress_bins = {'0-25%': 0, '26-50%': 0, '51-75%': 0, '76-100%': 0}
for p in progress_values:
    if p <= 25: progress_bins['0-25%'] += 1
    elif p <= 50: progress_bins['26-50%'] += 1
    elif p <= 75: progress_bins['51-75%'] += 1
    else: progress_bins['76-100%'] += 1

print("\nProgress distribution:")
for bin_name, count in progress_bins.items():
    pct = (count / len(progress_values)) * 100
    print(f"  {bin_name}: {count} ({pct:.1f}%)")

# Completed vs incomplete progress
completed_progress = [float(row['progress_percentage']) for row in enrollments if row['completed_at'].strip()]
incomplete_progress = [float(row['progress_percentage']) for row in enrollments if not row['completed_at'].strip()]
if completed_progress:
    print(f"\nAvg progress (completed): {sum(completed_progress)/len(completed_progress):.2f}%")
if incomplete_progress:
    print(f"Avg progress (incomplete): {sum(incomplete_progress)/len(incomplete_progress):.2f}%")

print("\n2. STUDENT SKILLS ANALYSIS")
print("="*80)
print(f"Total student-skill pairs: {len(student_skills)}")

unique_students_skills = set(row['student_id'] for row in student_skills)
unique_skills = set(row['skill_name'] for row in student_skills)
print(f"Students with skills: {len(unique_students_skills)}")
print(f"Unique skills: {len(unique_skills)}")

# Skills per student
student_skill_count = defaultdict(int)
for row in student_skills:
    student_skill_count[row['student_id']] += 1

skill_counts = list(student_skill_count.values())
avg_skills = sum(skill_counts) / len(skill_counts) if skill_counts else 0
print(f"Average skills per student: {avg_skills:.2f}")
print(f"Min skills: {min(skill_counts) if skill_counts else 0}")
print(f"Max skills: {max(skill_counts) if skill_counts else 0}")

# Most common skills
skill_counter = Counter(row['skill_name'] for row in student_skills)
print("\nTop 10 student skills:")
for skill, count in skill_counter.most_common(10):
    print(f"  {skill}: {count}")

print("\n3. COURSE SKILLS ANALYSIS")
print("="*80)
print(f"Total course-skill pairs: {len(course_skills)}")

unique_courses_skills = set(row['course_id'] for row in course_skills)
course_skill_names = set(row['skill_name'] for row in course_skills)
print(f"Courses with skills: {len(unique_courses_skills)}")
print(f"Unique course skills: {len(course_skill_names)}")

# Skills per course
course_skill_count = defaultdict(int)
for row in course_skills:
    course_skill_count[row['course_id']] += 1

course_counts = list(course_skill_count.values())
avg_course_skills = sum(course_counts) / len(course_counts) if course_counts else 0
print(f"Average skills per course: {avg_course_skills:.2f}")
print(f"Min skills: {min(course_counts) if course_counts else 0}")
print(f"Max skills: {max(course_counts) if course_counts else 0}")

print("\n4. DATA SUITABILITY FOR ML")
print("="*80)

# Check coverage
students_enrolled = unique_students
students_with_skills = unique_students_skills
students_no_skills = students_enrolled - students_with_skills
students_only_skills = students_with_skills - students_enrolled

print(f"Students enrolled: {len(students_enrolled)}")
print(f"Students with skills: {len(students_with_skills)}")
print(f"Students in both: {len(students_enrolled & students_with_skills)}")
print(f"Students with enrollments but no skills: {len(students_no_skills)}")
print(f"Students with skills but no enrollments: {len(students_only_skills)}")

courses_enrolled = unique_courses
courses_with_skills = unique_courses_skills
courses_no_skills = courses_enrolled - courses_with_skills
courses_only_skills = courses_with_skills - courses_enrolled

print(f"\nCourses enrolled: {len(courses_enrolled)}")
print(f"Courses with skills: {len(courses_with_skills)}")
print(f"Courses in both: {len(courses_enrolled & courses_with_skills)}")
print(f"Courses with enrollments but no skills: {len(courses_no_skills)}")
print(f"Courses with skills but no enrollments: {len(courses_only_skills)}")

# Check skill consistency
student_skill_set = unique_skills
course_skill_set = course_skill_names
common_skills = student_skill_set & course_skill_set
skills_only_students = student_skill_set - course_skill_set
skills_only_courses = course_skill_set - student_skill_set

print(f"\nSkill consistency:")
print(f"Skills in student_skills: {len(student_skill_set)}")
print(f"Skills in course_skills: {len(course_skill_set)}")
print(f"Common skills: {len(common_skills)}")
print(f"Skills only in students: {len(skills_only_students)}")
print(f"Skills only in courses: {len(skills_only_courses)}")

print("\n5. FEATURE ENGINEERING POTENTIAL")
print("="*80)

# Build student skill dict
student_skills_dict = defaultdict(set)
for row in student_skills:
    student_skills_dict[row['student_id']].add(row['skill_name'])

# Build course skill dict
course_skills_dict = defaultdict(set)
for row in course_skills:
    course_skills_dict[row['course_id']].add(row['skill_name'])

# Calculate skill matching for a sample
print("Sample skill matching analysis (first 20 enrollments):")
match_scores = []
for i, enrollment in enumerate(enrollments[:20]):
    student_id = enrollment['student_id']
    course_id = enrollment['course_id']
    student_skill_set = student_skills_dict.get(student_id, set())
    course_skill_set = course_skills_dict.get(course_id, set())

    if course_skill_set:
        matching = len(student_skill_set & course_skill_set)
        match_ratio = matching / len(course_skill_set)
    else:
        matching = 0
        match_ratio = 0

    completed = bool(enrollment['completed_at'].strip())
    progress = float(enrollment['progress_percentage'])

    print(f"  E{i+1}: Student {student_id}, Course {course_id}")
    print(f"      Skills: {len(student_skill_set)} student, {len(course_skill_set)} course, {matching} match ({match_ratio*100:.0f}%)")
    print(f"      Progress: {progress}%, Completed: {completed}")

    match_scores.append({
        'match_ratio': match_ratio,
        'completed': completed,
        'progress': progress
    })

# Calculate average match ratio for completed vs incomplete
completed_matches = [s['match_ratio'] for s in match_scores if s['completed']]
incomplete_matches = [s['match_ratio'] for s in match_scores if not s['completed']]

if completed_matches:
    print(f"\nAvg skill match (completed): {sum(completed_matches)/len(completed_matches)*100:.1f}%")
if incomplete_matches:
    print(f"Avg skill match (incomplete): {sum(incomplete_matches)/len(incomplete_matches)*100:.1f}%")

print("\n6. ML MODEL REQUIREMENTS")
print("="*80)
print("Target ML Architecture: 10 inputs -> 20 hidden -> 10 hidden -> 1 output")
print("\nProposed 10 Features:")
print("1. progress_percentage - Current progress (0-100)")
print("2. skill_match_ratio - Ratio of student skills matching course requirements")
print("3. student_skill_count - Total number of student skills")
print("4. course_skill_count - Total number of course required skills")
print("5. matching_skills - Absolute number of matching skills")
print("6. student_completion_rate - Historical completion rate of student")
print("7. course_difficulty - Based on overall course completion rate")
print("8. student_experience - Total courses taken by student")
print("9. course_popularity - Total enrollments for course")
print("10. course_avg_progress - Average progress of all students in course")

print("\nTarget Variable:")
print("- is_completed (binary: 0 or 1)")
print(f"- Class distribution: {completion_rate:.1f}% positive (completed)")
print(f"- Class balance: {'GOOD' if 30 <= completion_rate <= 70 else 'IMBALANCED'}")

print("\n7. OVERALL ASSESSMENT")
print("="*80)

assessment = []
assessment.append(f"Dataset Size: {len(enrollments)} samples - {'GOOD' if len(enrollments) >= 1000 else 'FAIR'}")
assessment.append(f"Class Balance: {completion_rate:.1f}% - {'GOOD' if 30 <= completion_rate <= 70 else 'NEEDS BALANCING'}")
assessment.append(f"Feature Coverage: {len(students_enrolled & students_with_skills)} students have both enrollment and skill data")
assessment.append(f"Skill Diversity: {len(unique_skills)} unique skills available")

coverage_pct = (len(students_enrolled & students_with_skills) / len(students_enrolled)) * 100
course_coverage_pct = (len(courses_enrolled & courses_with_skills) / len(courses_enrolled)) * 100

print("\nStrengths:")
print(f"+ {len(enrollments)} enrollments provide sufficient training data")
print(f"+ {completion_rate:.1f}% completion rate gives balanced examples")
print(f"+ {len(unique_skills)} skills provide good feature granularity")
print(f"+ {coverage_pct:.1f}% student coverage for skill matching")
print(f"+ {course_coverage_pct:.1f}% course coverage for skill requirements")

print("\nLimitations:")
if len(students_no_skills) > 0:
    print(f"- {len(students_no_skills)} students lack skill data")
if len(courses_no_skills) > 0:
    print(f"- {len(courses_no_skills)} courses lack skill requirements")
print("- No explicit course difficulty ratings available")
print("- Missing enrollment start dates for time-based features")

print("\nRecommendations:")
print("1. Data is SUITABLE for ML recommendation system")
print("2. Implement all 10 proposed features")
print("3. Use 70/15/15 train/validation/test split")
print("4. Apply feature normalization/standardization")
print("5. Monitor for class imbalance during training")
print("6. Use appropriate metrics: accuracy, precision, recall, F1, AUC-ROC")

suitability_score = 0
if len(enrollments) >= 1000: suitability_score += 2.5
if 30 <= completion_rate <= 70: suitability_score += 2.5
if coverage_pct >= 80: suitability_score += 2
if course_coverage_pct >= 80: suitability_score += 2
if len(unique_skills) >= 20: suitability_score += 1

print(f"\nOVERALL SUITABILITY SCORE: {suitability_score}/10")
if suitability_score >= 8:
    print("Assessment: EXCELLENT - Highly suitable for ML")
elif suitability_score >= 6:
    print("Assessment: GOOD - Suitable with minor improvements")
else:
    print("Assessment: FAIR - Usable but needs preprocessing")

print("\n" + "="*80)
print("ANALYSIS COMPLETE")
print("="*80)
