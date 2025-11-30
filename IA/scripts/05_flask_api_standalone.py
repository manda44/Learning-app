#!/usr/bin/env python3
"""ÉTAPE 10: Standalone ML API Server - No External Dependencies"""

import json
import random
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading

print("=" * 80)
print("ÉTAPE 10: ML RECOMMENDATION API - STANDALONE SERVER")
print("=" * 80 + "\n")

# Load CSV data
enrollments = []
student_skills = {}
course_skills = {}

script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(os.path.dirname(script_dir), 'data')

print("Loading data...")

try:
    # Load enrollments
    with open(os.path.join(data_dir, 'enrollments.csv'), 'r') as f:
        lines = f.readlines()
        headers = lines[0].strip().split(',')
        for line in lines[1:]:
            parts = line.strip().split(',')
            if len(parts) >= len(headers):
                enrollments.append({
                    'student_id': int(parts[0]),
                    'course_id': int(parts[1]),
                    'progress_percentage': float(parts[2]) if len(parts) > 2 else 50,
                    'completed_at': parts[3] if len(parts) > 3 and parts[3] else None
                })
    print(f"✓ Loaded {len(enrollments)} enrollments")

    # Load student skills
    with open(os.path.join(data_dir, 'student_skills.csv'), 'r') as f:
        lines = f.readlines()
        for line in lines[1:]:
            parts = line.strip().split(',')
            if len(parts) >= 2:
                sid = int(parts[0])
                skill = parts[1]
                if sid not in student_skills:
                    student_skills[sid] = set()
                student_skills[sid].add(skill)
    print(f"✓ Loaded {len(student_skills)} students with skills")

    # Load course skills
    with open(os.path.join(data_dir, 'course_skills.csv'), 'r') as f:
        lines = f.readlines()
        for line in lines[1:]:
            parts = line.strip().split(',')
            if len(parts) >= 2:
                cid = int(parts[0])
                skill = parts[1]
                if cid not in course_skills:
                    course_skills[cid] = set()
                course_skills[cid].add(skill)
    print(f"✓ Loaded {len(course_skills)} courses with skills\n")

except Exception as e:
    print(f"⚠ Warning: Could not load CSV files: {e}")
    print("Using default test data...\n")
    # Default test data
    enrollments = [
        {'student_id': i, 'course_id': j, 'progress_percentage': 50, 'completed_at': None}
        for i in range(1, 51) for j in range(1, 6)
    ]
    for i in range(1, 851):
        student_skills[i] = {'Python', 'JavaScript', 'Testing'}
    for i in range(1, 52):
        course_skills[i] = {'Python', 'JavaScript', 'React', 'Testing'}

# Calculate statistics
def get_stats():
    unique_students = set(e['student_id'] for e in enrollments)
    unique_courses = set(e['course_id'] for e in enrollments)
    completed = sum(1 for e in enrollments if e['completed_at'])

    return {
        'total_students': int(len(unique_students)),
        'total_courses': int(len(unique_courses)),
        'total_enrollments': int(len(enrollments)),
        'completion_rate': f"{(completed / len(enrollments) * 100) if enrollments else 0:.1f}%",
        'unique_skills': int(len(set().union(*student_skills.values())))
    }

def calculate_probability(student_id, course_id):
    """Calculate success probability based on features"""
    s_skills = student_skills.get(student_id, set())
    c_skills = course_skills.get(course_id, set())

    matching = len(s_skills.intersection(c_skills))
    course_count = len(c_skills) if c_skills else 1

    # Feature calculation
    skill_match = matching / course_count if course_count > 0 else 0.0

    # Get student completion history
    student_enr = [e for e in enrollments if e['student_id'] == student_id]
    completion_rate = (sum(1 for e in student_enr if e['completed_at']) / len(student_enr)) if student_enr else 0.44

    # Get course completion history
    course_enr = [e for e in enrollments if e['course_id'] == course_id]
    course_completion = (sum(1 for e in course_enr if e['completed_at']) / len(course_enr)) if course_enr else 0.44
    difficulty = 1 - course_completion

    # Simple probability formula
    base_prob = 0.5
    base_prob += skill_match * 0.15
    base_prob += completion_rate * 0.20
    base_prob -= difficulty * 0.15
    base_prob += (len(student_enr) / 10) * 0.10

    # Add some randomness for realistic variation
    random.seed(hash((student_id, course_id)) % 10000)
    noise = random.uniform(-0.05, 0.05)

    probability = max(0.0, min(1.0, base_prob + noise))
    return float(probability)

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        if path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {'status': 'OK', 'service': 'Course Recommendation API'}
            self.wfile.write(json.dumps(response).encode())

        elif path == '/stats':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = get_stats()
            self.wfile.write(json.dumps(response).encode())

        elif path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {
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
            }
            self.wfile.write(json.dumps(response).encode())

        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {'error': 'Not found'}
            self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode()

        try:
            data = json.loads(body) if body else {}
        except:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {'error': 'Invalid JSON'}
            self.wfile.write(json.dumps(response).encode())
            return

        path = urlparse(self.path).path

        if path == '/predict':
            student_id = data.get('student_id')
            course_id = data.get('course_id')

            if not student_id or not course_id:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {'error': 'Missing student_id or course_id'}
                self.wfile.write(json.dumps(response).encode())
                return

            prob = calculate_probability(student_id, course_id)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {
                'student_id': int(student_id),
                'course_id': int(course_id),
                'success_probability': float(prob),
                'success_percentage': f"{prob*100:.1f}%"
            }
            self.wfile.write(json.dumps(response).encode())

        elif path == '/recommend':
            student_id = data.get('student_id')
            top_n = data.get('top_n', 5)

            if not student_id:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {'error': 'Missing student_id'}
                self.wfile.write(json.dumps(response).encode())
                return

            if top_n < 1 or top_n > 20:
                top_n = 5

            # Get completed courses
            completed = set(
                e['course_id'] for e in enrollments
                if e['student_id'] == student_id
            )

            # Get all courses
            all_courses = sorted(set(e['course_id'] for e in enrollments))

            # Calculate probabilities
            predictions = []
            for course_id in all_courses:
                if course_id not in completed:
                    prob = calculate_probability(student_id, course_id)
                    predictions.append({'course_id': int(course_id), 'success_probability': float(prob)})

            # Sort and get top N
            recs = sorted(predictions, key=lambda x: x['success_probability'], reverse=True)[:top_n]

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {
                'student_id': int(student_id),
                'recommendations': [{'course_id': int(r['course_id']), 'success_probability': float(r['success_probability'])} for r in recs]
            }
            self.wfile.write(json.dumps(response).encode())

        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {'error': 'Not found'}
            self.wfile.write(json.dumps(response).encode())

    def log_message(self, format, *args):
        # Suppress default logging
        pass

# Start server
print("=" * 80)
print("🚀 Starting API...")
print("📍 URL: http://localhost:5000\n")
print("Endpoints:")
print("  GET  / - Service info")
print("  GET  /health - API health check")
print("  POST /predict - Predict success probability")
print("  POST /recommend - Get top courses recommendations")
print("  GET  /stats - Global statistics\n")
print("=" * 80 + "\n")

try:
    server = HTTPServer(('localhost', 5000), RequestHandler)
    print(" * Running on http://localhost:5000")
    print(" * Debug mode: off")
    print(" * Press CTRL+C to quit\n")
    server.serve_forever()
except KeyboardInterrupt:
    print("\n\n[interrupted]")
except Exception as e:
    print(f"\n❌ Error: {e}")
