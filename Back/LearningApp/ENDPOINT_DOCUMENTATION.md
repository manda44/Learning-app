# Endpoint Documentation: Get Courses with Enrollment Status

## Overview
This endpoint returns a list of all courses combined with the enrollment status of a specific student.

## Endpoint Details

### URL
```
GET /api/courses/with-enrollment/{studentId}
```

### Method
`GET`

### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `studentId` | integer | URL path | Yes | The ID of the student to fetch enrollment data for |

### Response Format

**Status Code:** `200 OK`

**Response Body:** Array of `CourseWithEnrollmentDto` objects

```json
[
  {
    "courseId": 1,
    "title": "Introduction to Python Programming",
    "description": "Learn Python basics...",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": null,
    "userId": 1,
    "enrollmentId": 101,
    "enrollmentDate": "2024-02-01T10:00:00Z",
    "status": "active",
    "progressPercentage": 65,
    "completionDate": null,
    "isEnrolled": true
  },
  {
    "courseId": 2,
    "title": "Advanced JavaScript",
    "description": "Learn modern JavaScript...",
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": null,
    "userId": 1,
    "enrollmentId": null,
    "enrollmentDate": null,
    "status": null,
    "progressPercentage": null,
    "completionDate": null,
    "isEnrolled": false
  }
]
```

## Response DTO: CourseWithEnrollmentDto

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `courseId` | integer | No | Unique identifier of the course |
| `title` | string | No | Title of the course |
| `description` | string | No | Description of the course |
| `createdAt` | DateTime | No | Course creation timestamp |
| `updatedAt` | DateTime | Yes | Course last update timestamp |
| `userId` | integer | No | ID of the user (teacher) who created the course |
| `enrollmentId` | integer | Yes | ID of enrollment (null if not enrolled) |
| `enrollmentDate` | DateTime | Yes | When student enrolled (null if not enrolled) |
| `status` | string | Yes | Enrollment status: `active`, `paused`, `completed`, `dropped` (null if not enrolled) |
| `progressPercentage` | integer | Yes | Progress in percentage (0-100, null if not enrolled) |
| `completionDate` | DateTime | Yes | Completion date (null if not completed or not enrolled) |
| `isEnrolled` | boolean | No | Flag indicating if student is enrolled in this course |

## Example Requests

### Request 1: Get all courses with enrollments for student ID 1
```
GET /api/courses/with-enrollment/1
```

### Request 2: Get all courses with enrollments for student ID 5
```
GET /api/courses/with-enrollment/5
```

## Error Handling

### Error Response
**Status Code:** `400 Bad Request`

```json
{
  "message": "Error retrieving courses with enrollment",
  "error": "Exception details here"
}
```

## Implementation Notes

1. **No Authentication Required** - Currently this endpoint is open to any caller
   - Consider adding `[Authorize]` attribute if access control is needed

2. **Enrollment Data** - If a student is not enrolled in a course:
   - `enrollmentId` = `null`
   - `enrollmentDate` = `null`
   - `status` = `null`
   - `progressPercentage` = `null`
   - `completionDate` = `null`
   - `isEnrolled` = `false`

3. **Performance** - This endpoint loads:
   - ALL courses from the database
   - ALL enrollments for the specified student
   - Then combines them in memory

   For large datasets, consider adding:
   - Pagination
   - Lazy loading with includes
   - Caching

4. **Database Queries** - Uses 2 queries:
   - `SELECT * FROM Courses`
   - `SELECT * FROM StudentCourseEnrollments WHERE StudentId = {studentId}`

## Usage Example (Frontend/JavaScript)

```javascript
// Fetch all courses with enrollment status for student ID 1
const studentId = 1;
const response = await fetch(`https://localhost:7121/api/courses/with-enrollment/${studentId}`);
const coursesWithEnrollment = await response.json();

// Example: Show enrolled courses
const enrolledCourses = coursesWithEnrollment.filter(c => c.isEnrolled);
console.log('Enrolled courses:', enrolledCourses);

// Example: Show available courses (not yet enrolled)
const availableCourses = coursesWithEnrollment.filter(c => !c.isEnrolled);
console.log('Available courses:', availableCourses);
```

## Future Enhancements

1. Add `[Authorize]` attribute to protect the endpoint
2. Add query parameters for filtering/sorting:
   - `/api/courses/with-enrollment/{studentId}?status=active`
   - `/api/courses/with-enrollment/{studentId}?sortBy=progress&order=desc`
3. Add pagination: `?page=1&pageSize=10`
4. Include related data (chapters, quiz count, etc.)
5. Add caching for performance optimization
