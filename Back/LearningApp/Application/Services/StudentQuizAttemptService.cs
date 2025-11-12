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
                    // Open response - automatic grading based on word matching
                    var correctAnswerRaw = question.QuestionItems.FirstOrDefault()?.RightResponse;
                    bool? isCorrect = null;
                    GradingResult gradingResult = null;

                    if (!string.IsNullOrWhiteSpace(correctAnswerRaw) && !string.IsNullOrWhiteSpace(answer.ResponseContent))
                    {
                        try
                        {
                            // Extract BOLD text from JSON content (from BlockNote editor) for keyword matching
                            string correctAnswer = ExtractBoldTextFromJson(correctAnswerRaw);
                            string studentAnswer = answer.ResponseContent;

                            // If no bold text found, fall back to extracting all text (for plain text responses)
                            if (string.IsNullOrWhiteSpace(correctAnswer))
                            {
                                correctAnswer = ExtractTextFromJson(correctAnswerRaw);
                            }
                            if (string.IsNullOrWhiteSpace(studentAnswer))
                            {
                                studentAnswer = ExtractTextFromJson(answer.ResponseContent);
                            }

                            Console.WriteLine($"[Open Response Grading] Correct answer: {correctAnswer}");
                            Console.WriteLine($"[Open Response Grading] Student answer: {studentAnswer}");

                            // Evaluate the answer based on word matching with detailed results
                            gradingResult = EvaluateAnswerWithWordMatchingDetailed(correctAnswer, studentAnswer);
                            isCorrect = gradingResult.IsCorrect;

                            if (isCorrect == true)
                            {
                                correctAnswers++;
                            }

                            Console.WriteLine($"[Open Response Grading] Result: {(isCorrect == true ? "CORRECT" : "INCORRECT")}");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[Open Response Grading] Error during evaluation: {ex.Message}");
                            isCorrect = false;
                        }
                    }
                    else
                    {
                        // Empty or missing answer/correct answer - mark as incorrect
                        isCorrect = false;
                    }

                    var response = new StudentQuestionResponse
                    {
                        QuizAttemptId = attemptId,
                        QuestionId = answer.QuestionId,
                        QuestionItemId = null,
                        ResponseContent = answer.ResponseContent,
                        IsCorrect = isCorrect
                    };

                    questionResponses.Add(response);
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
                    IsCorrect = qr.IsCorrect,
                    ExpectedKeywords = null,
                    FoundKeywords = null,
                    MatchPercentage = null
                }).ToList()
            };
        }

        /// <summary>
        /// Submit quiz (creates attempt and submits answers in one call)
        /// Deletes all previous attempts and responses before creating the new one
        /// </summary>
        public async Task<StudentQuizAttemptDto> SubmitQuiz(SubmitQuizDto dto)
        {
            // Get all previous attempts for this student and quiz
            var previousAttempts = await _quizAttemptRepository.GetStudentQuizAttempts(dto.StudentId, dto.QuizId);

            // Delete all previous attempts and their responses
            foreach (var oldAttempt in previousAttempts)
            {
                // Delete the attempt (cascade will delete responses if configured)
                await _quizAttemptRepository.DeleteAsync(oldAttempt.QuizAttemptId);
            }

            // Create the new quiz attempt (always attempt number 1 since we deleted previous ones)
            var attempt = new StudentQuizAttempt
            {
                StudentId = dto.StudentId,
                QuizId = dto.QuizId,
                ChapterProgressId = null,
                AttemptNumber = 1, // Always 1 since we delete previous attempts
                AttemptDate = DateTime.UtcNow,
                Status = "in_progress",
                Score = null,
                TimeSpentSeconds = null
            };

            await _quizAttemptRepository.AddAsync(attempt);

            // Now submit using the existing logic
            var submitDto = new SubmitQuizAttemptDto
            {
                TimeSpentSeconds = dto.TimeSpentSeconds,
                Answers = dto.Answers
            };

            return await SubmitQuizAttempt(attempt.QuizAttemptId, submitDto);
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
                    IsCorrect = qr.IsCorrect,
                    ExpectedKeywords = null,
                    FoundKeywords = null,
                    MatchPercentage = null
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
        /// Extract only BOLD text from BlockNote JSON content
        /// </summary>
        private string ExtractBoldTextFromJson(string jsonContent)
        {
            if (string.IsNullOrWhiteSpace(jsonContent))
                return string.Empty;

            try
            {
                // Try to parse as JSON
                using (JsonDocument doc = JsonDocument.Parse(jsonContent))
                {
                    var root = doc.RootElement;
                    var boldWords = new List<string>();

                    // Handle array format (most common from BlockNote)
                    if (root.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var element in root.EnumerateArray())
                        {
                            ExtractBoldTextFromElement(element, boldWords);
                        }
                    }
                    // Handle object format
                    else if (root.ValueKind == JsonValueKind.Object)
                    {
                        ExtractBoldTextFromElement(root, boldWords);
                    }

                    return string.Join(" ", boldWords).Trim();
                }
            }
            catch (Exception ex)
            {
                // If JSON parsing fails (invalid JSON, etc), return empty (no bold text found)
                Console.WriteLine($"[ExtractBoldTextFromJson] Failed to parse JSON: {ex.Message}");
                return string.Empty;
            }
        }

        /// <summary>
        /// Recursively extract only BOLD text from JSON elements
        /// BlockNote format: {type: "text", text: "...", styles: {bold: true, ...}}
        /// </summary>
        private void ExtractBoldTextFromElement(JsonElement element, List<string> boldWords)
        {
            if (element.ValueKind == JsonValueKind.Object)
            {
                // Check if this element has text and bold style
                if (element.TryGetProperty("text", out var textProp) && textProp.ValueKind == JsonValueKind.String &&
                    element.TryGetProperty("styles", out var stylesProp) && stylesProp.ValueKind == JsonValueKind.Object)
                {
                    // Check if bold is true
                    if (stylesProp.TryGetProperty("bold", out var boldProp) && boldProp.ValueKind == JsonValueKind.True)
                    {
                        string? text = textProp.GetString();
                        if (!string.IsNullOrWhiteSpace(text))
                        {
                            boldWords.Add(text);
                        }
                    }
                }

                // Recursively process content array
                if (element.TryGetProperty("content", out var contentProp) && contentProp.ValueKind == JsonValueKind.Array)
                {
                    foreach (var contentElement in contentProp.EnumerateArray())
                    {
                        ExtractBoldTextFromElement(contentElement, boldWords);
                    }
                }

                // Recursively process children array
                if (element.TryGetProperty("children", out var childrenProp) && childrenProp.ValueKind == JsonValueKind.Array)
                {
                    foreach (var childElement in childrenProp.EnumerateArray())
                    {
                        ExtractBoldTextFromElement(childElement, boldWords);
                    }
                }
            }
            else if (element.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in element.EnumerateArray())
                {
                    ExtractBoldTextFromElement(item, boldWords);
                }
            }
        }

        private string ExtractTextFromJson(string jsonContent)
        {
            if (string.IsNullOrWhiteSpace(jsonContent))
                return string.Empty;

            try
            {
                // Try to parse as JSON
                using (JsonDocument doc = JsonDocument.Parse(jsonContent))
                {
                    var root = doc.RootElement;
                    var textParts = new List<string>();

                    // Handle array format (most common from BlockNote)
                    if (root.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var element in root.EnumerateArray())
                        {
                            ExtractTextFromElement(element, textParts);
                        }
                    }
                    // Handle object format
                    else if (root.ValueKind == JsonValueKind.Object)
                    {
                        ExtractTextFromElement(root, textParts);
                    }

                    return string.Join(" ", textParts).Trim();
                }
            }
            catch (JsonException)
            {
                // If JSON parsing fails, return the content as-is (it might be plain text)
                return jsonContent.Trim();
            }
        }

        /// <summary>
        /// Recursively extract text from JSON elements
        /// </summary>
        private void ExtractTextFromElement(JsonElement element, List<string> textParts)
        {
            if (element.ValueKind == JsonValueKind.Object)
            {
                // Look for "text" property
                if (element.TryGetProperty("text", out var textProp) && textProp.ValueKind == JsonValueKind.String)
                {
                    string? text = textProp.GetString();
                    if (!string.IsNullOrWhiteSpace(text))
                    {
                        textParts.Add(text);
                    }
                }

                // Look for "content" property (array of content items)
                if (element.TryGetProperty("content", out var contentProp) && contentProp.ValueKind == JsonValueKind.Array)
                {
                    foreach (var contentElement in contentProp.EnumerateArray())
                    {
                        ExtractTextFromElement(contentElement, textParts);
                    }
                }

                // Recursively process other properties
                foreach (var prop in element.EnumerateObject())
                {
                    if (prop.Name != "text" && prop.Name != "content")
                    {
                        ExtractTextFromElement(prop.Value, textParts);
                    }
                }
            }
            else if (element.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in element.EnumerateArray())
                {
                    ExtractTextFromElement(item, textParts);
                }
            }
        }

        /// <summary>
        /// Evaluate answer based on word matching percentage
        /// Minimum 50% match of words from correct answer found in student answer
        /// </summary>
        private bool EvaluateAnswerWithWordMatching(string correctAnswer, string studentAnswer)
        {
            const int minimumMatchPercentage = 50;

            // Normalize answers: lowercase and remove extra spaces
            string normalizedCorrect = System.Text.RegularExpressions.Regex.Replace(
                correctAnswer.ToLower().Trim(), @"\s+", " ");
            string normalizedStudent = System.Text.RegularExpressions.Regex.Replace(
                studentAnswer.ToLower().Trim(), @"\s+", " ");

            // Split into words and remove common stop words
            var correctWords = GetSignificantWords(normalizedCorrect);
            var studentWords = GetSignificantWords(normalizedStudent);

            Console.WriteLine($"[Word Matching] Correct words: {string.Join(", ", correctWords)}");
            Console.WriteLine($"[Word Matching] Student words: {string.Join(", ", studentWords)}");

            if (correctWords.Count == 0)
                return studentWords.Count == 0;

            // Count how many words from correct answer are found in student answer
            int matchedWords = 0;
            foreach (var word in correctWords)
            {
                if (studentWords.Contains(word))
                {
                    matchedWords++;
                }
            }

            // Calculate match percentage
            double matchPercentage = (double)matchedWords / correctWords.Count * 100;
            Console.WriteLine($"[Word Matching] Match percentage: {matchPercentage:F2}% ({matchedWords}/{correctWords.Count} words)");
            Console.WriteLine($"[Word Matching] Minimum required: {minimumMatchPercentage}%");

            return matchPercentage >= minimumMatchPercentage;
        }

        /// <summary>
        /// Extract significant words (remove stop words and very short words)
        /// </summary>
        private HashSet<string> GetSignificantWords(string text)
        {
            // Common English stop words to ignore
            var stopWords = new HashSet<string>
            {
                "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "is", "was", "are", "be",
                "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may",
                "might", "must", "can", "by", "from", "with", "as", "it", "this", "that", "these", "those", "i", "you",
                "he", "she", "we", "they", "what", "which", "who", "when", "where", "why", "how", "all", "each", "every",
                "both", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
                "than", "too", "very", "just", "if", "then", "because", "while", "your", "his", "her", "its", "our", "their"
            };

            var words = text.Split(new[] { ' ', '.', ',', '!', '?', ';', ':', '\n', '\r' },
                System.StringSplitOptions.RemoveEmptyEntries);

            var significantWords = new HashSet<string>();
            foreach (var word in words)
            {
                // Keep words longer than 2 characters and not in stop words list
                if (word.Length > 2 && !stopWords.Contains(word))
                {
                    significantWords.Add(word);
                }
            }

            return significantWords;
        }

        /// <summary>
        /// Evaluate answer based on word matching and return detailed information
        /// Minimum 50% match of words from correct answer found in student answer
        /// </summary>
        private GradingResult EvaluateAnswerWithWordMatchingDetailed(string correctAnswer, string studentAnswer)
        {
            const int minimumMatchPercentage = 50;

            var result = new GradingResult();

            // Normalize answers: lowercase and remove extra spaces
            string normalizedCorrect = System.Text.RegularExpressions.Regex.Replace(
                correctAnswer.ToLower().Trim(), @"\s+", " ");
            string normalizedStudent = System.Text.RegularExpressions.Regex.Replace(
                studentAnswer.ToLower().Trim(), @"\s+", " ");

            // Split into words and remove common stop words
            var correctWords = GetSignificantWords(normalizedCorrect);
            var studentWords = GetSignificantWords(normalizedStudent);

            result.ExpectedKeywords = new List<string>(correctWords);
            result.FoundKeywords = new List<string>();

            Console.WriteLine($"[Word Matching] Correct words: {string.Join(", ", correctWords)}");
            Console.WriteLine($"[Word Matching] Student words: {string.Join(", ", studentWords)}");

            if (correctWords.Count == 0)
            {
                result.IsCorrect = studentWords.Count == 0;
                result.MatchPercentage = studentWords.Count == 0 ? 100 : 0;
                return result;
            }

            // Count how many words from correct answer are found in student answer
            int matchedWords = 0;
            foreach (var word in correctWords)
            {
                if (studentWords.Contains(word))
                {
                    matchedWords++;
                    result.FoundKeywords.Add(word);
                }
            }

            // Calculate match percentage
            double matchPercentage = (double)matchedWords / correctWords.Count * 100;
            result.MatchPercentage = (int)Math.Round(matchPercentage);
            result.IsCorrect = matchPercentage >= minimumMatchPercentage;

            Console.WriteLine($"[Word Matching] Match percentage: {matchPercentage:F2}% ({matchedWords}/{correctWords.Count} words)");
            Console.WriteLine($"[Word Matching] Minimum required: {minimumMatchPercentage}%");

            return result;
        }

        /// <summary>
        /// Class to hold grading results with keyword information
        /// </summary>
        private class GradingResult
        {
            public bool IsCorrect { get; set; }
            public int MatchPercentage { get; set; }
            public List<string> ExpectedKeywords { get; set; } = new List<string>();
            public List<string> FoundKeywords { get; set; } = new List<string>();
        }
    }
}
