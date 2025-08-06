import React, { useState, useEffect } from 'react'
import { Card, Stack, Text, Badge, Button, Box, Flex, TextInput, TextArea, Select, Grid } from '@sanity/ui'
import { TestTube, AlertTriangle, Shield, MessageSquare, User, Settings, Play, CheckCircle, XCircle } from 'lucide-react'
import { getModerationSettings, type ModerationSettings as ModerationSettingsType } from '../lib/moderation-queries'

interface TestResult {
  id: string
  content: string
  type: 'profanity' | 'hateSpeech' | 'threats' | 'spam' | 'personalInfo' | 'clean'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  action: 'warn' | 'delete' | 'ban' | 'report' | 'allow'
  timestamp: string
}

export const ModerationTest = () => {
  const [testContent, setTestContent] = useState('')
  const [testType, setTestType] = useState<'manual' | 'preset'>('manual')
  const [presetContent, setPresetContent] = useState('')
  const [results, setResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<any>(null)

  // Load moderation settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await getModerationSettings()
        if (savedSettings) {
          setSettings(savedSettings)
        }
      } catch (error) {
        console.error('Error loading moderation settings:', error)
      }
    }

    loadSettings()
  }, [])

  const presetExamples = [
    {
      name: 'Profanity Test',
      content: 'This is a test message with some inappropriate language that should be flagged.',
      type: 'profanity' as const
    },
    {
      name: 'Hate Speech Test',
      content: 'This message contains discriminatory content that should be detected.',
      type: 'hateSpeech' as const
    },
    {
      name: 'Threat Test',
      content: 'I will harm you if you continue this behavior.',
      type: 'threats' as const
    },
    {
      name: 'Spam Test',
      content: 'BUY NOW! CLICK HERE! FREE MONEY! MAKE MONEY FAST!',
      type: 'spam' as const
    },
    {
      name: 'Personal Info Test',
      content: 'My phone number is 555-123-4567 and my email is test@example.com',
      type: 'personalInfo' as const
    },
    {
      name: 'Clean Content',
      content: 'This is a perfectly normal message that should pass moderation.',
      type: 'clean' as const
    }
  ]

  const simulateModeration = async (content: string, type?: string) => {
    setIsLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate moderation logic
    const result: TestResult = {
      id: Date.now().toString(),
      content,
      type: type as any || 'clean',
      severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
      action: Math.random() > 0.8 ? 'ban' : Math.random() > 0.6 ? 'delete' : Math.random() > 0.4 ? 'warn' : 'allow',
      timestamp: new Date().toISOString()
    }
    
    setResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
    setIsLoading(false)
  }

  const handleTest = async () => {
    if (!testContent.trim()) return
    await simulateModeration(testContent)
  }

  const handlePresetTest = async (preset: typeof presetExamples[0]) => {
    setTestContent(preset.content)
    await simulateModeration(preset.content, preset.type)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-200 text-red-900'
      case 'high': return 'bg-orange-200 text-orange-900'
      case 'medium': return 'bg-yellow-200 text-yellow-900'
      case 'low': return 'bg-blue-200 text-blue-900'
      default: return 'bg-gray-200 text-gray-900'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'ban': return 'bg-red-100 text-red-800'
      case 'delete': return 'bg-orange-100 text-orange-800'
      case 'warn': return 'bg-yellow-100 text-yellow-800'
      case 'report': return 'bg-blue-100 text-blue-800'
      case 'allow': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
                  <TestTube className="h-6 w-6 text-white" />
                </div>
                <Stack space={2}>
                  <Text size={3} weight="bold" style={{ color: 'white' }}>
                    Moderation Test Tools
                  </Text>
                  <Text size={1} style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Test and validate moderation rules with sample content
                  </Text>
                </Stack>
              </Flex>
            </Stack>
            <Badge tone="primary" padding={2} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
              Testing Mode
            </Badge>
          </Flex>
        </Stack>
      </Card>

      {/* Test Input Section */}
      <Card padding={5} radius={3} shadow={2}>
        <Stack space={5}>
          <Stack space={3}>
            <Text size={2} weight="semibold">Test Content</Text>
            <Text size={1} muted>Enter content to test against moderation rules</Text>
          </Stack>
          
          <Stack space={4}>
            <TextArea
              placeholder="Enter content to test moderation..."
              value={testContent}
              onChange={(e) => setTestContent((e.target as HTMLTextAreaElement).value)}
              rows={4}
              style={{ minHeight: '120px' }}
            />
            
            <Flex gap={3} justify="flex-end">
              <Button
                mode="ghost"
                onClick={() => setTestContent('')}
                text="Clear"
              />
              <Button
                mode="default"
                onClick={handleTest}
                disabled={isLoading || !testContent.trim()}
                icon={Play}
                padding={3}
                text={isLoading ? 'Testing...' : 'Test Content'}
              />
            </Flex>
          </Stack>
        </Stack>
      </Card>

      {/* Preset Examples */}
      <Card padding={5} radius={3} shadow={2}>
        <Stack space={5}>
          <Stack space={3}>
            <Text size={2} weight="semibold">Preset Examples</Text>
            <Text size={1} muted>Quick test with predefined content types</Text>
          </Stack>
          
          <Grid columns={[1, 2]} gap={4}>
            {presetExamples.map((preset) => (
              <Card key={preset.name} padding={4} radius={2} shadow={1} style={{ cursor: 'pointer' }}>
                <Stack space={3}>
                  <Flex align="center" justify="space-between">
                    <Stack space={4}>
                      <Text size={1} weight="semibold">{preset.name}</Text>
                      <Text size={0} muted style={{ 
                        lineHeight: '1.5',
                        maxWidth: '320px',
                        wordWrap: 'break-word'
                      }}>
                        {preset.content}
                      </Text>
                    </Stack>
                    <Button
                      mode="ghost"
                      size={0}
                      onClick={() => handlePresetTest(preset)}
                      disabled={isLoading}
                      icon={Play}
                      text="Test"
                    />
                  </Flex>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Stack>
      </Card>

      {/* Test Results */}
      <Card padding={5} radius={3} shadow={2}>
        <Stack space={5}>
          <Stack space={3}>
            <Flex align="center" justify="space-between">
              <Stack space={2}>
                <Text size={2} weight="semibold">Test Results</Text>
                <Text size={1} muted>Recent moderation test outcomes</Text>
              </Stack>
              <Badge tone="primary" padding={1}>
                {results.length} tests
              </Badge>
            </Flex>
          </Stack>
          
          <Stack space={4}>
            {results.length === 0 ? (
              <Card padding={6} radius={2} shadow={1} tone="caution">
                <Flex direction="column" align="center" gap={3}>
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                  <Text size={1} muted>No test results yet. Run a test to see results here.</Text>
                </Flex>
              </Card>
            ) : (
              results.map((result) => (
                <Card key={result.id} padding={4} radius={2} shadow={1} style={{ 
                  borderLeft: `4px solid ${
                    result.severity === 'critical' ? '#dc2626' : 
                    result.severity === 'high' ? '#ea580c' : 
                    result.severity === 'medium' ? '#d97706' : '#65a30d'
                  }`
                }}>
                  <Stack space={4}>
                    <Flex align="center" justify="space-between">
                      <Stack space={2}>
                        <Text size={1} weight="semibold">
                          {result.type.charAt(0).toUpperCase() + result.type.slice(1)} Detection
                        </Text>
                        <Text size={0} muted>
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </Text>
                      </Stack>
                      <Flex gap={2}>
                        <Badge 
                          tone="caution" 
                          padding={1}
                          style={{ 
                            backgroundColor: getSeverityColor(result.severity).split(' ')[0].replace('bg-', ''),
                            color: getSeverityColor(result.severity).split(' ')[1].replace('text-', '')
                          }}
                        >
                          {result.severity}
                        </Badge>
                        <Badge 
                          tone="primary" 
                          padding={1}
                          style={{ 
                            backgroundColor: getActionColor(result.action).split(' ')[0].replace('bg-', ''),
                            color: getActionColor(result.action).split(' ')[1].replace('text-', '')
                          }}
                        >
                          {result.action}
                        </Badge>
                      </Flex>
                    </Flex>
                    
                    <Card padding={3} radius={1} tone="caution">
                      <Text size={1} style={{ fontStyle: 'italic' }}>
                        "{result.content}"
                      </Text>
                    </Card>
                    
                    <Flex align="center" justify="space-between">
                      <Stack space={2}>
                        <Text size={0} weight="semibold">Confidence</Text>
                        <Text size={1} weight="bold" style={{ color: '#059669' }}>
                          {(result.confidence * 100).toFixed(1)}%
                        </Text>
                      </Stack>
                      
                      <Flex gap={2}>
                        {result.action === 'allow' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </Flex>
                    </Flex>
                  </Stack>
                </Card>
              ))
            )}
          </Stack>
        </Stack>
      </Card>

      {/* Settings Info */}
      {settings && (
        <Card padding={5} radius={3} shadow={2} tone="primary">
          <Stack space={4}>
            <Flex align="center" gap={3}>
              <Settings className="h-5 w-5 text-blue-600" />
              <Stack space={2}>
                <Text size={2} weight="semibold">Current Settings</Text>
                <Text size={1} muted>Moderation rules being tested</Text>
              </Stack>
            </Flex>
            
            <Grid columns={[1, 2]} gap={4}>
              <Stack space={3}>
                <Text size={1} weight="semibold">Severity Level</Text>
                <Badge tone="primary" padding={1}>
                  {settings.severity}
                </Badge>
              </Stack>
              
              <Stack space={3}>
                <Text size={1} weight="semibold">Auto-Ban</Text>
                <Badge tone={settings.autoBan?.enabled ? 'positive' : 'caution'} padding={1}>
                  {settings.autoBan?.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </Stack>
            </Grid>
          </Stack>
        </Card>
      )}
    </Stack>
  )
} 