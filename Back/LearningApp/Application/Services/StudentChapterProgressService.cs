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
            bool previousChapterPassed = true; // First chapter is always unlocked

            foreach (var chapter in chapters)
            {
                var chapterQuiz = courseQuizzes.FirstOrDefault(q => q.ChapterId == chapter.ChapterId);
                var chapterProgress = progressDict.ContainsKey(chapter.ChapterId) ? progressDict[chapter.ChapterId] : null;

                // Check if this chapter's quiz was passed and get last score
                bool quizPassed = false;
                int? lastQuizScore = null;
                if (chapterQuiz != null)
                {
                    var quizAttemptsForChapter = studentAttempts
                        .Where(a => a.QuizId == chapterQuiz.QuizId)
                        .OrderByDescending(a => a.AttemptDate)
                        .ToList();

                    var passedAttempt = quizAttemptsForChapter.FirstOrDefault(a => a.Status == "passed");
                    quizPassed = passedAttempt != null;

                    // Get the last attempt score (most recent)
                    var lastAttempt = quizAttemptsForChapter.FirstOrDefault();
                    lastQuizScore = lastAttempt?.Score;
                }

                // Chapter is locked if the previous chapter's quiz was not passed
                bool isLocked = !previousChapterPassed;

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
                    QuizPassed = quizPassed,
                    QuizLocked = quizLocked,
                    LastQuizScore = lastQuizScore,
                    ProgressPercentage = chapterProgress?.ProgressPercentage ?? 0
                };

                result.Add(chapterDto);

                // Update for next iteration: next chapter is unlocked only if current quiz was passed OR no quiz exists
                if (chapterQuiz != null)
                {
                    previousChapterPassed = quizPassed;
                }
                // If no quiz, chapter completion doesn't affect next chapter lock status
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
