# SubSense

**Smart Subscription & Customer Experience Optimization** — Hackathon Case Study 2.

SubSense is an early-warning system for subscription businesses. It unifies scattered
customer data into one profile, predicts who will churn with an **explainable** health
score, and recommends the right retention action before the customer leaves.
website URL: https://subsense-rho.vercel.app/

---

## 🚀 Live deployment

The app is deployed and running — no local setup needed to see it:

| | URL |
| --- | --- |
| **Dashboard** (the app) | https://subsense-rho.vercel.app |
| **API** | https://subsense-api-pbjy.onrender.com |
| **Interactive API docs** | https://subsense-api-pbjy.onrender.com/docs |

- **Frontend** → Vercel (static build of `ui/`, with `VITE_API_BASE` pointing at the API).
- **API** → Render (blueprint in `render.yaml`; builds the DB + model at deploy time).
- **Heads-up:** the free Render API sleeps after ~15 min idle. If the dashboard shows
  zeros, open the API URL once to wake it (~50s), then refresh. Warm it up before a demo.

To redeploy after changes: push to `main`, then in Render trigger **Manual Deploy → Deploy
latest commit**; for the frontend, rebuild `ui/` (`VITE_API_BASE=<api-url> npm run build`)
and re-drop `ui/dist` on Vercel.

---

## What it does

| Pillar | Problem solved | Key capability |
| --- | --- | --- |
| 1. Unified customer intelligence | Data is scattered across usage, billing, support, feedback | ETL merges all sources into one profile per customer |
| 2. Predictive churn + health score | Churn is detected only after cancellation | XGBoost churn probability + 0–100 health score + SHAP explanations |
| 3. Personalised retention actions | Teams cannot personalise at scale | Plan right-sizing, pause-before-cancel, payment-retry playbooks |

**Health score** = 40% usage + 25% engagement + 20% support + 15% outcomes, blended with
the model's churn probability. Bands: ≥70 Healthy · 40–69 At-Risk · <40 Critical.

---

## Tech stack

- **Backend** — FastAPI (Python), SQLAlchemy, SQLite
- **ML** — XGBoost, scikit-learn, SMOTE (imbalanced-learn), SHAP
- **Frontend** — React 19 + Vite + TypeScript + Tailwind CSS 4
- **Data** — IBM Telco Customer Churn (labels) + synthesized behavioural events

---

## Project structure

```
subsense/
├─ backend/          FastAPI app
│  ├─ main.py        entry point (uvicorn backend.main:app)
│  ├─ models.py      10 SQLAlchemy tables
│  ├─ database.py    engine + session
│  ├─ routers/       customers.py, dashboard.py, recommendations.py, interventions.py
│  └─ services/      ingestion.py (ETL), recommend.py (Pillar 3 actions)
├─ ml/               feature engineering + models
│  ├─ seed_data.py   builds the database from telco.csv
│  ├─ features.py    computes customer_features
│  ├─ train.py       trains XGBoost -> model.pkl
│  ├─ explain.py     SHAP risk drivers
│  └─ health.py      4-dimension health score
├─ ui/               React dashboard (runs on port 3000)
└─ data/raw/         telco.csv
```

---

## Setup

> **Important:** `subsense.db` and `ml/model.pkl` are **not** committed (they are generated
> artifacts). You must run the pipeline below once after cloning, or the API will fail to
> start.

### 1. Backend

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1      # Windows PowerShell
# source .venv/bin/activate       # macOS / Linux

pip install -r requirements.txt
```

### 2. Build the database and models (run once, in this order)

```bash
python -m backend.init_db     # create the 10 tables
python -m ml.seed_data        # seed 400 customers + behavioural events
python -m ml.features         # compute customer_features
python -m ml.train            # train XGBoost -> ml/model.pkl
python -m ml.health           # score every customer -> health_scores
```

Each step prints a confirmation. After `ml.health` you should see a breakdown such as
`Healthy 264 / At-Risk 29 / Critical 5`.

### 3. Run the API

```bash
uvicorn backend.main:app --reload
```

Runs on <http://127.0.0.1:8000>. Check <http://127.0.0.1:8000/api/dashboard/overview>.

### 4. Run the UI

```bash
cd ui
npm install
npm run dev
```

Runs on <http://localhost:3000>. The UI falls back to bundled mock data if the API is
offline, so the design always renders.

---

## API endpoints

| Endpoint | Returns |
| --- | --- |
| `GET /api/dashboard/overview` | Portfolio KPIs: MRR, MRR at risk, risk-band counts |
| `GET /api/customers` | Customer list (filter by `risk_band`, `segment`, `limit`) |
| `GET /api/customers/{id}` | Full 360 profile: profile + features + health |
| `GET /api/customers/{id}/health` | Health score and its four dimensions |
| `GET /api/customers/{id}/churn` | Churn probability + SHAP risk drivers |
| `GET /api/alerts` | Active customers ranked by churn risk |
| `GET /api/customers/{id}/recommendations` | Plan right-size + next best action (Fn 3.1, 3.2) |
| `GET /api/playbooks` | Portfolio retention playbooks for the Actions board (Fn 3.2) |
| `GET /api/segments` | Per-segment health / risk / MRR rollups (Fn 1.3) |
| `GET /api/payments/at-risk` | Failed / expiring payments + suggested retry timing (Fn 3.3) |
| `GET /api/interventions` | Track intervention status / outcomes (Fn 3.2) |
| `POST /api/interventions` | Create / queue an intervention (Fn 3.2) |
| `PATCH /api/interventions/{id}` | Advance status or record outcome (Fn 3.2) |

All responses use the envelope `{ success, data, error, meta }`.

---

## Data note

The IBM Telco Customer Churn dataset supplies real churn labels, tenure and monthly
charges. No public SaaS dataset includes the usage telemetry a health score needs, so
`ml/seed_data.py` synthesizes usage, payments, support tickets and feedback on top.

Behaviour is deliberately an **imperfect** predictor: ~78% of churners show warning signs
(so ~22% churn silently), and ~12% of active customers already behave like churners.
That overlap is intentional — it keeps the model honest and creates the "still paying but
quietly declining" cohort the product exists to catch.

---

## Team

Two developers, both full-stack.

| | Dev 1 | Dev 2 |
| --- | --- | --- |
| Pillar | Churn + health score | Recommendations + interventions |
| Backend | churn/health/alerts/dashboard endpoints | recommendations/interventions endpoints |
| Frontend | Dashboard, At-Risk, Customer 360 | Actions, Interventions, Segments |

**Conventions:** no direct commits to `main`; work on `feature/*` branches and open a PR.
Agree the API JSON shape before building each slice. Merge to `main` at least once a day.
