## 📍Geospatial Search API

A REST API for proximity-based discovery of geospatial points of interest using Node.js, Express.js, PostgreSQL, and PostGIS.

The API allows users to search for nearby operational EV charging stations based on geographic coordinates, search radius, and charger plug type.

### Architecture Overview

```text
       ┌───────────┐
       │  Client   │
       └─────┬─────┘
             │
             │ GET /search
             ▼
┌─────────────────────────┐
│    Node.js + Express    │
├─────────────────────────┤
│  ├── Input Validation   │
│  └── Parameterized SQL  │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────┐
│       PostgreSQL + PostGIS      │
├─────────────────────────────────┤
│  ├── GiST Spatial Index         │
│  ├── Radius Filtering           │
│  ├── Distance Calculation       │
│  ├── Plug Type + Status Filter  │
│  ├── Nearest-First Sorting      │
│  └── properties Table           │
└────────────┬────────────────────┘
             │
             │ Query Results
             ▼
       ┌───────────┐
       │   JSON    │
       │ Response  │
       └───────────┘
```
