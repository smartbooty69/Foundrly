import { type SchemaTypeDefinition } from 'sanity'
import { author } from './author'
import { startup } from './startup'
import { playlist } from './playlist'
import { comment } from './comment'
import { report } from './report'
import { moderationSettings } from './moderationSettings'
import { moderationActivity } from './moderationActivity'
// import { notification } from './notification'
import { pushSubscription } from './pushSubscription'
import { badge } from './badge'
import { userBadge } from './userBadge'
import { accountHistory } from './accountHistory'
import { interestedSubmission } from './interestedSubmission'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    author,
    startup,
    playlist,
    comment,
    report,
    moderationSettings,
    moderationActivity,
    // notification,
    pushSubscription,
    badge,
    userBadge,
    accountHistory,
    interestedSubmission,
  ],
}
