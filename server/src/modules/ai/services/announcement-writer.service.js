import { GeminiService } from './gemini.service.js';
import { GeneratedContent } from '../models/GeneratedContent.js';
import { SYSTEM_PROMPTS } from '../ai.prompts.js';

export class AnnouncementWriterService {
  /**
   * Draft classroom announcements with selected tone.
   */
  static async generateAnnouncement(userId, userRole, { classroomId, prompt, audience = 'all_students', tone = 'professional', dueDate }) {
    const aiPrompt = `Topic / Note: "${prompt}"
Audience: ${audience}
Tone: ${tone}
${dueDate ? `Deadline / Key Date: ${dueDate}` : ''}

Output Format strictly as JSON:
{
  "title": "Clear Announcement Title",
  "announcement": "Formatted Markdown text for full announcement",
  "shortNotification": "1-sentence push notification text",
  "actionItems": ["Action 1", "Action 2"]
}`;

    const res = await GeminiService.generateStructuredJson({
      prompt: aiPrompt,
      systemInstruction: SYSTEM_PROMPTS.ANNOUNCEMENT_WRITER,
      temperature: 0.5,
      maxTokens: 1024,
    });

    const generated = await GeneratedContent.create({
      userId,
      role: userRole,
      classroomId,
      type: 'announcement',
      title: res.data.title || 'Classroom Announcement',
      content: res.data.announcement || res.rawText,
      structuredContent: res.data,
      status: 'draft', // Never auto-publish
    });

    return generated;
  }
}
