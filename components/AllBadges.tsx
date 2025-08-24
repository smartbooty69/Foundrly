'use client';

import React, { useState, useEffect } from 'react';
import { enhancedBadgeSystem } from '@/lib/enhanced-badge-system';
import EnhancedBadgeDisplay from './EnhancedBadgeDisplay';

interface Badge {
  _id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  rarity: string;
  tier: string;
  criteria: any;
  isActive: boolean;
}

const BADGE_CATEGORIES = [
  { value: 'all', label: 'All Categories', icon: '🏆' },
  { value: 'creator', label: 'Creator', icon: '🎨' },
  { value: 'community', label: 'Community', icon: '🤝' },
  { value: 'social', label: 'Social', icon: '💬' },
  { value: 'achievement', label: 'Achievement', icon: '⭐' },
  { value: 'special', label: 'Special Event', icon: '🎉' },
];

const TIER_LEVELS = [
  { value: 'all', label: 'All Tiers', icon: '🏆' },
  { value: 'bronze', label: 'Bronze', icon: '🥉' },
  { value: 'silver', label: 'Silver', icon: '🥈' },
  { value: 'gold', label: 'Gold', icon: '🥇' },
  { value: 'platinum', label: 'Platinum', icon: '💎' },
  { value: 'diamond', label: 'Diamond', icon: '💎' },
];

export default function AllBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  useEffect(() => {
    loadAllBadges();
  }, []);

  const loadAllBadges = async () => {
    try {
      setLoading(true);
      await enhancedBadgeSystem.initialize();
      const allBadges = await enhancedBadgeSystem.getAllBadges();
      setBadges(allBadges);
    } catch (error) {
      console.error('Failed to load badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = badges.filter(badge => {
    const categoryMatch = selectedCategory === 'all' || badge.category === selectedCategory;
    const tierMatch = selectedTier === 'all' || badge.tier === selectedTier;
    const rarityMatch = selectedRarity === 'all' || badge.rarity === selectedRarity;
    return categoryMatch && tierMatch && rarityMatch;
  });

  const getTierColor = (tier: string | null | undefined) => {
    if (!tier) return 'text-gray-600';
    switch (tier) {
      case 'bronze': return 'text-amber-600';
      case 'silver': return 'text-gray-600';
      case 'gold': return 'text-yellow-600';
      case 'platinum': return 'text-cyan-600';
      case 'diamond': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getRarityColor = (rarity: string | null | undefined) => {
    if (!rarity) return 'text-gray-600';
    switch (rarity) {
      case 'common': return 'text-green-600';
      case 'uncommon': return 'text-blue-600';
      case 'rare': return 'text-purple-600';
      case 'epic': return 'text-orange-600';
      case 'legendary': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTier = (tier: string | null | undefined) => {
    if (!tier) return 'Unknown';
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const formatRarity = (rarity: string | null | undefined) => {
    if (!rarity) return 'Unknown';
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const formatCategory = (category: string | null | undefined) => {
    if (!category) return 'Unknown';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Badges</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {BADGE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tier Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tier</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {TIER_LEVELS.map((tier) => (
                <option key={tier.value} value={tier.value}>
                  {tier.icon} {tier.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rarity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rarity</label>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">🎯 All Rarities</option>
              <option value="common">🟢 Common</option>
              <option value="uncommon">🔵 Uncommon</option>
              <option value="rare">🟣 Rare</option>
              <option value="epic">🟠 Epic</option>
              <option value="legendary">🔴 Legendary</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredBadges.length} of {badges.length} badges
        </div>
      </div>

      {/* Badges Grid */}
      {filteredBadges.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No badges found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more badges.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.map((badge) => (
            <div key={badge._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: (badge.color || '#6B7280') + '20' }}
                >
                  {badge.icon || '🏆'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className={`font-medium ${getTierColor(badge.tier)}`}>
                      {formatTier(badge.tier)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className={`font-medium ${getRarityColor(badge.rarity)}`}>
                      {formatRarity(badge.rarity)}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {badge.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {formatCategory(badge.category)}
                </span>
                {badge.criteria && (
                  <div className="text-xs text-gray-500">
                    {badge.criteria.target && (
                      <span>Target: {badge.criteria.target}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
