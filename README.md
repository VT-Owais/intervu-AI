IntervuAI — AI-Powered Technical Interview Simulator

Practice smarter, not harder. IntervuAI simulates real technical interviews using AI. personalized to your skills, resume, and goals.

--> Overview

IntervuAI is a full-stack, AI-driven web application designed to replicate real-world technical interviews.
It generates personalized questions, evaluates answers with LLM intelligence, and provides data-driven performance insights to help users improve over time.

Unlike static interview platforms, IntervuAI adapts dynamically to each user making every session unique and relevant.

✨ Key Features
    
🎯 Personalized Interview Generation
AI generates tailored questions based on user resume and selected topics
🤖 AI-Powered Evaluation Engine
Automatically analyzes answers and provides structured feedback
📄 Resume Parsing (PDF Upload)
Extracts candidate context to create highly relevant interview questions
📊 Performance Analytics Dashboard
Visualizes scores using interactive charts (Doughnut & Radar)
🔐 Secure Authentication System
JWT-based login with encrypted passwords (bcrypt)
🕒 Interview History Tracking
Track progress, view past attempts, and monitor improvement over time

🏗️ Tech Stack

->Frontend
   React (Vite)
   Tailwind CSS
   Chart.js (react-chartjs-2)
   React Router
   Axios

->Backend
  Node.js
  Express.js
  RESTful APIs

->Database & Auth
  MongoDB
  Mongoose
  JSON Web Tokens (JWT)
  bcrypt.js
  
->AI Integration
  Groq SDK
  Llama 3.1 (8B Instant)
  Prompt Engineering
  NLP (Natural Language Processing)
  
🔄 How It Works (System Flow)
1] User Authentication
Secure login system using JWT and encrypted credentials

2] Resume & Topic Input
Users upload PDF or select topics

3] AI Question Generation
LLM analyzes input and generates personalized interview questions

4] Interview Simulation
Users answer questions in a structured interface

5] AI Evaluation
Answers are analyzed and scored with detailed feedback
6] Analytics & Storage
Results stored in MongoDB and visualized in dashboard

⚡ Performance & Scalability
. Built on non-blocking Node.js architecture for high concurrency
. AI workload offloaded to Groq LPU inference for ultra-fast responses
. Handles hundreds to thousands of concurrent users on a single instance

--> Future Scaling Strategy
  . AWS S3 for file uploads
  . Load balancing (NGINX / AWS ALB)
  . Redis caching & rate limiting

  
🛠️ Installation & Setup
1. Clone Repository
git clone https://github.com/your-username/intervu-ai.git
cd intervu-ai

3. Setup Backend
cd server
npm install

Create .env file:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
GROQ_API_KEY=your_api_key

Run server:

npm start
3. Setup Frontend
cd client
npm install
npm run dev

----------------------------------------------

💡 Key Highlights
----------------------

Built with a product-first mindset
Combines AI + Full-Stack Development
Focused on real-world usability and scalability
Designed for continuous learning and improvement


--->📬 Contact

Mohammed Owais Farhan V T

📧 Email: vtowais786@gmail.com
🔗 GitHub: https://github.com/VT-Owais

⭐ If you found this project useful

Give it a star ⭐ — it helps others discover it!
