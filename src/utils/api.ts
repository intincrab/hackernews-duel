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

export async function fetchBestStories(limit: number = 50): Promise<number[]> {
  const response = await axios.get(`${BASE_URL}/beststories.json?orderBy="$priority"&limitToFirst=${limit}`);
  return response.data;
}

export async function fetchStoryDetails(id: number): Promise<Story> {
  const response = await axios.get(`${BASE_URL}/item/${id}.json`);
  return response.data;
}

export async function fetchTopStories(count: number = 50): Promise<Story[]> {
  const storyIds = await fetchBestStories(count);
  const stories = await Promise.all(storyIds.map(fetchStoryDetails));
  return stories.filter(story => story.url); // Ensure stories have a URL
}