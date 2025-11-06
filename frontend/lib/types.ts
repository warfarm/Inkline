export const Language = {
  Chinese: "Chinese",
  Japanese: "Japanese",
  Korean: "Korean",
  Spanish: "Spanish",
  French: "French",
  German: "German",
  Italian: "Italian",
  Portuguese: "Portuguese",
  Russian: "Russian",
  Arabic: "Arabic",
} as const;

export type Language = (typeof Language)[keyof typeof Language];
