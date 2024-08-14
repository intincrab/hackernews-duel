'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchTopStories, Story } from '../utils/api';
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink } from 'lucide-react';

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentPair, setCurrentPair] = useState<[Story, Story] | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);

  const loadStories = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedStories = await fetchTopStories(50);
      setStories(fetchedStories);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const nextPair = useCallback(() => {
    if (stories.length < 2) {
      loadStories();
      return;
    }
    const randomIndex = Math.floor(Math.random() * (stories.length - 1));
    const pair: [Story, Story] = [stories[randomIndex], stories[randomIndex + 1]];
    setCurrentPair(pair);
    setStories(stories.filter((_, index) => index !== randomIndex && index !== randomIndex + 1));
    setSelectedIndex(null);
    setTimer(5);
    setIsPaused(false);
    setCorrectIndex(null);

    // Reload stories if running low
    if (stories.length < 6) {
      loadStories();
    }
  }, [stories, loadStories]);

  useEffect(() => {
    loadStories();
    const interval = setInterval(() => {
      if (!isPaused) {
        loadStories();
      }
    }, 300000); // Fetch new stories every 5 minutes

    return () => clearInterval(interval);
  }, [isPaused, loadStories]);

  useEffect(() => {
    if (stories.length >= 2 && !currentPair) {
      nextPair();
    }
  }, [stories, currentPair, nextPair]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (selectedIndex !== null && !isPaused && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      nextPair();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedIndex, isPaused, timer, nextPair]);

  function getDaysAgo(timestamp: number): string {
    const now = Date.now();
    const diffInDays = Math.floor((now - timestamp * 1000) / (1000 * 60 * 60 * 24));
    return `${diffInDays} days ago`;
  }

  function handleGuess(index: 0 | 1) {
    if (!currentPair || selectedIndex !== null) return;

    const correct = currentPair[index].score >= currentPair[1 - index].score;
    setSelectedIndex(index);
    setCorrectIndex(correct ? index : 1 - index);

    if (correct) {
      setScore(score + 1);
      setStreak(streak + 1);
      setLongestStreak(Math.max(longestStreak, streak + 1));
    } else {
      setScore(prevScore => Math.max(0, prevScore - 1));
      setStreak(0);
    }
  }

  function handleCardClick(storyId: number) {
    if (selectedIndex !== null) {
      window.open(`https://news.ycombinator.com/item?id=${storyId}`, '_blank');
    }
  }

  function getDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (e) {
      return '';
    }
  }

  if (isLoading && !currentPair) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Skeleton className="w-[300px] h-[200px] mb-4" />
        <Skeleton className="w-[300px] h-[200px]" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-white text-black">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-orange-500">Hacker News Duel <span className="flex items-center justify-center flex-row text-gray-300 text-xs py-2">(orange site duel)</span></h1>

        <div className="mb-4 text-center">
          <span className="mr-4">Score: {score}</span>
          <span className="mr-4">Current Streak: {streak}</span>
          <span>Longest Streak: {longestStreak}</span>
        </div>
        <p className="mb-4 text-center">Can you predict which post got more points?</p>
        {currentPair && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {currentPair.map((story, index) => (
              <div 
                key={story.id} 
                className={`flex p-4 rounded-lg shadow-md max-w-4xl cursor-pointer transition transform hover:scale-105 border-2 group ${
                  selectedIndex === index
                    ? (index === correctIndex ? 'border-green-500 scale-105' : 'border-red-500 scale-105')
                    : selectedIndex !== null
                      ? 'opacity-50'
                      : ''
                }`}
                style={{ backgroundColor: 'rgb(246, 246, 239)', position: 'relative' }}
                onClick={() => selectedIndex === null ? handleGuess(index as 0 | 1) : handleCardClick(story.id)}
              >
                <div className="flex-1">
                  <h2 className="text-lg font-medium mb-2">
                    {story.title} <span className="text-gray-500 text-xs">({getDomain(story.url)})</span>
                  </h2>
                  <div className="text-gray-600 text-xs">
                    <span className={selectedIndex === null ? "blur-sm" : ""}>{story.score} points</span>
                    {' by '}
                    <span>{story.by}</span>
                    {' '}
                    <span>{getDaysAgo(story.time)}</span>
                    {' | '}
                    <span className={selectedIndex === null ? "blur-sm" : ""}>{story.descendants} comments</span>
                  </div>
                </div>
                {selectedIndex !== null && (
                  <div className="absolute top-2 right-2 flex items-center text-black transition-opacity">
                    <ExternalLink size={12} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {selectedIndex !== null && (
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">New posts in {timer} seconds</p>
            <Button 
              onClick={() => setIsPaused(!isPaused)}
              className="mr-2 bg-white text-black hover:bg-gray-200 transition-colors"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button 
              onClick={nextPair}
              className="bg-white text-orange-500 hover:bg-gray-200 transition-colors"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}