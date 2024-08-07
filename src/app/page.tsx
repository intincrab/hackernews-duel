import { fetchRecentStories } from '../utils/api';
import GameComponent from './GameComponent';

export default async function Home() {
  const initialStories = await fetchRecentStories(20);
  return <GameComponent initialStories={initialStories} />;
}