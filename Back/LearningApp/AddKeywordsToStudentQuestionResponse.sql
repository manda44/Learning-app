-- Migration: Add Keywords columns to StudentQuestionResponse table
-- Description: Add support for storing expected and found keywords for open-ended questions

-- Check if columns exist before adding them
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='StudentQuestionResponse' AND COLUMN_NAME='ExpectedKeywordsJson')
BEGIN
    ALTER TABLE StudentQuestionResponse
    ADD ExpectedKeywordsJson NVARCHAR(MAX) NULL;

    PRINT 'Added column ExpectedKeywordsJson to StudentQuestionResponse';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='StudentQuestionResponse' AND COLUMN_NAME='FoundKeywordsJson')
BEGIN
    ALTER TABLE StudentQuestionResponse
    ADD FoundKeywordsJson NVARCHAR(MAX) NULL;

    PRINT 'Added column FoundKeywordsJson to StudentQuestionResponse';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='StudentQuestionResponse' AND COLUMN_NAME='MatchPercentage')
BEGIN
    ALTER TABLE StudentQuestionResponse
    ADD MatchPercentage INT NULL;

    PRINT 'Added column MatchPercentage to StudentQuestionResponse';
END

-- Verify the changes
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME='StudentQuestionResponse'
AND COLUMN_NAME IN ('ExpectedKeywordsJson', 'FoundKeywordsJson', 'MatchPercentage')
ORDER BY ORDINAL_POSITION;
