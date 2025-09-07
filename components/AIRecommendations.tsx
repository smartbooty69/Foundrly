'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Carousel } from './ui/carousel';
import { Brain, TrendingUp, RefreshCw, Users, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import StartupCard from './StartupCard';

interface AIRecommendationsProps {
  limit?: number;
  onStartupSelect?: (startup: any) => void;
  className?: string;
}

export default function AIRecommendations({ 
  limit = 6, 
  onStartupSelect, 
  className 
}: AIRecommendationsProps) {
  const { recommendations, isLoading, error, refetch } = useAIRecommendations(limit);
  const [mobileCurrentIndex, setMobileCurrentIndex] = useState(0);
  const [desktopCurrentIndex, setDesktopCurrentIndex] = useState(0);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-gray-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Finding personalized recommendations...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={refetch} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!recommendations || !recommendations.startups || recommendations.startups.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No recommendations available</p>
              <p className="text-sm text-gray-400">
                Start exploring startups to get personalized recommendations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
        </div>
        <Button onClick={refetch} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Recommendations Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">
                  {recommendations.startups?.length || 0} personalized recommendations
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">
                  {Math.round((recommendations.confidence || 0) * 100)}% confidence
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Reasons */}
      {recommendations.reasons && recommendations.reasons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" />
              Why these recommendations?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recommendations.reasons.map((reason, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {reason}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Startups Carousel - Mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium">Recommended for you</h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileCurrentIndex(Math.max(0, mobileCurrentIndex - 1))}
              disabled={mobileCurrentIndex === 0}
              className="bg-white/90 hover:bg-white shadow-lg border-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileCurrentIndex(Math.min((recommendations.startups?.length || 1) - 1, mobileCurrentIndex + 1))}
              disabled={mobileCurrentIndex >= (recommendations.startups?.length || 1) - 1}
              className="bg-white/90 hover:bg-white shadow-lg border-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="w-full max-w-6xl mx-auto">
          <Carousel
            itemsPerView={1}
            showDots={true}
            showArrows={false}
            autoPlay={false}
            externalControls={true}
            currentIndex={mobileCurrentIndex}
            onIndexChange={setMobileCurrentIndex}
            className="w-full"
          >
          {recommendations.startups?.map((startup, index) => (
            <div key={startup._id || index} className="relative h-full">
              <StartupCard 
                post={startup} 
                isLoggedIn={true} 
                userId={null}
                onStartupSelect={onStartupSelect}
              />
              {startup.similarity && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="secondary" className="text-xs bg-white/90 backdrop-blur-sm">
                    {Math.round(startup.similarity * 100)}% match
                  </Badge>
                </div>
              )}
            </div>
          ))}
          </Carousel>
        </div>
      </div>

      {/* Desktop Carousel */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium">Recommended for you</h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDesktopCurrentIndex(Math.max(0, desktopCurrentIndex - 1))}
              disabled={desktopCurrentIndex === 0}
              className="bg-white/90 hover:bg-white shadow-lg border-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDesktopCurrentIndex(Math.min(Math.max(0, (recommendations.startups?.length || 3) - 3), desktopCurrentIndex + 1))}
              disabled={desktopCurrentIndex >= Math.max(0, (recommendations.startups?.length || 3) - 3)}
              className="bg-white/90 hover:bg-white shadow-lg border-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="w-full max-w-8xl mx-auto">
          <Carousel
            itemsPerView={3}
            showDots={true}
            showArrows={false}
            autoPlay={false}
            externalControls={true}
            currentIndex={desktopCurrentIndex}
            onIndexChange={setDesktopCurrentIndex}
            className="w-full"
          >
          {recommendations.startups?.map((startup, index) => (
            <div key={startup._id || index} className="relative h-full">
              <StartupCard 
                post={startup} 
                isLoggedIn={true} 
                userId={null}
                onStartupSelect={onStartupSelect}
              />
              {startup.similarity && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="secondary" className="text-xs bg-white/90 backdrop-blur-sm">
                    {Math.round(startup.similarity * 100)}% match
                  </Badge>
                </div>
              )}
            </div>
          ))}
          </Carousel>
        </div>
      </div>

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>
              Recommendations are personalized based on your interests and activity
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

