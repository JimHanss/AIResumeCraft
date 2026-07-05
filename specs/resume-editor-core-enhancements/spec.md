# Resume Editor Core Enhancements

## Goal

Improve the current no-AI resume editor foundation so the editing experience is more complete, consistent, and closer to real resume authoring workflows. The editor should provide fuller fields for core modules, a clearer drag handle, reusable title-and-input field UI, and draggable module ordering directly from the right-side preview.

## Users

- Resume creators who need to fill practical resume content in a visual editor.
- Product and design reviewers validating whether the editor and preview match common resume tooling workflows.
- Developers maintaining stable resume data structures, reusable form fields, and tested drag-and-drop data flow.

## User Scenarios

- As a resume creator, I can fill basic information such as name, headline, phone, email, location, avatar/photo, and profile links.
- As a resume creator, I can write a short summary targeted to the role I want.
- As a resume creator, I can fill education entries with school, degree, field of study, location, dates, GPA, honors, coursework, and notes.
- As a resume creator, I can fill experience entries with organization, role, location, dates, and impact bullets.
- As a resume creator, I can fill grouped skills as role-relevant technical skills, tools, languages, or industry keywords.
- As a resume creator, I can use a consistent title-and-input editing pattern across all core modules.
- As a resume creator, I can recognize draggable areas through a four-direction move icon.
- As a resume creator, I can drag whole modules in the right-side preview and see the middle editor order stay in sync.

## In Scope

- Replace the current content-editor drag handle visual with a clearer four-direction move icon.
- Add or standardize a reusable title-and-input field component for text input, month/date input, URL, textarea, and list/tag style fields.
- Migrate basic information, summary, education, experience, and skills modules to the unified field component.
- Improve core resume fields based on public resume guidance:
  - Basic information: name, target role or headline, phone, email, location, personal website or portfolio or LinkedIn-style link, avatar URL.
  - Summary: two to three short sentences that highlight target role, key capability, years of experience, or notable impact.
  - Education: school, degree, field of study, location, start date, end date, GPA, honors, coursework, and description.
  - Experience: company or organization, role, location, start date, end date, current-role state, and achievement or responsibility bullets.
  - Skills: skill groups and skill items; prioritize role-relevant technical skills, tools, languages, and industry keywords.
- Enable whole-module drag-and-drop ordering in the right-side preview.
- Preview reordering must update the same Pinia resume store and immediately sync with the middle content editor.
- Preserve the existing drag text-selection guard during editor and preview dragging.
- Update E2E coverage for preview module drag, field editing, and refresh persistence.

## Out of Scope

- AI rewriting, AI scoring, streaming output, or model calls.
- PDF or Word export.
- Accounts, cloud save, backend persistence, or database storage.
- Full template marketplace, complex layout engine, or multi-template style editor.
- Portfolio site redesign.
- Forcing a new icon library or UI framework unless the existing dependencies cannot express the drag handle clearly.

## Acceptance Criteria

- All core content-editor module fields render through a unified title-and-input style component.
- Basic information can edit at least name, headline, phone, email, location, avatar URL, and one profile link.
- Summary can edit multiline summary text.
- Education can edit at least school, degree, field of study, location, dates, GPA, honors, coursework, and description.
- Experience can edit at least company or organization, role, location, start date, end date, and achievement bullets.
- Skills can edit multiple named groups and multiple skill items inside each group.
- The content-editor module handle uses a four-direction move icon that clearly reads as a drag entry point.
- Middle editor drag ordering remains functional.
- Each right-side preview module can be dragged as a whole unit.
- Reordering in the preview immediately updates the middle editor order.
- Reordering in the middle editor immediately updates the preview order.
- Refreshing the page restores field content and module order from localStorage.
- Unit and E2E tests cover the added field updates and preview drag ordering.
- `yarn lint`, `yarn typecheck`, `yarn test:unit`, and `yarn test:e2e` pass.

## Edge Cases

- Empty or invalid avatar URLs should render initials or a safe placeholder in the preview.
- Empty phone, email, URL, or location fields should not leave dangling separators in the preview.
- Empty optional education fields should not leave dangling separators in the preview.
- If an experience end date is empty and "current" is enabled, the preview should show the localized equivalent of "Present".
- Empty experience bullet lines should not render blank bullets.
- Empty skill modules should receive a fallback group instead of persisting zero groups.
- Dragging in the preview should not select text inside preview modules.
- Disabling or deleting a module type should keep the left toggles, middle editor, and preview consistent.
- Multiple modules of the same type must be updated and reordered by module id, not by type alone.
- On narrow screens, the preview drag entry point should remain reachable without horizontal overflow.

## Confirmed Decisions

- Education is in scope for this enhancement and is part of the default module set.
- Avatar/photo remains optional; standard contact information is more essential than a photo.
- The profile link can start as one URL field and later expand to a multi-link list.
- Experience bullets can initially be stored as multiline text split into bullet lines, with a future upgrade path to per-bullet add/remove controls.
- Grouped skill editing is in scope for the first implementation pass.
- Preview drag should reuse the current resume store reorder behavior instead of storing an independent preview order.

## Research Notes

- Harvard FAS describes a resume as a concise summary of abilities, education, and experience, and emphasizes highlighting strongest assets and skills for the target job.
- MIT CAPD frames resumes as fact-based documents that include education, previous experience, skills, and accomplishments.
- Columbia Career Education lists common resume content areas such as education, work or internship experience, activities, leadership, and skills, with consistent readable formatting.
- MIT's resume checklist emphasizes role-relevant experience and skills such as programming languages, foreign languages, lab, and technical skills.
- Indeed's education guidance informs the education module fields, including school, location, degree, field of study, graduation year, GPA, honors, coursework, and activities.

Sources:

- https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/
- https://capd.mit.edu/channels/make-a-resume-cover-letter-cv/
- https://www.careereducation.columbia.edu/topics/resumes-cvs-home
- https://capd.mit.edu/resources/resume-checklist/
- https://www.indeed.com/career-advice/resumes-cover-letters/how-to-list-education-on-a-resume

## Clarifications Resolved

- The education module is implemented now.
- Skills use grouped editing now instead of a flat tag/list-only UI.
