import { genAIService } from '../geminiService';
import type { ContactActivity, Story, MatchResult } from '@/types';

export const storyMatcher = {
  /**
   * Match stories based on contact activity
   * Uses AI to analyze the activity and find relevant stories
   */
  async matchStories(
    activity: ContactActivity,
    userStories: Story[]
  ): Promise<MatchResult[]> {
    if (userStories.length === 0) {
      return [];
    }

    // Prepare story summaries for AI analysis
    const storySummaries = userStories.map((story) => ({
      id: story.id,
      title: story.title,
      content: story.content.substring(0, 500), // Limit content length
      tags: story.tags,
      success_rate: story.success_rate,
    }));

    // Build AI prompt
    const prompt = this.buildMatchingPrompt(activity, storySummaries);

    try {
      const response = await genAIService.generateContent(prompt);
      const matches = this.parseAIResponse(response, userStories);

      // Sort by score and return top matches
      return matches
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    } catch (error) {
      console.error('Error matching stories:', error);
      // Fallback to simple keyword matching
      return this.fallbackMatching(activity, userStories);
    }
  },

  /**
   * Build the AI prompt for story matching
   */
  buildMatchingPrompt(activity: ContactActivity, storySummaries: any[]): string {
    return `
你是一個專業的人脈關係顧問。請分析以下聯絡人動態，並從使用者的故事庫中推薦最相關的故事。

聯絡人動態：
- 活動類型：${activity.activity_type}
- 平台：${activity.platform}
- 內容：${activity.content}

使用者的故事庫：
${storySummaries.map((s, i) => `
故事 ${i + 1}：
- 標題：${s.title}
- 內容：${s.content}
- 標籤：${s.tags.join(', ') || '無'}
- 成功率：${s.success_rate}%
`).join('')}

請分析並回傳 JSON 格式，包含前 5 個最相關的故事：
{
  "matches": [
    {
      "story_id": "故事 ID",
      "score": 0-100 的相關性分數,
      "reason": "為何這個故事相關",
      "suggested_message": "建議的回應/留言文案（50 字以內）"
    }
  ]
}

評估標準：
1. 主題相關性（30%）
2. 情境適配度（25%）
3. 價值提供程度（25%）
4. 故事成功率（20%）

請確保回應是有效的 JSON 格式，不要包含任何額外的文字說明。
`;
  },

  /**
   * Parse AI response and match with actual stories
   */
  parseAIResponse(response: string, userStories: Story[]): MatchResult[] {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const matches: MatchResult[] = [];

      for (const match of parsed.matches || []) {
        const story = userStories.find((s) => s.id === match.story_id);
        if (story) {
          matches.push({
            story,
            score: match.score || 0,
            reason: match.reason || '',
            suggested_message: match.suggested_message || '',
          });
        }
      }

      return matches;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  },

  /**
   * Fallback to simple keyword matching when AI fails
   */
  fallbackMatching(activity: ContactActivity, userStories: Story[]): MatchResult[] {
    const keywords = this.extractKeywords(activity.content);
    const matches: MatchResult[] = [];

    for (const story of userStories) {
      let score = 0;
      const storyText = `${story.title} ${story.content} ${story.tags.join(' ')}`.toLowerCase();

      // Calculate keyword overlap score
      for (const keyword of keywords) {
        if (storyText.includes(keyword.toLowerCase())) {
          score += 20;
        }
      }

      // Add success rate bonus
      score += story.success_rate * 0.2;

      if (score > 0) {
        matches.push({
          story,
          score: Math.min(score, 100),
          reason: '關鍵字相關匹配',
          suggested_message: `關於${activity.activity_type}，我有個類似的經驗...`,
        });
      }
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, 5);
  },

  /**
   * Extract keywords from text
   */
  extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const commonWords = new Set(['的', '是', '在', '了', '和', '與', '及', '或', '但', '而', 'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must']);

    return text
      .split(/[\s,。！？、；：""''（）【】《》\.\,\!\?\;\:]/)
      .filter((word) => word.length > 1 && !commonWords.has(word))
      .slice(0, 10);
  },

  /**
   * Get top performing stories
   */
  async getTopStories(userStories: Story[], limit: number = 10): Promise<Story[]> {
    return userStories
      .sort((a, b) => {
        // Primary: success rate
        if (b.success_rate !== a.success_rate) {
          return b.success_rate - a.success_rate;
        }
        // Secondary: usage count
        return b.usage_count - a.usage_count;
      })
      .slice(0, limit);
  },

  /**
   * Get recently used stories
   */
  async getRecentStories(userStories: Story[], limit: number = 10): Promise<Story[]> {
    return userStories
      .filter((s) => s.last_used_at)
      .sort((a, b) => {
        const dateA = new Date(a.last_used_at!).getTime();
        const dateB = new Date(b.last_used_at!).getTime();
        return dateB - dateA;
      })
      .slice(0, limit);
  },
};
