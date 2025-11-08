# Teacher Dashboard

## A. Class Management

- Create new class (name input → generate random 6-character join code)
- List of all classes with student counts
- Archive old classes

## B. Class Overview

- Select a class from dropdown
- Display:
  - **Engagement Metrics:**
    - Average articles completed per student
    - Active students (logged in within 7 days) vs. total
    - Total words saved (class-wide)
  - **Weekly Activity Chart:**
    - Bar chart: articles read per day for entire class
  - **Topic Distribution:**
    - Pie/bar chart: which topics students are reading most

## C. Student List

- Table with columns:
  - Name | Articles Completed | Words Saved | Last Active | Status (Active/Inactive)
- Click student name → opens Student Detail View

## D. Student Detail View

- Student name and profile info
- **Progress Tab:**
  - Articles completed (list with dates and titles)
  - Word bank size and breakdown (learning vs. mastered)
  - Time spent reading (total + per article)
  - Activity timeline (chronological feed of actions)
- **Export Button:**
  - Generate CSV with student data
  - Format: Name, Email, Articles Completed, Words Saved, Last Active, Level

## E. Struggling Students Alert

Highlight students who:

- Haven't logged in for 7+ days (red badge)
- Have completed 0 articles in past 7 days (yellow badge)
