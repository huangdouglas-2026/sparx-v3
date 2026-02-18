import { genAIService } from '../geminiService';
import type { BusinessContact, Story, ConversationPlan } from '@/types';

type Platform = 'linkedin' | 'facebook' | 'line' | 'wechat' | 'email';

export const conversationPlanner = {
  /**
   * Plan a conversation based on contact, story, and platform
   */
  async planConversation(
    contact: BusinessContact,
    story: Story,
    platform: Platform
  ): Promise<ConversationPlan> {
    const prompt = this.buildPlanningPrompt(contact, story, platform);

    try {
      const response = await genAIService.generateContent(prompt);
      return this.parseAIResponse(response, contact, story, platform);
    } catch (error) {
      console.error('Error planning conversation:', error);
      return this.fallbackPlan(contact, story, platform);
    }
  },

  /**
   * Build the AI prompt for conversation planning
   */
  buildPlanningPrompt(contact: BusinessContact, story: Story, platform: Platform): string {
    const platformContext = this.getPlatformContext(platform);

    return `
你是一個專業的人脈關係顧問。請根據以下資訊，規劃一個有效的對話策略。

聯絡人資訊：
- 姓名：${contact.name}
- 職稱：${contact.title}
- 公司：${contact.company || '未知'}
- 產業：${contact.industry || '未知'}
- 關係階段：${contact.relationship_stage || 'unknown'}

選定的故事：
- 標題：${story.title}
- 內容：${story.content}
- 標籤：${story.tags.join(', ') || '無'}
- 成功率：${story.success_rate}%

平台特性：
${platformContext}

請提供一個完整的對話計畫，JSON 格式：
{
  "contact": {
    "id": "聯絡人 ID",
    "name": "姓名",
    "title": "職稱",
    "company": "公司"
  },
  "story": {
    "id": "故事 ID",
    "title": "標題",
    "content": "內容"
  },
  "platform": "平台名稱",
  "suggested_message": "主要建議訊息（100-150 字，適合該平台語氣）",
  "tone": "語氣建議 (formal/casual/friendly/professional)",
  "expected_outcome": "預期效果",
  "alternatives": [
    "替代方案 1（不同角度）",
    "替代方案 2（不同語氣）"
  ],
  "timing_suggestion": "最佳發送時機建議",
  "follow_up_strategy": "後續追蹤建議"
}

考量因素：
1. 平台文化和語氣
2. 聯絡人的專業背景
3. 關係深度
4. 故事的適用性
5. 預期回應

請確保回應是有效的 JSON 格式，不要包含任何額外的文字說明。
`;
  },

  /**
   * Get platform-specific context
   */
  getPlatformContext(platform: Platform): string {
    const contexts = {
      linkedin: `
- 專業商務平台
- 語氣：專業、正式但不失親切
- 長度：簡潔（100-150 字）
- 格式：清晰分段，可使用 bullet points
- 目標：建立專業形象，分享價值
      `,
      facebook: `
- 社交媒體平台
- 語氣：友善、輕鬆、可以較私人
- 長度：中等（150-200 字）
- 格式：較彈性，可使用表情符號
- 目標：建立連結，輕鬆交流
      `,
      line: `
- 即時通訊平台
- 語氣：親切、私人、即時
- 長度：簡短（50-100 字）
- 格式：對話式，可用貼圖/表情
- 目標：快速互動，維持關係
      `,
      wechat: `
- 即時通訊平台（類似 LINE）
- 語氣：親切、私人、即時
- 長度：簡短（50-100 字）
- 格式：對話式
- 目標：快速互動，維持關係
      `,
      email: `
- 正式通訊平台
- 語氣：專業、有禮貌
- 長度：可較長（200-300 字）
- 格式：完整的郵件結構（主題、開頭、正文、結尾）
- 目標：深度溝通，提供價值
      `,
    };

    return contexts[platform] || '';
  },

  /**
   * Parse AI response
   */
  parseAIResponse(
    response: string,
    contact: BusinessContact,
    story: Story,
    platform: Platform
  ): ConversationPlan {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        contact: {
          id: contact.id,
          name: contact.name,
          title: contact.title,
          company: contact.company || '',
        },
        story: {
          id: story.id,
          title: story.title,
          content: story.content,
          domain_id: story.domain_id,
          user_id: story.user_id,
          tags: story.tags,
          usage_count: story.usage_count,
          success_rate: story.success_rate,
          created_at: story.created_at,
          updated_at: story.updated_at,
        },
        platform,
        suggested_message: parsed.suggested_message || '',
        tone: parsed.tone || 'professional',
        expected_outcome: parsed.expected_outcome || '',
        alternatives: parsed.alternatives || [],
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.fallbackPlan(contact, story, platform);
    }
  },

  /**
   * Fallback plan when AI fails
   */
  fallbackPlan(
    contact: BusinessContact,
    story: Story,
    platform: Platform
  ): ConversationPlan {
    const toneMap: Record<Platform, ConversationPlan['tone']> = {
      linkedin: 'professional',
      facebook: 'friendly',
      line: 'casual',
      wechat: 'casual',
      email: 'formal',
    };

    const messages = {
      linkedin: `Hi ${contact.name}，\n\n看到你最近的動態，讓我想到一個相關的經驗想分享。\n\n${story.content.substring(0, 100)}...\n\n希望這對你有幫助！`,
      facebook: `${contact.name}，看到你的貼文讓我想到這件事：\n\n${story.content.substring(0, 100)}...\n\n希望對你有用！`,
      line: `${contact.name}，\n\n剛看到你的訊息，想起這個經驗：\n\n${story.content.substring(0, 80)}...`,
      wechat: `${contact.name}，\n\n剛看到你的訊息，想起這個經驗：\n\n${story.content.substring(0, 80)}...`,
      email: `Dear ${contact.name},\n\nHope this email finds you well. I came across your recent update and thought this experience might be relevant.\n\n${story.content}\n\nPlease let me know if you'd like to discuss further.\n\nBest regards`,
    };

    return {
      contact: {
        id: contact.id,
        name: contact.name,
        title: contact.title,
        company: contact.company || '',
      },
      story,
      platform,
      suggested_message: messages[platform],
      tone: toneMap[platform],
      expected_outcome: '建立聯繫並分享價值',
      alternatives: [
        '直接分享經驗，不做太多鋪陳',
        '先提問了解對方需求，再分享相關經驗',
      ],
    };
  },

  /**
   * Generate conversation starters
   */
  async generateConversationStarters(
    contact: BusinessContact,
    context?: string
  ): Promise<string[]> {
    const prompt = `
請為以下聯絡人生成 5 個對話開場白：

聯絡人：
- 姓名：${contact.name}
- 職稱：${contact.title}
- 公司：${contact.company || '未知'}
- 產業：${contact.industry || '未知'}

${context ? `額外背景：${context}` : ''}

請以 JSON 格式回傳：
{
  "starters": [
    "開場白 1",
    "開場白 2",
    "開場白 3",
    "開場白 4",
    "開場白 5"
  ]
}

開場白應該：
1. 自然、不突兀
2. 相關聯絡人的專業背景
3. 適合建立或維持關係
4. 長度在 20-40 字之間
`;

    try {
      const response = await genAIService.generateContent(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.starters || [];
      }
    } catch (error) {
      console.error('Error generating conversation starters:', error);
    }

    // Fallback starters
    return [
      `${contact.name}，最近在 ${contact.company || '工作'} 上還順利嗎？`,
      `嗨 ${contact.name}，之前看到你在 ${contact.industry || '這個領域'} 的分享，很有啟發`,
      `${contact.name}，最近有什麼新的專案或計畫嗎？`,
      `好久沒聯絡了，${contact.name}，最近一切好嗎？`,
      `${contact.name}，有什麼我可以幫忙或支持的地方嗎？`,
    ];
  },
};
