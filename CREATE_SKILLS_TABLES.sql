-- ============================================================================
-- CREATE SKILLS-RELATED TABLES
-- Tables: Skill, CourseSkill, StudentSkill
-- ============================================================================

-- ============================================================================
-- TABLE: Skill
-- Description: Master table for all available skills
-- ============================================================================
CREATE TABLE [dbo].[Skill] (
    [SkillId] INT PRIMARY KEY IDENTITY(1,1),
    [SkillName] NVARCHAR(100) NOT NULL UNIQUE,
    [Description] NVARCHAR(500) NULL,
    [Category] NVARCHAR(50) NULL, -- e.g., 'Frontend', 'Backend', 'DevOps', 'Database'
    [Level] NVARCHAR(20) NULL,    -- e.g., 'Beginner', 'Intermediate', 'Advanced'
    [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [UpdatedAt] DATETIME NULL
);

-- ============================================================================
-- TABLE: CourseSkill
-- Description: Join table - Maps skills required for each course
-- ============================================================================
CREATE TABLE [dbo].[CourseSkill] (
    [CourseSkillId] INT PRIMARY KEY IDENTITY(1,1),
    [CourseId] INT NOT NULL,
    [SkillId] INT NOT NULL,
    [IsRequired] BIT NOT NULL DEFAULT 1,  -- 1 = Required, 0 = Optional
    [ProficiencyLevel] NVARCHAR(20) NULL, -- e.g., 'Basic', 'Proficient', 'Expert'
    [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),

    -- Foreign Keys
    CONSTRAINT FK_CourseSkill_Course FOREIGN KEY ([CourseId])
        REFERENCES [dbo].[Course]([CourseId]) ON DELETE CASCADE,
    CONSTRAINT FK_CourseSkill_Skill FOREIGN KEY ([SkillId])
        REFERENCES [dbo].[Skill]([SkillId]) ON DELETE CASCADE,

    -- Unique constraint - Each skill can only be assigned once per course
    CONSTRAINT UQ_CourseSkill_CourseSkill UNIQUE ([CourseId], [SkillId])
);

-- ============================================================================
-- TABLE: StudentSkill
-- Description: Tracks skills acquired by students through courses
-- ============================================================================
CREATE TABLE [dbo].[StudentSkill] (
    [StudentSkillId] INT PRIMARY KEY IDENTITY(1,1),
    [UserId] INT NOT NULL,           -- Student UserId
    [SkillId] INT NOT NULL,
    [ProficiencyLevel] NVARCHAR(20) NOT NULL, -- 'Beginner', 'Intermediate', 'Advanced', 'Expert'
    [YearsOfExperience] DECIMAL(5,2) NULL,
    [IsVerified] BIT NOT NULL DEFAULT 0,      -- 1 = Verified by instructor/test
    [AcquiredDate] DATETIME NOT NULL DEFAULT GETDATE(),
    [LastUpdatedDate] DATETIME NULL,
    [VerifiedBy] INT NULL,                    -- UserId of instructor who verified
    [VerificationDate] DATETIME NULL,

    -- Foreign Keys
    CONSTRAINT FK_StudentSkill_User FOREIGN KEY ([UserId])
        REFERENCES [dbo].[Users]([UserId]) ON DELETE CASCADE,
    CONSTRAINT FK_StudentSkill_Skill FOREIGN KEY ([SkillId])
        REFERENCES [dbo].[Skill]([SkillId]) ON DELETE CASCADE,
    CONSTRAINT FK_StudentSkill_VerifiedBy FOREIGN KEY ([VerifiedBy])
        REFERENCES [dbo].[Users]([UserId]) ON DELETE NO ACTION ON UPDATE NO ACTION,

    -- Unique constraint - Each student has one proficiency per skill
    CONSTRAINT UQ_StudentSkill_UserSkill UNIQUE ([UserId], [SkillId])
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for CourseSkill lookups
CREATE INDEX IX_CourseSkill_CourseId ON [dbo].[CourseSkill]([CourseId]);
CREATE INDEX IX_CourseSkill_SkillId ON [dbo].[CourseSkill]([SkillId]);

-- Index for StudentSkill lookups
CREATE INDEX IX_StudentSkill_UserId ON [dbo].[StudentSkill]([UserId]);
CREATE INDEX IX_StudentSkill_SkillId ON [dbo].[StudentSkill]([SkillId]);
CREATE INDEX IX_StudentSkill_IsVerified ON [dbo].[StudentSkill]([IsVerified]);

-- Index for Skill searches
CREATE INDEX IX_Skill_Category ON [dbo].[Skill]([Category]);

-- ============================================================================
-- INSERT BASE SKILLS FROM course_skills.csv
-- These are the unique skills mentioned in the course requirements
-- ============================================================================

INSERT INTO [dbo].[Skill] ([SkillName], [Description], [Category], [Level])
VALUES
('Python Programming', 'Python language and ecosystem for web and data science', 'Backend', 'Intermediate'),
('JavaScript', 'JavaScript programming language for web development', 'Frontend', 'Intermediate'),
('TypeScript', 'TypeScript - typed superset of JavaScript', 'Frontend', 'Advanced'),
('React', 'React.js library for building user interfaces', 'Frontend', 'Intermediate'),
('Vue.js', 'Vue.js progressive framework for building UIs', 'Frontend', 'Intermediate'),
('Angular', 'Angular framework for building SPAs', 'Frontend', 'Advanced'),
('HTML/CSS', 'HTML markup and CSS styling for web pages', 'Frontend', 'Beginner'),
('Node.js', 'JavaScript runtime for backend development', 'Backend', 'Intermediate'),
('Express.js', 'Express.js web framework for Node.js', 'Backend', 'Intermediate'),
('Flask', 'Flask micro web framework for Python', 'Backend', 'Beginner'),
('Django', 'Django full-featured web framework for Python', 'Backend', 'Intermediate'),
('C#', 'C# programming language for .NET development', 'Backend', 'Intermediate'),
('.NET', '.NET framework for enterprise applications', 'Backend', 'Intermediate'),
('Java', 'Java programming language for enterprise apps', 'Backend', 'Intermediate'),
('SQL Database', 'SQL and relational database design', 'Database', 'Intermediate'),
('MongoDB', 'MongoDB NoSQL database', 'Database', 'Intermediate'),
('GraphQL', 'GraphQL query language for APIs', 'Backend', 'Advanced'),
('REST APIs', 'REST API design and development', 'Backend', 'Intermediate'),
('Docker', 'Docker containerization technology', 'DevOps', 'Intermediate'),
('Kubernetes', 'Kubernetes container orchestration', 'DevOps', 'Advanced'),
('Git', 'Git version control and collaborative development', 'Tools', 'Beginner'),
('CI/CD', 'Continuous Integration and Deployment', 'DevOps', 'Intermediate'),
('DevOps', 'DevOps practices and tools', 'DevOps', 'Intermediate'),
('Linux', 'Linux operating system and administration', 'DevOps', 'Intermediate'),
('AWS', 'Amazon Web Services cloud platform', 'Cloud', 'Intermediate'),
('Azure', 'Microsoft Azure cloud platform', 'Cloud', 'Intermediate'),
('Web Security', 'Web application security and best practices', 'Security', 'Intermediate'),
('Data Structures', 'Data structures and algorithms', 'Fundamentals', 'Intermediate'),
('Algorithms', 'Algorithm design and analysis', 'Fundamentals', 'Intermediate'),
('System Design', 'System design and architecture', 'Architecture', 'Advanced'),
('Testing', 'Software testing and quality assurance', 'QA', 'Intermediate');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT COUNT(*) as [Total Skills Created] FROM [dbo].[Skill];
SELECT COUNT(*) as [Total Skill Categories] FROM (SELECT DISTINCT [Category] FROM [dbo].[Skill]) AS Categories;

-- Display all created skills
SELECT [SkillId], [SkillName], [Category], [Level]
FROM [dbo].[Skill]
ORDER BY [Category], [SkillName];
