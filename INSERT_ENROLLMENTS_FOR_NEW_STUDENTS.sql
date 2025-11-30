-- ============================================================================
-- Script: INSERT_ENROLLMENTS_FOR_NEW_STUDENTS.sql
-- Objectif: Insérer des StudentCourseEnrollment pour les nouveaux étudiants
--           avec CourseId entre 2 et 51
-- ============================================================================

PRINT '==============================================================================='
PRINT 'INSERT ENROLLMENTS FOR NEW STUDENTS (CourseId 2-51)'
PRINT '===============================================================================' + CHAR(10)

-- Vérifier que les tables existent
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'StudentCourseEnrollment')
BEGIN
    PRINT 'Erreur: Table StudentCourseEnrollment n''existe pas'
    RETURN
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Course')
BEGIN
    PRINT 'Erreur: Table Course n''existe pas'
    RETURN
END

-- Compter les cours disponibles dans la plage 2-51
DECLARE @CourseCount INT = (SELECT COUNT(*) FROM [dbo].[Course] WHERE CourseId BETWEEN 2 AND 51)

IF @CourseCount = 0
BEGIN
    PRINT 'Erreur: Aucun cours trouvé avec CourseId entre 2 et 51'
    RETURN
END

-- Récupérer l'ID du dernier étudiant inséré (celui après max UserId avant insertion)
DECLARE @MaxStudentId INT = (SELECT MAX(UserId) FROM [dbo].[Users])
DECLARE @MinStudentIdForEnrollment INT = @MaxStudentId - 9  -- Les 10 derniers (qui sont les instructeurs)

PRINT 'Étudiants à traiter: ' + CAST(@MinStudentIdForEnrollment AS VARCHAR) + ' à ' + CAST(@MaxStudentId AS VARCHAR) + CHAR(10)
PRINT 'Cours disponibles: ' + CAST(@CourseCount AS VARCHAR) + CHAR(10)

-- ============================================================================
-- INSÉRER LES ENROLLMENTS
-- ============================================================================
PRINT '--- Insertion des enrollments ---' + CHAR(10)

DECLARE @StudentId INT
DECLARE @CourseId INT
DECLARE @ProgressPercentage INT
DECLARE @Status NVARCHAR(50)
DECLARE @EnrollmentDate DATETIME
DECLARE @CompletionDate DATETIME
DECLARE @InsertCount INT = 0
DECLARE @TotalCount INT = 0

DECLARE StudentCursor CURSOR FOR
SELECT UserId FROM [dbo].[Users] WHERE UserId BETWEEN @MinStudentIdForEnrollment AND @MaxStudentId

OPEN StudentCursor
FETCH NEXT FROM StudentCursor INTO @StudentId

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Pour chaque étudiant, insérer 5-8 enrollments aléatoires dans différents cours
    DECLARE @EnrollmentCountForStudent INT = (ABS(CHECKSUM(NEWID())) % 4) + 5  -- 5-8 enrollments
    DECLARE @EnrollmentCounter INT = 1
    DECLARE @UsedCourses NVARCHAR(MAX) = ''

    WHILE @EnrollmentCounter <= @EnrollmentCountForStudent
    BEGIN
        -- Sélectionner un cours aléatoire entre 2-51
        DECLARE @RandomCourseId INT = (SELECT TOP 1 CourseId
                                       FROM [dbo].[Course]
                                       WHERE CourseId BETWEEN 2 AND 51
                                       ORDER BY NEWID())

        -- Vérifier que l'étudiant n'est pas déjà inscrit à ce cours
        IF NOT EXISTS (SELECT 1 FROM [dbo].[StudentCourseEnrollment]
                       WHERE StudentId = @StudentId AND CourseId = @RandomCourseId)
        BEGIN
            -- Générer les données d'enrollment
            DECLARE @RandomProgress INT = (ABS(CHECKSUM(NEWID())) % 101)  -- 0-100%
            DECLARE @RandomDaysAgo INT = (ABS(CHECKSUM(NEWID())) % 120) + 1  -- 1-120 jours

            SET @EnrollmentDate = DATEADD(DAY, -@RandomDaysAgo, GETDATE())

            -- Déterminer le statut et la date de complétion
            IF @RandomProgress = 100
            BEGIN
                SET @Status = 'completed'
                SET @CompletionDate = DATEADD(DAY, -(@RandomDaysAgo - 30), GETDATE())
            END
            ELSE IF @RandomProgress = 0
            BEGIN
                SET @Status = 'dropped'
                SET @CompletionDate = NULL
            END
            ELSE IF @RandomProgress < 30
            BEGIN
                SET @Status = 'active'
                SET @CompletionDate = NULL
            END
            ELSE IF @RandomProgress < 70
            BEGIN
                SET @Status = 'active'
                SET @CompletionDate = NULL
            END
            ELSE
            BEGIN
                SET @Status = 'active'
                SET @CompletionDate = NULL
            END

            -- Insérer l'enrollment
            INSERT INTO [dbo].[StudentCourseEnrollment] (
                [StudentId],
                [CourseId],
                [EnrollmentDate],
                [Status],
                [ProgressPercentage],
                [CompletionDate]
            ) VALUES (
                @StudentId,
                @RandomCourseId,
                @EnrollmentDate,
                @Status,
                @RandomProgress,
                @CompletionDate
            )

            SET @InsertCount = @InsertCount + 1
            SET @EnrollmentCounter = @EnrollmentCounter + 1
        END

        SET @TotalCount = @TotalCount + 1
        -- Protection contre les boucles infinies
        IF @TotalCount > 1000 BREAK
    END

    FETCH NEXT FROM StudentCursor INTO @StudentId
