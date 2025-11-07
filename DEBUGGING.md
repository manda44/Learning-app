# Debugging: Why 12 courses show instead of 1?

## Issue
- Backend endpoint returns: 1 course (from database)
- Frontend displays: 12 courses (from mock data)

## Root Cause
Likely localStorage persistence is loading old mock data instead of fresh API data.

## Solution
Need to clear localStorage and ensure fresh API call.

### Steps to Fix

1. Clear localStorage
```javascript
localStorage.clear()
```

2. Hard refresh browser
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

3. Check Network tab
- Look for GET request to `/api/courses/with-enrollment/1`
- Should return 1 course (the only one in database)

4. Check Console
- Look for any errors
- Check store state in DevTools

## Verification
After clearing localStorage and hard refresh:
- Should see exactly 1 course
- That course should have: courseId=1, title="Test", description="hellooo"
- Should show "Not enrolled" since isEnrolled=false

## Why This Happens
- Zustand persist middleware saves state to localStorage
- Old mock data (12 courses) gets restored on page reload
- Component may display old data before API call completes

## Prevention
- Option 1: Don't persist coursesWithEnrollment to localStorage
- Option 2: Always fetch fresh from API on component mount
- Option 3: Add version number to localStorage to invalidate old data
