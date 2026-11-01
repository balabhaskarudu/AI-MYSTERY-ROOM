# AI MYSTERY ROOM
## Master Product & Technical Specification

**Document Version:** 2.0  
**Status:** Implementation Specification  
**Development Methodology:** Spec-Driven Development (SDD)  
**Product Type:** AI-Powered Interactive Mystery Investigation Platform  
**Frontend:** React.js + Vite  
**Backend:** Node.js + Express.js  
**Database:** MongoDB + Mongoose  
**AI:** Google Gemini API  
**Language:** JavaScript (ES Modules)

---

# 1. PROJECT OVERVIEW

## 1.1 Product Description

AI Mystery Room is an AI-powered interactive detective investigation platform.

Users provide a short story, scenario, or mystery idea. The application transforms that input into a complete fictional investigation using Google Gemini.

The generated investigation contains:

- A mystery or crime scenario.
- Multiple fictional suspects.
- A predetermined culprit.
- Motives and alibis.
- Witness statements.
- WhatsApp-style conversations.
- Photographic evidence.
- Simulated CCTV recordings.
- Documents and investigation reports.
- A chronological incident timeline.
- Hidden clues and misleading evidence.

The user enters an interactive investigation room and examines the available evidence to identify the culprit.

After examining the evidence, the user must select one suspect and submit a final accusation.

The backend evaluates the accusation against the predetermined culprit and reveals the complete investigation solution.

## 1.2 Product Vision

Create an immersive detective experience where users become investigators, examine AI-generated evidence, connect clues, identify contradictions, and solve dynamically generated mysteries.

Each investigation should feel like a self-contained detective case rather than a simple AI-generated story.

## 1.3 Core Product Principles

1. Every mystery must have exactly one predetermined culprit.
2. Every evidence item must belong to the same underlying story.
3. Evidence must provide enough information to logically identify the culprit.
4. The application must not reveal the solution before the final accusation.
5. Users must be able to investigate at their own pace.
6. All investigations must be fictional.
7. The final answer must be evaluated by backend logic, not by an additional AI guess.
8. A generated mystery must pass validation before becoming playable.

---

# 2. PRODUCT SCOPE

## 2.1 MVP Features

The first release must implement:

### User Management
- User registration.
- User login.
- User logout.
- Protected routes.
- User profile.
- User-owned investigations.

### Mystery Creation
- Custom scenario input.
- Mystery category selection.
- Difficulty selection.
- Suspect count selection.
- Evidence preferences.
- AI-powered mystery generation.
- Generation progress and error handling.

### Investigation
- Investigation dashboard.
- Case overview.
- Suspect profiles.
- Evidence room.
- WhatsApp-style chat evidence.
- Image evidence.
- CCTV evidence.
- Document evidence.
- Witness statements.
- Investigation timeline.
- Private case notes.
- Persistent investigation progress.

### Accusation
- Suspect selection.
- Final confirmation.
- Answer submission.
- Correct/incorrect evaluation.
- Complete investigation report.
- Culprit reveal.

### Dashboard
- View all investigations.
- Continue unfinished investigations.
- View completed investigations.
- Delete investigations.
- Filter investigations by status.

## 2.2 Features Excluded From MVP

Do not implement these in the first release:

- Multiplayer investigations.
- Real-time collaboration.
- Multiplayer chat.
- Subscription plans.
- Payment gateway.
- Leaderboards.
- Public user-generated mystery marketplace.
- Social networking.
- Voice interrogation.
- Real-world criminal investigation.
- AI-powered free-form suspect conversations.
- User-uploaded investigation evidence.

The architecture may support future expansion, but these features must not delay the MVP.

---

# 3. USER ROLES AND PERMISSIONS

## 3.1 Guest

Guests can:

- Visit the landing page.
- View product information.
- View publicly available sample content.
- Register.
- Log in.

Guests cannot create or access private investigations.

## 3.2 Authenticated User

Authenticated users can:

- Create investigations.
- View their own investigations.
- Start and resume investigations.
- Examine suspects and evidence.
- Write investigation notes.
- Submit a final accusation.
- View completed investigation results.
- Delete their investigations.
- Update their profile.

Users cannot access investigations belonging to other users.

---

# 4. USER JOURNEY

The complete user journey is:

1. User visits the landing page.
2. User registers or logs in.
3. User enters the dashboard.
4. User clicks Create Mystery.
5. User enters a scenario.
6. User selects category and difficulty.
7. User configures the number of suspects and desired evidence types.
8. User clicks Generate Mystery.
9. Backend starts the Gemini generation workflow.
10. The system generates the investigation and validates it.
11. The system generates or prepares the required media assets.
12. The complete investigation is saved in MongoDB.
13. User is redirected to the investigation room.
14. User examines the case overview.
15. User examines suspects.
16. User opens different evidence items.
17. User connects clues and writes notes.
18. User selects the suspected culprit.
19. User confirms the accusation.
20. Backend evaluates the selection.
21. User sees the final investigation report.
22. The completed investigation is saved in the dashboard.

Users must be able to leave and resume an unfinished investigation.

---

# 5. MYSTERY CREATION FUNCTIONALITY

## 5.1 Create Mystery Page

The creation page must contain:

### Required Input

**Scenario Description**

A multiline text field where the user describes the situation they want to investigate.

Example:

