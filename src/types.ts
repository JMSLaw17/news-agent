export interface Article {
  url: string;
  title: string;
}

export interface SearchResponse {
  news?: NewsData;
  weather?: WeatherData;
}

export interface NewsData {
  text: string;
  articles: Article[];
}

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
}

export enum Timespan {
  OneWeek = '1w',
  TwoWeeks = '2w',
  ThreeWeeks = '3w',
  FourWeeks = '4w',
  FiveWeeks = '5w',
  SixWeeks = '6w',
  SevenWeeks = '7w',
  EightWeeks = '8w',
  NineWeeks = '9w',
  TenWeeks = '10w',
  ElevenWeeks = '11w',
  TwelveWeeks = '12w',
  ThirteenWeeks = '13w',
  FourteenWeeks = '14w',
}
