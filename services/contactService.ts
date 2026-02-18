import { createClient } from '@/lib/supabase/client';
import { DashboardContact, ActivityCategory } from '../types';

export const contactService = {
    async getContacts(): Promise<DashboardContact[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('last_contact', { ascending: false });

        if (error) {
            console.error('Error fetching contacts:', error);
            throw error;
        }

        return data.map((contact: any) => {
            // Handle legacy data: met_at might contain text instead of date
            let metAt = contact.met_at || '';
            let metAtNote = contact.met_at_note || '';

            // If met_at is not a valid date format (yyyy-mm-dd), move it to metAtNote
            if (metAt && !/^\d{4}-\d{2}-\d{2}$/.test(metAt)) {
                metAtNote = metAtNote ? `${metAtNote} (${metAt})` : metAt;
                metAt = '';
            }

            return {
                id: contact.id,
                user_id: contact.user_id,
                name: contact.name,
                englishName: contact.english_name || '',
                title: contact.title || '',
                department: contact.department || '',          // 新增：部門
                company: contact.company || '',
                avatarUrl: contact.avatar_url || '',
                lastContact: contact.last_contact,
                category: contact.category as ActivityCategory,
                industry: contact.industry || '',
                // 電子郵件（兩種）
                email: contact.email || contact.personal_email || '',  // 向後相容：優先使用 email，沒有則用 personal_email
                personalEmail: contact.personal_email || '',
                workEmail: contact.work_email || '',
                // 電話（四種）
                phone: contact.phone || contact.mobile_phone || '',     // 向後相容
                mobilePhone: contact.mobile_phone || '',
                homePhone: contact.home_phone || '',
                workPhone: contact.work_phone || '',
                workFax: contact.work_fax || '',
                landline: contact.landline || '',                      // 保留向後相容
                fax: contact.fax || '',                                // 保留向後相容
                website: contact.website || '',
                // 住址（四種）
                address: contact.address || contact.company_address || '',  // 向後相容
                companyAddress: contact.company_address || '',
                officeAddress: contact.office_address || '',
                homeAddress: contact.home_address || '',
                mailingAddress: contact.mailing_address || '',
                address2: contact.address2 || '',                       // 保留向後相容
                address3: contact.address3 || '',                       // 保留向後相容
                metAt,
                metAtNote,                                             // 新增：初次見面備註
                birthday: contact.birthday,
                linkedin: contact.linkedin,
                line: contact.line,
                wechat: contact.wechat,
                whatsapp: contact.whatsapp,
                facebook: contact.facebook,
                instagram: contact.instagram,
                threads: contact.threads,
            };
        });
    },

    async createContact(contact: Omit<DashboardContact, 'id'>) {
        const supabase = createClient();

        // Get current user if user_id not provided
        let userId = contact.user_id;
        if (!userId) {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                console.error('Error getting current user:', userError);
                throw new Error('無法取得使用者資訊，請重新登入');
            }
            userId = user.id;
        }

        // Helper function to convert undefined to null
        const toNull = (value: any) => value === undefined ? null : value;

        // Helper function to convert undefined or empty string to null (for DATE fields)
        const toDate = (value: any) => {
            if (value === undefined || value === '' || value === null) return null;
            return value;
        };

        const { data, error } = await supabase
            .from('contacts')
            .insert([
                {
                    user_id: userId,
                    name: contact.name,
                    english_name: toNull(contact.englishName),
                    title: toNull(contact.title),
                    department: toNull(contact.department),                    // 新增：部門
                    company: toNull(contact.company),
                    avatar_url: toNull(contact.avatarUrl),
                    // 電子郵件（兩種）
                    email: toNull(contact.personalEmail || contact.email),    // 向後相容
                    personal_email: toNull(contact.personalEmail),
                    work_email: toNull(contact.workEmail),
                    // 電話（四種）
                    phone: toNull(contact.mobilePhone || contact.phone),      // 向後相容
                    mobile_phone: toNull(contact.mobilePhone),
                    home_phone: toNull(contact.homePhone),
                    work_phone: toNull(contact.workPhone),
                    work_fax: toNull(contact.workFax),
                    landline: toNull(contact.landline),                        // 保留向後相容
                    fax: toNull(contact.fax),                                  // 保留向後相容
                    website: toNull(contact.website),
                    // 住址（四種）
                    address: toNull(contact.companyAddress || contact.address),  // 向後相容
                    company_address: toNull(contact.companyAddress),
                    office_address: toNull(contact.officeAddress),
                    home_address: toNull(contact.homeAddress),
                    mailing_address: toNull(contact.mailingAddress),
                    address2: toNull(contact.address2),                         // 保留向後相容
                    address3: toNull(contact.address3),                         // 保留向後相容
                    industry: toNull(contact.industry),
                    category: contact.category,
                    met_at: toDate(contact.metAt),
                    met_at_note: toNull(contact.metAtNote),              // 新增：初次見面備註
                    birthday: toDate(contact.birthday),
                    linkedin: toNull(contact.linkedin),
                    line: toNull(contact.line),
                    wechat: toNull(contact.wechat),
                    whatsapp: toNull(contact.whatsapp),
                    facebook: toNull(contact.facebook),
                    instagram: toNull(contact.instagram),
                    threads: toNull(contact.threads),
                    last_contact: new Date().toISOString(), // Default to now
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating contact:', error);
            throw error;
        }

        return data;
    },

    async updateContact(id: string, updates: Partial<DashboardContact>) {
        const supabase = createClient();

        // Verify user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('❌ User not authenticated:', userError);
            throw new Error('您尚未登入，請重新登入後再試');
        }
        console.log('✅ User authenticated:', user.id);

        // Helper function to check if a field exists in updates (including empty strings)
        const hasField = (key: string) => key in updates && updates[key as keyof DashboardContact] !== undefined;

        // Map frontend fields to DB columns
        const dbUpdates: any = {};

        if (hasField('name')) dbUpdates.name = updates.name;
        if (hasField('englishName')) dbUpdates.english_name = updates.englishName || null;
        if (hasField('title')) dbUpdates.title = updates.title || null;
        if (hasField('department')) dbUpdates.department = updates.department || null;
        if (hasField('company')) dbUpdates.company = updates.company || null;
        if (hasField('avatarUrl')) dbUpdates.avatar_url = updates.avatarUrl || null;
        // 電子郵件（兩種）
        if (hasField('personalEmail')) dbUpdates.personal_email = updates.personalEmail || null;
        if (hasField('workEmail')) dbUpdates.work_email = updates.workEmail || null;
        if (hasField('email')) dbUpdates.email = updates.email || null;
        // 電話（四種）
        if (hasField('mobilePhone')) dbUpdates.mobile_phone = updates.mobilePhone || null;
        if (hasField('homePhone')) dbUpdates.home_phone = updates.homePhone || null;
        if (hasField('workPhone')) dbUpdates.work_phone = updates.workPhone || null;
        if (hasField('workFax')) dbUpdates.work_fax = updates.workFax || null;
        if (hasField('phone')) dbUpdates.phone = updates.phone || null;
        if (hasField('landline')) dbUpdates.landline = updates.landline || null;
        if (hasField('fax')) dbUpdates.fax = updates.fax || null;
        if (hasField('website')) dbUpdates.website = updates.website || null;
        // 住址（四種）
        if (hasField('companyAddress')) dbUpdates.company_address = updates.companyAddress || null;
        if (hasField('officeAddress')) dbUpdates.office_address = updates.officeAddress || null;
        if (hasField('homeAddress')) dbUpdates.home_address = updates.homeAddress || null;
        if (hasField('mailingAddress')) dbUpdates.mailing_address = updates.mailingAddress || null;
        if (hasField('address')) dbUpdates.address = updates.address || null;
        if (hasField('address2')) dbUpdates.address2 = updates.address2 || null;
        if (hasField('address3')) dbUpdates.address3 = updates.address3 || null;
        if (hasField('industry')) dbUpdates.industry = updates.industry || null;
        if (hasField('category')) dbUpdates.category = updates.category;
        if (hasField('metAt')) dbUpdates.met_at = updates.metAt || null;
        if (hasField('metAtNote')) dbUpdates.met_at_note = updates.metAtNote || null;  // 新增：初次見面備註
        if (hasField('birthday')) dbUpdates.birthday = updates.birthday || null;
        if (hasField('lastContact')) dbUpdates.last_contact = updates.lastContact;

        // Socials
        if (hasField('linkedin')) dbUpdates.linkedin = updates.linkedin || null;
        if (hasField('line')) dbUpdates.line = updates.line || null;
        if (hasField('wechat')) dbUpdates.wechat = updates.wechat || null;
        if (hasField('whatsapp')) dbUpdates.whatsapp = updates.whatsapp || null;
        if (hasField('facebook')) dbUpdates.facebook = updates.facebook || null;
        if (hasField('instagram')) dbUpdates.instagram = updates.instagram || null;
        if (hasField('threads')) dbUpdates.threads = updates.threads || null;

        console.log('Updating contact:', id, 'with updates:', dbUpdates);
        console.log('dbUpdates keys:', Object.keys(dbUpdates), 'dbUpdates values:', Object.values(dbUpdates));

        const { data, error } = await supabase
            .from('contacts')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .maybeSingle();  // Use maybeSingle() instead of single() to handle no matches

        // Debug: log response details
        console.log('Supabase response:', {
            data,
            error,
            dataType: typeof data,
            errorType: typeof error,
            dataKeys: data ? Object.keys(data) : 'N/A',
            errorIsObject: typeof error === 'object',
            errorKeys: error && typeof error === 'object' ? Object.keys(error) : 'N/A',
            errorStringified: error ? JSON.stringify(error) : 'N/A'
        });

        // Handle Supabase response - check for success or errors
        if (data) {
            console.log('✅ Update successful:', data);
            return data;
        }

        // No data - check if there's a real error
        // Supabase might return an empty error object {} even on success
        // We need to check for actual error properties
        if (error) {
            const hasRealError =
                error.message ||
                error.details ||
                error.hint ||
                error.code ||
                (typeof error === 'object' && Object.keys(error).some(key => !['message', 'details', 'hint', 'code'].includes(key)));

            if (hasRealError) {
                console.error('❌ Supabase error:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                    full: error
                });
                throw error;
            }

            // Empty error object - might be a Supabase quirk, continue checking
            console.warn('⚠️ Empty error object returned, checking for other issues...');
        }

        // No data and no meaningful error - likely permission issue or contact not found
        console.error('❌ Update failed: No data returned', {
            hasError: !!error,
            errorType: typeof error,
            errorKeys: error ? Object.keys(error) : [],
            dbUpdateFields: Object.keys(dbUpdates),
            contactId: id
        });
        throw new Error('更新失敗：找不到聯絡人或沒有權限修改');
    },

    async deleteContact(id: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting contact:', error);
            throw error;
        }
    }
};
