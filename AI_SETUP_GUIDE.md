# 🤖 AI Features Setup Guide for Foundrly

## 🎯 Overview

Your Foundrly platform now includes comprehensive AI features powered by Google Gemini, Anthropic Claude (optional), and Pinecone vector database. This guide will help you set up and use these features.

**Current Status:**
- ✅ **Gemini API**: Working perfectly
- ⚠️ **Anthropic API**: Needs credits (optional - Gemini provides fallback)
- ✅ **Pinecone API**: Ready to use

## 🔧 Environment Variables

Make sure you have these environment variables set in your `.env.local` file:

```env
# AI Service API Keys
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
```

## 🚀 Features Implemented

### 1. **AI-Powered Semantic Search**
- **Location**: `/ai-features` page
- **API**: `/api/ai/semantic-search`
- **Features**:
  - Natural language search queries
  - Vector-based similarity matching
  - Search suggestions and history
  - Confidence scoring

### 2. **AI Content Generation**
- **Location**: `/ai-features` page
- **API**: `/api/ai/generate-content`
- **Features**:
  - Generate startup descriptions
  - Suggest categories and tags
  - Content improvement suggestions
  - Copy-to-clipboard functionality

### 3. **AI Pitch Analysis**
- **Location**: `/ai-features` page
- **API**: `/api/ai/pitch-analysis`
- **Features**:
  - Overall pitch scoring (1-10)
  - Strengths and weaknesses analysis
  - Improvement suggestions
  - Market insights
  - Category and tag recommendations

### 4. **Personalized Recommendations**
- **Location**: `/ai-features` page
- **API**: `/api/ai/recommendations`
- **Features**:
  - User behavior-based recommendations
  - Vector similarity matching
  - Confidence scoring
  - Recommendation explanations

### 5. **Enhanced Content Moderation**
- **API**: `/api/ai/moderate`
- **Features**:
  - AI-powered content analysis
  - Severity classification
  - Improvement suggestions
  - Confidence scoring

### 6. **Vector Database Integration**
- **Automatic syncing** when startups are created/updated
- **API**: `/api/ai/sync-vectors`
- **Features**:
  - Bulk sync all startups
  - Batch processing
  - Sync status monitoring

## 🛠️ Setup Instructions

### Step 1: Install Dependencies
```bash
npm install @google/generative-ai @anthropic-ai/sdk @pinecone-database/pinecone
```

### Step 2: Set Up Pinecone Index
1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Create a new index named `foundrly-startups`
3. Use these settings:
   - **Dimensions**: 768 (for Gemini embeddings)
   - **Metric**: cosine
   - **Cloud**: Choose your preferred region

### Step 2.5: (Optional) Add Anthropic Credits
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Navigate to "Plans & Billing"
3. Add credits to your account for enhanced AI analysis
4. **Note**: This is optional - Gemini provides excellent fallback functionality

### Step 3: Initial Data Sync
After setting up your environment variables, sync your existing startups:

```bash
# Make a POST request to sync all startups
curl -X POST http://localhost:3000/api/ai/sync-vectors \
  -H "Content-Type: application/json" \
  -d '{"action": "sync-all"}'
```

### Step 4: Test AI Features
1. Visit `/ai-features` to test all AI components
2. Try the semantic search with natural language queries
3. Test content generation with startup ideas
4. Analyze existing pitches

## 📊 Usage Examples

### Semantic Search
```typescript
// Search for AI healthcare startups
const results = await fetch('/api/ai/semantic-search?q=AI startups for healthcare');
```

### Content Generation
```typescript
// Generate content for a startup idea
const content = await fetch('/api/ai/generate-content', {
  method: 'POST',
  body: JSON.stringify({
    idea: "AI-powered fitness app",
    category: "HealthTech"
  })
});
```

### Pitch Analysis
```typescript
// Analyze a startup pitch
const analysis = await fetch('/api/ai/pitch-analysis', {
  method: 'POST',
  body: JSON.stringify({
    title: "My Startup",
    pitch: "Our startup solves...",
    category: "FinTech"
  })
});
```

## 🔄 Automatic Integration

The AI features are automatically integrated with your existing workflow:

- **Startup Creation**: New startups are automatically synced to Pinecone
- **Search Enhancement**: Your existing search can be enhanced with semantic search
- **Content Moderation**: AI moderation can be integrated with your existing moderation system

## 🎨 UI Components

### Available Components
- `AIPitchAnalyzer` - Analyze startup pitches
- `AIContentGenerator` - Generate startup content
- `AISemanticSearch` - AI-powered search interface
- `AIRecommendations` - Personalized recommendations
- `useAIRecommendations` - Hook for fetching recommendations

### Usage in Your App
```tsx
import AIPitchAnalyzer from '@/components/AIPitchAnalyzer';
import AISemanticSearch from '@/components/AISemanticSearch';

// In your component
<AIPitchAnalyzer 
  pitch={startupPitch}
  title={startupTitle}
  category={startupCategory}
  onAnalysisComplete={(analysis) => console.log(analysis)}
/>
```

## 📈 Performance & Costs

### Estimated Costs (Monthly)
- **Gemini API**: ~$50-100 (depending on usage)
- **Anthropic Claude**: ~$30-60 (depending on usage)
- **Pinecone**: ~$70 (starter plan)

### Optimization Tips
1. **Caching**: Implement caching for repeated queries
2. **Batch Processing**: Use batch operations for vector updates
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Error Handling**: Graceful fallbacks when AI services are unavailable

## 🔒 Security & Privacy

### Data Protection
- All AI processing is done server-side
- User data is not stored by AI providers
- Vector embeddings are stored securely in Pinecone
- API keys are kept secure in environment variables

### Content Moderation
- AI moderation enhances your existing moderation system
- All flagged content is reviewed by your moderation team
- AI suggestions are not automatically applied

## 🚨 Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify all environment variables are set correctly
   - Check API key permissions and quotas

2. **Pinecone Connection Issues**
   - Verify index name matches `foundrly-startups`
   - Check Pinecone API key and region

3. **Vector Sync Failures**
   - Check startup data structure in Sanity
   - Verify all required fields are present

4. **AI Response Errors**
   - Check API quotas and rate limits
   - Verify request format and parameters

### Debug Mode
Enable debug logging by setting:
```env
DEBUG_AI=true
```

## 🎯 Next Steps

### Immediate Actions
1. ✅ Set up environment variables
2. ✅ Create Pinecone index
3. ✅ Test AI features on `/ai-features`
4. ✅ Sync existing startups

### Future Enhancements
- **Real-time Recommendations**: Update recommendations as users interact
- **Advanced Analytics**: AI-powered insights dashboard
- **Custom Models**: Train models on your specific data
- **Multi-language Support**: Support for multiple languages
- **Voice Search**: Voice-activated semantic search

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review API documentation for each service
3. Check console logs for error messages
4. Verify all environment variables are set correctly

---

**🎉 Congratulations!** Your Foundrly platform now has powerful AI capabilities that will significantly enhance user experience and platform intelligence!
