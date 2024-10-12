import { NextResponse } from 'next/server';
import openaiClient from '@/lib/openai';
import { searchGdelt } from '@/lib/gdelt';
import { getContent } from '@/lib/getContent';
import { getWeather } from '@/lib/getWeather';
import { Article, SearchResponse, Timespan } from '@/types';
import { searchGdeltFunction, getWeatherFunction } from '@/lib/tools';

// Define the tools available for the OpenAI model to use
const tools = [
  searchGdeltFunction,
  getWeatherFunction,
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const timespanParam = searchParams.get('timespan');
  const numArticlesParam = Number(searchParams.get('numarticles'));
  const timespan = Object.values(Timespan).includes(timespanParam as Timespan)
    ? timespanParam as Timespan
    : Timespan.OneWeek;

  // Validate query parameter
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  // Parse and validate number of articles
  const numArticles = !isNaN(numArticlesParam) ? numArticlesParam : 3;
  if (numArticles > 5 || numArticles < 1) {
    return NextResponse.json(
      { error: 'Number of articles must be between 1 and 5' },
      { status: 400 }
    );
  }

  try {
    // Call OpenAI API to process the query and possibly call a tool
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that helps a user understand the news and weather. " +
                   "Make a good guess about longitude and latitude for weather queries if they are not known."
        },
        { role: "user", content: query }
      ],
      tools,
      tool_choice: "auto",
    });

    const response: SearchResponse = {};

    if (completion.choices[0].finish_reason === 'tool_calls') {
      const toolCall = completion.choices[0].message.tool_calls?.[0];
      if (!toolCall) {
        throw new Error('No tool call found when the model returned a tool call');
      }
      const toolCallResponse = JSON.parse(toolCall.function.arguments);

      if (toolCall.function.name === 'searchGdelt') {
        toolCallResponse.numArticles = numArticles;
        toolCallResponse.timespan = timespan;

        // Handle news search
        const articles = (await searchGdelt(toolCallResponse))['articles'] as Article[];
        const articleUrls = articles.map((article) => article.url);
        const articleContents = await getContent(articleUrls);

        // Filter out articles if we weren't able to fetch the content
        const validArticles = articles.filter((_, index) => articleContents[index]);
        if (!validArticles.length) {
          return NextResponse.json(
            { error: 'Failed to retrieve article contents. Try requesting more sources or a different query.' },
            { status: 500 }
          );
        }
        const validContents = articleContents.filter((articleContent: string) => articleContent);

        // Generate a summary of the news articles
        let summary = null;
        while (!summary) {
          try {
            summary = await openaiClient.chat.completions.create({
              model: "gpt-4",
              messages: [
                {
                  role: "system",
                  content: "You are a helpful assistant that helps a user understand the news."
                },
                {
                  role: "user",
                  content: `Respond to: ${query}\n\n` +
                    `By generating a summary of the news. ` +
                    `The articles below should provide the context, ` +
                    `but do not simply list what they say. Do not ` +
                    `apologize if the content is confusing:\n` +
                    `${validContents.join('\n\n')}`
                }
              ],
            });
          } catch (error) {
            console.error('Error generating summary:', error);
            if ((error as any).code === 'context_length_exceeded') {
              // Remove the last article if the context length is exceeded
              validContents.pop();
              validArticles.pop();
              if (!validContents.length) {
                throw new Error('Failed to generate summary');
              }
              console.warn('Context length exceeded. Retrying with shorter content.');
            } else {
              throw new Error('Failed to generate summary');
            }
          }
        }

        response.news = {
          text: summary.choices[0].message.content ?? '',
          articles: validArticles,
        };
      } else if (toolCall.function.name === 'getWeather') {
        // Handle weather request
        const weatherData = await getWeather(
          toolCallResponse.location,
          toolCallResponse.latitude,
          toolCallResponse.longitude
        );
        response.weather = weatherData;
      }
    } else {
      // If no tool was called, assume it's a general query and provide a response
      response.news = {
        text: completion.choices[0].message.content ?? '',
        articles: [],
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
