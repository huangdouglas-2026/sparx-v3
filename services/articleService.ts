import { createClient } from '@/lib/supabase/client';
import { ArticleSummary } from '../types';

// 內部類型：包含額外元數據的文章
export interface ArticleWithMetadata extends ArticleSummary {
    id: string;
    created_at: string;
}

export const articleService = {
    async getArticles(): Promise<ArticleWithMetadata[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching articles:', error);
            throw error;
        }

        return data.map((article: any) => ({
            id: article.id,
            created_at: article.created_at,
            title: article.title,
            source: article.source,
            sourceIconUrl: article.source_icon_url,
            imageUrl: article.image_url,
            keyPoints: article.key_points || [],
            url: article.url,           // 網址
            tags: article.tags || [],    // 標籤
        }));
    },
    async saveArticleSummary(
        summary: ArticleSummary,
        recipientIds: string[],
        isShared: boolean = false  // 是否分享給他人
    ): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('articles')
            .insert([
                {
                    title: summary.title,
                    source: summary.source,
                    source_icon_url: summary.sourceIconUrl,
                    image_url: summary.imageUrl,
                    key_points: summary.keyPoints,
                    url: summary.url || null,           // 網址
                    tags: summary.tags || [],           // 標籤
                    recipient_ids: recipientIds.length > 0 ? recipientIds : null,
                    is_shared: isShared || recipientIds.length > 0,  // 是否分享
                    created_at: new Date().toISOString(),
                }
            ]);

        if (error) {
            console.error('Error saving article summary:', error);
            throw error;
        }
    },
    // 新增：更新文章（用於編輯功能）
    async updateArticle(id: string, updates: Partial<ArticleSummary & { personalNote?: string }>): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('articles')
            .update({
                title: updates.title,
                key_points: updates.keyPoints,
                url: updates.url,
                tags: updates.tags,
                personal_note: updates.personalNote,
            })
            .eq('id', id);

        if (error) {
            console.error('Error updating article:', error);
            throw error;
        }
    }
};
