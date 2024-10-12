import { z } from 'zod';
import { zodFunction } from "openai/helpers/zod";

const SearchGdeltParameters = z.object({
    terms: z.array(z.string()).describe("The search terms."),
    sourceLang: z.enum([
        'english', 'french', 'german', 'spanish', 'italian',
        'portuguese', 'russian', 'arabic', 'chinese', 'hebrew', 'any'
    ]).optional().describe(
        "The language of the news articles. Leave empty for any language."
    ),
    sourceCountry: z.enum([
        'us', 'uk', 'france', 'germany', 'italy', 'spain',
        'portugal', 'russia', 'china', 'israel', 'any'
    ]).optional().describe(
        "The country of the news articles. Leave empty for any country."
    ),
});

const GetWeatherParameters = z.object({
    location: z.string().describe("The location to get weather for."),
    latitude: z.number().describe(
        "The latitude of the location. Make a guess if it's not known."
    ),
    longitude: z.number().describe(
        "The longitude of the location. Make a guess if it's not known."
    ),
});

export const searchGdeltFunction = zodFunction({
    name: "searchGdelt",
    description: "Search GDELT for news articles",
    parameters: SearchGdeltParameters
});

export const getWeatherFunction = zodFunction({
    name: "getWeather",
    description: "Get weather information for a location",
    parameters: GetWeatherParameters
});
