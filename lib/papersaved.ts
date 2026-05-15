const TOTAL_RECORDS = 2400;
const PAGES_PER_RECORD = 3;

export const sheetsSaved = TOTAL_RECORDS * PAGES_PER_RECORD;
export const paperSavedLabel = `🌿 ${sheetsSaved.toLocaleString()} sheets saved`;