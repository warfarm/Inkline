# Onboarding Flow (Students Only)

## Steps

### 1. Interest Survey

- Display 5-10 broad topics (checkboxes):
  - Daily Life
  - Technology
  - Culture & Travel
  - Food & Cooking
  - Entertainment & Hobbies
  - Business & Work
  - Science & Nature
  - Sports & Fitness
  - Arts & Literature
  - Current Events
- Free text input for custom interests (optional)
- "Next" button

### 2. Level Selection

- Three options with descriptions:
  - **Beginner:** "I know basic phrases and can read simple sentences"
  - **Intermediate:** "I can read short articles with some help"
  - **Advanced:** "I'm comfortable reading most content with occasional lookups"
- Target language selection (Chinese or Japanese)
- "Complete Setup" button

### 3. Class Join (Optional)

- "Do you have a class code?" prompt
- Text input for join code
- "Skip" or "Join Class" buttons

## Save to Database

- Update `profiles` table with interests, level, target_language
- If class code provided, create entry in `class_enrollments`