"A valuable diamond necklace disappeared during a private birthday party at a luxury hotel. Five people attended the event, and everyone claims they had nothing to do with it."

Validation:
- Minimum length: 30 characters.
- Maximum length: 2,000 characters.
- Empty descriptions are not accepted.
- Trim unnecessary whitespace.
- Reject unsupported or excessively large input.

### Optional Input

**Mystery Title**

The user can enter a title or allow Gemini to generate one.

**Mystery Category**

Supported values:

- THEFT
- MURDER_MYSTERY
- MISSING_PERSON
- CORPORATE_ESPIONAGE
- CYBER_MYSTERY
- RELATIONSHIP_MYSTERY
- HISTORICAL_MYSTERY
- GENERAL

All scenarios must remain fictional.

**Difficulty**

Supported values:

| Difficulty | Suspects | Evidence Items | Complexity |
|---|---:|---:|---|
| EASY | 3 | 5–7 | Direct clues |
| MEDIUM | 4 | 8–10 | Contradictions and indirect clues |
| HARD | 5–6 | 11–15 | Interconnected clues and misleading evidence |

These are generation targets, not guarantees that every case must have precisely the same number of clues.

**Evidence Preferences**

Users can select the evidence types they want:

- Chat conversations.
- Images.
- CCTV.
- Documents.
- Witness statements.

At least three evidence types should be available in the MVP.

The backend may add necessary supporting evidence to preserve investigation quality.

## 5.2 Generation Interface

After the user clicks Generate Mystery:

- Disable repeated submissions.
- Display a generation screen.
- Show the mystery title if available.
- Display progress messages.
- Handle long-running requests.
- Display retry options if generation fails.

Suggested progress messages:

1. Creating investigation scenario.
2. Establishing suspects and motives.
3. Building the investigation timeline.
4. Generating evidence.
5. Checking evidence consistency.
6. Preparing the investigation room.

Progress messages must reflect actual backend stages. Do not display fabricated percentage completion.

## 5.3 Generation Completion

When generation succeeds:

- Save the mystery.
- Create an investigation session.
- Mark the mystery as READY.
- Redirect the user to the investigation room.

When generation fails:

- Mark the generation job as FAILED.
- Preserve an appropriate failure message.
- Do not create a playable incomplete investigation.
- Allow the user to retry.

---

# 6. AI MYSTERY GENERATION ENGINE

This is the core business logic of the application.

## 6.1 Core Generation Principle

The application must use a truth-first generation strategy.

Gemini must establish the complete truth of the mystery before generating public evidence.

The generation sequence:

1. Understand the user scenario.
2. Establish the actual incident.
3. Decide the culprit.
4. Establish the culprit's motive.
5. Establish how the incident happened.
6. Create all suspects.
7. Create the chronological timeline.
8. Create the confidential investigation solution.
9. Generate public evidence based on the established truth.
10. Generate misleading clues.
11. Validate the entire investigation.
12. Generate media assets.
13. Store the completed investigation.

The culprit must never be decided after evidence generation or after the user submits an answer.

## 6.2 Generation Pipeline

Implement the generation pipeline as separate services.

### Stage 1: Scenario Interpretation

Gemini analyzes the user's input and identifies:

- Main incident.
- Setting.
- Relevant characters.
- Potential conflict.
- Mystery category.
- Missing details that can be reasonably filled in.

### Stage 2: Investigation Blueprint

Gemini creates:

- Mystery title.
- Incident description.
- Location.
- Incident date.
- Incident time.
- Actual incident sequence.
- Culprit ID.
- Culprit motive.
- Method of committing the fictional act.
- Suspect list.
- Relationship between suspects.
- Initial investigation theory.

The blueprint must be the foundation for every later generation stage.

### Stage 3: Suspect Generation

Generate each suspect with:

- Unique suspect ID.
- Name.
- Age.
- Occupation.
- Background.
- Relationship to the incident.
- Public statement.
- Public alibi.
- Motive information.
- Personality.
- Profile image description.

Suspects must have believable backgrounds and distinguishable personalities.

Not every suspect needs to be guilty or have an equally strong motive.

### Stage 4: Timeline Generation

Generate the complete incident timeline.

Each event must contain:

- Event ID.
- Timestamp.
- Description.
- Location.
- Involved suspects.
- Related evidence IDs.

The timeline must be chronologically consistent.

### Stage 5: Evidence Generation

Generate the evidence based on the established investigation blueprint.

Every evidence item must have a purpose.

Evidence should include:

- Direct clues.
- Supporting clues.
- Contradictions.
- Circumstantial clues.
- Misleading clues.

Evidence must not randomly introduce new facts that change the original solution.

### Stage 6: Solution Generation

Generate a detailed confidential solution containing:

- Actual culprit.
- Motive.
- Opportunity.
- Incident reconstruction.
- Explanation of each decisive clue.
- Explanation of misleading evidence.
- Explanation of other suspects' innocence.
- Final conclusion.

### Stage 7: Consistency Validation

Validate the complete investigation.

Required checks:

- Exactly one culprit exists.
- Culprit ID references a valid suspect.
- All suspect IDs are unique.
- All evidence IDs are unique.
- All evidence references are valid.
- Timeline events are chronologically valid.
- At least two independent clues support the culprit.
- The culprit has a logical motive.
- The culprit has a plausible opportunity.
- Public evidence does not directly reveal the culprit.
- The final solution is supported by available evidence.
- No evidence contradicts the established truth without an explanation.
- Misleading clues have a logical explanation.

