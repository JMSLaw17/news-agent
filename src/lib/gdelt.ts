import axios from 'axios';
import { Timespan } from '@/types';
const gdeltApiUrl = 'https://api.gdeltproject.org/api/v2/doc/doc';

export async function searchGdelt({
  terms,
  sourceLang,
  sourceCountry,
  numArticles,
  timespan,
}: {
  terms: string[];
  sourceLang?: string;
  sourceCountry?: string;
  numArticles: number;
  timespan: Timespan;
}) {
  if (sourceLang && sourceLang !== 'any') {
    terms.push(`sourcelang:${sourceLang}`);
  }
  if (sourceCountry && sourceCountry !== 'any') {
    terms.push(`sourcecountry:${sourceCountry}`);
  }

  let query = terms.join(' OR ');
  if (terms.length > 1) {
    query = `(${query})`;
  }

  const response = await axios.get(gdeltApiUrl, {
    params: {
      query,
      mode: 'artlist',
      maxrecords: numArticles,
      timespan,
      format: 'json',
    },
  });

  return response.data;
}
