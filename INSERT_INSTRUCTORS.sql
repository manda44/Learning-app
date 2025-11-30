-- ============================================================================
-- INSERT INSTRUCTORS SCRIPT
-- Create 6 instructor users (UserId 3-8) with Role "Instructor" (RoleId 3)
-- ============================================================================

SET IDENTITY_INSERT [dbo].[Users] ON;

-- Insert 6 instructors
INSERT INTO [dbo].[Users] (
    [UserId],
    [FirstName],
    [LastName],
    [Email],
    [CreationDate],
    [Password],
    [IsActive]
) VALUES

-- UserId 3: Dr. Sarah Johnson - Expert in Frontend Development
(3, 'Sarah', 'Johnson',
 'sarah.johnson@learningapp.com',
 GETDATE(),
 'hashed_password_001', -- This would be a bcrypt/hashed password in production
 1),

-- UserId 4: Prof. Michael Chen - Specialist in Cloud Architecture
(4, 'Michael', 'Chen',
 'michael.chen@learningapp.com',
 GETDATE(),
 'hashed_password_002',
 1),

-- UserId 5: Emma Rodriguez - Expert in DevOps & Kubernetes
(5, 'Emma', 'Rodriguez',
 'emma.rodriguez@learningapp.com',
 GETDATE(),
 'hashed_password_003',
 1),

-- UserId 6: James Wilson - Full-Stack Development Expert
(6, 'James', 'Wilson',
 'james.wilson@learningapp.com',
 GETDATE(),
 'hashed_password_004',
 1),

-- UserId 7: Dr. Lisa Wang - Data Science & Python Specialist
(7, 'Lisa', 'Wang',
 'lisa.wang@learningapp.com',
 GETDATE(),
 'hashed_password_005',
 1),

-- UserId 8: Robert Martinez - Enterprise Architecture Expert
(8, 'Robert', 'Martinez',
 'robert.martinez@learningapp.com',
 GETDATE(),
 'hashed_password_006',
 1);

SET IDENTITY_INSERT [dbo].[Users] OFF;

-- ============================================================================
-- INSERT USER ROLES
-- Assign Role 3 (Instructor) to all 6 users
-- ============================================================================

INSERT INTO [dbo].[UserRole] (
    [UserId],
    [RoleId],
    [DateAdded]
) VALUES

-- Sarah Johnson - Instructor
(3, 3, GETDATE()),

-- Michael Chen - Instructor
(4, 3, GETDATE()),

-- Emma Rodriguez - Instructor
(5, 3, GETDATE()),

-- James Wilson - Instructor
(6, 3, GETDATE()),

-- Lisa Wang - Instructor
(7, 3, GETDATE()),

-- Robert Martinez - Instructor
(8, 3, GETDATE());

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count users inserted
SELECT
    COUNT(*) as [Total Instructors Inserted]
FROM [dbo].[Users]
WHERE UserId BETWEEN 3 AND 8;

-- Verify user roles
SELECT
    u.[UserId],
    u.[FirstName],
    u.[LastName],
    u.[Email],
    r.[RoleId],
    r.[DateAdded]
FROM [dbo].[Users] u
INNER JOIN [dbo].[UserRole] r ON u.[UserId] = r.[UserId]
WHERE u.[UserId] BETWEEN 3 AND 8
ORDER BY u.[UserId];
