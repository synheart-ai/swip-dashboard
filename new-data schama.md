**Version:** 1.0

**Created:** Oct 20, 2025

**Author:** Synheart AI Team

**Related Docs:** [SWIP Protocol RFC],

Dev: k3ax10V7DcYAbGMT

---

## **1. Overview**

The **SWIP Dashboard** is an **open-source transparency interface** for the **Synheart Wellness Impact Protocol (SWIP)**.

It allows researchers, developers, and the public to visualize how wellness applications interact with user heart and HRV data — and how these apps impact user well-being according to the SWIP scoring model.

The dashboard provides:

- Transparent **session data** tables from participating apps.
- **Global leaderboards** ranking apps by their wellness impact.
- **Developer registration** and **API key issuance** for apps sending SWIP data for evaluation.

Built on **Next.js** and using **Better Auth** for secure authentication, the SWIP Dashboard serves as the main portal for **open evaluation of digital wellness apps**.

---

## **2. Goals**

1. **Transparency:**
    
    Expose anonymized HRV and session metrics to the public for open accountability.
    
2. **Community:**
    
    Create a leaderboard of top applications contributing positively to human wellness.
    
3. **Developer Integration:**
    
    Provide an API gateway for developers to submit session data in the SWIP format for automatic evaluation.
    
4. **Open Science:**
    
    Encourage reproducible wellness research through open metrics and transparent data structures.
    

---

## **3. System Architecture**

### **Frontend**

- **Framework:** Next.js (App Router)
- **UI:** TailwindCSS + shadcn/ui
- **Charts:** Recharts / Plotly
- **Auth:** Better Auth SDK
- **Deployment:** Vercel

### **Backend**

- **API Routes:** Next.js server actions
- **Database:** PostgreSQL hosted on Supabase
- **ORM:** Prisma
- **Data Source:** SWIP ingestion API (developer-submitted data)

### **Security**

- OAuth / email-based auth via Better Auth
- Rate limiting and verification for API key use
- Data anonymization at ingestion layer

---

## **4. Core Features**

### **A. Session Explorer**

Displays anonymized sessions from participating apps:

- HRV and HR time series
- Calculated SWIP score (wellness impact index)
- Timestamps and session duration
- Device / app name
- Aggregated emotion or stress level distribution

### **B. Global Leaderboard**

Ranks apps globally based on:

- Mean SWIP score over last 30 days
- Number of active sessions
- Retention / engagement wellness index

### **C. Developer Portal**

- Register / login with Better Auth
- Create and manage projects (apps)
- Generate API keys
- View ingestion status and logs
- Access app-specific dashboards

### **D. API Integration**

Developers can POST session data to /api/swip/ingest with:

```
{
  "app_id": "your_app_id",
  "session_id": "uuid",
  "metrics": {
    "hr": [...],
    "rr": [...],
    "hrv": {"sdnn": 52, "rmssd": 48},
    "emotion": "calm",
    "timestamp": "2025-10-20T08:00:00Z"
  }
}
```

The system evaluates and ranks sessions according to SWIP scoring algorithms.

---

## **5. Visuals and charts**

| Access Group |
| --- |
| Public / Guest |
| User |
| Session |
| Developer |

| Filter Types |  |  |  |  |
| --- | --- | --- | --- | --- |
| Day | Part of Day | Wearable | OS | App Category |
| Last 6 Hrs. | morning | Apple Watch | iOS | Health |
| Today | afternoon | Samsung Galaxy Watch | Android | Communication |
| This Week | evening |  |  | Game |
| This Month | night |  |  | Entertainment |