Use deterministic validation wherever possible.

An optional Gemini review stage can identify narrative inconsistencies.

AI review cannot replace deterministic validation.

### Stage 8: Media Generation

Generate or prepare the actual visual assets.

All media must be linked to the corresponding evidence IDs.

Media generation must be independent of the text generation pipeline.

If media generation fails, retry according to configuration or use a clearly marked fallback asset.

Do not fail the entire mystery because a non-essential visual asset could not be generated.

### Stage 9: Persistence

Only publish the mystery as READY after the required text and evidence validation succeeds.

Store:

- Public mystery information.
- Private solution.
- Generation metadata.
- Media references.
- User ownership.
- Creation timestamp.

## 6.3 Gemini Integration

Use the official Google Gen AI SDK.

All Gemini calls must originate from the backend.

Use environment variables:

GEMINI_API_KEY=your_key
GEMINI_MODEL=your_configured_model
GEMINI_IMAGE_MODEL=your_configured_image_model

The model names must be configurable.

Do not hardcode model identifiers in multiple files.

Use structured JSON output with schema validation.

Use Zod for validating parsed responses.

If Gemini returns invalid JSON:

1. Attempt parsing and validation.
2. Attempt controlled repair or regeneration.
3. Retry within a configurable limit.
4. Record the failure.
5. Stop if validation continues to fail.

Never silently accept invalid generated data.

## 6.4 AI Prompt Organization

Maintain prompts independently from business logic.

Suggested structure:

backend/src/services/ai/prompts/

- scenario.prompt.js
- blueprint.prompt.js
- suspects.prompt.js
- timeline.prompt.js
- evidence.prompt.js
- solution.prompt.js
- consistency-review.prompt.js

Prompts must contain clear instructions about:

- Fictional content.
- Consistency.
- Stable IDs.
- Evidence relationships.
- Difficulty.
- JSON structure.
- Culprit confidentiality.
- Narrative quality.

---

# 7. INVESTIGATION DATA SPECIFICATION

## 7.1 Mystery Public Data

Each mystery must contain:

- mysteryId
- ownerId
- title
- description
- category
- difficulty
- location
- incidentDate
- incidentTime
- status
- suspects
- evidence
- timeline
- generationMetadata
- createdAt
- updatedAt

Public data must not contain the hidden solution.

## 7.2 Suspect Structure

Each suspect must contain:

- suspectId
- name
- age
- occupation
- profileImageUrl
- background
- relationshipToIncident
- publicStatement
- publicAlibi
- lastKnownLocation
- personality
- relatedEvidenceIds

Do not expose private culprit-specific facts through suspect profile APIs.

## 7.3 Evidence Structure

Each evidence item must contain:

- evidenceId
- title
- description
- type
- importance
- timestamp
- location
- content
- involvedSuspects
- relatedEvidenceIds
- mediaAssets
- createdAt

Supported evidence types:

- CHAT
- IMAGE
- CCTV
- DOCUMENT
- WITNESS_STATEMENT

Importance:

- LOW
- MEDIUM
- HIGH
- CRITICAL

Every evidence item must be linked to the investigation.

## 7.4 Chat Evidence

Chat evidence must contain:

- chatId
- platformStyle
- participants
- conversationDate
- messages

Each message must contain:

- messageId
- senderId
- messageText
- timestamp
- messageType

The interface should resemble a fictional messaging application.

Use fictional identities and fictional conversations.

Do not imply that the messages were retrieved from actual WhatsApp accounts.

## 7.5 Image Evidence

Image evidence must contain:

- imageId
- imageUrl
- thumbnailUrl
- caption
- description
- capturedAt
- location
- relatedSuspects
- metadata

Images should visually support the investigation.

Examples:

- A photograph of the crime scene.
- An object found at the location.
- A photograph showing an important background detail.
- A suspicious object belonging to a suspect.

Image descriptions must be consistent with the actual generated image.

## 7.6 CCTV Evidence

CCTV evidence must contain:

- recordingId
- cameraName
- location
- recordedAt
- duration
- thumbnailUrl
- videoUrl (optional)
- frames
- observations
- transcript (optional)

MVP implementation:

- Use AI-generated CCTV-style frames.
- Display timestamp overlays.
- Show camera details.
- Display observations.
- Allow users to move through available frames.
- Use a simulated recording player.

Actual video generation is not mandatory for MVP.

Do not pretend a static image is a real video recording.

## 7.7 Document Evidence

Document evidence must contain:

- documentId
- documentTitle
- documentType
- documentContent
- issuedAt
- relatedSuspects
- relatedEvidenceIds

Examples:

- Hotel entry register.
- Security report.
- Receipt.
- Office access log.
- Incident report.

## 7.8 Witness Statements

Witness evidence must contain:

- witnessId
- witnessName
- occupation
- statement
- statementTimestamp
- location
- relatedSuspects
- relatedEvidenceIds

Statements must be fictional and consistent with the timeline.

## 7.9 Timeline

Each timeline item must contain:

- eventId
- timestamp
- description
- location
- involvedSuspects
- relatedEvidenceIds

Timeline events must be sortable chronologically.

---

