{
  "entities": {
    "User": {
      "title": "User Profile and Settings",
      "description": "User preferences and workspace configurations",
      "type": "object",
      "properties": {
        "uid": {
          "type": "string",
          "description": "Firebase Authentication User ID"
        },
        "email": {
          "type": "string",
          "description": "Email address of the user"
        },
        "hourlyRate": {
          "type": "number",
          "description": "Standard rate per hour of work"
        },
        "currency": {
          "type": "string",
          "description": "Currency symbol chosen by user"
        },
        "standardShiftDuration": {
          "type": "number",
          "description": "Standard shift length in hours"
        },
        "overtimeMultiplier": {
          "type": "number",
          "description": "Multiplier coefficient for overtime hours"
        },
        "weeklyGoalHours": {
          "type": "number",
          "description": "Target weekly work hours count"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time",
          "description": "Timestamp of the last update"
        }
      },
      "required": ["uid", "email", "hourlyRate", "currency", "standardShiftDuration", "overtimeMultiplier", "weeklyGoalHours", "updatedAt"]
    },
    "Shift": {
      "title": "Shift Entry",
      "description": "A daily work entry including regular and overtime hours",
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "Document ID which is the exact date string (YYYY-MM-DD)"
        },
        "date": {
          "type": "string",
          "description": "Shift calendar date in YYYY-MM-DD format"
        },
        "regularHours": {
          "type": "number",
          "description": "Regular hours worked (standard rate)"
        },
        "overtimeHours": {
          "type": "number",
          "description": "Overtime/extra hours worked (multiplier rate)"
        },
        "notes": {
          "type": "string",
          "description": "Optional notes or details for the shift"
        },
        "hourlyRate": {
          "type": "number",
          "description": "Hourly rate active at the time of entry"
        },
        "overtimeMultiplier": {
          "type": "number",
          "description": "Overtime multiplier active at the time of entry"
        },
        "isOvernight": {
          "type": "boolean",
          "description": "Whether the shift spans from evening to next morning (overnight shift)"
        },
        "userId": {
          "type": "string",
          "description": "Owner userId of the shift"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time",
          "description": "Creation timestamp of the record"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time",
          "description": "Last update timestamp of the record"
        }
      },
      "required": ["id", "date", "regularHours", "overtimeHours", "hourlyRate", "overtimeMultiplier", "userId", "createdAt", "updatedAt"]
    }
  },
  "firestore": {
    "users/{userId}": {
      "schema": "User",
      "description": "Config and settings details per user"
    },
    "users/{userId}/shifts/{shiftId}": {
      "schema": "Shift",
      "description": "Daily logged shifts for a specific user"
    }
  }
}
