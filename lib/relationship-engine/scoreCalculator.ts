import type { RelationshipScoreInputs } from '@/types';

export interface RelationshipScoreResult {
  score: number;
  level: 'stranger' | 'acquaintance' | 'friend' | 'partner' | 'advocate';
  breakdown: {
    interaction_frequency: number;
    response_rate: number;
    common_topics: number;
    recency: number;
    referrals: number;
  };
  suggestions: string[];
}

export const scoreCalculator = {
  /**
   * Calculate relationship score based on various inputs
   * Returns a score from 0 to 100
   */
  calculateRelationshipScore(inputs: RelationshipScoreInputs): RelationshipScoreResult {
    // Calculate weighted scores
    const interactionScore = this.calculateInteractionScore(inputs.interaction_frequency);
    const responseScore = this.calculateResponseScore(inputs.response_rate);
    const topicsScore = this.calculateTopicsScore(inputs.common_topics);
    const recencyScore = this.calculateRecencyScore(inputs.last_interaction_days);
    const referralScore = this.calculateReferralScore(inputs.referral_count);

    // Weight breakdown according to roadmap
    const weights = {
      interaction_frequency: 0.25, // 25%
      response_rate: 0.30,          // 30%
      common_topics: 0.20,          // 20%
      recency: 0.10,                // 10%
      referrals: 0.15,              // 15%
    };

    const totalScore =
      interactionScore * weights.interaction_frequency +
      responseScore * weights.response_rate +
      topicsScore * weights.common_topics +
      recencyScore * weights.recency +
      referralScore * weights.referrals;

    return {
      score: Math.round(totalScore),
      level: this.determineLevel(totalScore),
      breakdown: {
        interaction_frequency: Math.round(interactionScore),
        response_rate: Math.round(responseScore),
        common_topics: Math.round(topicsScore),
        recency: Math.round(recencyScore),
        referrals: Math.round(referralScore),
      },
      suggestions: this.generateSuggestions(inputs, totalScore),
    };
  },

  /**
   * Calculate interaction frequency score (0-100)
   */
  calculateInteractionScore(frequency: number): number {
    // Frequency is number of interactions per month
    if (frequency >= 8) return 100; // 2+ times per week
    if (frequency >= 4) return 80;  // 1+ times per week
    if (frequency >= 2) return 60;  // 1+ times every 2 weeks
    if (frequency >= 1) return 40;  // 1+ times per month
    if (frequency >= 0.5) return 20; // 1+ times per 2 months
    return 10;
  },

  /**
   * Calculate response rate score (0-100)
   */
  calculateResponseScore(rate: number): number {
    // Rate is percentage (0-100)
    return rate; // Direct mapping
  },

  /**
   * Calculate common topics score (0-100)
   */
  calculateTopicsScore(count: number): number {
    // Count is number of common topics
    if (count >= 5) return 100;
    if (count >= 4) return 80;
    if (count >= 3) return 60;
    if (count >= 2) return 40;
    if (count >= 1) return 20;
    return 0;
  },

  /**
   * Calculate recency score (0-100)
   */
  calculateRecencyScore(daysSinceLastInteraction: number): number {
    // Days since last interaction
    if (daysSinceLastInteraction <= 7) return 100;   // Within a week
    if (daysSinceLastInteraction <= 14) return 80;   // Within 2 weeks
    if (daysSinceLastInteraction <= 30) return 60;   // Within a month
    if (daysSinceLastInteraction <= 60) return 40;   // Within 2 months
    if (daysSinceLastInteraction <= 90) return 20;   // Within 3 months
    return 10;
  },

  /**
   * Calculate referral score (0-100)
   */
  calculateReferralScore(count: number): number {
    // Count is number of referrals given/received
    if (count >= 5) return 100;
    if (count >= 3) return 80;
    if (count >= 2) return 60;
    if (count >= 1) return 40;
    return 0;
  },

  /**
   * Determine relationship level based on score
   */
  determineLevel(score: number): RelationshipScoreResult['level'] {
    if (score >= 80) return 'advocate';
    if (score >= 60) return 'partner';
    if (score >= 40) return 'friend';
    if (score >= 20) return 'acquaintance';
    return 'stranger';
  },

  /**
   * Generate suggestions for improving relationship
   */
  generateSuggestions(inputs: RelationshipScoreInputs, score: number): string[] {
    const suggestions: string[] = [];

    // Interaction frequency suggestions
    if (inputs.interaction_frequency < 2) {
      suggestions.push('增加互動頻率，建議每週至少聯繫一次');
    }

    // Response rate suggestions
    if (inputs.response_rate < 60) {
      suggestions.push('提升回應率，嘗試更吸引人的對話開場');
    }

    // Common topics suggestions
    if (inputs.common_topics < 3) {
      suggestions.push('發掘更多共同話題，深入了解對方的專業領域');
    }

    // Recency suggestions
    if (inputs.last_interaction_days > 30) {
      suggestions.push('太久沒聯繫了，主動打个招呼吧');
    }

    // Referral suggestions
    if (inputs.referral_count === 0 && score >= 60) {
      suggestions.push('關係不錯了，可以考慮互相介紹人脈');
    }

    // Overall suggestions
    if (score >= 80) {
      suggestions.push('關係非常好！維持現有互動，尋求合作機會');
    } else if (score >= 60) {
      suggestions.push('關係良好，可以嘗試更深入的交流');
    } else if (score >= 40) {
      suggestions.push('關係發展中，繼續保持聯繫');
    } else {
      suggestions.push('關係剛起步，多找機會互動交流');
    }

    return suggestions;
  },

  /**
   * Get label for relationship level
   */
  getLevelLabel(level: RelationshipScoreResult['level']): string {
    const labels = {
      stranger: '陌生人',
      acquaintance: '點頭之交',
      friend: '朋友',
      partner: '合作夥伴',
      advocate: '推薦者',
    };
    return labels[level];
  },

  /**
   * Get color for relationship level
   */
  getLevelColor(level: RelationshipScoreResult['level']): string {
    const colors = {
      stranger: '#9ca3af',    // gray
      acquaintance: '#60a5fa', // blue
      friend: '#34d399',      // green
      partner: '#fbbf24',     // yellow
      advocate: '#f87171',    // red
    };
    return colors[level];
  },
};