# 8. CONFIDENTIAL SOLUTION

## 8.1 Solution Structure

The private solution must contain:

- mysteryId
- culpritSuspectId
- motive
- opportunity
- completeExplanation
- incidentReconstruction
- decisiveEvidenceIds
- supportingEvidenceIds
- redHerrings
- suspectVerdicts

Each suspect verdict should contain:

- suspectId
- verdict
- explanation

Possible verdict values:

- GUILTY
- INNOCENT

## 8.2 Solution Protection

The solution must be stored separately from public mystery information.

Recommended collections:

1. Mysteries
2. MysterySolutions

The MysterySolution collection must only be accessed by authorized backend services.

The following rules are mandatory:

- Never include solution fields in normal mystery responses.
- Never include the culprit ID in public suspect data.
- Never expose private prompts or internal AI output.
- Never expose the complete generated blueprint if it contains the solution.
- Never rely on frontend hiding for security.
- Never allow users to retrieve the solution through evidence endpoints.
- Reveal the solution only after a valid final accusation.

---

# 9. INVESTIGATION GAMEPLAY

## 9.1 Investigation Start

When a user opens a READY mystery:

- Create an investigation session if one does not exist.
- Otherwise retrieve the existing session.
- Mark the session as IN_PROGRESS.
- Display the case overview.

A user must not receive multiple independent sessions for the same mystery in the MVP.

## 9.2 Investigation Dashboard

The investigation room is the primary gameplay interface.

It must contain:

### Case Overview

Display:

- Mystery title.
- Incident description.
- Category.
- Difficulty.
- Location.
- Incident date and time.
- Investigation status.

### Suspects

Display all generated suspects.

Users can:

- View suspect cards.
- Open detailed profiles.
- Read public statements.
- Examine public alibis.
- View linked evidence.

### Evidence Room

Display all evidence items.

Users can:

- Browse evidence.
- Filter by evidence type.
- Search evidence titles.
- Sort by timestamp.
- Open evidence viewers.
- Navigate between related evidence.

### Timeline

Display important events in chronological order.

Users can:

- View events.
- Open linked evidence.
- Identify timeline gaps.
- Compare events with suspect statements.

### Case Notes

Users can:

- Create notes.
- Edit notes.
- Delete notes.
- Save notes.
- Revisit saved notes.

Notes are private to the user and must not be sent to Gemini or used to modify the mystery solution.

## 9.3 Evidence Interaction

All evidence types must have dedicated viewers.

### Chat Viewer

Display:

- Participant names.
- Profile icons.
- Message bubbles.
- Timestamps.
- Conversation dates.
- Message alignment based on sender.

### Image Viewer

Display:

- Full image.
- Zoom functionality.
- Caption.
- Capture timestamp.
- Location.
- Image description.

### CCTV Viewer

Display:

- Camera name.
- Recording location.
- Recording date.
- Timestamp.
- Frame navigation.
- Observations.

### Document Viewer

Display:

- Document title.
- Document type.
- Document content.
- Issued timestamp.
- Related information.

### Witness Viewer

Display:

- Witness profile.
- Statement.
- Statement timestamp.
- Related suspects.
- Related evidence.

All evidence should be accessible before the user submits the final accusation.

## 9.4 Investigation Progress

The system should persist:

- Session status.
- Viewed evidence IDs.
- Investigation notes.
- Selected suspect before submission (optional).
- Last accessed timestamp.

Progress must be restored when the user resumes an investigation.

Viewed evidence is a gameplay convenience and must not affect answer correctness.

---

# 10. ACCUSATION SYSTEM

## 10.1 Culprit Selection

Provide an accusation interface where the user selects one suspect.

The interface must:

- Display all suspects.
- Highlight the selected suspect.
- Show a confirmation modal.
- Warn that submission is final.
- Require explicit confirmation.

## 10.2 Submission Rules

MVP rules:

- Only one final accusation is allowed.
- The accusation cannot be changed after submission.
- The selected suspect must belong to the mystery.
- The investigation must belong to the authenticated user.
- The investigation must be IN_PROGRESS.

## 10.3 Evaluation Logic

The backend evaluates:

submittedSuspectId === solution.culpritSuspectId

If equal:

isCorrect = true

Otherwise:

isCorrect = false

Do not use Gemini for the final correctness decision.

## 10.4 Result Report

After submission, display:

- Correct or incorrect result.
- User's selected suspect.
- Actual culprit.
- Culprit's motive.
- Incident reconstruction.
- Important evidence.
- Supporting evidence.
- Misleading clues.
- Explanation of contradictions.
- Explanation of other suspects.
- Final investigation conclusion.

The result must be generated from the already stored solution.

Do not ask Gemini to invent a new explanation after the accusation.

## 10.5 Completed Investigation

After submission:

- Change session status to COMPLETED.
- Store selected suspect.
- Store correctness.
- Store submission timestamp.
- Make the result available for future viewing.
- Prevent another accusation.

---

# 11. USER DASHBOARD

The dashboard must be the user's personal investigation library.

## 11.1 Dashboard Sections

### Overview

Display:

- Total investigations.
- Active investigations.
- Completed investigations.
- Correct accusations.

### My Mysteries

Display investigation cards with:

- Mystery title.
- Description.
- Category.
- Difficulty.
- Status.
- Creation date.
- Last accessed date.

### Filtering

