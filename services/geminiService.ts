import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { ArticleSummary, DashboardContact } from '../types';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const ai = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: "You are a specialized business card OCR and data extraction expert. Your goal is to map EVERY piece of text to the correct field. \n- Company name is often near the largest logo or at the top of a text block (e.g., '資誠聯合會計師事務所').\n- Address often starts with a city name (e.g., '台北市') and ends with a floor number (e.g., '27樓').\n- Always distinguish Email (contains @) from Website (starting with www or pwc.tw).\n- For traditional Chinese, ensure you use the exact characters found.",
  generationConfig: {
    responseMimeType: "application/json",
  }
});

/**
 * 產生文章摘要（使用 Gemini 2.0 Flash）
 * 直接在客戶端調用 Gemini API
 */
export const summarizeArticle = async (url: string): Promise<ArticleSummary | null> => {
  console.log(`Fetching summary for URL: ${url}`);
  if (!url) {
    return null;
  }

  try {
    const result = await ai.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `請分析此 URL 的文章內容：${url}。

【極度重要 - 精確提取指示】
你正在分析一個新聞網站，該網站可能有「新聞跑馬燈」或側邊欄顯示其他不相關的新聞標題。

🚫 請絕對忽略：
- 側邊欄（sidebar）的任何內容
- 頁尾（footer）的資訊
- 導航選單（navigation menu）
- 「相關新聞」或「推薦閱讀」區塊
- 新聞跑馬燈（ticker/scrolling news）
- 快速連結列表

✅ 請專注於：
- 網頁中央的主要文章內容區塊
- 標題最大的那篇文章
- 文字內容最長、最詳細的報導
- 通常包含完整段落和敘述的新聞

📝 輸出要求：
請以繁體中文（台灣）回應，並包含：
1. 文章的精確標題（必須是主要文章的標題）
2. 來源網站名稱 (例如 "TechCrunch", "天下雜誌", "Newtalk新聞")
3. 網域 (例如 "techcrunch.com", "newstalk.tw")
4. 三個最具代表性的重點摘要（必須來自主要文章內容）
5. 針對主要文章內容，產生 2-3 個英文關鍵字，用於搜尋相關圖片
6. 如果你能從內容中識別出 OG Image (OpenGraph 預覽圖) 的 URL，請直接提供

⚠️ 如果網頁包含多個新聞標題，請選擇：
- 在內容區域中央的那篇
- 文字最長、最詳細的那篇
- 不是跑馬燈中的快速標題`
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            title: {
              type: SchemaType.STRING,
              description: '主要文章的標題，不是側邊欄或推薦新聞的標題'
            },
            sourceName: {
              type: SchemaType.STRING,
              description: '來源網站的正式名稱'
            },
            domain: {
              type: SchemaType.STRING,
              description: '來源網站的域名'
            },
            keyPoints: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.STRING,
              },
              description: '三個主要文章的重點摘要'
            },
            imageKeywords: {
              type: SchemaType.STRING,
              description: '用於 Unsplash 的英文關鍵字'
            },
            identifiedImageUrl: {
              type: SchemaType.STRING,
              description: '識別出的預覽圖 URL (如果有)'
            },
          },
          required: ["title", "sourceName", "domain", "keyPoints", "imageKeywords"],
        },
      },
    });

    const response = await result.response;
    const parsed = JSON.parse(response.text());

    // Construct final ArticleSummary
    const summary: ArticleSummary = {
      title: parsed.title,
      source: parsed.sourceName || parsed.domain,
      sourceIconUrl: `https://logo.clearbit.com/${parsed.domain}`,
      imageUrl: parsed.identifiedImageUrl || `https://source.unsplash.com/random/800x600?${encodeURIComponent(parsed.imageKeywords)}`,
      keyPoints: parsed.keyPoints,
      url: url,  // 保存原始網址
      tags: [],  // 初始化空標籤陣列
    };

    console.log('Summary received:', summary);
    return summary;

  } catch (error) {
    console.error("Error summarizing article:", error);
    return null;
  }
};

