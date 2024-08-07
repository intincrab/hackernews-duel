'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { fetchRecentStories, Story } from '../utils/api';
import { Button } from "@/components/ui/button"
import { ExternalLink } from 'lucide-react';
import { formatDistanceToNow, subDays } from 'date-fns';

const BATCH_SIZE = 20;
const THRESHOLD = 10;

export default function GameComponent({ initialStories }: { initialStories: Story[] }) {
  const [stories, setStories] = useState<Story[]>(initialStories.slice(2));
  const [currentPair, setCurrentPair] = useState<[Story, Story]>([initialStories[0], initialStories[1]]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);

  const fetchMoreStories = useCallback(async () => {
    try {
      const newStories = await fetchRecentStories(BATCH_SIZE);
      setStories(prevStories => [...prevStories, ...newStories]);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    }
  }, []);

  useEffect(() => {
    if (stories.length < THRESHOLD) {
      fetchMoreStories();
    }
  }, [stories, fetchMoreStories]);

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
  }, [selectedIndex, isPaused, timer]);

  const nextPair = useCallback(() => {
    if (stories.length < 2) {
      fetchMoreStories();
      return;
    }
    const [first, second, ...rest] = stories;
    setCurrentPair([first, second]);
    setStories(rest);
    setSelectedIndex(null);
    setTimer(5);
    setIsPaused(false);
    setCorrectIndex(null);
  }, [stories, fetchMoreStories]);

  function getDaysAgo(timestamp: number): string {
    // Convert timestamp to milliseconds if it's in seconds
    const timeInMilliseconds = timestamp * 1000;
    const date = new Date(timeInMilliseconds);
    return formatDistanceToNow(date, { addSuffix: true });
  }

  function handleGuess(index: 0 | 1) {
    if (selectedIndex !== null) return;
  
    const correct = currentPair[index].score >= currentPair[1 - index].score;
    setSelectedIndex(index);
    setCorrectIndex(correct ? index : 1 - index);
  
    if (correct) {
      setScore(prevScore => prevScore + 1);
      setStreak(prevStreak => prevStreak + 1);
      setLongestStreak(prevLongest => Math.max(prevLongest, streak + 1));
    } else {
      setScore(prevScore => prevScore - 1);  // Subtract 1 from score for incorrect guess
      setStreak(0);
    }
  }
  

  function handlePause() {
    setIsPaused(prevPaused => !prevPaused);
  }

  function handleCardClick(storyId: number) {
    if (selectedIndex !== null) {
      window.open(`https://news.ycombinator.com/item?id=${storyId}`, '_blank');
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-white text-black">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-orange-500">hacker news duel</h1>
        
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
              onClick={() => selectedIndex === null ? handleGuess(index as 0 | 1) : handleCardClick(story.id)}
            >
              <h2 className="text-lg font-medium mb-2">{story.title}</h2>
              <div className="text-gray-600 text-xs">
                <span className={selectedIndex === null ? "blur-sm" : ""}>{story.score} points</span>
                {' by '}
                <span>{story.by}</span>
                {' '}
                <span>{getDaysAgo(story.time)}</span>
                {' | '}
                <span className={selectedIndex === null ? "blur-sm" : ""}>{story.descendants} comments</span>
              </div>
              {selectedIndex !== null && (
                <div className="absolute top-2 right-2 flex items-center text-black transition-opacity">
                  <ExternalLink size={12} />
                </div>
              )}
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