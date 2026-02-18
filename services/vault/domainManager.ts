import { createClient } from '@/lib/supabase/client';
import type { ValueDomain } from '@/types';

export const domainManager = {
  /**
   * Create a new value domain
   */
  async createDomain(data: Partial<ValueDomain>): Promise<ValueDomain> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: newDomain, error } = await supabase
      .from('value_domains')
      .insert({
        user_id: user.id,
        name: data.name || '',
        description: data.description || '',
        icon: data.icon || '💎',
        color: data.color || '#ee8c2b',
        story_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating domain:', error);
      throw error;
    }

    return newDomain as ValueDomain;
  },

  /**
   * Get all domains for the current user
   */
  async getDomains(): Promise<ValueDomain[]> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('value_domains')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching domains:', error);
      throw error;
    }

    return (data || []) as ValueDomain[];
  },

  /**
   * Get a single domain by ID
   */
  async getDomain(id: string): Promise<ValueDomain | null> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('value_domains')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching domain:', error);
      throw error;
    }

    return data as ValueDomain;
  },

  /**
   * Update a domain
   */
  async updateDomain(id: string, data: Partial<ValueDomain>): Promise<ValueDomain> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: updatedDomain, error } = await supabase
      .from('value_domains')
      .update({
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating domain:', error);
      throw error;
    }

    return updatedDomain as ValueDomain;
  },

  /**
   * Delete a domain
   */
  async deleteDomain(id: string): Promise<void> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('value_domains')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting domain:', error);
      throw error;
    }
  },

  /**
   * Increment story count for a domain
   */
  async incrementStoryCount(domainId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase.rpc('increment_domain_story_count', {
      domain_id: domainId,
    });

    if (error) {
      console.error('Error incrementing story count:', error);
      throw error;
    }
  },

  /**
   * Decrement story count for a domain
   */
  async decrementStoryCount(domainId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase.rpc('decrement_domain_story_count', {
      domain_id: domainId,
    });

    if (error) {
      console.error('Error decrementing story count:', error);
      throw error;
    }
  },
};
