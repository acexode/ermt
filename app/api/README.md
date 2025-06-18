# API Documentation

## Authentication

All API endpoints require authentication using a Bearer token. Include the token in the Authorization header:

```http
Authorization: Bearer <your-token>
```

## Endpoints

### Providers

#### GET /api/providers
Get all providers.

**Response**
```json
[
  {
    "id": "string",
    "name": "string",
    "departments": [
      {
        "id": "string",
        "name": "string"
      }
    ]
  }
]
```

#### POST /api/providers
Create a new provider. Requires SUPERADMIN role.

**Request Body**
```json
{
  "name": "string"
}
```

#### PATCH /api/providers
Update a provider. Requires SUPERADMIN role.

**Request Body**
```json
{
  "id": "string",
  "name": "string"
}
```

#### DELETE /api/providers?id={id}
Delete a provider. Requires SUPERADMIN role.

### Departments

#### GET /api/departments
Get all departments.

**Response**
```json
[
  {
    "id": "string",
    "name": "string",
    "provider": {
      "id": "string",
      "name": "string"
    },
    "sections": [
      {
        "id": "string",
        "name": "string"
      }
    ]
  }
]
```

#### POST /api/departments
Create a new department. Requires SUPERADMIN role.

**Request Body**
```json
{
  "name": "string",
  "providerId": "string"
}
```

#### PATCH /api/departments
Update a department. Requires SUPERADMIN role.

**Request Body**
```json
{
  "id": "string",
  "name": "string",
  "providerId": "string"
}
```

#### DELETE /api/departments?id={id}
Delete a department. Requires SUPERADMIN role.

### Sections

#### GET /api/sections
Get all sections.

**Response**
```json
[
  {
    "id": "string",
    "name": "string",
    "department": {
      "id": "string",
      "name": "string",
      "provider": {
        "id": "string",
        "name": "string"
      }
    },
    "disciplines": [
      {
        "id": "string",
        "name": "string"
      }
    ]
  }
]
```

#### POST /api/sections
Create a new section. Requires SUPERADMIN role.

**Request Body**
```json
{
  "name": "string",
  "departmentId": "string"
}
```

#### PATCH /api/sections
Update a section. Requires SUPERADMIN role.

**Request Body**
```json
{
  "id": "string",
  "name": "string",
  "departmentId": "string"
}
```

#### DELETE /api/sections?id={id}
Delete a section. Requires SUPERADMIN role.

### Disciplines

#### GET /api/disciplines
Get all disciplines.

**Response**
```json
[
  {
    "id": "string",
    "name": "string",
    "section": {
      "id": "string",
      "name": "string",
      "department": {
        "id": "string",
        "name": "string",
        "provider": {
          "id": "string",
          "name": "string"
        }
      }
    }
  }
]
```

#### POST /api/disciplines
Create a new discipline. Requires SUPERADMIN role.

**Request Body**
```json
{
  "name": "string",
  "sectionId": "string"
}
```

#### PATCH /api/disciplines
Update a discipline. Requires SUPERADMIN role.

**Request Body**
```json
{
  "id": "string",
  "name": "string",
  "sectionId": "string"
}
```

#### DELETE /api/disciplines?id={id}
Delete a discipline. Requires SUPERADMIN role.

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal Server Error"
}
``` 
