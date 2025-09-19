import { SavedPoem } from '../types';

const SAVED_POEMS_KEY = 'sang_tac_tho_ai_saved_poems';

/**
 * Retrieves saved poems from localStorage.
 * @returns An array of SavedPoem objects or an empty array if none are found or an error occurs.
 */
export const getSavedPoems = (): SavedPoem[] => {
  try {
    const savedPoemsJson = localStorage.getItem(SAVED_POEMS_KEY);
    if (savedPoemsJson) {
      const poems = JSON.parse(savedPoemsJson);
      // Ensure all poems have a title for backward compatibility
      return poems.map((p: any) => ({...p, title: p.title || 'Bài thơ không tên'}));
    }
  } catch (error) {
    console.error("Không thể phân tích các bài thơ đã lưu từ localStorage", error);
  }
  return [];
};

/**
 * Saves a new poem to localStorage.
 * The new poem is added to the beginning of the list.
 * Does not save empty or duplicate poems.
 * @param poem An object containing the title and content of the poem to save.
 */
export const savePoem = (poem: { title: string; content: string }): void => {
  if (!poem.content.trim()) return;
  
  const poems = getSavedPoems();
  const newPoem: SavedPoem = {
    title: poem.title.trim() || 'Bài thơ không tên',
    content: poem.content,
    timestamp: Date.now(),
  };

  // Avoid saving duplicates (based on content)
  if (poems.some(p => p.content === newPoem.content)) {
      console.log("Bài thơ đã được lưu.");
      return;
  }

  const updatedPoems = [newPoem, ...poems];
  
  try {
    localStorage.setItem(SAVED_POEMS_KEY, JSON.stringify(updatedPoems));
  } catch (error) {
    console.error("Không thể lưu bài thơ vào localStorage", error);
  }
};


/**
 * Deletes a poem from localStorage based on its timestamp.
 * @param timestamp The unique timestamp of the poem to delete.
 */
export const deletePoem = (timestamp: number): void => {
    const poems = getSavedPoems();
    const updatedPoems = poems.filter(p => p.timestamp !== timestamp);
    try {
        localStorage.setItem(SAVED_POEMS_KEY, JSON.stringify(updatedPoems));
    } catch (error) {
        console.error("Không thể xóa bài thơ khỏi localStorage", error);
    }
}