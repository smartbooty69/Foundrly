import { auth } from "@/auth";
import AIPitchAnalyzerStandalone from "@/components/AIPitchAnalyzerStandalone";
import AIContentGenerator from "@/components/AIContentGenerator";
import AISemanticSearch from "@/components/AISemanticSearch";
import AIRecommendations from "@/components/AIRecommendations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, Search, TrendingUp, Shield, Zap } from "lucide-react";

export default async function AIFeaturesPage() {
  const session = await auth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold">AI-Powered Features</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover how artificial intelligence enhances your startup discovery and creation experience on Foundrly
        </p>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Semantic Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Find startups using natural language. Describe what you're looking for and get intelligent results.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Content Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Generate compelling startup descriptions, tags, and categories using AI assistance.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Get personalized startup recommendations based on your interests and activity.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-orange-600" />
              Pitch Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Analyze your startup pitch with AI to get insights, suggestions, and improvement recommendations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Content Moderation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              AI-powered content moderation ensures a safe and professional environment for all users.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Vector Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Advanced vector-based search that understands context and meaning, not just keywords.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Features Sections */}
      <div className="space-y-12">
        {/* Semantic Search */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Search className="h-6 w-6 text-blue-600" />
            AI-Powered Search
          </h2>
          <AISemanticSearch />
        </section>

        {/* Content Generation */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI Content Generator
          </h2>
          <AIContentGenerator />
        </section>

        {/* Pitch Analysis */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Brain className="h-6 w-6 text-orange-600" />
            AI Pitch Analyzer
          </h2>
          <AIPitchAnalyzerStandalone />
        </section>

        {/* Recommendations */}
        {session && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              Personalized Recommendations
            </h2>
            <AIRecommendations />
          </section>
        )}
      </div>

      {/* How It Works */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-8 text-center">How Our AI Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Data Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                We process startup data and create vector embeddings using Google's Gemini AI.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Vector Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Startup data is stored in Pinecone's vector database for fast similarity searches.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Anthropic's Claude AI analyzes content and provides intelligent insights.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">4. Smart Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Get personalized recommendations and intelligent search results.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="mt-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Data Protection</h3>
                <p className="text-sm text-gray-600">
                  Your data is processed securely and never shared with third parties. 
                  We use enterprise-grade AI services with strict privacy policies.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Transparent AI</h3>
                <p className="text-sm text-gray-600">
                  Our AI systems are designed to be transparent and explainable. 
                  You can see why recommendations were made and how analysis was performed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

