# ContractIQ

AI-powered contract analysis platform built with Next.js, TypeScript, and OpenAI.

ContractIQ helps users understand legal agreements by breaking down contracts into clauses, assigning risk levels, and generating plain-English explanations.

---

# Features

* AI-powered contract analysis
* Clause-by-clause risk detection
* Plain-English explanations
* Contract simulation and editing
* OCR support for image-based contracts
* PDF parsing support
* Real-time risk scoring
* Modern responsive UI
* Local authentication support

---

# Tech Stack

## Frontend

* Next.js 15
* React
* TypeScript
* Tailwind CSS
* Framer Motion
* Lucide Icons

## Backend

* Next.js API Routes
* OpenAI API
* JWT Authentication

## File Processing

* pdf-parse
* OCR using GPT-4o Vision

---


---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/yourusername/contractiq.git
cd contractiq
```

## 2. Install dependencies

```bash
pnpm install
```

or

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the project root.

```env
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_secret_key
```

---

# Running the Project

## Development

```bash
pnpm dev
```

or

```bash
npm run dev
```

The app will run on:

```bash
http://localhost:3000
```

---

# Production Build

```bash
pnpm build
```

Start production server:

```bash
pnpm start
```

---

# Authentication

The project uses a local JWT-based authentication system.

## Authentication Flow

1. User logs in using email and password
2. Server generates JWT token
3. Token is stored locally
4. Protected routes verify token validity

---

# API Routes

## Analyze Contract

```bash
POST /api/analyze
```

Analyzes a contract and returns:

* Overall risk score
* Clause analysis
* Risk summary

---

## OCR Extraction

```bash
POST /api/ocr
```

Extracts text from uploaded images using GPT-4o Vision.

---

## Parse File

```bash
POST /api/parse-file
```

Parses:

* PDF files
* Text files
* Image files

---

## Simulate Clause Changes

```bash
POST /api/simulate
```

Re-analyzes edited clauses and recalculates risk score.

---

# Security Notes

* Never expose your OpenAI API key
* Do not use `NEXT_PUBLIC_OPENAI_API_KEY`
* Keep `.env` inside `.gitignore`
* Store secrets only on the server

Recommended `.gitignore`:

```bash
.env
.env.*
```

---

# Deployment

## Deploy on Vercel

1. Push code to GitHub
2. Import project into Vercel
3. Add environment variables:

```env
OPENAI_API_KEY=your_key
JWT_SECRET=your_secret
```

4. Deploy

---

# Common Build Issues

## OpenAI build error

Problem:

```bash
Missing OPENAI_API_KEY
```

Fix:

* Initialize OpenAI only inside functions
* Never create OpenAI client at top-level

---

## pdf-parse import issue

Fix:

```ts
const pdfParseModule = await import("pdf-parse");
const pdfParse = (pdfParseModule as any).default || pdfParseModule;
```

---

## TypeScript Framer Motion issue

Fix:

```ts
ease: "easeInOut" as const
```

---

# Future Improvements

* Database support
* User dashboards
* Contract history
* Team collaboration
* Export reports
* Advanced OCR pipeline
* AI negotiation suggestions

---

# Disclaimer

ContractIQ provides AI-generated analysis for informational purposes only and does not constitute legal advice.

Always consult a qualified legal professional before signing legally binding agreements.

---

# License

MIT License