Allow filtering by:

- ALL
- GENERATING
- READY
- IN_PROGRESS
- COMPLETED
- FAILED

### Actions

Users can:

- Create a mystery.
- Continue an investigation.
- View completed results.
- Delete an investigation.

Deleting an investigation must also delete its private solution, investigation session and associated stored assets where applicable.

Deletion should require confirmation.

---

# 12. FRONTEND SPECIFICATION

## 12.1 Technology Stack

- React.js
- Vite
- JavaScript
- React Router
- Axios
- Tailwind CSS
- Context API
- Lucide React

Use reusable components and modular page structures.

Avoid introducing unnecessary state-management libraries.

## 12.2 Required Routes

| Route | Page |
|---|---|
| / | Landing page |
| /login | Login |
| /register | Registration |
| /dashboard | User dashboard |
| /mysteries/create | Mystery creation |
| /mysteries/:id | Investigation dashboard |
| /mysteries/:id/evidence/:evidenceId | Evidence viewer |
| /mysteries/:id/result | Investigation result |
| /profile | User profile |
| * | Not found |

Protected pages must require authentication.

## 12.3 Design Direction

The design should feel like a premium detective investigation platform.

Design characteristics:

- Dark detective atmosphere.
- Professional investigation dashboard.
- Evidence-board-inspired interface.
- Clear typography.
- Subtle animations.
- Cinematic imagery.
- Clean information hierarchy.
- Responsive layouts.

### Design Tokens

Background: #0B0D12

Primary Surface: #141923

Secondary Surface: #1C2430

Accent: #C49A52

Primary Text: #F3F0E8

Secondary Text: #929BA9

Success: #4CAF84

Danger: #D45C5C

Maintain consistent colors and spacing throughout the application.

Avoid excessive gradients and generic admin-dashboard designs.

## 12.4 Landing Page

The landing page must contain:

- Navigation bar.
- Hero section.
- Product introduction.
- How it works section.
- Evidence examples.
- Feature highlights.
- Call-to-action.
- Footer.

Primary CTA: Create Your Mystery.

Secondary CTA: Explore the Experience.

## 12.5 Investigation Layout

Desktop:

LEFT:
- Case overview.
- Suspects.
- Evidence.
- Timeline.
- Notes.

CENTER:
- Selected investigation content.
- Evidence viewer.
- Investigation details.

RIGHT:
- Investigation progress.
- Quick suspect access.
- Case actions.

Mobile:

Use responsive navigation with a drawer or bottom navigation.

Do not simply shrink the desktop layout.

## 12.6 Frontend Architecture

Suggested structure:

frontend/src/

- assets/
- components/
  - common/
  - layout/
  - mystery/
  - investigation/
  - suspects/
  - evidence/
  - results/
- pages/
- context/
- hooks/
- services/
- utils/
- routes/
- styles/

Keep API calls inside dedicated service modules.

Do not put API logic directly into large page components.

---

# 13. BACKEND SPECIFICATION

## 13.1 Technology

- Node.js
- Express.js
- MongoDB
- Mongoose
- Google Gen AI SDK
- Zod
- JWT
- bcrypt
- Helmet
- CORS
- Rate limiting
- Pino or Winston

## 13.2 Architecture

Use a modular MVC + Service architecture.

backend/src/

config/
- database.js
- env.js
- gemini.js

controllers/
- auth.controller.js
- user.controller.js
- mystery.controller.js
- investigation.controller.js
- evidence.controller.js

routes/
- auth.routes.js
- user.routes.js
- mystery.routes.js
- investigation.routes.js
- evidence.routes.js

models/
- User.js
- Mystery.js
- MysterySolution.js
- InvestigationSession.js
- GenerationJob.js

services/
- auth.service.js
- user.service.js
- mystery.service.js
- investigation.service.js
- evidence.service.js
- generation-job.service.js

services/ai/
- gemini.service.js
- mystery-generator.service.js
- mystery-validator.service.js
- consistency-review.service.js
- prompts/

services/media/
- image-generation.service.js
- video-generation.service.js
- storage.service.js

middleware/
- auth.middleware.js
- error.middleware.js
- rate-limit.middleware.js
- validation.middleware.js

validators/
- auth.validator.js
- mystery.validator.js
- investigation.validator.js

utils/
- async-handler.js
- api-response.js
- logger.js

app.js
server.js

Controllers must remain thin.

Business logic belongs in service modules.

---

# 14. DATABASE DESIGN

Use MongoDB and Mongoose.

## 14.1 User Collection

Fields:

- _id
- name
- email
- passwordHash
- avatar
- createdAt
- updatedAt

Email must be unique.

Never return passwordHash in API responses.

## 14.2 Mystery Collection

Fields:

- _id
- ownerId
- title
- description
- category
- difficulty
- location
- incidentDate
- incidentTime
- status
- suspects
- evidence
- timeline
- generationMetadata
- createdAt
- updatedAt

The public mystery collection must not contain the confidential solution.

Suspects, evidence and timeline can be embedded documents for MVP.

## 14.3 MysterySolution Collection

Fields:

- _id
- mysteryId
- culpritSuspectId
- motive
- opportunity
- completeExplanation
- incidentReconstruction
- decisiveEvidenceIds
- supportingEvidenceIds
- redHerrings
- suspectVerdicts
- createdAt