export const generateFollowUpEmail = async (contact: DashboardContact): Promise<string> => {
  console.log(`Generating email for ${contact.name} at ${contact.company}`);

  try {
    const result = await ai.generateContent({
      contents: [{
        role: 'user', parts: [{
          text: `請撰寫一封友善且專業的後續追蹤郵件草稿，並使用繁體中文（台灣）。語氣請溫暖、簡潔。
      
      **聯絡資訊:**
      - 姓名: ${contact.name}
      - 公司: ${contact.company || '未知'}
      - 職稱: ${contact.title || '專家'}
      - 產業: ${contact.industry || '專業領域'}
      - 初識於: ${contact.metAt}
      - 您的名字: 亞歷 (Alex)
      
      **撰寫指示:**
      - 招呼語請務必採用格式：**「[職稱] [姓名] 您好」**（例如：羅副人資長 沁雯 您好）。
      - 內容請控制在 4-5 句話。
      - 第一句話請主動自我介紹：**「我是亞歷 (Alex)，在 ${contact.metAt} 很榮幸能與您認識。」**
      - 提及對方在 ${contact.company || ''} 的身分。
      - 簡短表達享受交流並從中收穫，特別是對於 ${contact.industry || '相關領域'} 的見解。
      - 表達希望保持聯繫，並期待未來能進一步交流或合作。
      - 結尾使用「祝 順心」。
      
      **重要規則:**
      - **輸出的內容只能包含郵件主體文字。**
      - **絕對不要包含任何 JSON、大括號 {}、欄位標籤或 Markdown 代碼塊標記。**
      - 不要包含簽名檔（姓名、電話等），我會在程式中自動附加。
      - 不要包含主旨行。` }]
      }],
      generationConfig: {
        responseMimeType: "text/plain",
      }
    });

    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating follow-up email:", error);
    return "抱歉，目前無法生成郵件草稿。請稍後再試。";
  }
};

export const getDailySpark = async (contacts: DashboardContact[]): Promise<{ contactId: string, reasoning: string } | null> => {
  if (contacts.length === 0) return null;

  try {
    const result = await ai.generateContent({
      contents: [{
        role: 'user', parts: [{
          text: `請從以下聯絡人清單中，挑選一位今天最適合聯繫的人馬。請優先考慮很久沒聯繫、或是具有特定職稱/公司背景的人。請以繁體中文（台灣）給出一段簡短的推薦理由（約 20-30 字）。
      
      聯絡人清單： ${JSON.stringify(contacts.map(c => ({ id: c.id, name: c.name, title: c.title, lastContact: c.lastContact, industry: c.industry })))}`
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            contactId: { type: SchemaType.STRING },
            reasoning: { type: SchemaType.STRING },
          },
        },
      },
    });

    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Error getting daily spark:", error);
    return { contactId: contacts[0].id, reasoning: `好久沒跟 ${contacts[0].name} 聯絡了，打個招呼吧！` };
  }
};

const scanSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING, description: "Chinese name of the person." },
    englishName: { type: SchemaType.STRING, description: "English name of the person (e.g., Violet)." },
    title: { type: SchemaType.STRING, description: "Job title or position." },
    department: { type: SchemaType.STRING, description: "Department name (e.g., 研發部, 行銷部)." },
    company: { type: SchemaType.STRING, description: "Company or organization name." },
    // 電子郵件（兩種）
    personalEmail: { type: SchemaType.STRING, description: "Personal email address (Gmail, Yahoo, etc.)." },
    workEmail: { type: SchemaType.STRING, description: "Company/work email address." },
    email: { type: SchemaType.STRING, description: "Primary email address (backward compatibility)." },
    // 電話（四種）
    mobilePhone: { type: SchemaType.STRING, description: "Mobile phone number." },
    homePhone: { type: SchemaType.STRING, description: "Home phone number." },
    workPhone: { type: SchemaType.STRING, description: "Work phone number." },
    workFax: { type: SchemaType.STRING, description: "Work fax number." },
    phone: { type: SchemaType.STRING, description: "Primary phone (backward compatibility)." },
    landline: { type: SchemaType.STRING, description: "Landline phone number." },
    fax: { type: SchemaType.STRING, description: "Fax number." },
    website: { type: SchemaType.STRING, description: "Company or personal website URL." },
    // 住址（四種）
    companyAddress: { type: SchemaType.STRING, description: "Company headquarters address." },
    officeAddress: { type: SchemaType.STRING, description: "Office location address." },
    homeAddress: { type: SchemaType.STRING, description: "Home/residential address." },
    mailingAddress: { type: SchemaType.STRING, description: "Mailing address." },
    address: { type: SchemaType.STRING, description: "Primary address (backward compatibility)." },
    address2: { type: SchemaType.STRING, description: "Secondary address." },
    address3: { type: SchemaType.STRING, description: "Third address." },
    industry: { type: SchemaType.STRING, description: "Industry (e.g., Tech, Finance, Marketing)." },
    line: { type: SchemaType.STRING, description: "Any social media ID like Line." },
  },
};