| Category | Interpretation | Chart | Access | Status |
| --- | --- | --- | --- | --- |
| Users | Active users count (Total Users) | KPI Card | Public, Developer | P1 |
| Users | Active users count Trend (Last 6 Hrs., Today, This Week, This Month, Custom) | Line Chart | Public, Developer | P1 |
| Users | New users count | KPI Card | Public, Developer | P1 |
| Users | New users count Trend (Last 6 Hrs., Today, This Week, This Month, Custom) | Line Chart | Public, Developer | P1 |
| SWIP score | Average SWIP score | KPI Card | Public, Developer, Session, User | P1 |
| SWIP score | Average SWIP score Trend (Last 6 Hrs., Today, This Week, This Month, Custom) | Line Chart | Public, Developer, Session, User | P1 |
| Session | Total Session  | KPI Card | Public, Developer, User | P1 |
| Session | Total Session Trend (Last 6 Hrs., Today, This Week, This Month, Custom) | Line Chart | Public, Developer, User | P1 |
| Session | Average Session per day | KPI Card | Public, Developer, User | P1 |
| Session | Average Session per user | KPI Card | Public, Developer, User | P1 |
| Session | Average Session per user per day | KPI Card | Public, Developer, User | P1 |
| Stress Rate | Average stress rate | KPI Card | Public, Developer, User | P1 |
| Stress Rate | Average stress rate Trend (Last 6 Hrs., Today, This Week, This Month, Custom) | Line Chart | Public, Developer, User | P1 |
| Session | Average Session Duration | KPI Card | Public, Developer, User | P1 |
| Session | Average Session Duration Trend (Last 6 Hrs., Today, This Week, This Month, Custom) | Line Chart | Public, Developer, User | P1 |
| SWIP Score | SWIP Score Peak Hour (Part of Day) | Pie Chart / KPI Card | Public, Developer, Session, User | P2 |
| SWIP Score | SWIP Score per day for every hour | Heatmap | Public, Developer, User | P1 |
| HRV | Average HRV per session | KPI Card | Public, Developer, User | P1 |
| Bio signal | Bio signals for a session | Line Chart | Session | P1 |
| Bio signal | Frequency distribution of bio signals | Bar Chart | User, Session | P2 |
| Emotion | Emotion distribution | Pie chart | Public, Developer, Session, User | P2 |
| Session | Session Table (session id, wearable, started at, ended at, duration, Avg. BPM, Avg. HRV, Emotion, SWIP Score) | Table | Session | P1 |
| App | App Leaderboard (App name, Category, Developer, Average SWIP Score, Average Stress Rate, Total Session) | Table | Public | P1 |

## **6. Data Model (Simplified)**

**Tables:**

- **Users**
    - id, name, email, auth_provider, created_at
- **Apps**
    - id, name, owner_id, api_key, created_at
- **Sessions**
    - id, app_id, user_tag, swip_score, hr_data, hrv_metrics, created_at
- **Leaderboard**
    - app_id, avg_score, sessions_count, rank

---

## **7. Open Governance**

The dashboard codebase is open-source under **MIT License**.

Community contributions are managed through GitHub pull requests, and the transparency data API is versioned under v1.

All anonymized session data is publicly viewable and queryable through /api/public/sessions.

---

## **8. Future Roadmap**

| **Version** | **Focus** | **Description** |
| --- | --- | --- |
| v0.1 | MVP | Developer auth, app registration, basic leaderboard |
| v0.2 | Analytics | HRV visualization + SWIP scoring |
| v0.3 | Transparency | Public sessions explorer |
| v1.0 | Community | Verified apps + badges + API documentation portal |

---

## **9. Example Workflow**

1. A developer registers their wellness app on the SWIP Dashboard.
2. They receive an API key.
3. Their app starts sending HRV-based session data.
4. The SWIP engine evaluates sessions → assigns a SWIP Score.
5. The app’s rank and transparency data appear on the public dashboard.

---

## **10. Repositories**

- **Frontend:** [github.com/synheart-ai/swip-dashboard](https://github.com/synheart-ai/swip-dashboard)
- **Protocol:** [github.com/synheart-ai/swip](https://github.com/synheart-ai/swip)

---

## **11. License**

**MIT License** — open contribution and transparency encouraged.

All public data is anonymized and complies with the **Synheart Open Standard (SOS-1.0)** privacy rules.

---