Add a unique index on mysteryId.

Only authorized backend services may access this collection.

## 14.4 InvestigationSession Collection

Fields:

- _id
- userId
- mysteryId
- status
- viewedEvidenceIds
- notes
- selectedSuspectId
- isCorrect
- submittedAt
- lastAccessedAt
- createdAt
- updatedAt

Add a unique compound index on userId + mysteryId.

## 14.5 GenerationJob Collection

Fields:

- _id
- userId
- mysteryId
- status
- currentStage
- errorCode
- errorMessage
- retryCount
- createdAt
- updatedAt
- completedAt

Supported statuses:

- PENDING
- PROCESSING
- COMPLETED
- FAILED

This collection enables the frontend to monitor generation progress.

## 14.6 Database Rules

- Always verify ownership.
- Never trust frontend-supplied owner IDs.
- Validate all ObjectIds.
- Use appropriate indexes.
- Do not expose private collections.
- Delete related records when a mystery is deleted.
- Use atomic or transactional operations where necessary.

---

# 15. API SPECIFICATION

Base URL:

/api/v1

Standard success response:

{
  "success": true,
  "message": "Request successful",
  "data": {}
}

Standard error response:

{
  "success": false,
  "message": "Request failed",
  "code": "ERROR_CODE"
}

## 15.1 Authentication

POST /auth/register

Register a new user.

POST /auth/login

Authenticate a user.

POST /auth/refresh

Refresh an expired access token if refresh-token authentication is implemented.

POST /auth/logout

Invalidate the user's refresh session.

GET /auth/me

Return authenticated user information.

## 15.2 User

GET /users/me

Get the user's profile.

PATCH /users/me

Update permitted profile information.

## 15.3 Mystery

POST /mysteries/generate

Create a new mystery-generation job.

Request:

{
  "scenario": "A valuable necklace disappeared during a private party at a luxury hotel.",
  "difficulty": "MEDIUM",
  "category": "THEFT",
  "suspectCount": 4,
  "evidenceTypes": [
    "CHAT",
    "IMAGE",
    "CCTV",
    "DOCUMENT"
  ]
}

Response:

{
  "success": true,
  "data": {
    "jobId": "JOB_ID",
    "mysteryId": "MYSTERY_ID",
    "status": "PENDING"
  }
}

GET /mysteries/generation/:jobId

Retrieve generation progress.

GET /mysteries

Retrieve the authenticated user's mysteries.

GET /mysteries/:id

Retrieve public mystery information without the solution.

DELETE /mysteries/:id

Delete an owned mystery and its associated records.

## 15.4 Investigation

POST /investigations/:mysteryId/start

Create or retrieve an investigation session.

GET /investigations/:mysteryId

Retrieve investigation information and progress.

PATCH /investigations/:mysteryId/progress

Update viewed evidence IDs and progress.

PATCH /investigations/:mysteryId/notes

Save investigation notes.

POST /investigations/:mysteryId/accuse

Submit the final accusation.

Request:

{
  "suspectId": "SUSPECT_ID"
}

Response:

{
  "success": true,
  "data": {
    "isCorrect": true,
    "selectedSuspect": {},
    "actualCulprit": {},
    "explanation": "..."
  }
}

The response above is illustrative. Actual response fields must be defined by the result schema.

GET /investigations/:mysteryId/result

Retrieve the result of a completed investigation.

## 15.5 Evidence

GET /mysteries/:mysteryId/evidence

Retrieve evidence metadata.

GET /mysteries/:mysteryId/evidence/:evidenceId

Retrieve one evidence item.

All evidence endpoints must verify investigation ownership.

---

# 16. API BUSINESS RULES

1. All protected APIs require authentication.
2. Users can only access their own investigations.
3. A mystery must have READY status before an investigation can start.
4. A generation job must belong to the requesting user.
5. Evidence must belong to the requested mystery.
6. The final accusation must reference an existing suspect.
7. A completed investigation cannot accept another accusation.
8. The result endpoint must reject unfinished investigations.
9. The solution must never be returned through ordinary mystery or evidence endpoints.
10. All request payloads must be validated.
11. All responses must follow the standardized response format.
12. All errors must use appropriate HTTP status codes.

---

# 17. AUTHENTICATION AND SECURITY

## 17.1 Authentication

Use JWT-based authentication.

Recommended implementation:

- Short-lived access token.
- Refresh token.
- HttpOnly cookies for token storage.
- Secure cookie configuration in production.
- SameSite cookie policy.
- Refresh token rotation.
- Server-side refresh token invalidation.

Store hashed refresh tokens if they are persisted in MongoDB.

Never store passwords in plain text.

## 17.2 Security Requirements

- Hash passwords using bcrypt.
- Keep API keys on the backend.
- Validate request bodies.
- Use Helmet.
- Configure CORS explicitly.
- Apply rate limiting.
- Prevent NoSQL injection.
- Prevent unauthorized resource access.
- Limit scenario length.
- Limit AI generation frequency.
- Limit generated content size.
- Avoid logging sensitive information.
- Prevent hidden solution leakage.
- Handle API errors safely.
- Protect file uploads if introduced later.

## 17.3 AI Security

Treat user scenarios as untrusted input.

Gemini prompts must clearly distinguish user-provided content from system instructions.

Do not allow user scenario text to override generation rules, request secrets, or change the application workflow.

