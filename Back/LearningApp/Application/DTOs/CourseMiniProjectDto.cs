using System;

namespace LearningApp.Application.DTOs;

public class CourseMiniProjectDto
{
    public int CourseMiniProjectId { get; set; }

    public int CourseId { get; set; }

    public int MiniProjectId { get; set; }

    public DateTime CreatedAt { get; set; }
}

public class CreateCourseMiniProjectDto
{
    public int CourseId { get; set; }

    public int MiniProjectId { get; set; }
}