export const scanBusinessCard = async (base64Image: string): Promise<Partial<DashboardContact> | null> => {
  if (!ai) {
    console.warn("AI service not initialized, returning null");
    return null;
  }

  console.log("Starting business card scan with Gemini 2.0 Flash...");

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  const textPart = {
    text: `Extract contact information from this business card.

    IMPORTANT RULES:
    - Keep all values simple and short - avoid long explanations
    - If a field is empty or not found, use null or empty string ""
    - Never include newlines within field values
    - Escape quotes in text values properly

    FIELDS TO EXTRACT:
    - name: Chinese name
    - englishName: English name
    - title: Job title
    - department: Department
    - company: Company name
    - personalEmail: Personal email (Gmail, Yahoo)
    - workEmail: Work email
    - mobilePhone: Mobile phone
    - workPhone: Work phone
    - companyAddress: Company address
    - industry: Industry
    - line: LINE ID

    Format: JSON only. Keep response concise.`,
  };

  try {
    const result = await ai.generateContent({
      contents: [{
        role: 'user',
        parts: [imagePart, textPart]
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            englishName: { type: SchemaType.STRING },
            title: { type: SchemaType.STRING },
            department: { type: SchemaType.STRING },
            company: { type: SchemaType.STRING },
            personalEmail: { type: SchemaType.STRING },
            workEmail: { type: SchemaType.STRING },
            mobilePhone: { type: SchemaType.STRING },
            workPhone: { type: SchemaType.STRING },
            companyAddress: { type: SchemaType.STRING },
            industry: { type: SchemaType.STRING },
            line: { type: SchemaType.STRING },
          },
        },
      },
    });

    const response = await result.response;
    if (response) {
      const text = response.text();
      console.log("Gemini Response received:", text);

      // Try to parse the JSON with fallback handling
      try {
        // First try: Clean and parse normally
        const cleanedJsonString = text.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(cleanedJsonString) as Partial<DashboardContact>;
      } catch (parseError) {
        console.warn('Initial JSON parse failed, attempting repair...');

        // Try to fix common JSON issues
        let repairedJson = text
          .replace(/```json\n?|```/g, '')
          .trim();

        // Fix unterminated strings by truncating at the last complete property
        const lastValidBrace = repairedJson.lastIndexOf('}');
        if (lastValidBrace > 0) {
          repairedJson = repairedJson.substring(0, lastValidBrace + 1);
        }

        // Fix unescaped newlines in strings
        repairedJson = repairedJson.replace(/"\s*\n\s*"/g, '');

        // Fix trailing commas before closing braces
        repairedJson = repairedJson.replace(/,\s*}/g, '}');

        try {
          const parsed = JSON.parse(repairedJson);
          console.log('Successfully parsed repaired JSON');
          return parsed as Partial<DashboardContact>;
        } catch (secondError) {
          console.error('JSON repair failed:', secondError);
          // Return minimal valid data as fallback
          return {
            name: 'Unknown',
            company: 'Unknown Company',
          };
        }
      }
    }
    return null;

  } catch (error) {
    console.error('Error scanning business card with Gemini:', error);
    // Return null instead of throwing to allow graceful degradation
    return null;
  }
};

/**
 * Generic AI content generation for other services
 */
export const genAIService = {
  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await ai.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "text/plain",
        }
      });

      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }
};
