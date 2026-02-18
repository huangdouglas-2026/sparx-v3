import { createClient } from '@/lib/supabase/client';
import type { Story, StoryStats } from '@/types';
import { domainManager } from './domainManager';

export const storyManager = {
  /**
   * Create a new story
   */
  async createStory(data: Partial<Story>): Promise<Story> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: newStory, error } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        domain_id: data.domain_id || '',
        title: data.title || '',
        content: data.content || '',
        tags: data.tags || [],
        usage_count: 0,
        success_rate: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating story:', error);
      throw error;
    }

    // Increment the domain's story count
    await domainManager.incrementStoryCount(data.domain_id!);

    return newStory as Story;
  },

  /**
   * Get all stories for a domain
   */
  async getStories(domainId: string): Promise<Story[]> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', user.id)
      .eq('domain_id', domainId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }

    return (data || []) as Story[];
  },

  /**
   * Get all stories for the current user
   */
  async getAllStories(): Promise<Story[]> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all stories:', error);
      throw error;
    }

    return (data || []) as Story[];
  },

  /**
   * Get a single story by ID
   */
  async getStory(id: string): Promise<Story | null> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching story:', error);
      throw error;
    }

    return data as Story;
  },

  /**
   * Update a story
   */
  async updateStory(id: string, data: Partial<Story>): Promise<Story> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: updatedStory, error } = await supabase
      .from('stories')
      .update({
        domain_id: data.domain_id,
        title: data.title,
        content: data.content,
        tags: data.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating story:', error);
      throw error;
    }

    return updatedStory as Story;
  },

  /**
   * Delete a story
   */
  async deleteStory(id: string): Promise<void> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get the story first to decrement the domain count
    const story = await this.getStory(id);
    if (story) {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting story:', error);
        throw error;
      }

      // Decrement the domain's story count
      await domainManager.decrementStoryCount(story.domain_id);
    }
  },

  /**
   * Get top performing stories
   */
  async getTopStories(limit: number = 10): Promise<Story[]> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', user.id)
      .order('success_rate', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching top stories:', error);
      throw error;
    }

    return (data || []) as Story[];
  },

  /**
   * Get recently used stories
   */
  async getRecentStories(limit: number = 10): Promise<Story[]> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', user.id)
      .not('last_used_at', 'is', null)
      .order('last_used_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent stories:', error);
      throw error;
    }

    return (data || []) as Story[];
  },

  /**
   * Record story usage
   */
  async recordUsage(storyId: string): Promise<void> {
    const supabase = createClient();

    // First, get the current usage count
    const { data: currentStory } = await supabase
      .from('stories')
      .select('usage_count')
      .eq('id', storyId)
      .single();

    const currentCount = currentStory?.usage_count || 0;

    // Then, update with incremented count
    const { error } = await supabase
      .from('stories')
      .update({
        usage_count: currentCount + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', storyId);

    if (error) {
      console.error('Error recording story usage:', error);
      throw error;
    }
  },

  /**
   * Get story usage statistics
   */
  async getStoryUsageStats(storyId: string): Promise<StoryStats> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('story_insights')
      .select('result, created_at, contact_id')
      .eq('story_id', storyId);

    if (error) {
      console.error('Error fetching story stats:', error);
      throw error;
    }

    const insights = data || [];
    const totalUsage = insights.length;
    const positiveCount = insights.filter((i) => i.result === 'positive').length;
    const successRate = totalUsage > 0 ? (positiveCount / totalUsage) * 100 : 0;

    // Calculate average response time (placeholder logic)
    const avgResponseTime = 0;

    // Get last used
    const lastUsed =
      insights.length > 0
        ? insights.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0].created_at
        : '';

    // Get best contacts (contacts with positive results)
    const bestContacts = insights
      .filter((i) => i.result === 'positive')
      .map((i) => i.contact_id);

    return {
      total_usage: totalUsage,
      success_rate: successRate,
      avg_response_time: avgResponseTime,
      last_used: lastUsed,
      best_contacts: bestContacts,
    };
  },

  /**
   * Update story success rate
   */
  async updateSuccessRate(storyId: string): Promise<void> {
    const stats = await this.getStoryUsageStats(storyId);
    const supabase = createClient();

    const { error } = await supabase
      .from('stories')
      .update({
        success_rate: stats.success_rate,
      })
      .eq('id', storyId);

    if (error) {
      console.error('Error updating success rate:', error);
      throw error;
    }
  },

  /**
   * Search stories by keyword
   */
  async searchStories(keyword: string): Promise<Story[]> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', user.id)
      .or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching stories:', error);
      throw error;
    }

    return (data || []) as Story[];
  },
};
