export interface PoemOptions {
  type: string;
  lines: number;
  style: string;
  context: string;
  customContext: string;
  emotions: string[];
  audience: string;
  inspiration: string;
}

export interface SavedPoem {
  title: string;
  content: string;
  timestamp: number;
}