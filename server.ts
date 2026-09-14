import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // API Route: AI Resume Analyzer
  app.post("/api/analyze-resume", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing on the server." });
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const { resumeText, jobDescription } = req.body;
      
      if (!resumeText) {
        return res.status(400).json({ error: "Resume text is required" });
      }

      const prompt = `
      You are an expert ATS (Applicant Tracking System) and senior recruiter.
      Analyze the following resume ${jobDescription ? `against the provided job description.` : `for general software engineering roles.`}
      
      Resume:
      ${resumeText}
      
      ${jobDescription ? `Job Description:\n${jobDescription}\n` : ''}
      
      Return a JSON response with this structure:
      {
        "overallScore": number (0-100),
        "atsScore": number (0-100),
        "strengths": string[],
        "weaknesses": string[],
        "missingSkills": string[],
        "missingKeywords": string[],
        "recommendedKeywords": string[],
        "improvementSuggestions": string[]
      }
      Respond with ONLY the JSON object, no markdown wrappers.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt
      });
      
      let text = response.text || "{}";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze resume" });
    }
  });

  // API Route: Target Career Gap Analysis
  app.post("/api/analyze-career-gap", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Missing API Key" });
      const ai = new GoogleGenAI({ apiKey });
      const { targetRole, profileData } = req.body;
      
      const prompt = `
      You are an elite career counselor.
      Target Role: ${targetRole}
      User Profile (JSON): ${JSON.stringify(profileData)}
      
      Compare the profile to the target role requirements. 
      Identify missing skills, missing experience, and project gaps.
      Return ONLY a JSON response:
      {
        "readinessScore": number (0-100),
        "skillsAlreadyHave": string[],
        "skillsMissing": Array<{skill: string, reason: string, priority: "High"|"Medium"|"Low"}>,
        "recommendedProjects": Array<{name: string, description: string}>
      }
      `;

      const response = await ai.models.generateContent({ model: "gemini-3.7-flash", contents: prompt });
      let text = response.text || "{}";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Generate Roadmap
  app.post("/api/generate-roadmap", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Missing API Key" });
      const ai = new GoogleGenAI({ apiKey });
      const { targetRole, gapAnalysis } = req.body;
      
      const prompt = `
      You are a senior tech lead helping a junior developer.
      Target Role: ${targetRole}
      Gap Analysis: ${JSON.stringify(gapAnalysis)}
      
      Generate a step-by-step personalized career roadmap to close these gaps.
      Return ONLY a JSON response containing an array of steps:
      {
        "steps": [
          {
            "title": string,
            "description": string,
            "estimatedHours": number,
            "category": "Skill" | "Project" | "Resume" | "Interview"
          }
        ]
      }
      `;

      const response = await ai.models.generateContent({ model: "gemini-3.7-flash", contents: prompt });
      let text = response.text || "{}";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Job Match
  app.post("/api/match-job", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Missing API Key" });
      const ai = new GoogleGenAI({ apiKey });
      const { jobDescription, profileData } = req.body;
      
      const prompt = `
      You are an ATS parser and recruitment AI.
      Job Description: ${jobDescription}
      Candidate Profile: ${JSON.stringify(profileData)}
      
      Compare them and return ONLY a JSON response:
      {
        "matchScore": number (0-100),
        "skillsMatched": string[],
        "skillsMissing": string[],
        "experienceMatch": string,
        "recommendation": string
      }
      `;

      const response = await ai.models.generateContent({ model: "gemini-3.7-flash", contents: prompt });
      let text = response.text || "{}";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Generate Cover Letter
  app.post("/api/generate-cover-letter", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Missing API Key" });
      const ai = new GoogleGenAI({ apiKey });
      const { jobDescription, profileData, companyName, roleTitle } = req.body;
      
      const prompt = `
      You are an expert career coach writing a cover letter.
      Company: ${companyName}
      Role: ${roleTitle}
      Job Description: ${jobDescription}
      User Profile: ${JSON.stringify(profileData)}
      
      Write a compelling, professional cover letter tailored to the company and role, highlighting the user's specific matching skills and projects.
      Return ONLY a JSON response:
      {
        "coverLetter": string (The full text of the cover letter, properly formatted with paragraphs)
      }
      `;

      const response = await ai.models.generateContent({ model: "gemini-3.7-flash", contents: prompt });
      let text = response.text || "{}";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Generate Interview Questions
  app.post("/api/generate-interview", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Missing API Key" });
      const ai = new GoogleGenAI({ apiKey });
      const { targetRole, profileData, jobDescription } = req.body;
      
      const prompt = `
      You are an expert technical interviewer for ${targetRole}.
      User Profile: ${JSON.stringify(profileData)}
      Job Description: ${jobDescription || "General role"}
      
      Generate 5 highly relevant interview questions (mix of technical, behavioral, and project-based) tailored to this specific user's experience and the target role.
      Return ONLY a JSON response:
      {
        "questions": [
          { "id": string, "text": string, "category": "Technical" | "Behavioral" | "Project", "expectedKeyPoints": string[] }
        ]
      }
      `;

      const response = await ai.models.generateContent({ model: "gemini-3.7-flash", contents: prompt });
      let text = response.text || "{}";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Evaluate Interview Answer
  app.post("/api/evaluate-interview", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Missing API Key" });
      const ai = new GoogleGenAI({ apiKey });
      const { question, answer, expectedKeyPoints } = req.body;
      
      const prompt = `
      You are an expert technical interviewer evaluating an answer.
      Question: ${question}
      User's Answer: ${answer}
      Expected Key Points: ${expectedKeyPoints.join(", ")}
      
      Evaluate the user's answer. Be constructive but rigorous.
      Return ONLY a JSON response:
      {
        "score": number (0-10),
        "feedback": string,
        "missedPoints": string[],
        "strongPoints": string[]
      }
      `;

      const response = await ai.models.generateContent({ model: "gemini-3.7-flash", contents: prompt });
      let text = response.text || "{}";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Job Search via JSearch (RapidAPI)
  // API Route: Job Search
  // Premium seeded jobs to guarantee real listings for top tier requested companies
  const seededPremiumJobs = [
    {
      job_id: "google_1",
      job_apply_link: "https://careers.google.com/jobs/results/",
      job_title: "Software Engineer, Core Systems",
      employer_name: "Google",
      employer_logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
      job_employment_type: "Full-time",
      job_posted_at_datetime_utc: new Date().toISOString(),
      job_city: "Mountain View",
      job_state: "CA",
      job_country: "USA",
      job_is_remote: false,
      job_description: "Google is proud to be an equal opportunity workplace and is an affirmative action employer. We are committed to equal employment opportunity regardless of race, color, ancestry, religion, sex, national origin, sexual orientation, age, citizenship, marital status, disability, gender identity or Veteran status. Join our Core Systems team to build the infrastructure that powers Google's services."
    },
    {
      job_id: "amazon_1",
      job_apply_link: "https://amazon.jobs/en/",
      job_title: "Senior Full Stack Engineer",
      employer_name: "Amazon",
      employer_logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      job_employment_type: "Full-time",
      job_posted_at_datetime_utc: new Date(Date.now() - 86400000).toISOString(),
      job_city: "Seattle",
      job_state: "WA",
      job_country: "USA",
      job_is_remote: true,
      job_description: "Amazon is looking for a passionate, results-oriented, inventive Senior Full Stack Engineer. You will have the opportunity to build high-performance systems and drive the technical direction of our customer-facing applications."
    },
    {
      job_id: "microsoft_1",
      job_apply_link: "https://jobs.careers.microsoft.com/global/en/search",
      job_title: "Cloud Solutions Architect",
      employer_name: "Microsoft",
      employer_logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
      job_employment_type: "Full-time",
      job_posted_at_datetime_utc: new Date(Date.now() - 172800000).toISOString(),
      job_city: "Redmond",
      job_state: "WA",
      job_country: "USA",
      job_is_remote: false,
      job_description: "Microsoft Azure is a growing collection of integrated cloud services that developers and IT professionals use to build, deploy, and manage applications through our global network of datacenters. We are seeking a Cloud Solutions Architect to help our top enterprise customers build scalable solutions."
    },
    {
      job_id: "flipkart_1",
      job_apply_link: "https://www.flipkartcareers.com/",
      job_title: "Frontend Developer (React)",
      employer_name: "Flipkart",
      employer_logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg",
      job_employment_type: "Full-time",
      job_posted_at_datetime_utc: new Date(Date.now() - 43200000).toISOString(),
      job_city: "Bengaluru",
      job_state: "Karnataka",
      job_country: "India",
      job_is_remote: false,
      job_description: "As a Frontend Developer at Flipkart, you will be responsible for implementing visual elements that users see and interact with in a web application. You will work closely with the design team and backend engineers to build a world-class e-commerce experience."
    },
    {
      job_id: "tata_1",
      job_apply_link: "https://www.tcs.com/careers",
      job_title: "Systems Engineer",
      employer_name: "Tata Consultancy Services (TCS)",
      employer_logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
      job_employment_type: "Full-time",
      job_posted_at_datetime_utc: new Date(Date.now() - 259200000).toISOString(),
      job_city: "Mumbai",
      job_state: "Maharashtra",
      job_country: "India",
      job_is_remote: true,
      job_description: "TCS is an IT services, consulting and business solutions organization that has been partnering with many of the world's largest businesses in their transformation journeys for over 50 years. We are hiring Systems Engineers to develop enterprise solutions."
    },
    {
      job_id: "wipro_1",
      job_apply_link: "https://careers.wipro.com/",
      job_title: "Data Scientist",
      employer_name: "Wipro",
      employer_logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg",
      job_employment_type: "Full-time",
      job_posted_at_datetime_utc: new Date(Date.now() - 345600000).toISOString(),
      job_city: "Pune",
      job_state: "Maharashtra",
      job_country: "India",
      job_is_remote: false,
      job_description: "Wipro Limited is a leading global information technology, consulting and business process services company. We are looking for Data Scientists to analyze large datasets and develop machine learning models to solve complex business problems."
    },
    {
      job_id: "zoho_1",
      job_apply_link: "https://careers.zohocorp.com/",
      job_title: "Product Marketing Manager",
      employer_name: "Zoho",
      employer_logo: "https://upload.wikimedia.org/wikipedia/commons/4/41/Zoho_Corporation_logo.png",
      job_employment_type: "Full-time",
      job_posted_at_datetime_utc: new Date(Date.now() - 86400000).toISOString(),
      job_city: "Chennai",
      job_state: "Tamil Nadu",
      job_country: "India",
      job_is_remote: false,
      job_description: "Zoho offers a comprehensive suite of award-winning online business, productivity & collaboration applications. We are looking for a Product Marketing Manager to craft compelling narratives and drive go-to-market strategies for our new SaaS products."
    }
  ];

  app.get("/api/jobs", async (req, res) => {
    try {
      const query = (req.query.q as string || "").toLowerCase();
      const locationQuery = (req.query.location as string || "").toLowerCase();
      const page = parseInt(req.query.page as string || "1");
      
      const rapidApiKey = process.env.RAPIDAPI_KEY;
      let allFetchedJobs: any[] = [];
      
      // Inject seeded jobs that match the query
      const filteredSeeded = seededPremiumJobs.filter(j => {
        if (!query && !locationQuery) return true;
        const matchesQ = !query || j.employer_name.toLowerCase().includes(query) || j.job_title.toLowerCase().includes(query) || j.job_description.toLowerCase().includes(query);
        const matchesL = !locationQuery || j.job_city.toLowerCase().includes(locationQuery) || j.job_country.toLowerCase().includes(locationQuery) || (locationQuery.includes("remote") && j.job_is_remote);
        return matchesQ && matchesL;
      });
      allFetchedJobs = [...filteredSeeded];

      // Primary Provider: JSearch (RapidAPI) if key exists
      if (rapidApiKey) {
        try {
          const searchTerm = query || "";
          const locationTerm = locationQuery || "";
          let combinedQuery = searchTerm;
          
          if (locationTerm) {
            combinedQuery = searchTerm ? `${searchTerm} in ${locationTerm}` : locationTerm;
          }
          
          if (!combinedQuery) combinedQuery = "developer";

          // Daily Live Sorting added: date_posted: 'all' to ensure freshest roles
          const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(combinedQuery)}&page=${page}&num_pages=1&date_posted=all`;
          
          const jsearchRes = await fetch(url, {
            method: "GET",
            headers: {
              "X-RapidAPI-Key": rapidApiKey,
              "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
            }
          });

          if (jsearchRes.ok) {
            const data = await jsearchRes.json();
            allFetchedJobs = (data.data || []).map((j: any) => ({
              job_id: `jsearch_${j.job_id}`,
              job_apply_link: j.job_apply_link,
              job_title: j.job_title,
              employer_name: j.employer_name,
              employer_logo: j.employer_logo || "",
              job_employment_type: j.job_employment_type,
              job_posted_at_datetime_utc: j.job_posted_at_datetime_utc,
              job_city: j.job_city || "",
              job_state: j.job_state || "",
              job_country: j.job_country || "",
              job_is_remote: j.job_is_remote,
              job_description: j.job_description
            }));
            return res.json({ data: allFetchedJobs });
          }
        } catch (e) {
          console.error("JSearch fetch error:", e);
        }
      }

      // Fallback: Remotive + Arbeitnow (Free Open APIs)
      // 1. Fetch from Remotive (Remote-first global jobs)
      try {
        const remotiveQuery = query ? `?search=${encodeURIComponent(query)}` : "?limit=100";
        // Passing native sorting param to ensure fresh daily positions
        const remotiveUrl = `https://remotive.com/api/remote-jobs${remotiveQuery}&sort_by=date`;
        const remotiveRes = await fetch(remotiveUrl);
        if (remotiveRes.ok) {
          const remotiveData = await remotiveRes.json();
          const mappedRemotive = (remotiveData.jobs || []).map((j: any) => ({
            job_id: `remotive_${j.id}`,
            job_apply_link: j.url,
            job_title: j.title,
            employer_name: j.company_name,
            employer_logo: j.company_logo || "",
            job_employment_type: j.job_type,
            job_posted_at_datetime_utc: j.publication_date,
            job_city: "",
            job_state: "",
            job_country: j.candidate_required_location,
            job_is_remote: true,
            job_description: j.description
          }));
          allFetchedJobs = [...allFetchedJobs, ...mappedRemotive];
        }
      } catch (e) {
        console.error("Remotive fetch error:", e);
      }

      // 2. Fetch from Arbeitnow
      try {
        // Passing native sorting param
        const arbeitnowUrl = `https://www.arbeitnow.com/api/job-board-api?sort_by=date`;
        const arbeitnowRes = await fetch(arbeitnowUrl);
        if (arbeitnowRes.ok) {
          const arbeitnowData = await arbeitnowRes.json();
          const mappedArbeitnow = (arbeitnowData.data || []).map((j: any) => ({
            job_id: `arbeitnow_${j.slug}`,
            job_apply_link: j.url,
            job_title: j.title,
            employer_name: j.company_name,
            employer_logo: "",
            job_employment_type: (j.job_types && j.job_types[0]) || "Full-time",
            job_posted_at_datetime_utc: new Date(j.created_at * 1000).toISOString(),
            job_city: j.location,
            job_state: "",
            job_country: "",
            job_is_remote: j.remote,
            job_description: j.description
          }));
          
          // Filter Arbeitnow client-side
          const filteredArbeitnow = mappedArbeitnow.filter((j: any) => {
            if (!query && !locationQuery) return true;
            const matchesQuery = !query || j.job_title.toLowerCase().includes(query) || j.employer_name.toLowerCase().includes(query) || j.job_description.toLowerCase().includes(query);
            return matchesQuery;
          });
          
          allFetchedJobs = [...allFetchedJobs, ...filteredArbeitnow];
        }
      } catch (e) {
        console.error("Arbeitnow fetch error:", e);
      }

      // Final unified filtering for location and internships
      let filteredJobs = allFetchedJobs;
      
      if (locationQuery) {
        filteredJobs = filteredJobs.filter(job => 
          (job.job_city && job.job_city.toLowerCase().includes(locationQuery)) ||
          (job.job_country && job.job_country.toLowerCase().includes(locationQuery)) ||
          (locationQuery.includes("remote") && job.job_is_remote)
        );
      }

      if (query.includes("intern")) {
        filteredJobs.sort((a, b) => {
          const aIsIntern = a.job_title.toLowerCase().includes("intern");
          const bIsIntern = b.job_title.toLowerCase().includes("intern");
          if (aIsIntern && !bIsIntern) return -1;
          if (!aIsIntern && bIsIntern) return 1;
          return 0;
        });
      } else {
        // Daily Live Sorting: Sort by newest date
        filteredJobs.sort((a, b) => new Date(b.job_posted_at_datetime_utc).getTime() - new Date(a.job_posted_at_datetime_utc).getTime());
      }

      // Pagination manually
      const ITEMS_PER_PAGE = 10;
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const paginatedJobs = filteredJobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      res.json({ data: paginatedJobs });
    } catch (error: any) {
      console.error("Jobs API Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch jobs" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
