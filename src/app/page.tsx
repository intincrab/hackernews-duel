'use client'

import { useState, useEffect } from 'react';
import { fetchRecentStories, Story } from '../utils/api';
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

  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (selectedIndex !== null && !isPaused && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      nextPair(stories);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedIndex, isPaused, timer, stories]);

  async function loadStories() {
    setIsLoading(true);
    try {
      const fetchedStories = await fetchRecentStories(10);
      setStories(fetchedStories);
      nextPair(fetchedStories);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function nextPair(stories: Story[]) {
    if (stories.length < 2) {
      setCurrentPair(null);
      return;
    }
    const pair: [Story, Story] = [stories[0], stories[1]];
    setCurrentPair(pair);
    setStories(stories.slice(2));
    setSelectedIndex(null);
    setTimer(5);
    setIsPaused(false);
    setCorrectIndex(null);
  }

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
      setStreak(0);
    }
  }

  function handleNext() {
    nextPair(stories);
  }

  function handlePause() {
    setIsPaused(!isPaused);
  }

  function handleCardClick(url: string) {
    if (selectedIndex !== null) {
      window.open(url, '_blank');
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Skeleton className="w-[300px] h-[200px] mb-4" />
        <Skeleton className="w-[300px] h-[200px]" />
      </div>
    );
  }

  if (!currentPair) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-gray-500 text-2xl font-bold mb-4">Game Over</h2>
        <Button className="bg-white text-orange-500 hover:bg-gray-200 transition-colors" onClick={loadStories}>Play Again</Button>

      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-white text-black">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-orange-500">hacker news duel</h1>
        
        <div className="flex justify-center mb-4">
        </div>

        <div className="mb-4 text-center">
          <span className="mr-4">Score: {score}</span>
          <span className="mr-4">Current Streak: {streak}</span>
          <span>Longest Streak: {longestStreak}</span>
        </div>
        <p className="mb-4 text-center">Can you predict which post got more points?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {currentPair.map((story, index) => (
            <div 
              key={story.id} 
              className={`p-4 rounded-lg shadow-md max-w-2xl cursor-pointer transition transform hover:scale-105 border-2 group ${
                selectedIndex === index
                  ? (index === correctIndex ? 'border-green-500 scale-105' : 'border-red-500 scale-105')
                  : selectedIndex !== null
                    ? 'opacity-50'
                    : ''
              }`}
              style={{ backgroundColor: 'rgb(246, 246, 239)', position: 'relative' }}
              onClick={() => selectedIndex === null ? handleGuess(index as 0 | 1) : handleCardClick(story.url)}
            >
              <h2 className="text-lg font-medium mb-2">{story.title}</h2>
              <div className="text-gray-600 text-xs">
                <span className={selectedIndex === null ? "blur-sm" : ""}>{story.score} points</span>
                {' by '}
                <span>{story.by}</span>
                {' '}
                <span>{getDaysAgo(story.time)}</span>
                {' | '}
                <span>{story.descendants} comments</span>
              </div>
              <div className="absolute top-2 right-2 flex items-center text-black opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={16} />
              </div>
            </div>          
          ))}
        </div>
        {selectedIndex !== null && (
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">New posts in {timer} seconds</p>
            <Button 
              onClick={handlePause} 
              className="mr-2 bg-white text-black hover:bg-gray-200 transition-colors"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button 
              onClick={handleNext}
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