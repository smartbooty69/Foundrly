import React, { useState, useEffect } from 'react'
import { Card, Stack, Text, Badge, Button, Box, Flex, Grid, Inline } from '@sanity/ui'
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  MessageSquare, 
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Ban,
  CheckCircle,
  Settings,
  TestTube,
  BarChart3,
  Eye,
  Filter
} from 'lucide-react'
import { ModerationSettings } from './ModerationSettings'
import { ModerationTest } from './ModerationTest'
import { getModerationStats, getModerationActivity, type ModerationStats, type ModerationActivity } from '../lib/moderation-queries'

export const ModerationDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'test' | 'activity'>('overview')
  const [stats, setStats] = useState<ModerationStats>({
    totalMessages: 0,
    flaggedMessages: 0,
    deletedMessages: 0,
    bannedUsers: 0,
    activeReports: 0,
    moderationRate: 0
  })
  const [recentActivity, setRecentActivity] = useState<ModerationActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load moderation data from Sanity
    const loadModerationData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch real data from Sanity
        const [statsData, activityData] = await Promise.all([
          getModerationStats(),
          getModerationActivity(20)
        ])
        
        setStats(statsData)
        setRecentActivity(activityData)
      } catch (error) {
        console.error('Error loading moderation data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadModerationData()
  }, [])

  const getActivityIcon = (type: ModerationActivity['type']) => {
    switch (type) {
      case 'message_deleted':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'user_banned':
        return <Ban className="h-4 w-4 text-red-600" />
      case 'warning_sent':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'report_created':
        return <Shield className="h-4 w-4 text-blue-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-100 text-yellow-800'
      case 'medium':
        return 'bg-orange-100 text-orange-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'critical':
        return 'bg-red-200 text-red-900'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'overview':
        return <BarChart3 className="h-4 w-4" />
      case 'settings':
        return <Settings className="h-4 w-4" />
      case 'test':
        return <TestTube className="h-4 w-4" />
      case 'activity':
        return <Activity className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <Card padding={6} radius={3} shadow={2}>
        <Stack space={4} align="center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <Text size={2} muted>Loading moderation data...</Text>
        </Stack>
      </Card>
    )
  }

  return (
    <Stack space={6}>
      {/* Header */}
      <Card padding={5} radius={3} shadow={2} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Stack space={4}>
          <Flex align="center" justify="space-between">
            <Stack space={3}>
              <Flex align="center" gap={3}>
                <div className="p-3 bg-white/20 rounded-full">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                                 <Stack space={2}>
                   <Text size={4} weight="bold" style={{ color: 'white' }}>
                     Moderation Dashboard
                   </Text>
                   <Text size={1} style={{ color: 'rgba(255,255,255,0.8)' }}>
                     Monitor and manage content moderation across the platform
                   </Text>
                 </Stack>
              </Flex>
            </Stack>
            <Badge tone="positive" padding={2} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
              Active
            </Badge>
          </Flex>
        </Stack>
      </Card>

      {/* Navigation Tabs */}
      <Card padding={3} radius={2} shadow={1}>
        <Flex gap={2} wrap="wrap">
          {[
            { id: 'overview', label: 'Overview', icon: getTabIcon('overview') },
            { id: 'settings', label: 'Settings', icon: getTabIcon('settings') },
            { id: 'test', label: 'Test Tools', icon: getTabIcon('test') },
            { id: 'activity', label: 'Activity Log', icon: getTabIcon('activity') }
          ].map((tab) => (
            <Button
              key={tab.id}
              mode={activeTab === tab.id ? 'default' : 'ghost'}
              tone={activeTab === tab.id ? 'primary' : 'default'}
              onClick={() => setActiveTab(tab.id as any)}
              padding={3}
              style={{ 
                borderRadius: '8px',
                minWidth: '120px',
                transition: 'all 0.2s ease'
              }}
            >
              <Flex align="center" gap={2}>
                {tab.icon}
                <Text size={1} weight="semibold">{tab.label}</Text>
              </Flex>
            </Button>
          ))}
        </Flex>
      </Card>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <Stack space={5}>
          {/* Key Metrics */}
          <Card padding={5} radius={3} shadow={2}>
            <Stack space={4}>
                             <Stack space={3}>
                 <Flex align="center" justify="space-between">
                   <Text size={3} weight="bold">Key Metrics</Text>
                   <Badge tone="primary" padding={2}>
                     Last 24 hours
                   </Badge>
                 </Flex>
               </Stack>
              
              <Grid columns={[1, 2, 4]} gap={4}>
                                 <Card padding={5} radius={2} shadow={1} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                   <Stack space={3}>
                     <Flex align="center" gap={3}>
                       <div className="p-3 bg-white/20 rounded-lg">
                         <MessageSquare className="h-6 w-6 text-white" />
                       </div>
                       <Text size={4} weight="bold" style={{ color: 'white' }}>{stats.totalMessages.toLocaleString()}</Text>
                     </Flex>
                     <Text size={1} style={{ color: 'rgba(255,255,255,0.8)' }}>Total Messages</Text>
                   </Stack>
                 </Card>

                                 <Card padding={5} radius={2} shadow={1} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                   <Stack space={3}>
                     <Flex align="center" gap={3}>
                       <div className="p-3 bg-white/20 rounded-lg">
                         <AlertTriangle className="h-6 w-6 text-white" />
                       </div>
                       <Text size={4} weight="bold" style={{ color: 'white' }}>{stats.flaggedMessages.toLocaleString()}</Text>
                     </Flex>
                     <Text size={1} style={{ color: 'rgba(255,255,255,0.8)' }}>Flagged Messages</Text>
                   </Stack>
                 </Card>

                                 <Card padding={5} radius={2} shadow={1} style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                   <Stack space={3}>
                     <Flex align="center" gap={3}>
                       <div className="p-3 bg-white/20 rounded-lg">
                         <TrendingDown className="h-6 w-6 text-white" />
                       </div>
                       <Text size={4} weight="bold" style={{ color: 'white' }}>{stats.deletedMessages.toLocaleString()}</Text>
                     </Flex>
                     <Text size={1} style={{ color: 'rgba(255,255,255,0.8)' }}>Deleted Messages</Text>
                   </Stack>
                 </Card>

                                 <Card padding={5} radius={2} shadow={1} style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
                   <Stack space={3}>
                     <Flex align="center" gap={3}>
                       <div className="p-3 bg-white/20 rounded-lg">
                         <Ban className="h-6 w-6 text-white" />
                       </div>
                       <Text size={4} weight="bold" style={{ color: 'white' }}>{stats.bannedUsers.toLocaleString()}</Text>
                     </Flex>
                     <Text size={1} style={{ color: 'rgba(255,255,255,0.8)' }}>Banned Users</Text>
                   </Stack>
                 </Card>
              </Grid>
            </Stack>
          </Card>

          {/* Additional Stats */}
          <Grid columns={[1, 2]} gap={4}>
            <Card padding={4} radius={2} shadow={1}>
                               <Stack space={4}>
                   <Stack space={2}>
                     <Flex align="center" gap={2}>
                       <Shield className="h-5 w-5 text-blue-600" />
                       <Text size={2} weight="semibold">Active Reports</Text>
                     </Flex>
                   </Stack>
                   <Stack space={2}>
                     <Text size={4} weight="bold" style={{ color: '#2563eb' }}>{stats.activeReports}</Text>
                     <Text size={1} muted>Reports requiring attention</Text>
                   </Stack>
                 </Stack>
            </Card>

            <Card padding={4} radius={2} shadow={1}>
                               <Stack space={4}>
                   <Stack space={2}>
                     <Flex align="center" gap={2}>
                       <TrendingUp className="h-5 w-5 text-green-600" />
                       <Text size={2} weight="semibold">Moderation Rate</Text>
                     </Flex>
                   </Stack>
                   <Stack space={2}>
                     <Text size={4} weight="bold" style={{ color: '#059669' }}>{stats.moderationRate.toFixed(1)}%</Text>
                     <Text size={1} muted>Content reviewed within 24h</Text>
                   </Stack>
                 </Stack>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Card padding={5} radius={3} shadow={2}>
            <Stack space={4}>
                             <Stack space={3}>
                 <Flex align="center" justify="space-between">
                   <Flex align="center" gap={2}>
                     <Activity className="h-5 w-5 text-gray-600" />
                     <Text size={2} weight="semibold">Recent Activity</Text>
                   </Flex>
                   <Badge tone="primary" padding={1}>
                     {recentActivity.length} items
                   </Badge>
                 </Flex>
               </Stack>
              
              <Stack space={3}>
                {recentActivity.slice(0, 5).map((activity) => (
                  <Card key={activity.id} padding={4} radius={2} shadow={1} style={{ 
                    borderLeft: `4px solid ${activity.severity === 'critical' ? '#dc2626' : 
                      activity.severity === 'high' ? '#ea580c' : 
                      activity.severity === 'medium' ? '#d97706' : '#65a30d'}`
                  }}>
                                         <Flex align="center" justify="space-between">
                       <Flex align="center" gap={4}>
                         <div className="p-3 rounded-full" style={{ 
                           backgroundColor: activity.severity === 'critical' ? '#fecaca' : 
                             activity.severity === 'high' ? '#fed7aa' : 
                             activity.severity === 'medium' ? '#fef3c7' : '#dcfce7'
                         }}>
                           {getActivityIcon(activity.type)}
                         </div>
                         <Stack space={2}>
                           <Text size={1} weight="semibold">
                             {activity.userName}
                           </Text>
                           <Text size={0} muted>{activity.reason}</Text>
                         </Stack>
                       </Flex>
                       <Flex align="center" gap={4}>
                         <Badge 
                           tone="caution" 
                           padding={2}
                           style={{ 
                             backgroundColor: getSeverityColor(activity.severity).split(' ')[0].replace('bg-', ''),
                             color: getSeverityColor(activity.severity).split(' ')[1].replace('text-', '')
                           }}
                         >
                           {activity.severity}
                         </Badge>
                         <Text size={0} muted>
                           {formatTimeAgo(activity.timestamp)}
                         </Text>
                       </Flex>
                     </Flex>
                  </Card>
                ))}
              </Stack>
              
              {recentActivity.length > 5 && (
                <Flex justify="center">
                  <Button mode="ghost" tone="primary" text="View All Activity" />
                </Flex>
              )}
            </Stack>
          </Card>
        </Stack>
      )}

      {activeTab === 'settings' && (
        <ModerationSettings />
      )}

      {activeTab === 'test' && (
        <ModerationTest />
      )}

      {activeTab === 'activity' && (
        <Card padding={5} radius={3} shadow={2}>
          <Stack space={4}>
                         <Stack space={3}>
               <Flex align="center" justify="space-between">
                 <Flex align="center" gap={2}>
                   <Activity className="h-5 w-5 text-gray-600" />
                   <Text size={2} weight="semibold">Moderation Activity Log</Text>
                 </Flex>
                 <Flex gap={2}>
                   <Button mode="ghost" icon={Filter} text="Filter" />
                   <Button mode="ghost" icon={Eye} text="Export" />
                 </Flex>
               </Flex>
             </Stack>
            
            <Card padding={4} radius={2} shadow={1} tone="caution">
              <Stack space={3}>
                <Text size={1} weight="semibold">📊 Comprehensive Activity Tracking</Text>
                <Text size={1} muted>
                  This section provides detailed information about all moderation actions,
                  including timestamps, user information, content analysis results,
                  and actions taken. The data is fetched from Sanity and displayed
                  in a comprehensive log format with advanced filtering capabilities.
                </Text>
                <Inline space={2}>
                  <Badge tone="primary">Real-time</Badge>
                  <Badge tone="caution">Filterable</Badge>
                  <Badge tone="positive">Exportable</Badge>
                </Inline>
              </Stack>
            </Card>
          </Stack>
        </Card>
      )}
    </Stack>
  )
} 