# Frontend Update Summary: AllCourses Component

## Overview
Updated the `AllCourses` component to use the new backend endpoint `/api/courses/with-enrollment/{studentId}` for displaying all courses with their enrollment status.

---

## Changes Made

### 1. **AllCourses Component**
📁 `src/pages/AllCourses.tsx`

#### Imports Updated
```typescript
// Before
import type { Course } from '../services/courseService';

// After
import type { CourseWithEnrollment } from '../services/courseService';
```

#### State Changes
```typescript
// Before
const [studentId, setStudentId] = useState<number | null>(null);
const { courses, coursesLoading, coursesError, enrollments, fetchAllCourses, enrollCourse } = useStudentStore();

// After
const STUDENT_ID = 1; // Static value
const { coursesWithEnrollment, coursesLoading, coursesError, fetchAllCoursesWithEnrollment, enrollCourse } = useStudentStore();
```

#### Initial Data Fetch
```typescript
// Before
useEffect(() => {
  const userInfo = getUserInfo();
  if (userInfo) {
    setStudentId(userInfo.id);
  }
}, []);

useEffect(() => {
  fetchAllCourses();
}, [fetchAllCourses]);

// After
useEffect(() => {
  // Fetch all courses with enrollment status for student ID 1
  fetchAllCoursesWithEnrollment(STUDENT_ID);
}, [fetchAllCoursesWithEnrollment]);
```

#### Filtering Logic
```typescript
// Before
let filtered = courses;

// After
let filtered = coursesWithEnrollment;
```

#### Enrollment Check
```typescript
// Before
const isEnrolled = (courseId: number) => {
  return enrollments.some(e => e.courseId === courseId);
};

// After
const isEnrolled = (courseId: number) => {
  const course = coursesWithEnrollment.find(c => c.courseId === courseId);
  return course?.isEnrolled ?? false;
};
```

#### Handle Enrollment
```typescript
// Before
const handleEnroll = async (courseId: number) => {
  if (!studentId) return;
  setEnrollingId(courseId);
  try {
    await enrollCourse(studentId, courseId);
  } finally {
    setEnrollingId(null);
  }
};

// After
const handleEnroll = async (courseId: number) => {
  setEnrollingId(courseId);
  try {
    await enrollCourse(STUDENT_ID, courseId);
  } finally {
    setEnrollingId(null);
  }
};
```

### 2. **Zustand Store**
📁 `src/store/studentStore.ts`

#### State Interface
```typescript
// Added
coursesWithEnrollment: CourseWithEnrollment[];
```

#### Actions Interface
```typescript
// Added
fetchAllCoursesWithEnrollment: (studentId: number) => Promise<void>;
```

#### Initial State
```typescript
// Added
coursesWithEnrollment: [],
```

#### New Action Implementation
```typescript
fetchAllCoursesWithEnrollment: async (studentId: number) => {
  set({ coursesLoading: true, coursesError: null });
  try {
    const coursesWithEnrollment = await courseService.getAllCoursesWithEnrollment(studentId);
    set({ coursesWithEnrollment, coursesLoading: false });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch courses with enrollment';
    set({ coursesError: errorMsg, coursesLoading: false });
  }
};
```

#### Persistence Configuration
```typescript
// Added to partialize
coursesWithEnrollment: state.coursesWithEnrollment,
```

### 3. **Course Service**
📁 `src/services/courseService.ts`

#### New Interface
```typescript
export interface CourseWithEnrollment extends Course {
  enrollmentId?: number | null;
  enrollmentDate?: string | null;
  status?: string | null;
  progressPercentage?: number | null;
  completionDate?: string | null;
  isEnrolled: boolean;
}
```

#### New Method
```typescript
getAllCoursesWithEnrollment: async (studentId: number): Promise<CourseWithEnrollment[]> => {
  const response = await fetch(`${API_URL}/courses/with-enrollment/${studentId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch courses with enrollment');
  }

  return response.json();
};
```

---

## How It Works

### Flow Diagram
```
AllCourses Component Loads
    ↓