Validate all AI-generated content before storing or displaying it.

Do not render generated HTML or execute AI-generated JavaScript.

---

# 18. MEDIA GENERATION AND STORAGE

## 18.1 Image Generation

Use a compatible image-generation model/provider.

Gemini text generation and image generation must be treated as separate capabilities.

The image-generation service must accept:

- Mystery ID.
- Evidence ID.
- Image prompt.
- Image category.
- Style instructions.

Generated images must be stored through a storage abstraction.

## 18.2 Image Storage

Development:

- Local file storage.

Production:

- Configurable object storage provider.

Store media metadata in MongoDB.

Do not store large binary image files directly inside mystery documents.

## 18.3 CCTV

MVP:

- Generate CCTV-style still images or frames.
- Associate frames with recording timestamps.
- Display them in a simulated player.
- Present observations and camera metadata.

Future:

- Actual AI-generated video integration.

## 18.4 Media Failure Handling

If an image-generation request fails:

1. Retry within a configured limit.
2. Mark the individual asset as FAILED if retries are exhausted.
3. Use an explicitly marked placeholder if the asset is optional.
4. Preserve the rest of the playable investigation.

Do not display broken image URLs.

---

# 19. GENERATION JOB AND FAILURE MANAGEMENT

Mystery generation may take longer than an ordinary API request.

Use a job-based workflow.

## 19.1 Job Lifecycle

PENDING → PROCESSING → COMPLETED

or

PENDING → PROCESSING → FAILED

## 19.2 Progress Stages

- SCENARIO_ANALYSIS
- BLUEPRINT_GENERATION
- SUSPECT_GENERATION
- TIMELINE_GENERATION
- EVIDENCE_GENERATION
- SOLUTION_GENERATION
- CONSISTENCY_VALIDATION
- MEDIA_GENERATION
- PERSISTENCE

## 19.3 Polling

The frontend should poll the generation-status endpoint at a reasonable interval.

Stop polling when the job reaches COMPLETED or FAILED.

Do not expose internal prompts, raw Gemini responses, private solution data, or sensitive debugging details in job responses.

## 19.4 Retry Rules

- Limit retries.
- Use exponential backoff for temporary provider failures.
- Do not retry permanent validation failures indefinitely.
- Avoid duplicate generation jobs caused by repeated clicks.
- Use an idempotency strategy for generation requests.
- Clean up abandoned incomplete records.

---

# 20. ERROR HANDLING

Handle:

- Invalid user input.
- Invalid scenario.
- Unauthorized access.
- Missing investigation.
- Invalid suspect.
- Gemini timeout.
- Gemini rate limits.
- Gemini API errors.
- Invalid structured JSON.
- Consistency validation failure.
- Image-generation failure.
- MongoDB connection failure.
- Network errors.
- Duplicate accusations.
- Missing evidence.
- Storage failure.

Use centralized error handling.

Return meaningful messages to the frontend without revealing internal implementation details.

---

# 21. UI STATES

Every page must support the appropriate UI states.

## Loading

Display loaders or skeletons while data is being retrieved.

## Empty

Examples:

- No investigations created.
- No evidence available.
- No notes added.

Provide useful actions.

## Error

Display understandable error messages and retry actions where appropriate.

## Success

Provide confirmation after successful actions.

## Disabled

Prevent duplicate submissions and invalid actions.

## Not Found

Display a proper not-found screen for missing investigations and evidence.

---

# 22. TESTING REQUIREMENTS

Use:

Backend:
- Vitest or Jest.
- Supertest.
- Mocked Gemini responses.

Frontend:
- Vitest.
- React Testing Library.

## 22.1 Authentication Tests

- Successful registration.
- Duplicate email rejection.
- Invalid login rejection.
- Protected route access.
- Token refresh.
- Logout and token invalidation.

## 22.2 Mystery Generation Tests

- Valid mystery generation.
- Empty scenario rejection.
- Invalid category rejection.
- Invalid difficulty rejection.
- Gemini timeout handling.
- Invalid JSON handling.
- Retry behavior.
- Unique suspect IDs.
- Valid evidence references.
- Exactly one culprit.
- Timeline consistency.
- Evidence consistency.
- Private solution storage.
- No incomplete playable mysteries.

## 22.3 Investigation Tests

- Start investigation.
- Resume investigation.
- Save notes.
- Update viewed evidence.
- Retrieve evidence.
- Reject access by another user.
- Submit correct accusation.
- Submit incorrect accusation.
- Reject invalid suspect ID.
- Reject duplicate accusation.
- Reject result access before completion.
- Verify solution protection.

## 22.4 Frontend Tests

- Registration and login.
- Mystery form validation.
- Generation progress.
- Suspect display.
- Evidence filtering.
- Chat viewer.
- Image viewer.
- CCTV viewer.
- Document viewer.
- Witness viewer.
- Notes functionality.
- Accusation confirmation.
- Result display.
- Responsive layouts.

---

# 23. DEVELOPMENT PHASES

Codex must implement the application incrementally.

Do not generate the entire application in one operation.

## Phase 1 — Project Foundation

- Create frontend.
- Create backend.
- Configure MongoDB.
- Configure Express.
- Configure React Router.
- Configure Tailwind CSS.
- Configure environment variables.
- Configure centralized error handling.
- Verify frontend/backend communication.

