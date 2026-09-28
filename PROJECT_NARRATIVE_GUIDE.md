# How to Add Projects with Detailed Narrative Sections

## Issue
When adding a project, the "Detailed Narrative & Purpose" sections are not displaying on the public website because they are not being filled in the admin form.

## Solution
When creating a new project, you MUST fill in **Tab 2: Narrative & Purpose** with the detailed sections.

---

## Step-by-Step Guide

### Step 1: Go to Admin Projects
Navigate to: `http://localhost:5173/admin/projects`

### Step 2: Click "Add New Project"
Click the blue **"+ Add New Project"** button

### Step 3: Fill Tab 1 - Basic Info & Summary
1. **Project Name**: e.g., "ApexCore AI Platform"
2. **Category**: Select a category
3. **Client Name**: e.g., "Vanguard Global Analytics"
4. **Status**: Select "Completed", "Ongoing", "Upcoming", or "On Hold"
5. **Cover Image**: Upload a project cover image (REQUIRED)
6. **Short Description**: Brief 1-2 sentence summary
7. **Start Date**: Project start date
8. **Completion Date** (optional): When project finished
9. Check **"Publish Immediately"** if you want it visible on the website

Then click **Next Tab** or the **"2. Narrative & Purpose"** tab

---

### Step 4: Fill Tab 2 - Narrative & Purpose ⭐ IMPORTANT

This is the section with all the detailed narrative fields. Fill these in:

#### **Section 1: What is this Project?**
- **Overview Section Title**: e.g., "What is this Project?" (or customize)
- **Full Project Overview Content**: Detailed description of what the project is
  
Example:
```
ApexCore AI Intelligence Platform is a next-generation multimodal enterprise 
retrieval-augmented generation (RAG) system designed to handle semantic search 
across massive document repositories. Built for Fortune 500 enterprises requiring 
sub-second latency and enterprise-grade security.
```

#### **Section 2: What This Project Does**
- **Functionality Section Title**: e.g., "What This Project Does" (or customize)
- **What This Project Does Content**: Explain the real-world functionality
  
Example:
```
ApexCore enables enterprise teams to:
- Query 20M+ documents with sub-second semantic search
- Extract insights from unstructured data in real-time
- Integrate with existing enterprise systems via REST APIs
- Scale horizontally across multiple cloud regions
- Maintain audit trails and compliance with SOC2 Type II
```

#### **Section 3: What Problem Does It Solve?**
- **Problems Section Title**: e.g., "What Problem Does It Solve?" (or customize)
- **What Problem Does It Solve Content**: Describe the pain points this solves
  
Example:
```
Legacy document management systems suffered from:
- Search latency causing 20+ minute query times
- Poor semantic understanding of complex domain documents
- Siloed data preventing cross-team knowledge sharing
- Limited scalability for growing enterprise datasets
- Compliance and audit trail gaps
```

---

### Step 5: Fill Tab 3 - Features Matrix (Optional)
Add key features that will display as a grid on the project page:

1. Click **"+ Add Feature"**
2. **Feature Title**: e.g., "Multimodal RAG"
3. **Feature Description**: e.g., "Process text, PDFs, images with unified semantic indexing"
4. **Icon**: Select an icon (Zap, Shield, Lock, etc.)
5. Repeat for each feature

---

### Step 6: Fill Tab 4 - Tech Stack (Optional)
Add technologies used in the project:

1. Click **"+ Add Tech"**
2. **Tech Name**: e.g., "Python"
3. **Category**: e.g., "Backend Language"
4. **Color**: Select a color for display
5. Repeat for each technology

---

### Step 7: Save Project
Click the **"Publish Project"** button to save and make it public

---

## What Displays on the Website

Once you fill in these sections and save, your project will display on the website with:

### On Project Showcase (Homepage):
- ✅ Project name
- ✅ Short description
- ✅ Cover image
- ✅ Client name
- ✅ Completion date
- ✅ Problems solved (preview)

### On Project Detail Page:
- ✅ **What is this Project?** section with full overview
- ✅ **What Problem Does It Solve?** section with detailed problems
- ✅ **What This Project Does** section with functionality
- ✅ **Key Features** section (if you added features)
- ✅ **Technology Stack** section (if you added tech)
- ✅ Gallery and screenshots

---

## Example: Complete Project

Here's a complete example with all sections filled:

**Tab 1 - Basic:**
- Name: "ApexCore AI Platform"
- Category: "Artificial Intelligence"
- Client: "Vanguard Global Analytics"
- Status: "Completed"
- Cover Image: [Upload image]
- Short Description: "Enterprise-grade multimodal RAG platform enabling semantic search across 20M+ documents"

**Tab 2 - Narrative:**

*Overview Section:*
- Title: "What is this Project?"
- Content: "ApexCore is an enterprise AI platform that revolutionizes how organizations search and extract insights from massive document collections. Our system processes 20M+ documents with sub-second latency using advanced multimodal retrieval-augmented generation..."

*Functionality Section:*
- Title: "What This Project Does"
- Content: "ApexCore enables enterprise teams to query unstructured data with semantic intelligence, automatically extract key insights, integrate with existing systems via REST APIs, and scale across cloud regions while maintaining compliance..."

*Problems Section:*
- Title: "What Problem Does It Solve?"
- Content: "Legacy systems suffered from slow search (20+ min queries), poor semantic understanding, data silos, limited scalability, and compliance gaps. ApexCore solves this with AI-powered search..."

**Tab 3 - Features:**
1. "Multimodal RAG" - "Process text, PDFs, and images with unified indexing"
2. "Enterprise Security" - "SOC2 Type II compliance with end-to-end encryption"
3. "Real-time Indexing" - "Sub-second document indexing and search"

**Tab 4 - Tech:**
1. Python - Backend Language
2. PostgreSQL - Database
3. OpenAI - AI/ML Platform
4. Kubernetes - Infrastructure

---

## Common Issues

### "Sections not displaying on website"
→ You didn't fill in Tab 2: Narrative & Purpose fields
→ Solution: Go back to admin, edit the project, fill Tab 2

### "Only title shows, but no content"
→ You filled in the titles but not the content fields
→ Solution: Fill in the "Content" text areas below each title

### "Can't see the project on website at all"
→ Make sure "Publish Immediately" is checked in Tab 1
→ Solution: Edit project, check the publish checkbox, save

---

## Testing

1. Add a test project through admin with all fields filled
2. Go to `http://localhost:5173/projects` to see projects list
3. Click the project to view detail page
4. Verify all narrative sections display correctly
5. Use **"View Project"** button in admin projects table to preview before publishing