useEffect calls fetchAllCoursesWithEnrollment(1)
    ↓
Store calls courseService.getAllCoursesWithEnrollment(1)
    ↓
HTTP GET /api/courses/with-enrollment/1
    ↓
Backend returns CourseWithEnrollmentDto[]
    ↓
Store updates coursesWithEnrollment state
    ↓
Component re-renders with updated courses
    ↓
For each course, check course.isEnrolled
    ↓
Show "Déjà inscrit" or "S'inscrire" button
```

### Example Data Structure
```typescript
const coursesWithEnrollment = [
  {
    // Course data
    courseId: 1,
    title: "Python Programming",
    description: "...",
    level: "Beginner",
    duration: 20,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: null,
    userId: 1,

    // Enrollment data (if enrolled)
    enrollmentId: 101,
    enrollmentDate: "2024-02-01T10:00:00Z",
    status: "active",
    progressPercentage: 65,
    completionDate: null,
    isEnrolled: true
  },
  {
    // Course data
    courseId: 2,
    title: "JavaScript Advanced",
    description: "...",
    level: "Advanced",
    duration: 25,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: null,
    userId: 1,

    // Enrollment data (if NOT enrolled)
    enrollmentId: null,
    enrollmentDate: null,
    status: null,
    progressPercentage: null,
    completionDate: null,
    isEnrolled: false
  }
];
```

---

## Static StudentId Usage

The component now uses a **static StudentId = 1**:

```typescript
const STUDENT_ID = 1;
```

This means:
- ✅ Always fetches data for Student ID 1
- ✅ Shows enrollment status for Student ID 1
- ✅ Enrollments are associated with Student ID 1

To make it dynamic in the future:
```typescript
const [studentId, setStudentId] = useState(1);

useEffect(() => {
  const userInfo = getUserInfo();
  setStudentId(userInfo?.id ?? 1);
}, []);

useEffect(() => {
  fetchAllCoursesWithEnrollment(studentId);
}, [studentId, fetchAllCoursesWithEnrollment]);
```

---

## API Endpoint Used

**Backend Endpoint:**
```
GET https://localhost:7121/api/courses/with-enrollment/1
```

**Response Time:** Should be fast since:
1. Fetches all courses (usually < 50)
2. Filters enrollments for one student (very fast)
3. Combines in memory (instant)

---

## Features

✅ Displays all courses from the backend
✅ Shows enrollment status for Student ID 1
✅ Shows progress percentage for enrolled courses
✅ Search and filter by level still work
✅ Loading and error states handled
✅ "Déjà inscrit" button for enrolled courses
✅ "S'inscrire" button for available courses
✅ Data persisted in localStorage

---

## Component Behavior

### Enrolled Courses
```
┌─────────────────────────────┐
│ Course Title                │
│ Description...              │
│ Status: active              │
│ Progress: 65%               │
│ [Déjà inscrit] (disabled)   │
└─────────────────────────────┘
```

### Available Courses (Not Enrolled)
```
┌─────────────────────────────┐
│ Course Title                │
│ Description...              │
│ No enrollment data          │
│ [S'inscrire] (enabled)      │
└─────────────────────────────┘
```

---

## Testing Checklist

- [ ] Page loads without errors
- [ ] All courses display
- [ ] Student ID 1 enrolled courses show "Déjà inscrit"
- [ ] Student ID 1 non-enrolled courses show "S'inscrire"
- [ ] Search filter works
- [ ] Level filter works
- [ ] Loading spinner displays while fetching
- [ ] Error message displays if API fails
- [ ] Data persists in localStorage

---

## Summary

The `AllCourses` component now:
- Fetches all courses with enrollment status from the new backend endpoint
- Uses a static StudentId = 1
- Displays enrollment information inline
- Allows filtering and searching
- Handles loading and error states
- Persists data in localStorage

All data comes from the backend API, not from mock data!
