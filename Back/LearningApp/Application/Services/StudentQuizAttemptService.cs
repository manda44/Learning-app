using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace LearningApp.Application.Services
{
    public class StudentQuizAttemptService
    {
        private readonly IStudentQuizAttemptRepository _quizAttemptRepository;
        private readonly IQuizRepository _quizRepository;
        private readonly IQuestionRepository _questionRepository;
        private readonly IQuestionItemRepository _questionItemRepository;
        private readonly HttpClient _httpClient;

        public StudentQuizAttemptService(
            IStudentQuizAttemptRepository quizAttemptRepository,
            IQuizRepository quizRepository,
            IQuestionRepository questionRepository,
            IQuestionItemRepository questionItemRepository,
            HttpClient httpClient)
        {
            _quizAttemptRepository = quizAttemptRepository;
            _quizRepository = quizRepository;
            _questionRepository = questionRepository;
            _questionItemRepository = questionItemRepository;
            _httpClient = httpClient;
        }

        public async Task<StudentQuizAttemptDto> StartQuizAttempt(CreateStudentQuizAttemptDto dto)
        {
            // Get the number of previous attempts
            var previousAttempts = await _quizAttemptRepository.GetStudentQuizAttempts(dto.StudentId, dto.QuizId);
            var attemptNumber = previousAttempts.Count + 1;

            var attempt = new StudentQuizAttempt
            {
                StudentId = dto.StudentId,
                QuizId = dto.QuizId,
                ChapterProgressId = dto.ChapterProgressId,
                AttemptNumber = attemptNumber,
                AttemptDate = DateTime.UtcNow,
                Status = "in_progress",
                Score = null,
                TimeSpentSeconds = null
            };

            await _quizAttemptRepository.AddAsync(attempt);

            return new StudentQuizAttemptDto
            {
                QuizAttemptId = attempt.QuizAttemptId,
                StudentId = attempt.StudentId,
                QuizId = attempt.QuizId,
                ChapterProgressId = attempt.ChapterProgressId,
                AttemptNumber = attempt.AttemptNumber,
                AttemptDate = attempt.AttemptDate,
                Status = attempt.Status,
                Score = attempt.Score,
                TimeSpentSeconds = attempt.TimeSpentSeconds,
                StudentQuestionResponses = new List<StudentQuestionResponseDto>()
            };
        }

        public async Task<StudentQuizAttemptDto> SubmitQuizAttempt(int attemptId, SubmitQuizAttemptDto dto)
        {
            var attempt = await _quizAttemptRepository.GetByIdAsync(attemptId);
            if (attempt == null)
            {
                throw new Exception($"Quiz attempt with ID {attemptId} not found");
            }

            // Get quiz and questions with their items
            var questions = await _quizRepository.GetQuestions(attempt.QuizId);
            var quiz = await _quizRepository.GetQuizById(attempt.QuizId);

            if (quiz == null)
            {
                throw new Exception($"Quiz with ID {attempt.QuizId} not found");
            }

            int totalQuestions = questions.Count;
            int correctAnswers = 0;

            var questionResponses = new List<StudentQuestionResponse>();

            // Process each answer
            foreach (var answer in dto.Answers)
            {
                var question = questions.FirstOrDefault(q => q.QuestionId == answer.QuestionId);
                if (question == null) continue;

                if (question.Type == "MCQ")
                {
                    // Multiple choice - check if all selected items are correct and no incorrect items are selected
                    var correctItems = question.QuestionItems.Where(qi => qi.IsRight == true).Select(qi => qi.QuestionItemId).ToList();
                    var selectedItems = answer.QuestionItemIds ?? new List<int>();

                    bool isCorrect = correctItems.Count == selectedItems.Count &&
                                   correctItems.All(ci => selectedItems.Contains(ci));

                    // Create a response for each selected item
                    foreach (var itemId in selectedItems)
                    {
                        questionResponses.Add(new StudentQuestionResponse
                        {
                            QuizAttemptId = attemptId,
                            QuestionId = answer.QuestionId,
                            QuestionItemId = itemId,
                            ResponseContent = null,
                            IsCorrect = isCorrect
                        });
                    }

                    if (isCorrect)
                    {
                        correctAnswers++;
                    }
                }
                else if (question.Type == "UNIQUECHOICE")
                {
                    // Single choice - check if the selected item is correct
                    var selectedItemId = answer.QuestionItemIds?.FirstOrDefault();
                    if (selectedItemId.HasValue)
                    {
                        var selectedItem = question.QuestionItems.FirstOrDefault(qi => qi.QuestionItemId == selectedItemId.Value);
                        bool isCorrect = selectedItem?.IsRight == true;

                        questionResponses.Add(new StudentQuestionResponse
                        {
                            QuizAttemptId = attemptId,
                            QuestionId = answer.QuestionId,
                            QuestionItemId = selectedItemId.Value,
                            ResponseContent = null,
                            IsCorrect = isCorrect
                        });

                        if (isCorrect)
                        {
                            correctAnswers++;
                        }
                    }
                }
                else if (question.Type == "OPENRESPONSE")
                {
                    // Open response - automatic grading using AI with retry
                    var correctAnswer = question.QuestionItems.FirstOrDefault()?.RightResponse;
                    bool? isCorrect = null;

                    if (!string.IsNullOrWhiteSpace(correctAnswer) && !string.IsNullOrWhiteSpace(answer.ResponseContent))
                    {
                        // Retry up to 3 times to ensure AI evaluation succeeds
                        for (int retryCount = 0; retryCount < 3; retryCount++)
                        {
                            try
                            {
                                // Use AI to evaluate the answer
                                isCorrect = await EvaluateAnswerWithAI(correctAnswer, answer.ResponseContent);

                                if (isCorrect == true)
                                {
                                    correctAnswers++;
                                }
                                break; // Success, exit retry loop
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"AI evaluation attempt {retryCount + 1} failed: {ex.Message}");

                                // If this was the last attempt, mark as incorrect rather than null
                                if (retryCount == 2)
                                {
                                    Console.WriteLine("All AI evaluation attempts failed. Marking as incorrect.");
                                    isCorrect = false;
                                }
                                else
                                {
                                    // Wait a bit before retrying
                                    await Task.Delay(500);
                                }
                            }
                        }
                    }
                    else
                    {
                        // Empty or missing answer/correct answer - mark as incorrect
                        isCorrect = false;
                    }

                    questionResponses.Add(new StudentQuestionResponse
                    {
                        QuizAttemptId = attemptId,
                        QuestionId = answer.QuestionId,
                        QuestionItemId = null,
                        ResponseContent = answer.ResponseContent,
                        IsCorrect = isCorrect
                    });
                }
            }

            // Calculate score (includes MCQ, UNIQUECHOICE, and OPENRESPONSE questions)
            int score = totalQuestions > 0 ? (int)Math.Round((double)correctAnswers / totalQuestions * 100) : 0;
            string status = score >= quiz.SuccessPercentage ? "passed" : "failed";

            // Update the attempt
            attempt.Score = score;
            attempt.Status = status;
            attempt.TimeSpentSeconds = dto.TimeSpentSeconds;

            await _quizAttemptRepository.UpdateAsync(attempt);

            // Save all question responses
            foreach (var response in questionResponses)
            {
                await _quizAttemptRepository.AddQuestionResponseAsync(response);
            }

            // Return the complete result
            return new StudentQuizAttemptDto
            {
                QuizAttemptId = attempt.QuizAttemptId,
                StudentId = attempt.StudentId,
                QuizId = attempt.QuizId,
                ChapterProgressId = attempt.ChapterProgressId,
                AttemptNumber = attempt.AttemptNumber,
                AttemptDate = attempt.AttemptDate,
                Status = attempt.Status,
                Score = attempt.Score,
                TimeSpentSeconds = attempt.TimeSpentSeconds,
                StudentQuestionResponses = questionResponses.Select(qr => new StudentQuestionResponseDto
                {
                    QuestionResponseId = qr.QuestionResponseId,
                    QuizAttemptId = qr.QuizAttemptId,
                    QuestionId = qr.QuestionId,
                    QuestionItemId = qr.QuestionItemId,
                    ResponseContent = qr.ResponseContent,
                    IsCorrect = qr.IsCorrect
                }).ToList()
            };
        }

        public async Task<StudentQuizAttemptDto?> GetQuizAttemptById(int attemptId)
        {
            var attempt = await _quizAttemptRepository.GetQuizAttemptWithResponses(attemptId);
            if (attempt == null) return null;

            return new StudentQuizAttemptDto
            {
                QuizAttemptId = attempt.QuizAttemptId,
                StudentId = attempt.StudentId,
                QuizId = attempt.QuizId,
                ChapterProgressId = attempt.ChapterProgressId,
                AttemptNumber = attempt.AttemptNumber,
                AttemptDate = attempt.AttemptDate,
                Status = attempt.Status,
                Score = attempt.Score,
                TimeSpentSeconds = attempt.TimeSpentSeconds,
                StudentQuestionResponses = attempt.StudentQuestionResponses.Select(qr => new StudentQuestionResponseDto
                {
                    QuestionResponseId = qr.QuestionResponseId,
                    QuizAttemptId = qr.QuizAttemptId,
                    QuestionId = qr.QuestionId,
                    QuestionItemId = qr.QuestionItemId,
                    ResponseContent = qr.ResponseContent,
                    IsCorrect = qr.IsCorrect
                }).ToList()
            };
        }

        public async Task<List<StudentQuizAttemptDto>> GetStudentQuizAttempts(int studentId, int quizId)
        {
            var attempts = await _quizAttemptRepository.GetStudentQuizAttempts(studentId, quizId);
            return attempts.Select(a => new StudentQuizAttemptDto
            {
                QuizAttemptId = a.QuizAttemptId,
                StudentId = a.StudentId,
                QuizId = a.QuizId,
                ChapterProgressId = a.ChapterProgressId,
                AttemptNumber = a.AttemptNumber,
                AttemptDate = a.AttemptDate,
                Status = a.Status,
                Score = a.Score,
                TimeSpentSeconds = a.TimeSpentSeconds,
                StudentQuestionResponses = new List<StudentQuestionResponseDto>()
            }).ToList();
        }

        /// <summary>
        /// Evaluate a student's answer using AI (Groq API with Llama model)
        /// </summary>
        private async Task<bool> EvaluateAnswerWithAI(string correctAnswer, string studentAnswer)
        {
            try
            {
                // Groq API endpoint (free and fast)
                const string apiUrl = "https://api.groq.com/openai/v1/chat/completions";

                // You need to set this API key in your environment variables or configuration
                // Get a free key from: https://console.groq.com/
                const string apiKey = "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";

                Console.WriteLine($"[AI Evaluation] Evaluating answer...");
                Console.WriteLine($"[AI Evaluation] Correct: {correctAnswer}");
                Console.WriteLine($"[AI Evaluation] Student: {studentAnswer}");

                var requestBody = new
                {
                    model = "llama3-8b-8192",
                    messages = new[]
                    {
                        new
                        {
                            role = "system",
                            content = "You are a teacher grading student answers. Compare the student's answer with the correct answer and determine if they convey the same meaning. Consider synonyms, paraphrasing, and equivalent explanations. Be lenient if the core concepts match. Respond with ONLY 'CORRECT' or 'INCORRECT'."
                        },
                        new
                        {
                            role = "user",
                            content = $"Correct answer: {correctAnswer}\n\nStudent's answer: {studentAnswer}\n\nIs the student's answer correct?"
                        }
                    },
                    temperature = 0.2,
                    max_tokens = 20
                };

                var jsonContent = JsonSerializer.Serialize(requestBody);
                var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var request = new HttpRequestMessage(HttpMethod.Post, apiUrl);
                request.Headers.Add("Authorization", $"Bearer {apiKey}");
                request.Content = httpContent;

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"[AI Evaluation] API Error: {response.StatusCode} - {errorContent}");
                    throw new Exception($"AI API returned {response.StatusCode}: {errorContent}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[AI Evaluation] Raw Response: {responseContent}");

                var jsonResponse = JsonDocument.Parse(responseContent);

                var aiResponse = jsonResponse.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString()
                    ?.Trim()
                    .ToUpper();

                Console.WriteLine($"[AI Evaluation] AI Decision: {aiResponse}");

                bool isCorrect = aiResponse?.Contains("CORRECT") == true && !aiResponse.Contains("INCORRECT");
                Console.WriteLine($"[AI Evaluation] Final Result: {(isCorrect ? "CORRECT" : "INCORRECT")}");

                return isCorrect;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AI Evaluation] Error: {ex.Message}");
                Console.WriteLine($"[AI Evaluation] Stack Trace: {ex.StackTrace}");
                throw;
            }
        }
    }
}
