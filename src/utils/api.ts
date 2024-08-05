import axios from 'axios';

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';

export interface Story {
  id: number;
  title: string;
  score: number;
  time: number;
  url: string;
  by: string; // Add this line
  descendants: number;
}

export async function fetchTopStories(): Promise<number[]> {
  const response = await axios.get(`${BASE_URL}/topstories.json`);
  return response.data;
}

export async function fetchStoryDetails(id: number): Promise<Story> {
  const response = await axios.get(`${BASE_URL}/item/${id}.json`);
  return response.data;
}

export async function fetchRecentStories(count: number = 10): Promise<Story[]> {
  const topStories = await fetchTopStories();
  const oneMonthAgo = Date.now() / 1000 - 30 * 24 * 60 * 60;
  
  const stories = await Promise.all(
    topStories.slice(0, 100).map(fetchStoryDetails)
  );
  
  return stories
    .filter(story => story.time > oneMonthAgo && story.score >= 8)
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}