Acceptance criteria:

Both applications run locally and connect to MongoDB successfully.

## Phase 2 — Authentication

- Implement registration.
- Implement login.
- Implement logout.
- Implement JWT authentication.
- Implement refresh-token handling.
- Implement protected routes.
- Implement user profile.

Acceptance criteria:

Users can securely register, log in, and access protected pages.

## Phase 3 — AI Mystery Engine

- Integrate Gemini.
- Create prompt templates.
- Create structured output schemas.
- Implement truth-first generation.
- Generate suspects.
- Generate timeline.
- Generate evidence.
- Generate confidential solution.
- Validate consistency.
- Store public and private information separately.

Acceptance criteria:

The system can generate and validate complete playable mysteries from multiple sample scenarios.

## Phase 4 — Generation Job System

- Create generation jobs.
- Implement job status tracking.
- Implement frontend polling.
- Implement retry handling.
- Implement generation error states.

Acceptance criteria:

Users can monitor mystery generation and receive a completed investigation or a meaningful failure message.

## Phase 5 — Mystery Creation and Dashboard

- Build landing page.
- Build mystery creation page.
- Build user dashboard.
- Build investigation cards.
- Implement filters.
- Implement delete functionality.

Acceptance criteria:

Users can create, view, and manage their investigations.

## Phase 6 — Investigation Room

- Build investigation layout.
- Implement case overview.
- Implement suspect profiles.
- Implement evidence collection.
- Implement timeline.
- Implement notes.
- Implement investigation persistence.

Acceptance criteria:

Users can examine a mystery and resume it later without losing progress.

## Phase 7 — Evidence Experience

- Build chat viewer.
- Build image viewer.
- Build CCTV viewer.
- Build document viewer.
- Build witness viewer.
- Integrate generated media.

Acceptance criteria:

All supported evidence types can be examined through their dedicated interfaces.

## Phase 8 — Accusation and Results

- Build suspect selection.
- Build confirmation modal.
- Implement final accusation API.
- Implement deterministic evaluation.
- Implement final investigation report.
- Implement result persistence.

Acceptance criteria:

Users can submit one accusation and receive the correct final result.

## Phase 9 — Security and Testing

- Verify ownership checks.
- Verify hidden solution protection.
- Test all APIs.
- Test generation failure scenarios.
- Test frontend interactions.
- Test mobile responsiveness.
- Fix critical issues.

Acceptance criteria:

All critical security and gameplay tests pass.

## Phase 10 — Deployment Preparation

- Configure production environment variables.
- Configure production MongoDB.
- Configure media storage.
- Configure frontend and backend deployment.
- Configure CORS.
- Configure logging.
- Verify production build.

Acceptance criteria:

The application can run in a production environment without development-only dependencies.

---

# 24. CODING STANDARDS

Codex must follow these rules:

1. Follow this specification.
2. Use JavaScript ES Modules.
3. Maintain modular architecture.
4. Keep controllers thin.
5. Keep business logic in services.
6. Keep prompts in dedicated files.
7. Use Zod validation.
8. Use reusable React components.
9. Avoid unnecessary dependencies.
10. Never hardcode secrets.
11. Never expose private solutions.
12. Never trust frontend ownership information.
13. Use centralized error handling.
14. Write tests for critical business logic.
15. Avoid duplicated functionality.
16. Follow consistent naming conventions.
17. Update documentation when contracts change.
18. Do not introduce out-of-scope features.
19. Do not silently change the specification.
20. Do not claim a feature is complete without testing it.

---

# 25. DEFINITION OF DONE

The MVP is complete only when:

- Users can register and log in.
- Users can create custom mystery scenarios.
- Gemini generates complete fictional investigations.
- Each investigation has exactly one predetermined culprit.
- Suspects and evidence are logically connected.
- The investigation passes validation.
- Public and private investigation data are separated.
- Users can examine all supported evidence types.
- Users can view suspect profiles.
- Users can examine the timeline.
- Users can write and save notes.
- Users can leave and resume investigations.
- Users can submit a final accusation.
- The backend evaluates the answer deterministically.
- The result report reveals the complete solution.
- Duplicate accusations are prevented.
- Unauthorized users cannot access private investigations.
- Hidden solutions cannot be retrieved before submission.
- Media failures do not unnecessarily destroy playable cases.
- Critical tests pass.
- The application is responsive on desktop and mobile.

---

# 26. SINGLE SOURCE OF TRUTH POLICY

This document is the authoritative source of truth for AI Mystery Room.

All implementation decisions must comply with this specification.

Codex must:

1. Read this document before implementing features.
2. Understand the relevant requirements before modifying code.
3. Follow the defined business logic.
4. Follow the database and API contracts.
5. Follow the AI generation workflow.
6. Follow the security requirements.
7. Follow the development phases.
8. Avoid inventing additional functionality.
9. Ask for clarification when a requirement is ambiguous or contradictory.
10. Update the specification when an approved requirement changes.

Supporting documentation such as ARCHITECTURE.md, DATABASE.md, API.md, AI_GENERATION.md, UI_UX.md, SECURITY.md, TESTING.md and TASKS.md may expand implementation details but must never contradict this master specification.

Any approved deviation must be documented.

**The product is considered complete only when the Definition of Done is satisfied.**

# END OF MASTER SPECIFICATION
