-- Script to update the foreign key constraint on StudentQuestionResponse table
-- This allows QuestionItem to be deleted by setting QuestionItemId to NULL

-- First, drop the existing foreign key constraint
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK__StudentQuestionResponse__QuestionItemId')
BEGIN
    ALTER TABLE [dbo].[StudentQuestionResponse]
    DROP CONSTRAINT [FK__StudentQuestionResponse__QuestionItemId];
    PRINT 'Existing constraint dropped successfully.';
END
ELSE
BEGIN
    PRINT 'Constraint FK__StudentQuestionResponse__QuestionItemId not found. Checking for similar constraints...';

    -- Find the actual constraint name if it's different
    SELECT name, OBJECT_NAME(parent_object_id) AS table_name
    FROM sys.foreign_keys
    WHERE parent_object_id = OBJECT_ID('StudentQuestionResponse')
    AND referenced_object_id = OBJECT_ID('QuestionItem');
END

-- Re-create the foreign key constraint with ON DELETE SET NULL
ALTER TABLE [dbo].[StudentQuestionResponse]
ADD CONSTRAINT [FK__StudentQuestionResponse__QuestionItemId]
FOREIGN KEY ([QuestionItemId])
REFERENCES [dbo].[QuestionItem]([QuestionItemId])
ON DELETE SET NULL;

PRINT 'Foreign key constraint recreated with ON DELETE SET NULL.';
GO
