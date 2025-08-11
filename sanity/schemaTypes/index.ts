import { type SchemaTypeDefinition } from 'sanity'
import { author } from './author'
import { startup } from './startup'
import { playlist } from './playlist'
import { comment } from './comment'
import { report } from './report'
import { moderationSettings } from './moderationSettings'
import { moderationActivity } from './moderationActivity'
import { notification } from './notification'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [author, startup, playlist, comment, report, moderationSettings, moderationActivity, notification],
}
