import axios from 'axios';

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';

export interface Story {
  id: number;
  title: string;
  score: number;
  time: number;
  url: string;
  by: string;
  descendants: number;
}

let storyCache: Story[] = [];
let lastFetchTime = 0;

export async function fetchTopStories(): Promise<number[]> {
  const response = await axios.get(`${BASE_URL}/topstories.json`);
  return response.data;
}

export async function fetchStoryDetails(id: number): Promise<Story> {
  const response = await axios.get(`${BASE_URL}/item/${id}.json`);
  return response.data;
}

export async function preloadStories(count: number = 20): Promise<void> {
  const topStories = await fetchTopStories();
  const oneMonthAgo = Date.now() / 1000 - 30 * 24 * 60 * 60;

  const newStories = await Promise.all(
    topStories.slice(0, 100).map(fetchStoryDetails)
  );

  storyCache = newStories
    .filter(story => story.time > oneMonthAgo && story.score >= 8)
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  lastFetchTime = Date.now();
}

export async function fetchRecentStories(count: number = 2): Promise<Story[]> {
  const now = Date.now();
  const cacheLifetime = 5 * 60 * 1000; // 5 minutes

  if (now - lastFetchTime > cacheLifetime || storyCache.length < count) {
    await preloadStories(Math.max(count, 20));
  }

  // If we don't have enough stories, fetch more
  if (storyCache.length < count) {
    const additionalStories = await fetchRecentStories(count - storyCache.length);
    storyCache = [...storyCache, ...additionalStories];
  }

  // Return the requested number of stories and remove them from the cache
  const stories = storyCache.splice(0, count);
  return stories;
}