# University Research Opportunity Portal

A full-stack web application that allows faculty members to post, view, update, and manage research opportunities in one centralised place — replacing scattered emails, WhatsApp groups, and noticeboards.

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | Node.js, Express.js                     |
| Database | MySQL                                   |
| Frontend | HTML5, CSS3, Bootstrap 5, JavaScript    |
| API      | RESTful JSON API                        |

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MySQL](https://www.mysql.com/) 8.0 or higher
- A MySQL client (MySQL Workbench, DBeaver, or CLI)

## Project Structure

```
research-opportunity-portal/
  backend/
    routes/
      opportunities.js   # CRUD route handlers
    db.js                # MySQL connection pool
    server.js            # Express app entry point
    package.json
    .env.example         # Template for environment variables
    .gitignore
  frontend/
    css/
      style.css          # Custom styles
    js/
      app.js             # Frontend logic (fetch API calls)
    index.html           # Single-page UI
  database/
    schema.sql           # Database and table definitions
  research-portal.postman_collection.json
  README.md
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/username/research-opportunity-portal
cd research-opportunity-portal
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Create the database

Open your MySQL client and run:

```bash
mysql -u root -p < ../database/schema.sql
```

Or paste the contents of `database/schema.sql` directly into MySQL Workbench.

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your MySQL credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=research_portal
PORT=3000
```

> ⚠️ **Never commit `.env` to version control.** It is listed in `.gitignore`.

### 5. Start the backend server

```bash
npm start
```

You should see: `Server running on port 3000`

### 6. Open the frontend

Open `frontend/index.html` directly in your browser (double-click or drag into Chrome/Firefox). No separate frontend server is required.

---

## API Endpoints

| Method | Route                       | Description                        | Status Codes         |
|--------|-----------------------------|------------------------------------|----------------------|
| POST   | `/api/opportunities`        | Create a new research opportunity  | 201, 400, 500        |
| GET    | `/api/opportunities`        | Retrieve all research opportunities| 200, 500             |
| GET    | `/api/opportunities/:id`    | Retrieve a single opportunity      | 200, 404, 500        |
| PUT    | `/api/opportunities/:id`    | Update an existing opportunity     | 200, 400, 404, 500   |
| DELETE | `/api/opportunities/:id`    | Delete a research opportunity      | 200, 404, 500        |

### Request Body (POST / PUT)

```json
{
  "title": "Machine Learning in Healthcare",
  "description": "Exploring ML for diagnostics...",
  "research_area": "Artificial Intelligence",
  "faculty_name": "Dr. Sarah Ahmed",
  "department": "Computer Science",
  "required_skills": "Python, TensorFlow",
  "available_positions": 3,
  "application_deadline": "2025-08-31",
  "status": "Open"
}
```

For PUT, only include the fields you want to update (partial updates are supported).

---

## API Testing (Postman)

Import `research-portal.postman_collection.json` into Postman:

1. Open Postman → **Import** → select the file.
2. Ensure the backend is running on `http://localhost:3000`.
3. Run the requests in order (1–10) to create, retrieve, update, close, delete, and validate error handling.

---

## GitHub Repository

```
https://github.com/username/research-opportunity-portal
```

> Replace `username` with your actual GitHub username before submission.

---

## Security Notes

- `.env` is listed in `.gitignore` — credentials are never committed.
- `.env.example` is committed as a template with placeholder values only.
- All database interactions use parameterised queries (`?` placeholders with `mysql2`) to prevent SQL injection.
