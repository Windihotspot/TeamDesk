# API Documentation

## Base URL

https://YOUR_PROJECT.supabase.co/functions/v1

---

## Auth

All protected routes require:

Authorization: Bearer <access_token>

---

## Register

POST /register

Creates a user and automatically provisions a workspace (team + membership).

teamName is optional — if not provided, a default workspace name will be generated.


### Body

{
"email": "user@email.com",
"password": "password123",
"firstName": "John",
"lastName": "Doe",
"teamName": "My Team"
}



### Response

{
  "message": "Workspace created successfully",
  "user": {
    "id": "uuid",
    "email": "user@email.com"
  },
  "team": {
    "id": "uuid",
    "name": "My Team",
    "description": "Auto-created workspace",
    "created_at": "timestamp"
  }
}
---

## Login

POST /login

### Body

{
"email": "user@email.com",
"password": "password123"
}

### Response

- Returns access_token
- Store token in frontend

---

## Invite Member

POST /invite-member

### Headers

Authorization: Bearer <token>

### Body

{
"email": "member@email.com",
"role": "member"
}

### Notes

- Only owner/admin allowed



## Dashboard

---

### POST /dashboard

Returns full dashboard data for the authenticated user.

---

### Headers

Authorization: Bearer <access_token>  
Content-Type: application/json

---

### Body

No body required (user is derived from token or mocked in dev mode)

---

### Description

Fetches complete dashboard data for the logged-in user’s team.

This includes:

- Team details
- Team members
- Projects
- Tasks
- Aggregated statistics

Data is resolved via Supabase RPC:

get_full_dashboard(p_user_id uuid)

---

### Response

#### Success (200)

{
  "user": {
    "id": "uuid",
    "email": "dev@teamdesk.local"
  },
  "dashboard": {
    "team": {
      "id": "uuid",
      "name": "Dev Team",
      "description": "Seeded development team for dashboard testing",
      "created_at": "timestamp"
    },
    "members": [
      {
        "id": "uuid",
        "email": "user@email.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "admin"
      }
    ],
    "projects": [
      {
        "id": "uuid",
        "name": "Project Alpha",
        "description": "Example project",
        "created_at": "timestamp"
      }
    ],
    "tasks": [
      {
        "id": "uuid",
        "title": "Build dashboard UI",
        "status": "in_progress",
        "priority": "high",
        "due_date": "timestamp",
        "project_id": "uuid",
        "assignees": [
          {
            "id": "uuid",
            "name": "John Doe"
          }
        ]
      }
    ],
    "stats": {
      "total_projects": 1,
      "total_tasks": 5,
      "completed_tasks": 2
    }
  }
}

---

### Error Responses

#### 400 - User not assigned to any team

{
  "error": "User not assigned to any team"
}

---

#### 401 - Unauthorized

{
  "error": "Missing or invalid token"
}

---

#### 500 - Server Error

{
  "error": "Internal server error"
}

---

### Notes

- Requires valid user-session (unless in dev mock mode)
- Data is scoped per user team
- Uses PostgreSQL RPC for aggregation
- Safe to call repeatedly (no side effects)