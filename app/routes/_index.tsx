import { useState, useEffect } from "react";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  return json({});
};

export default function Index() {
  const [searchTerm, setSearchTerm] = useState("");
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [copyAllText, setCopyAllText] = useState("");
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      if (searchTerm) {
        setLoadingChannels(true);
        setError(null);
        try {
          const response = await fetch(`/api/youtube?searchTerm=${searchTerm}`);
          if (!response.ok) {
            throw new Error("Failed to fetch channels");
          }
          const data = await response.json();
          setChannels(data);
        } catch (e: any) {
          setError(e.message);
          setChannels([]);
        } finally {
          setLoadingChannels(false);
        }
      } else {
        setChannels([]);
        setLoadingChannels(false);
      }
    };

    fetchChannels();
  }, [searchTerm]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (selectedChannelId) {
        setLoadingPlaylists(true);
        setError(null);
        try {
          const response = await fetch(`/api/youtube?channelId=${selectedChannelId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch playlists");
          }
          const data = await response.json();
          setPlaylists(data);
        } catch (e: any) {
          setError(e.message);
          setPlaylists([]);
        } finally {
          setLoadingPlaylists(false);
        }
      } else {
        setPlaylists([]);
        setLoadingPlaylists(false);
      }
    };

    fetchPlaylists();
  }, [selectedChannelId]);

  useEffect(() => {
    if (playlists.length > 0) {
      const allText = playlists
        .map((playlist) => `${playlist.title} - https://www.youtube.com/playlist?list=${playlist.playlistId}`)
        .join("\\n");
      setCopyAllText(allText);
    } else {
      setCopyAllText("");
    }
  }, [playlists]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
  };

  const handleCopyClick = (playlist: any) => {
    const playlistLink = `https://www.youtube.com/playlist?list=${playlist.playlistId}`;
    navigator.clipboard.writeText(\`\${playlist.title} - \${playlistLink}\`);
    alert("Playlist link copied to clipboard!");
  };

  const handleCopyAllClick = () => {
    navigator.clipboard.writeText(copyAllText);
    alert("All playlist names and links copied to clipboard!");
  };

  const handleBackClick = () => {
    setSelectedChannelId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold text-center">YouTube Playlist Explorer</h1>
            </div>
            {error && (
              <div className="bg-red-200 text-red-800 py-2 px-4 rounded mt-4">
                Error: {error}
              </div>
            )}
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                {!selectedChannelId ? (
                  <div className="relative">
                    <input
                      type="text"
                      className="peer h-10 w-full border rounded px-4 text-gray-800 placeholder-transparent focus:outline-none focus:border-blue-500"
                      placeholder="Search YouTube Channels"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    <label className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm px-2 bg-white">
                      Search YouTube Channels
                    </label>
                  </div>
                ) : (
                  <button
                    onClick={handleBackClick}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                  >
                    Back to Channels
                  </button>
                )}
              </div>
            </div>
            {!selectedChannelId ? (
              <>
                {loadingChannels && <div className="text-center">Loading channels...</div>}
                {channels.length > 0 && (
                  <div className="py-4">
                    <h2 className="text-lg font-semibold mb-2">Channels</h2>
                    <ul>
                      {channels.map((channel) => (
                        <li key={channel.channelId} className="flex items-center py-2">
                          <button
                            onClick={() => handleChannelSelect(channel.channelId)}
                            className="flex items-center"
                          >
                            <img
                              src={channel.thumbnail}
                              alt={channel.title}
                              className="w-10 h-10 rounded-full mr-2"
                            />
                            <span className="text-blue-500 hover:underline">{channel.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <>
                {loadingPlaylists && <div className="text-center">Loading playlists...</div>}
                {playlists.length > 0 && (
                  <div className="py-4">
                    <h2 className="text-lg font-semibold mb-2">Playlists</h2>
                    <button
                      onClick={handleCopyAllClick}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                    >
                      Copy All
                    </button>
                    <ul>
                      {playlists.map((playlist) => (
                        <li key={playlist.playlistId} className="flex items-center justify-between py-2">
                          <span>{playlist.title}</span>
                          <button
                            onClick={() => handleCopyClick(playlist)}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                          >
                            Copy
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
