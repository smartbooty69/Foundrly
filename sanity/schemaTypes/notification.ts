import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'notification',
  title: 'Notification',
  type: 'document',
  fields: [
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Interested Submission', value: 'interested_submission' },
          { title: 'Status Update', value: 'status_update' },
          { title: 'Comment', value: 'comment' },
          { title: 'Like', value: 'like' },
          { title: 'Follow', value: 'follow' },
        ],
        layout: 'radio'
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'recipient',
      title: 'Recipient',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'sender',
      title: 'Sender',
      type: 'reference',
      to: [{ type: 'author' }],
      description: 'User who triggered the notification (optional)'
    }),
    defineField({
      name: 'startup',
      title: 'Startup',
      type: 'reference',
      to: [{ type: 'startup' }],
      description: 'Related startup (if applicable)'
    }),
    defineField({
      name: 'interestedSubmissionId',
      title: 'Interested Submission ID',
      type: 'string',
      description: 'ID of the related interested submission (if applicable)'
    }),
    defineField({
      name: 'isRead',
      title: 'Is Read',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'isEmailSent',
      title: 'Email Sent',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'emailSentAt',
      title: 'Email Sent At',
      type: 'datetime',
      description: 'When the email notification was sent'
    }),
    defineField({
      name: 'readAt',
      title: 'Read At',
      type: 'datetime',
      description: 'When the notification was read'
    }),
    defineField({
      name: 'startupTitle',
      title: 'Startup Title',
      type: 'string',
      description: 'Cached startup title for quick access'
    }),
    defineField({
      name: 'senderName',
      title: 'Sender Name',
      type: 'string',
      description: 'Cached sender name for quick access'
    }),
    defineField({
      name: 'senderEmail',
      title: 'Sender Email',
      type: 'string',
      description: 'Cached sender email for quick access'
    })
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      isRead: 'isRead',
      recipient: 'recipient.name'
    },
    prepare(selection) {
      const { title, type, isRead, recipient } = selection
      return {
        title: title,
        subtitle: `${type} - ${recipient} ${isRead ? '(Read)' : '(Unread)'}`
      }
    }
  }
})