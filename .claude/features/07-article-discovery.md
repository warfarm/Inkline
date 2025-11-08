# Article Discovery & Recommendation

## Browse Page

- **Filter sidebar:**
  - Language (Chinese / Japanese)
  - Difficulty Level (Beginner / Intermediate / Advanced)
  - Topic (checkboxes for all topics)
- **Article cards with:**
  - Title
  - Topic tag
  - Difficulty badge
  - Word count
  - [Start Reading] button

## Simple Recommendation Algorithm

- Query articles based on:
  - User's `target_language` and `current_level`
  - User's interests (topics they selected + topics they've liked)
- Sort by:
  - Priority: Articles in liked topics
  - De-prioritize: Articles in topics user clicked "Less"
  - Random selection within filtered set

## Post-Article Feedback

- After completing an article, show modal:
  - "How did you like this topic?"
  - [More 👍] [Less 👎] [Neutral]
  - Update user interest weights in database
