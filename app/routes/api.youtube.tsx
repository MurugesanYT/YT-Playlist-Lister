import { json, LoaderArgs } from "@remix-run/node";

const YOUTUBE_API_KEY = "AIzaSyDDxX1kn5GVvZnZa7XJ-hyo3n4kVJSLpX4";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("searchTerm");
  const channelId = url.searchParams.get("channelId");

  if (searchTerm) {
    const searchResults = await searchChannels(searchTerm);
    return json(searchResults);
  }

  if (channelId) {
    const playlists = await fetchPlaylists(channelId);
    return json(playlists);
  }

  return json({ error: "Missing search term or channel ID" }, { status: 400 });
};

async function searchChannels(searchTerm: string) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchTerm}&type=channel&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    console.error("YouTube API Error:", data);
    throw new Error("Failed to fetch channels");
  }

  return data.items.map((item: any) => ({
    channelId: item.id.channelId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.default.url,
  }));
}

async function fetchPlaylists(channelId: string) {
  let allPlaylists: any[] = [];
  let nextPageToken: string | null = null;

  do {
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${channelId}&maxResults=50&key=${YOUTUBE_API_KEY}${
      nextPageToken ? `&pageToken=${nextPageToken}` : ""
    }`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error("YouTube API Error:", data);
      throw new Error("Failed to fetch playlists");
    }

    allPlaylists = allPlaylists.concat(data.items.map((item: any) => ({
      playlistId: item.id,
      title: item.snippet.title,
    })));
    nextPageToken = data.nextPageToken || null;
  } while (nextPageToken);

  return allPlaylists;
}
