using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.Application.Services
{
    public class StudentChapterProgressService
    {
        private readonly IStudentChapterProgressRepository _progressRepository;
        private readonly IChapterRepository _chapterRepository;
        private readonly IQuizRepository _quizRepository;
        private readonly IStudentQuizAttemptRepository _quizAttemptRepository;

        public StudentChapterProgressService(
            IStudentChapterProgressRepository progressRepository,
            IChapterRepository chapterRepository,
            IQuizRepository quizRepository,
            IStudentQuizAttemptRepository quizAttemptRepository)
        {
            _progressRepository = progressRepository;
            _chapterRepository = chapterRepository;
            _quizRepository = quizRepository;
            _quizAttemptRepository = quizAttemptRepository;
        }

        /// <summary>
        /// Mark a chapter as completed for a student
        /// </summary>
        public async Task<StudentChapterProgressDto> MarkChapterAsCompleted(int studentId, int chapterId)
        {
            var progress = await _progressRepository.GetByStudentAndChapterAsync(studentId, chapterId);

            if (progress == null)
            {
                // Create new progress entry
                progress = new StudentChapterProgress
                {
                    StudentId = studentId,
                    ChapterId = chapterId,
                    StartedDate = DateTime.UtcNow,
                    CompletedDate = DateTime.UtcNow,
                    Status = "completed",
                    ProgressPercentage = 100
                };
                await _progressRepository.AddAsync(progress);
            }
            else
            {
                // Update existing progress
                progress.CompletedDate = DateTime.UtcNow;
                progress.Status = "completed";
                progress.ProgressPercentage = 100;
                await _progressRepository.UpdateAsync(progress);
            }

            return new StudentChapterProgressDto
            {
                ChapterProgressId = progress.ChapterProgressId,
                StudentId = progress.StudentId,
                ChapterId = progress.ChapterId,
                StartedDate = progress.StartedDate,
                CompletedDate = progress.CompletedDate,
                Status = progress.Status,
                ProgressPercentage = progress.ProgressPercentage
            };
        }

        /// <summary>
        /// Get all chapters with their lock status for a student
        /// </summary>
        public async Task<List<ChapterWithLockStatusDto>> GetChaptersWithLockStatus(int courseId, int studentId)
        {
            // Get all chapters for the course
            var chapters = (await _chapterRepository.GetAllAsync())
                .Where(c => c.CourseId == courseId)
                .OrderBy(c => c.Order_)
                .ToList();

            // Get all quizzes for these chapters
            var allQuizzes = await _quizRepository.GetAllAsync();
            var courseQuizzes = allQuizzes.Where(q => chapters.Any(c => c.ChapterId == q.ChapterId)).ToList();

            // Get all student progress
            var studentProgress = await _progressRepository.GetStudentChapterProgressAsync(studentId);
            var progressDict = studentProgress.ToDictionary(p => p.ChapterId, p => p);

            // Get all student quiz attempts
            var studentAttempts = await _quizAttemptRepository.GetStudentQuizAttempts(studentId, 0); // 0 to get all attempts

            var result = new List<ChapterWithLockStatusDto>();

            for (int i = 0; i < chapters.Count; i++)
            {
                var chapter = chapters[i];
                var chapterQuiz = courseQuizzes.FirstOrDefault(q => q.ChapterId == chapter.ChapterId);
                var chapterProgress = progressDict.ContainsKey(chapter.ChapterId) ? progressDict[chapter.ChapterId] : null;

                // Check if this chapter's quiz was passed and get last score
                bool currentQuizPassed = false;
                int? lastQuizScore = null;
                if (chapterQuiz != null)
                {
                    var quizAttemptsForChapter = studentAttempts
                        .Where(a => a.QuizId == chapterQuiz.QuizId)
                        .OrderByDescending(a => a.AttemptDate)
                        .ToList();

                    var passedAttempt = quizAttemptsForChapter.FirstOrDefault(a => a.Status == "passed");
                    currentQuizPassed = passedAttempt != null;

                    // Get the last attempt score (most recent)
                    var lastAttempt = quizAttemptsForChapter.FirstOrDefault();
                    lastQuizScore = lastAttempt?.Score;
                }

                // Determine if this chapter is locked
                bool isLocked = false;
                if (i == 0)
                {
                    // First chapter is always unlocked
                    isLocked = false;
                }
                else
                {
                    // Check if the previous chapter's quiz was passed
                    var previousChapter = chapters[i - 1];
                    var previousChapterQuiz = courseQuizzes.FirstOrDefault(q => q.ChapterId == previousChapter.ChapterId);

                    if (previousChapterQuiz != null)
                    {
                        // Previous chapter has a quiz - check if it was passed
                        var previousQuizAttempts = studentAttempts
                            .Where(a => a.QuizId == previousChapterQuiz.QuizId)
                            .ToList();

                        var previousQuizPassed = previousQuizAttempts.Any(a => a.Status == "passed");
                        isLocked = !previousQuizPassed;
                    }
                    else
                    {
                        // Previous chapter has no quiz - inherit lock status from that chapter
                        // This means if previous chapter was unlocked, this one is too
                        isLocked = false;
                    }
                }

                // Quiz is locked if chapter is not completed
                bool quizLocked = chapterProgress?.Status != "completed";

                var chapterDto = new ChapterWithLockStatusDto
                {
                    ChapterId = chapter.ChapterId,
                    Title = chapter.Title,
                    Description = chapter.Description,
                    Order = chapter.Order_,
                    Color = chapter.Color,
                    IsLocked = isLocked,
                    IsCompleted = chapterProgress?.Status == "completed",
                    HasQuiz = chapterQuiz != null,
                    QuizId = chapterQuiz?.QuizId,
                    QuizPassed = currentQuizPassed,
                    QuizLocked = quizLocked,
                    LastQuizScore = lastQuizScore,
                    ProgressPercentage = chapterProgress?.ProgressPercentage ?? 0
                };

                result.Add(chapterDto);
            }

            return result;
        }

        /// <summary>
        /// Check if a chapter is accessible for a student
        /// </summary>
        public async Task<bool> IsChapterAccessible(int studentId, int chapterId)
        {
            var chapter = await _chapterRepository.GetByIdAsync(chapterId);
            if (chapter == null) return false;

            // Get all chapters in the same course
            var chapters = (await _chapterRepository.GetAllAsync())
                .Where(c => c.CourseId == chapter.CourseId)
                .OrderBy(c => c.Order_)
                .ToList();

            // Find the previous chapter
            var currentIndex = chapters.FindIndex(c => c.ChapterId == chapterId);
            if (currentIndex == 0) return true; // First chapter is always accessible

            var previousChapter = chapters[currentIndex - 1];

            // Check if previous chapter's quiz was passed
            var allQuizzes = await _quizRepository.GetAllAsync();
            var previousQuiz = allQuizzes.FirstOrDefault(q => q.ChapterId == previousChapter.ChapterId);

            if (previousQuiz == null)
            {
                // No quiz, so chapter is accessible
                return true;
            }

            // Check if student passed the previous quiz
            var studentAttempts = await _quizAttemptRepository.GetStudentQuizAttempts(studentId, previousQuiz.QuizId);
            var passedAttempt = studentAttempts.FirstOrDefault(a => a.Status == "passed");

            return passedAttempt != null;
        }
    }
}