END

CLOSE StudentCursor
DEALLOCATE StudentCursor

PRINT 'Inséré ' + CAST(@InsertCount AS VARCHAR) + ' enrollments' + CHAR(10)

-- ============================================================================
-- RÉSUMÉ ET STATISTIQUES
-- ============================================================================
PRINT '==============================================================================' + CHAR(10)
PRINT 'RÉSUMÉ DES DONNÉES INSÉRÉES'
PRINT '==============================================================================' + CHAR(10)

SELECT
    'Nouveaux enrollments créés' as Métrique,
    CAST(@InsertCount AS VARCHAR) as Valeur

UNION ALL

SELECT
    'Étudiants avec enrollments',
    CAST(COUNT(DISTINCT StudentId) AS VARCHAR)
FROM [dbo].[StudentCourseEnrollment]
WHERE StudentId BETWEEN @MinStudentIdForEnrollment AND @MaxStudentId

UNION ALL

SELECT
    'Cours utilisés',
    CAST(COUNT(DISTINCT CourseId) AS VARCHAR)
FROM [dbo].[StudentCourseEnrollment]
WHERE StudentId BETWEEN @MinStudentIdForEnrollment AND @MaxStudentId

UNION ALL

SELECT
    'Total enrollments complétés',
    CAST(SUM(CASE WHEN [Status] = 'completed' THEN 1 ELSE 0 END) AS VARCHAR)
FROM [dbo].[StudentCourseEnrollment]
WHERE StudentId BETWEEN @MinStudentIdForEnrollment AND @MaxStudentId

UNION ALL

SELECT
    'Total enrollments actifs',
    CAST(SUM(CASE WHEN [Status] = 'active' THEN 1 ELSE 0 END) AS VARCHAR)
FROM [dbo].[StudentCourseEnrollment]
WHERE StudentId BETWEEN @MinStudentIdForEnrollment AND @MaxStudentId

UNION ALL

SELECT
    'Total enrollments abandonnés',
    CAST(SUM(CASE WHEN [Status] = 'dropped' THEN 1 ELSE 0 END) AS VARCHAR)
FROM [dbo].[StudentCourseEnrollment]
WHERE StudentId BETWEEN @MinStudentIdForEnrollment AND @MaxStudentId

PRINT CHAR(10) + '--- DÉTAILS PAR ÉTUDIANT ---' + CHAR(10)

SELECT
    u.UserId,
    u.FirstName,
    u.LastName,
    COUNT(*) as [Total Enrollments],
    SUM(CASE WHEN sce.[Status] = 'completed' THEN 1 ELSE 0 END) as [Completed],
    SUM(CASE WHEN sce.[Status] = 'active' THEN 1 ELSE 0 END) as [Active],
    SUM(CASE WHEN sce.[Status] = 'dropped' THEN 1 ELSE 0 END) as [Dropped],
    CAST(SUM(CASE WHEN sce.[Status] = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2)) as [Completion Rate %],
    CAST(AVG(CAST(sce.ProgressPercentage AS FLOAT)) AS DECIMAL(5,2)) as [Avg Progress %]
FROM [dbo].[Users] u
LEFT JOIN [dbo].[StudentCourseEnrollment] sce ON u.UserId = sce.StudentId
WHERE u.UserId BETWEEN @MinStudentIdForEnrollment AND @MaxStudentId
GROUP BY u.UserId, u.FirstName, u.LastName
ORDER BY u.UserId

PRINT CHAR(10) + '--- DÉTAILS PAR COURS ---' + CHAR(10)

SELECT TOP 20
    c.CourseId,
    c.Title,
    COUNT(*) as [Total Enrollments],
    SUM(CASE WHEN sce.[Status] = 'completed' THEN 1 ELSE 0 END) as [Completed],
    CAST(SUM(CASE WHEN sce.[Status] = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2)) as [Completion Rate %]
FROM [dbo].[Course] c
LEFT JOIN [dbo].[StudentCourseEnrollment] sce ON c.CourseId = sce.CourseId
WHERE sce.StudentId BETWEEN @MinStudentIdForEnrollment AND @MaxStudentId
GROUP BY c.CourseId, c.Title
ORDER BY [Total Enrollments] DESC

PRINT CHAR(10) + '==============================================================================' + CHAR(10)
PRINT 'INSERTION COMPLÉTÉE AVEC SUCCÈS'
PRINT 'Les nouveaux étudiants ont été inscrits à des cours (CourseId 2-51)'
PRINT '==============================================================================' + CHAR(10)
