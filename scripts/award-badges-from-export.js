#!/usr/bin/env node
// Award badges for a specific user using the exported Sanity JSON (sanity-export.json)
// Usage (Windows CMD): node scripts/award-badges-from-export.js --user LDlWZya6Yh8tzuXX8PpJMg

import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { createClient } from '@sanity/client'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const TOKEN = process.env.SANITY_WRITE_TOKEN

if (!PROJECT_ID || !DATASET || !TOKEN) {
  console.error('Missing Sanity env. Required: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_WRITE_TOKEN')
  process.exit(1)
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  token: TOKEN,
  apiVersion: '2025-01-02',
  useCdn: false,
})

function arg(name, fallback) {
  const idx = process.argv.findIndex(a => a === `--${name}`)
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1]
  return fallback
}

const USER_ID = arg('user', '')
const ALL = process.argv.includes('--all') || process.argv.includes('-A')
const EXPORT_PATH = arg('file', path.resolve(process.cwd(), 'sanity-export.json'))

if (!USER_ID && !ALL) {
  console.error('Provide --user <sanityUserId> or --all')
  process.exit(1)
}

// Minimal badge catalog we'll upsert if missing
const BADGES_CATALOG = [
  { name: 'First Pitch', description: 'Submit your first startup', category: 'creator', icon: '🚀', color: '#10B981', rarity: 'common', criteria: { type: 'count', target: 1, metric: 'startups_created', timeframe: 'all_time' } },
  { name: 'Serial Entrepreneur', description: 'Create 5 startups', category: 'creator', icon: '💼', color: '#3B82F6', rarity: 'uncommon', criteria: { type: 'count', target: 5, metric: 'startups_created', timeframe: 'all_time' } },
  { name: 'Pitch Master', description: 'Create 10 startups', category: 'creator', icon: '👑', color: '#8B5CF6', rarity: 'rare', criteria: { type: 'count', target: 10, metric: 'startups_created', timeframe: 'all_time' } },
  { name: 'First Comment', description: 'Post your first comment', category: 'community', icon: '💬', color: '#10B981', rarity: 'common', criteria: { type: 'count', target: 1, metric: 'comments_posted', timeframe: 'all_time' } },
  { name: 'Helpful Hand', description: 'Post 10 comments', category: 'community', icon: '🤝', color: '#3B82F6', rarity: 'uncommon', criteria: { type: 'count', target: 10, metric: 'comments_posted', timeframe: 'all_time' } },
  { name: 'Trendsetter', description: 'Reach 100 views on any startup', category: 'creator', icon: '📈', color: '#F59E0B', rarity: 'uncommon', criteria: { type: 'count', target: 100, metric: 'views_received', timeframe: 'all_time' } },
  { name: 'Popular Creator', description: 'Total likes across startups ≥ 10', category: 'creator', icon: '⭐', color: '#2563EB', rarity: 'rare', criteria: { type: 'count', target: 10, metric: 'likes_received', timeframe: 'all_time' } },
]

async function ensureBadges() {
  const existing = await client.fetch(`*[_type == "badge"]{ _id, name }`)
  const nameToId = new Map(existing.map(b => [b.name, b._id]))
  for (const b of BADGES_CATALOG) {
    if (!nameToId.has(b.name)) {
      const created = await client.create({ _type: 'badge', isActive: true, ...b })
      nameToId.set(b.name, created._id)
      console.log(`Created badge: ${b.name}`)
    }
  }
  return nameToId
}

function loadExport() {
  if (!fs.existsSync(EXPORT_PATH)) {
    console.error(`Export file not found: ${EXPORT_PATH}`)
    process.exit(1)
  }
  const raw = fs.readFileSync(EXPORT_PATH, 'utf8')
  return JSON.parse(raw)
}

