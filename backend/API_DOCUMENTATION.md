# SlangSupport Backend API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "username": "username",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "username": "username",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "preferences": {
      "autoSpeak": false,
      "theme": "dark",
      "lastWordOfDay": "",
      "lastWordOfDayDate": ""
    }
  },
  "token": "jwt-token"
}
```

### User Management

#### GET /user/profile
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "username": "username",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "preferences": { ... },
    "_count": {
      "searchHistory": 10,
      "favorites": 5,
      "quizScores": 3
    }
  }
}
```

#### PUT /user/profile
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "username": "new-username",
  "email": "new-email@example.com"
}
```

#### DELETE /user/account
Delete user account and all associated data.

**Headers:** `Authorization: Bearer <token>`

### Search History

#### POST /search/save
Save a search to user's history.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "term": "slang-term",
  "meaning": "Definition of the term",
  "example": "Example sentence",
  "category": "Internet",
  "relatedTerms": [
    {
      "term": "related-term",
      "reason": "Similar meaning"
    }
  ]
}
```

#### GET /search/suggestions
Get search suggestions based on query.

**Query Parameters:**
- `q` (string): Search query

**Response:**
```json
{
  "suggestions": [
    {
      "term": "suggestion",
      "meaning": "Definition",
      "category": "Internet"
    }
  ]
}
```

#### GET /search/popular
Get popular terms across all users.

**Query Parameters:**
- `limit` (number): Number of results (default: 20)

### Favorites

#### GET /favorites
Get user's favorite terms.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)
- `search` (string): Search within favorites

**Response:**
```json
{
  "favorites": [
    {
      "id": "favorite-id",
      "term": "favorite-term",
      "meaning": "Definition",
      "example": "Example",
      "category": "Internet",
      "savedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

#### POST /favorites
Add a term to favorites.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "term": "favorite-term",
  "meaning": "Definition",
  "example": "Example",
  "category": "Internet"
}
```

#### DELETE /favorites/:term
Remove a term from favorites.

**Headers:** `Authorization: Bearer <token>`

#### GET /favorites/:term/check
Check if a term is favorited.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "isFavorited": true
}
```

#### DELETE /favorites
Clear all favorites.

**Headers:** `Authorization: Bearer <token>`

### Search History

#### GET /history
Get user's search history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)
- `search` (string): Search within history

#### DELETE /history/:id
Remove specific history item.

**Headers:** `Authorization: Bearer <token>`

#### DELETE /history
Clear all search history.

**Headers:** `Authorization: Bearer <token>`

#### GET /history/stats
Get search history statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "stats": {
    "totalSearches": 100,
    "todaySearches": 5,
    "categoryStats": [
      {
        "category": "Internet",
        "count": 50
      }
    ],
    "recentSearches": [...]
  }
}
```

### Quiz

#### POST /quiz/score
Save quiz score.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "score": 4,
  "total": 5
}
```

#### GET /quiz/scores
Get user's quiz scores.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

#### GET /quiz/stats
Get quiz statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "stats": {
    "totalQuizzes": 10,
    "averageScore": 80,
    "bestScore": {
      "score": 5,
      "total": 5,
      "percentage": 100,
      "date": "2024-01-01T00:00:00.000Z"
    },
    "recentScores": [...]
  }
}
```

#### GET /quiz/generate
Generate quiz questions from user's history and favorites.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (number): Number of questions (default: 5)

**Response:**
```json
{
  "questions": [
    {
      "term": "slang-term",
      "correctAnswer": "Correct definition",
      "options": ["Correct", "Wrong 1", "Wrong 2", "Wrong 3"],
      "definition": {
        "meaning": "Definition",
        "example": "Example",
        "category": "Internet"
      }
    }
  ]
}
```

### Preferences

#### GET /preferences
Get user preferences.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "preferences": {
    "id": "pref-id",
    "autoSpeak": false,
    "theme": "dark",
    "lastWordOfDay": "term",
    "lastWordOfDayDate": "2024-01-01",
    "userId": "user-id"
  }
}
```

#### PUT /preferences
Update user preferences.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "autoSpeak": true,
  "theme": "light",
  "lastWordOfDay": "new-term",
  "lastWordOfDayDate": "2024-01-02"
}
```

#### GET /preferences/export
Export all user data.

**Headers:** `Authorization: Bearer <token>`

**Response:** JSON file download

#### POST /preferences/import
Import user data from backup.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "data": {
    "version": "1.0",
    "user": {...},
    "searchHistory": [...],
    "favorites": [...],
    "quizScores": [...],
    "preferences": {...}
  }
}
```

#### DELETE /preferences/clear
Clear all user data.

**Headers:** `Authorization: Bearer <token>`

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate limited to 100 requests per 15 minutes per IP address.

## CORS

The API supports CORS for the configured frontend URL. Make sure to set the `FRONTEND_URL` environment variable correctly.
