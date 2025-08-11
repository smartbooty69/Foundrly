export const notification = {
  name: 'notification',
  title: 'Notification',
  type: 'document',
  fields: [
    {
      name: 'recipient',
      title: 'Recipient',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (Rule: any) => Rule.required(),
      description: 'User who will receive this notification'
    },
    {
      name: 'type',
      title: 'Notification Type',
      type: 'string',
      options: {
        list: [
          { title: 'Follow', value: 'follow' },
          { title: 'Comment', value: 'comment' },
          { title: 'Like', value: 'like' },
          { title: 'Startup View', value: 'startup_view' },
          { title: 'Mention', value: 'mention' },
          { title: 'System', value: 'system' }
        ]
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required().max(100)
    },
    {
      name: 'message',
      title: 'Message',
      type: 'text',
      validation: (Rule: any) => Rule.required().max(500)
    },
    {
      name: 'sender',
      title: 'Sender',
      type: 'reference',
      to: [{ type: 'author' }],
      description: 'User who triggered this notification (optional for system notifications)'
    },
    {
      name: 'startup',
      title: 'Related Startup',
      type: 'reference',
      to: [{ type: 'startup' }],
      description: 'Startup related to this notification (for comments, likes, views)'
    },
    {
      name: 'comment',
      title: 'Related Comment',
      type: 'reference',
      to: [{ type: 'comment' }],
      description: 'Comment related to this notification'
    },
    {
      name: 'actionUrl',
      title: 'Action URL',
      type: 'url',
      description: 'URL to navigate to when notification is clicked'
    },
    {
      name: 'isRead',
      title: 'Is Read',
      type: 'boolean',
      initialValue: false,
      description: 'Whether the user has read this notification'
    },
    {
      name: 'readAt',
      title: 'Read At',
      type: 'datetime',
      description: 'When the notification was marked as read'
    },
    {
      name: 'metadata',
      title: 'Additional Metadata',
      type: 'object',
      fields: [
        {
          name: 'startupTitle',
          title: 'Startup Title',
          type: 'string'
        },
        {
          name: 'commentText',
          title: 'Comment Text',
          type: 'text'
        },
        {
          name: 'userName',
          title: 'User Name',
          type: 'string'
        },
        {
          name: 'userImage',
          title: 'User Image',
          type: 'url'
        }
      ],
      description: 'Additional data for display purposes'
    }
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      recipient: 'recipient.name',
      isRead: 'isRead'
    },
    prepare(selection: any) {
      const { title, type, recipient, isRead } = selection;
      return {
        title: title,
        subtitle: `${type} - ${recipient || 'Unknown'} ${isRead ? '(Read)' : '(Unread)'}`,
        media: isRead ? '✅' : '🔔'
      };
    }
  },
  orderings: [
    {
      title: 'Newest First',
      name: 'createdAtDesc',
      by: [{ field: '_createdAt', direction: 'desc' }]
    },
    {
      title: 'Oldest First',
      name: 'createdAtAsc',
      by: [{ field: '_createdAt', direction: 'asc' }]
    },
    {
      title: 'Unread First',
      name: 'unreadFirst',
      by: [
        { field: 'isRead', direction: 'asc' },
        { field: '_createdAt', direction: 'desc' }
      ]
    }
  ]
}; 