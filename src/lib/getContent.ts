import axios from 'axios';
import * as cheerio from 'cheerio';
import { convert } from 'html-to-text';

export async function getContent(urls: string[]) {
  const contents = await Promise.all(urls.map(async (url) => {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      // Remove unnecessary elements
      $('script, style, nav, footer, header, aside').remove();

      // Convert HTML to plain text with additional options
      const text = convert($.html(), {
        wordwrap: false,
        selectors: [
          { selector: 'a', options: { ignoreHref: true } },
          { selector: 'img', format: 'skip' }
        ],
        preserveNewlines: false,
        singleNewLineParagraphs: true
      });

      // Further content reduction
      return text
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\n{2,}/g, '\n')
        .replace(/^.*?:/, '') // Remove prefixes like "Advertisement:"
        .replace(/\b\w{1,3}\b\s*/g, '') // Remove short words (1-3 characters)
        .replace(/\s+/g, ' '); // Final whitespace cleanup
    } catch (error) {
      console.error(`Error fetching content from ${url}:`, error);
      return '';
    }
  }));
  return contents;
}