function computeUserStats(data, userId) {
  const startups = (data.data.startup || []).filter(s => s?.author?._ref === userId)
  const comments = (data.data.comment || []).filter(c => c?.author?._ref === userId && !c.deleted)
  const author = (data.data.author || []).find(a => a._id === userId)

  const startupsCreated = startups.length
  const totalLikes = startups.reduce((acc, s) => acc + (s.likes || 0), 0)
  const maxViews = startups.reduce((acc, s) => Math.max(acc, s.views || 0), 0)
  const commentsPosted = comments.length
  const followers = Array.isArray(author?.followers) ? author.followers.length : 0

  return { startupsCreated, totalLikes, maxViews, commentsPosted, followers }
}

function meets(badgeName, stats) {
  switch (badgeName) {
    case 'First Pitch': return stats.startupsCreated >= 1
    case 'Serial Entrepreneur': return stats.startupsCreated >= 5
    case 'Pitch Master': return stats.startupsCreated >= 10
    case 'First Comment': return stats.commentsPosted >= 1
    case 'Helpful Hand': return stats.commentsPosted >= 10
    case 'Trendsetter': return stats.maxViews >= 100
    case 'Popular Creator': return stats.totalLikes >= 10
    default: return false
  }
}

async function alreadyHas(userId, badgeId) {
  const found = await client.fetch(`count(*[_type == "userBadge" && user._ref == $u && badge._ref == $b])`, { u: userId, b: badgeId })
  return (found || 0) > 0
}

async function getExistingUserBadgeId(userId, badgeId) {
  const id = await client.fetch(`*[_type == "userBadge" && user._ref == $u && badge._ref == $b][0]._id`, { u: userId, b: badgeId })
  return id || null
}

async function award(userId, badgeId, current, target) {
  return client.create({
    _type: 'userBadge',
    user: { _ref: userId, _type: 'reference' },
    badge: { _ref: badgeId, _type: 'reference' },
    earnedAt: new Date().toISOString(),
    progress: { current, target, percentage: Math.min(Math.round((current / (target || 1)) * 100), 100) },
    metadata: { context: 'export_award' }
  })
}

async function updateProgress(userBadgeId, current, target) {
  return client.patch(userBadgeId).set({
    progress: { current, target, percentage: Math.min(Math.round((current / (target || 1)) * 100), 100) }
  }).commit({ autoGenerateArrayKeys: true })
}

function computeCurrentAndTarget(badge, stats) {
  let current = 1, target = 1
  if (badge.criteria.metric === 'startups_created') { current = stats.startupsCreated; target = badge.criteria.target }
  if (badge.criteria.metric === 'comments_posted') { current = stats.commentsPosted; target = badge.criteria.target }
  if (badge.name === 'Trendsetter') { current = stats.maxViews; target = 100 }
  if (badge.name === 'Popular Creator') { current = stats.totalLikes; target = 10 }
  return { current, target }
}

async function awardForUser(data, userId, nameToId) {
  const stats = computeUserStats(data, userId)
  let awarded = 0
  for (const badge of BADGES_CATALOG) {
    const badgeId = nameToId.get(badge.name)
    if (!badgeId) continue
    const ok = meets(badge.name, stats)
    const { current, target } = computeCurrentAndTarget(badge, stats)

    // If user already has the badge, keep it up to date with latest progress
    const existingId = await getExistingUserBadgeId(userId, badgeId)
    if (existingId) {
      await updateProgress(existingId, current, target)
      // Only count as awarded when newly creating
      continue
    }

    if (!ok) continue
    await award(userId, badgeId, current, target)
    awarded++
  }
  return awarded
}

async function main() {
  console.log('➡ Using export at:', EXPORT_PATH)
  const data = loadExport()
  const nameToId = await ensureBadges()

  if (ALL) {
    const authors = (data.data.author || []).map(a => a._id)
    let total = 0
    for (const uid of authors) {
      const n = await awardForUser(data, uid, nameToId)
      if (n > 0) console.log(`User ${uid}: awarded ${n}`)
      total += n
    }
    console.log(`✅ Done. Awarded ${total} badge(s) across ${authors.length} users.`)
    return
  }

  const awarded = await awardForUser(data, USER_ID, nameToId)
  console.log(`✅ Done. Awarded ${awarded} badge(s) for ${USER_ID}.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


