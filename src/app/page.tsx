"use client";

import { useState } from "react";
import { Article, SearchResponse } from "@/types";
import axios from 'axios';

export default function Home() {
  const [query, setQuery] = useState("");
  const [numArticles, setNumArticles] = useState(3);
  const [timespan, setTimespan] = useState(1);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/search', {
        params: {
          query: query,
          numarticles: numArticles,
          timespan: `${timespan}w`
        }
      });
      setResponse(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center w-full max-w-2xl mt-8">
        <h1 className="text-2xl font-bold">News Search</h1>
        <div className="flex items-center gap-2 w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your search query"
            className="p-2 border border-gray-300 rounded flex-grow text-black dark:text-black self-end"
          />
          <div className="flex flex-col items-center ml-2">
            <label htmlFor="numArticles" className="text-sm mb-1 text-center">Sources</label>
            <select
              id="numArticles"
              value={numArticles}
              onChange={(e) => setNumArticles(Number(e.target.value))}
              className="p-2 border border-gray-300 rounded text-black dark:text-black"
              title="Number of articles"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col items-center ml-2">
            <label htmlFor="timespan" className="text-sm mb-1 text-center">Weeks</label>
            <select
              id="timespan"
              value={timespan}
              onChange={(e) => setTimespan(Number(e.target.value))}
              className="p-2 border border-gray-300 rounded text-black dark:text-black"
              title="Number of weeks to search"
            >
              {[...Array(14)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 h-10 self-end w-24 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Search'
            )}
          </button>
        </div>
        {(response?.news || response?.weather) && (
          <div className="w-full">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-w-full">
              {response.weather && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">
                    Weather in {response.weather.location}:
                  </h3>
                  <p className="dark:text-gray-300">
                    Temperature: {response.weather.temperature}°F
                  </p>
                  <p className="dark:text-gray-300">
                    Humidity: {response.weather.humidity}%
                  </p>
                  <p className="dark:text-gray-300">
                    Wind Speed: {response.weather.windSpeed} mph
                  </p>
                </div>
              )}
              {response.news && (
                <>
                  <p className="mb-4 dark:text-gray-300">
                    {response.news.text}
                  </p>
                  {response.news.articles.length > 0 && (
                    <>
                      <h3 className="text-lg font-semibold mb-2 dark:text-white">
                        Sources:
                      </h3>
                      <ul className="list-disc pl-5">
                        {response.news.articles.map(
                          (article: Article, index: number) => (
                            <li key={index} className="mb-2">
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {article.title}
                              </a>
                            </li>
                          )
                        )}
                      </ul>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
