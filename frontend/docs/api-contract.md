# API Contract v1

Base URL: `/api/v1`  
Format: `application/json`  
Timestamp format: ISO 8601 UTC

## Response Envelope

Success:

```json
{
  "success": true,
  "data": {},
  "message": "ok"
}
```

Validation Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "fields": {
      "phone": ["Invalid phone number"]
    }
  }
}
```

Paginated:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 12,
    "total": 42,
    "total_pages": 4
  }
}
```

## Endpoints

1. `GET /site-config`
2. `GET /program-levels`
3. `GET /program-levels/{slug}`
4. `GET /learning-modules`
5. `GET /worksheets?level=&subject=&difficulty=&page=`
6. `GET /teachers`
7. `GET /testimonials`
8. `GET /faqs`
9. `POST /inquiries`
10. `GET /announcements` (optional)
11. `POST /auth/login`
12. `POST /auth/logout` (token auth)
13. `GET/PATCH /students/profile` (token auth)

## Core Schemas

### ProgramLevel

```json
{
  "id": 1,
  "name": "Class 3",
  "slug": "class-3",
  "age_group": "8-9 years",
  "description": "Analytical thinking using stepwise worksheets",
  "subjects": ["English", "Math"],
  "learning_outcomes": ["Comprehension answers", "Multiplication mastery"],
  "display_order": 6
}
```

### Worksheet

```json
{
  "id": 14,
  "title": "Fractions Visual Set",
  "level_slug": "class-4",
  "subject": "Math",
  "difficulty": "Intermediate",
  "pages": 7,
  "preview_url": "https://cdn.example.com/previews/14.pdf",
  "file_url": "https://cdn.example.com/files/14.pdf",
  "is_public": true,
  "updated_at": "2026-02-17T08:40:00Z"
}
```

### Teacher

```json
{
  "id": 3,
  "full_name": "Neha Sinha",
  "photo_url": "https://cdn.example.com/teachers/neha.jpg",
  "subjects": ["Foundation", "English"],
  "experience_years": 8,
  "qualification": "M.Ed",
  "bio": "Foundation mentor for Nursery to UKG",
  "awards": ["Best Early Learning Mentor 2024"]
}
```

### Inquiry

Request:

```json
{
  "student_name": "Aarav Sharma",
  "guardian_name": "Riya Sharma",
  "phone": "+919876543210",
  "email": "riya@example.com",
  "target_class": "Class 2",
  "message": "Need support in reading and math fluency",
  "preferred_contact_time": "4:00 PM - 6:00 PM",
  "branch": "Sector 8"
}
```

### Student Login

Request:

```json
{
  "username": "student_demo",
  "password": "Student@123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "token": "92d8fd...",
    "student": {
      "username": "student_demo",
      "email": "aarav.student@example.com",
      "student_code": "KV-STU-001",
      "full_name": "Aarav Sharma"
    }
  },
  "message": "Login successful"
}
```

### Student Profile

```json
{
  "username": "student_demo",
  "email": "aarav.student@example.com",
  "student_code": "KV-STU-001",
  "full_name": "Aarav Sharma",
  "class_level": "Class 3",
  "section": "A",
  "date_of_birth": null,
  "guardian_name": "Riya Sharma",
  "guardian_phone": "+919876543210",
  "guardian_email": "riya.parent@example.com",
  "address": "Sunrise Enclave, Sector 8",
  "interests": ["Math puzzles", "Reading stories", "Science activities"],
  "goals": "Improve reading speed and word-problem accuracy.",
  "joined_on": "2026-02-17",
  "created_at": "2026-02-17T09:00:00Z",
  "updated_at": "2026-02-17T09:00:00Z"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": 88,
    "status": "new",
    "created_at": "2026-02-17T09:00:00Z"
  },
  "message": "Inquiry submitted"
}
```
