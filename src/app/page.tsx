'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchTopStories, Story } from '../utils/api';
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, Trophy, Zap } from 'lucide-react';

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
    }, 5000); // Fetch new stories every 5 seconds

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
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-white text-gray-800">
      <div className="w-full max-w-5xl">
      <h1 className="text-5xl font-extrabold mb-8 text-center text-orange-600 drop-shadow-md">
  <span className="text-orange-500">HN </span>
  <span className="text-gray-600">Duel</span>
  <span className="block text-sm font-normal text-gray-600 mt-2">Can you predict which post got more points?</span>
</h1>


        <div className="mb-8 flex justify-center space-x-8 text-lg">
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <Trophy className="text-yellow-500 mr-2" />
            <span>Score: {score}</span>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <Zap className="text-blue-500 mr-2" />
            <span>Streak: {streak}</span>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <Trophy className="text-purple-500 mr-2" />
            <span>Best: {longestStreak}</span>
          </div>
        </div>

        {isLoading && !currentPair ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Skeleton className="w-[300px] h-[200px] mb-4 rounded-lg" />
            <Skeleton className="w-[300px] h-[200px] rounded-lg" />
          </div>
        ) : currentPair ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentPair.map((story, index) => (
              <div 
              key={story.id} 
              className={`
                flex p-4 rounded-lg shadow-md max-w-4xl cursor-pointer transition transform hover:scale-105 border-2 group
                ${selectedIndex === null ? 'hover:border-orange-300' : ''}
                ${selectedIndex === index 
                  ? (index === correctIndex ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') 
                  : selectedIndex !== null ? 'opacity-50' : 'border-transparent'}
              `}
              style={{ backgroundColor: selectedIndex === null ? 'rgb(255, 250, 240)' : '' }}
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
                <ExternalLink className="absolute top-4 right-4 text-gray-400" size={15} />
              )}
            </div>
            ))}
          </div>
        ) : null}

        {selectedIndex !== null && (
          <div className="mt-8 text-center">
            <p className="text-xl mb-4">
              {correctIndex === selectedIndex 
                ? "Great job! You guessed correctly." 
                : "Oops! Better luck next time."}
            </p>
            <p className="text-gray-600 text-lg mb-4">Next pair in {timer} seconds</p>
            <Button 
              onClick={() => setIsPaused(!isPaused)}
              className="mr-4 bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors text-lg px-6 py-3 rounded-full"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button 
              onClick={nextPair}
              className="bg-orange-500 text-white hover:bg-orange-600 transition-colors text-lg px-6 py-3 rounded-full"
            >
              Next Pair
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
