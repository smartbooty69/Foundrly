import type {StructureResolver} from 'sanity/structure'
import { ModerationDashboard } from './components/ModerationDashboard'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Reports section - prominently displayed for moderation
      S.listItem()
        .title('🚨 Reports & Moderation')
        .child(
          S.list()
            .title('Reports & Moderation')
            .items([
              S.listItem()
                .id('moderation-dashboard')
                .title('Moderation Dashboard')
                .child(
                  S.component()
                    .component(ModerationDashboard)
                    .title('Moderation Dashboard')
                ),
              S.listItem()
                .id('pending-reports')
                .title('Pending Reports')
                .child(
                  S.documentList()
                    .title('Pending Reports')
                    .filter('_type == "report" && status == "pending"')
                    .defaultOrdering([{field: 'timestamp', direction: 'desc'}])
                ),
              S.listItem()
                .id('all-reports')
                .title('All Reports')
                .child(
                  S.documentList()
                    .title('All Reports')
                    .filter('_type == "report"')
                    .defaultOrdering([{field: 'timestamp', direction: 'desc'}])
                ),
            ])
        ),
      // Main content
      S.documentTypeListItem('author').title('Authors'),
      S.documentTypeListItem('startup').title('Startups'),
      S.documentTypeListItem('comment').title('Comments'),
      S.documentTypeListItem('playlist').title('Playlists'),
    ]);
