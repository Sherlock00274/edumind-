<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/918cc014-0e4b-4d3c-b45e-9ced113e1413

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `VITE_API_BASE_URL=http://localhost:8000/api/v1` in [.env.local](.env.local)
3. Run the app:
   `npm run dev`

Workflow:

1. Upload a syllabus first.
2. Review and edit the extracted course name, assessment details, and chapters.
3. Create the course workspace.
4. Upload materials by chapter, or leave chapter selection on auto-detect for cross-chapter files such as past papers, tutorials, homework, or quizzes.

Supported upload extensions are `.pdf`, `.pptx`, `.docx`, `.md`, `.markdown`, and `.txt`.
