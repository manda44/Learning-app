-- ============================================================================
-- Script: INSERT_USERS_WITH_ROLE_3.sql
-- Objectif: Insérer des utilisateurs avec le role 3 (INSTRUCTOR)
-- ============================================================================

PRINT '==============================================================================='
PRINT 'INSERT USERS WITH ROLE 3 (INSTRUCTOR)'
PRINT '===============================================================================' + CHAR(10)

-- Vérifier que les tables existent
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
BEGIN
    PRINT 'Erreur: Table Users n''existe pas'
    RETURN
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Role')
BEGIN
    PRINT 'Erreur: Table Role n''existe pas'
    RETURN
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'UserRole')
BEGIN
    PRINT 'Erreur: Table UserRole n''existe pas'
    RETURN
END

-- Vérifier que le Role 3 existe
DECLARE @RoleId3Exists INT = (SELECT COUNT(*) FROM [dbo].[Role] WHERE RoleId = 3)
IF @RoleId3Exists = 0
BEGIN
    PRINT 'Attention: RoleId 3 n''existe pas dans la table Role'
    PRINT 'Création du role 3...' + CHAR(10)
    INSERT INTO [dbo].[Role] ([RoleId], [Name])
    VALUES (3, 'Instructor')
    PRINT 'Role 3 créé avec succès' + CHAR(10)
END

-- ============================================================================
-- INSÉRER 10 NOUVEAUX INSTRUCTEURS
-- ============================================================================
PRINT '--- Insertion de 10 nouveaux instructeurs ---' + CHAR(10)

DECLARE @MaxUserId INT = (SELECT MAX(UserId) FROM [dbo].[Users])
DECLARE @StartUserId INT = ISNULL(@MaxUserId, 0) + 1

-- Préserver l'identité actuelle
SET IDENTITY_INSERT [dbo].[Users] ON

-- Insérer les utilisateurs
INSERT INTO [dbo].[Users] (
    [UserId],
    [FirstName],
    [LastName],
    [Email],
    [CreationDate],
    [Password],
    [IsActive]
) VALUES
    (@StartUserId, 'Alice', 'Thompson', CONCAT('alice.thompson', @StartUserId, '@learningapp.com'), GETDATE(), 'hashed_password_alice', 1),
    (@StartUserId + 1, 'David', 'Peterson', CONCAT('david.peterson', @StartUserId + 1, '@learningapp.com'), GETDATE(), 'hashed_password_david', 1),
    (@StartUserId + 2, 'Caroline', 'Anderson', CONCAT('caroline.anderson', @StartUserId + 2, '@learningapp.com'), GETDATE(), 'hashed_password_caroline', 1),
    (@StartUserId + 3, 'John', 'Mitchell', CONCAT('john.mitchell', @StartUserId + 3, '@learningapp.com'), GETDATE(), 'hashed_password_john', 1),
    (@StartUserId + 4, 'Patricia', 'Taylor', CONCAT('patricia.taylor', @StartUserId + 4, '@learningapp.com'), GETDATE(), 'hashed_password_patricia', 1),
    (@StartUserId + 5, 'Christopher', 'Brown', CONCAT('christopher.brown', @StartUserId + 5, '@learningapp.com'), GETDATE(), 'hashed_password_christopher', 1),
    (@StartUserId + 6, 'Jennifer', 'Garcia', CONCAT('jennifer.garcia', @StartUserId + 6, '@learningapp.com'), GETDATE(), 'hashed_password_jennifer', 1),
    (@StartUserId + 7, 'Daniel', 'Martinez', CONCAT('daniel.martinez', @StartUserId + 7, '@learningapp.com'), GETDATE(), 'hashed_password_daniel', 1),
    (@StartUserId + 8, 'Margaret', 'Lee', CONCAT('margaret.lee', @StartUserId + 8, '@learningapp.com'), GETDATE(), 'hashed_password_margaret', 1),
    (@StartUserId + 9, 'Thomas', 'White', CONCAT('thomas.white', @StartUserId + 9, '@learningapp.com'), GETDATE(), 'hashed_password_thomas', 1)

SET IDENTITY_INSERT [dbo].[Users] OFF

PRINT 'Inséré 10 utilisateurs avec IDs: ' + CAST(@StartUserId AS VARCHAR) + ' à ' + CAST(@StartUserId + 9 AS VARCHAR) + CHAR(10)

-- ============================================================================
-- ASSIGNER LE ROLE 3 (INSTRUCTOR) À CES UTILISATEURS
-- ============================================================================
PRINT '--- Attribution du role 3 (INSTRUCTOR) ---' + CHAR(10)

INSERT INTO [dbo].[UserRole] (
    [UserId],
    [RoleId],
    [DateAdded]
) VALUES
    (@StartUserId, 3, GETDATE()),
    (@StartUserId + 1, 3, GETDATE()),
    (@StartUserId + 2, 3, GETDATE()),
    (@StartUserId + 3, 3, GETDATE()),
    (@StartUserId + 4, 3, GETDATE()),
    (@StartUserId + 5, 3, GETDATE()),
    (@StartUserId + 6, 3, GETDATE()),
    (@StartUserId + 7, 3, GETDATE()),
    (@StartUserId + 8, 3, GETDATE()),
    (@StartUserId + 9, 3, GETDATE())

PRINT 'Role 3 assigné à 10 utilisateurs' + CHAR(10)

-- ============================================================================
-- RÉSUMÉ ET STATISTIQUES
-- ============================================================================
PRINT '==============================================================================' + CHAR(10)
PRINT 'RÉSUMÉ DES DONNÉES INSÉRÉES'
PRINT '==============================================================================' + CHAR(10)

SELECT
    'Nouveaux utilisateurs créés' as Métrique,
    CAST(COUNT(*) AS VARCHAR) as Valeur
FROM [dbo].[Users]
WHERE [UserId] >= @StartUserId

UNION ALL

SELECT
    'Total instructeurs (Role 3)',
    CAST(COUNT(*) AS VARCHAR)
FROM [dbo].[UserRole]
WHERE [RoleId] = 3

UNION ALL

SELECT
    'Total utilisateurs',
    CAST(COUNT(*) AS VARCHAR)
FROM [dbo].[Users]

PRINT CHAR(10) + '--- DÉTAILS DES NOUVEAUX INSTRUCTEURS ---' + CHAR(10)

SELECT
    [UserId],
    [FirstName],
    [LastName],
    [Email],
    [IsActive],
    [CreationDate],
    'Instructor' as [Role]
FROM [dbo].[Users]
WHERE [UserId] >= @StartUserId
ORDER BY [UserId]

PRINT CHAR(10) + '==============================================================================' + CHAR(10)
PRINT 'INSERTION COMPLÉTÉE AVEC SUCCÈS'
PRINT '10 nouveaux instructeurs ont été créés et assignés au role 3'
PRINT '==============================================================================' + CHAR(10)
