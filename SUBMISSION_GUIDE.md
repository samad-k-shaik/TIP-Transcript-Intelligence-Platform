# Transcript Intelligence — Submission Guide

This document contains the strictly aligned materials for your take-home assignment. All terminology used here matches the project requirements exactly.

---

## 0. Live Deployment Links

* **Frontend (Platform UI)**: [https://tip-frontend-ofppwali6a-uc.a.run.app](https://tip-frontend-ofppwali6a-uc.a.run.app)
* **Backend (API Base)**: [https://tip-backend-ofppwali6a-uc.a.run.app/api/v1](https://tip-backend-ofppwali6a-uc.a.run.app/api/v1)

---

## 1. Slide Deck Outline (Product & Engineering Focus)

### Slide 1: Title
* **Transcript Intelligence: Operational Insights Platform**
* Strategic analysis of customer support, external, and internal call transcripts.

### Slide 2: Executive Summary
* **The Goal**: Enable data-driven decisions for support leaders, sales managers, product managers, and engineering leads.
* **The Solution**: An automated pipeline that converts 100+ raw transcripts into structured intelligence.

### Slide 3: Requirement 1 — Topic or Theme Categorization
* **Methodology**: Hybrid AI Engine (LLM discovery + Scalable classification).
* **Identified Categories**: 
    * Technical Support & Bug Tracking (customer support calls).
    * Renewal & Adoption Feedback (external calls).
    * Engineering Syncs & Planning (internal calls).
* **Reasoning**: Hybrid approach balances the depth of LLM insights with the performance needed for high-volume processing.

### Slide 4: Requirement 2 — Sentiment Analysis Trends
* **Findings**: 
    * **customer support calls**: Sentiment volatility identifies friction points before they escalate.
    * **external calls**: Positive trends in renewal discussions correlate with new feature adoption.
    * **internal calls**: High sentiment stability during engineering syncs indicates strong team alignment.
* **Impact**: Identifying "Sentiment Drift" as a leading indicator of churn.

### Slide 5: Requirement 3 — Additional Insights
* **Feature Gap Analysis**: (Stakeholder: product managers) Identifying unmet needs by extracting unsupported feature mentions from transcripts.
* **Validation Layer**: (Stakeholder: support leaders) Confidence scoring ensures AI-generated summaries are accurate and reliable.
* **Anomaly Monitoring**: (Stakeholder: engineering leads) Identifying technical anomalies in ingestion streams.

---

## 2. Video Demo Script (5-Minute Walkthrough)

**0:00-0:45 | Introduction**
* "Hi, I’m [Your Name]. This is **Transcript Intelligence**—a tool designed to turn conversation data into strategic decisions for our stakeholders."

**0:45-1:45 | Dashboard & Sentiment**
* "Starting on our Dashboard, we see live trends for **customer support calls**, **external calls**, and **internal calls**. We’ve identified a key trend: sentiment in external calls is a leading indicator for customer health."

**1:45-3:00 | The Pipeline**
* "Moving to the Transcript Pipeline, we see our hybrid categorization in action. I'll trigger a run now... [Click Trigger]. This provides full transparency for **engineering leads** to see exactly how we process raw data into Topic and Theme Categorization."

**3:00-4:15 | Deep Dive & Insights**
* "Our Feature Gap Analysis view helps **product managers** see what users want but don't have. We also have a Validation Layer to score AI confidence, ensuring accuracy for **support leaders**."

**4:15-5:00 | Conclusion**
* "In conclusion, this platform turns fragmented transcripts into a unified intelligence lake, ready for organization-wide scaling. Thank you."

---

## 3. Submission Checklist
- [ ] **Slide Deck**: Export the outline above into a tool like PowerPoint or Google Slides. Use screenshots from the UI we built.
- [ ] **Code Repository**: This repository is already well-organized with `backend` and `frontend` separation.
- [ ] **Live Environment**: Verify that the Cloud Run links provided in Section 0 are active and responsive.
- [ ] **Video Demo**: Use the script above to record your screen while navigating the platform.
