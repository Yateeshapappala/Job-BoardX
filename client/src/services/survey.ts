export type Question = {
  id: string;
  label: string;
  type?: string;
  options?: string[]; // optional since only for some question types
};

export type Survey = {
  _id: string;
  title: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  questions: Question[];
  responsesCount?: number;
  analytics?: {
    averageRatings: { questionIndex: number; avg: number | null }[];  // changed questionId to questionIndex
    optionCounts?: {
      questionIndex: number;
      counts: { [option: string]: number };
    }[];
    textAnswers?: {
      questionIndex: number;
      answers: string[];
    }[];
  };
};