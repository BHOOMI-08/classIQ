/**
 * Prompt Builder Service for ClassIQ AI Suite
 * Standardizes prompt templates for Grounded AI Tutor, Study Planner, and Smart Revision Generator.
 */

export class AIPromptBuilderService {
  /**
   * System instruction for Context-Grounded RAG Tutor.
   */
  static buildTutorSystemInstruction() {
    return `You are the ClassIQ Context-Grounded AI Tutor. 
Your SOLE purpose is to answer student academic questions strictly using ONLY the provided classroom study resource excerpts.

CRITICAL CONSTRAINTS:
1. Do NOT use general external knowledge outside the provided context.
2. If the provided context excerpts do not contain enough information to confidently and accurately answer the question, you MUST respond EXACTLY with:
"The uploaded classroom resources do not contain enough information to answer this confidently."
3. Never fabricate facts, page numbers, or citations.
4. When providing an answer based on context, include clear inline reference tags such as [Source: Resource Title, Page X].
5. Keep your tone encouraging, academic, and clear.`;
  }

  /**
   * User prompt formatting for Tutor chat.
   */
  static buildTutorPrompt({ question, packedContext, history = [] }) {
    let prompt = '';

    if (history && history.length > 0) {
      prompt += `Conversation History:\n`;
      history.slice(-4).forEach((msg) => {
        prompt += `${msg.role.toUpperCase()}: ${msg.content}\n`;
      });
      prompt += `\n`;
    }

    prompt += `Retrieved Classroom Context:\n${packedContext}\n\n`;
    prompt += `Student Question: ${question}\n\n`;
    prompt += `Provide a grounded answer with inline citations, or state the exact fallback message if context is insufficient.`;

    return prompt;
  }

  /**
   * Prompt template for AI Study Planner JSON formatting.
   */
  static buildStudyPlannerPrompt({ userInputs, priorityAnalysis, backendMetrics }) {
    return `You are the ClassIQ AI Study Planner Assistant.
Convert the following prioritized academic work items and student constraints into a well-structured, realistic weekly study schedule.

Student Constraints:
- Available Daily Study Hours: ${userInputs.dailyAvailableHours || 2} hours/day
- Target Exam Dates: ${JSON.stringify(userInputs.examDates || [])}
- Weak Topics Identified: ${JSON.stringify(userInputs.weakTopics || [])}

Backend Priority Analysis & Metrics:
${JSON.stringify(priorityAnalysis, null, 2)}

Backend Aggregate Performance:
- Attendance Health: ${backendMetrics.attendanceRate}%
- Pending Assignments: ${backendMetrics.pendingAssignmentsCount}
- Upcoming Quizzes: ${backendMetrics.upcomingQuizzesCount}

Format Output:
Return ONLY a valid JSON object matching this structure:
{
  "scheduleTitle": "Personalized Academic Roadmap",
  "totalWeeklyHours": 14,
  "examCountdown": [
    { "subject": "Subject Name", "daysRemaining": 10 }
  ],
  "dailySchedule": [
    {
      "dayName": "Monday",
      "date": "YYYY-MM-DD",
      "totalMinutes": 120,
      "tasks": [
        {
          "timeSlot": "09:00 - 09:45",
          "title": "Task Title",
          "type": "revision",
          "priority": "high",
          "description": "Task description",
          "topic": "Topic Name"
        }
      ]
    }
  ],
  "revisionBlocks": ["List of core revision topics"],
  "assignmentPriority": ["Prioritized assignment list"],
  "quizPrep": ["Quiz prep guidelines"],
  "catchupBufferMinutes": 60,
  "studyStatistics": {
    "completionRate": 85,
    "focusAreas": ["Topic A", "Topic B"]
  }
}`;
  }

  /**
   * Prompt template for Smart Revision Generator.
   */
  static buildRevisionPrompt({ topic, revisionType, packedContext }) {
    return `You are the ClassIQ Smart Revision Generator.
Generate a comprehensive, grounded revision package for topic "${topic}".

Retrieved Context Material:
${packedContext}

Type to Generate: ${revisionType}

Output Requirements:
Return ONLY a valid JSON object matching this structure:
{
  "title": "${topic} - ${revisionType.toUpperCase()}",
  "topic": "${topic}",
  "type": "${revisionType}",
  "summary": "Concise summary of the concept based ONLY on retrieved context",
  "flashcards": [
    {
      "id": "fc-1",
      "front": "Question / Concept",
      "back": "Detailed Answer / Explanation",
      "citation": "Source Title, Page X"
    }
  ],
  "onePageSummary": ["Bullet point 1", "Bullet point 2"],
  "importantQuestions": [
    {
      "question": "Sample Question?",
      "answer": "Grounded Model Answer",
      "difficulty": "medium"
    }
  ],
  "formulaSheet": [
    {
      "name": "Formula / Definition Name",
      "formula": "Equation or Rule",
      "explanation": "Brief explanation"
    }
  ],
  "revisionChecklist": [
    { "item": "Checklist item text", "completed": false }
  ],
  "miniQuiz": [
    {
      "question": "Quiz Question?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why option A is correct"
    }
  ]
}`;
  }
}
