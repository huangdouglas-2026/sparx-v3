import { createClient } from '@/lib/supabase/client';
import type { UserProfile, UserProfileData } from '@/types';

export const profileService = {
    async getProfile(userId?: string): Promise<UserProfile | null> {
        const supabase = createClient();

        // Get current user if userId not provided
        if (!userId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error('No user logged in');
                return null;
            }
            userId = user.id;
        }
        const defaultProfileData: any = {
            name: { id: 'name', label: '姓名', value: '', icon: '', visible: true },
            alias: { id: 'alias', label: '別名', value: '', icon: '', visible: true },
            title: { id: 'title', label: '職稱', value: '', icon: '', visible: true },
            company: { id: 'company', label: '公司', value: '', icon: '', visible: true },
            bio: { id: 'bio', label: '簡介', value: '', icon: 'info', visible: true },
            phone: { id: 'phone', label: '電話', value: '', icon: 'call', visible: true },
            fax: { id: 'fax', label: '傳真', value: '', icon: 'fax', visible: true },
            email: { id: 'email', label: '電子郵件', value: '', icon: 'mail', visible: true },
            address: { id: 'address', label: '地址', value: '', icon: 'location_on', visible: false },
            linkedin: { id: 'linkedin', label: 'LinkedIn', value: '', icon: 'fab fa-linkedin', visible: true },
            line: { id: 'line', label: 'Line', value: '', icon: 'fab fa-line', visible: true },
            facebook: { id: 'facebook', label: 'Facebook', value: '', icon: 'fab fa-facebook', visible: false },
            instagram: { id: 'instagram', label: 'Instagram', value: '', icon: 'fab fa-instagram', visible: true },
            threads: { id: 'threads', label: 'Threads', value: '', icon: 'fab fa-threads', visible: false },
        };

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error('Error fetching profile:', error);
            return null;
        }

        if (!data) {
            // Create a default profile for new users

            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    profile_data: defaultProfileData,
                    updated_at: new Date().toISOString()
                });

            if (insertError) {
                console.error('Error creating default profile:', insertError);
            }

            return {
                avatarUrl: '',
                companyCardUrl: '',
                qrCodeUrl: '',
                data: defaultProfileData,
            };
        }

        // Return existing profile data, merging with defaults to ensure no missing fields
        const mergedData = { ...defaultProfileData, ...data.profile_data };

        return {
            avatarUrl: data.avatar_url || '',
            companyCardUrl: data.company_card_url || '',
            qrCodeUrl: '',
            data: mergedData as UserProfileData,
        };
    },

    async updateProfile(userId?: string, profileData?: Partial<UserProfileData>, avatarUrl?: string, companyCardUrl?: string) {
        const supabase = createClient();

        // Get current user if userId not provided
        if (!userId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error('No user logged in');
                throw new Error('No user logged in');
            }
            userId = user.id;
        }

        if (!profileData) {
            throw new Error('Profile data is required');
        }

        const { data: current } = await supabase.from('profiles').select('profile_data, avatar_url, company_card_url').eq('id', userId).maybeSingle();
        const newData = { ...(current?.profile_data as any || {}), ...profileData };

        const updatePayload: any = {
            profile_data: newData,
            updated_at: new Date().toISOString(),
        };

        if (avatarUrl !== undefined) {
            updatePayload.avatar_url = avatarUrl || null;
        }

        if (companyCardUrl !== undefined) {
            updatePayload.company_card_url = companyCardUrl;
        }

        const { error } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('id', userId);

        if (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    async getProfileByAlias(identifier: string): Promise<UserProfile | null> {
        const supabase = createClient();
        const cleanId = identifier.trim().toLowerCase().replace(/\s+/g, '');

        // 1. Direct fetch using an optimized query to avoid client-side filtering lag
        // We look for: A) ID match, OR B) Exact alias match, OR C) Space-normalized match (client fallback)

        // Try direct ID first
        const { data: idMatch } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', identifier)
            .maybeSingle();

        if (idMatch) return {
            avatarUrl: idMatch.avatar_url || '',
            companyCardUrl: idMatch.company_card_url || '',
            qrCodeUrl: '',
            data: idMatch.profile_data as UserProfileData,
        };

        // If not ID, fetch list to find by normalized alias
        // (Adding a random param to URL/Query is not needed for Supabase as it doesn't cache like a browser)
        const { data: allProfiles, error } = await supabase
            .from('profiles')
            .select('*');

        if (error) {
            console.error('Error fetching profiles:', error);
            return null;
        }

        const matchedProfile = allProfiles?.find((p: any) => {
            const profileData = p.profile_data as UserProfileData;
            const profileAlias = profileData.alias?.value?.trim().toLowerCase().replace(/\s+/g, '') || '';
            return profileAlias === cleanId;
        });

        if (matchedProfile) {
            return {
                avatarUrl: matchedProfile.avatar_url || '',
                companyCardUrl: matchedProfile.company_card_url || '',
                qrCodeUrl: '',
                data: matchedProfile.profile_data as UserProfileData,
            };
        }

        return null;
    }
};
