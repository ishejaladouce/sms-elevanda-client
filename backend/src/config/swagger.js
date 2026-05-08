// OpenAPI 3 specification for the SMS Elevanda Client API.
// We keep this hand-written so it is easy to read and maintain.

const okResponse = (label) => ({
  description: label,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/SuccessResponse" },
    },
  },
});

const errorResponse = (status, label) => ({
  description: label,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
    },
  },
});

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "SMS Elevanda - Client API",
    version: "1.0.0",
    description:
      "REST API for the parent and student portal. Authentication uses an httpOnly JWT cookie set on login. Each device must be verified by an admin before login is allowed.",
    contact: { name: "Elevanda Ventures", email: "careers@elevandaventures.com" },
  },
  servers: [
    { url: "http://localhost:5000", description: "Local development" },
  ],
  tags: [
    { name: "Health", description: "Service health checks" },
    { name: "Auth", description: "Register, log in, log out" },
    { name: "Profile", description: "Authenticated user details" },
    { name: "Fees", description: "Balance, history, deposits and refunds" },
    { name: "Academics", description: "Grades, attendance and timetable" },
    { name: "Notifications", description: "School updates" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "sms_token",
        description: "JWT issued on login, stored in an httpOnly cookie.",
      },
    },
    schemas: {
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "OK" },
          data: { type: "object", nullable: true },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Something went wrong" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password", "role", "deviceId"],
        properties: {
          name: { type: "string", minLength: 2, example: "Aline Uwase" },
          email: { type: "string", format: "email", example: "aline@example.com" },
          password: { type: "string", minLength: 6, example: "secret123" },
          role: { type: "string", enum: ["STUDENT", "PARENT"], example: "STUDENT" },
          deviceId: { type: "string", minLength: 3, example: "device-abc-123" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password", "deviceId"],
        properties: {
          email: { type: "string", format: "email", example: "aline@example.com" },
          password: { type: "string", example: "secret123" },
          deviceId: { type: "string", example: "device-abc-123" },
        },
      },
      DepositRequest: {
        type: "object",
        required: ["amount"],
        properties: {
          amount: { type: "number", minimum: 1, example: 50000 },
          note: { type: "string", nullable: true, example: "Term 2 fees" },
        },
      },
      WithdrawRequest: {
        type: "object",
        required: ["amount"],
        properties: {
          amount: { type: "number", minimum: 1, example: 10000 },
          note: { type: "string", nullable: true, example: "Refund for cancelled trip" },
        },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: { 200: okResponse("Server is up") },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a parent or student account",
        description:
          "Creates an account in pending state. An admin must verify the device before login is allowed.",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } },
          },
        },
        responses: {
          201: okResponse("Account created"),
          400: errorResponse(400, "Validation failed"),
          409: errorResponse(409, "Email already in use"),
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        description:
          "Validates email, password and device. On success an httpOnly JWT cookie is set and the user object is returned.",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } },
          },
        },
        responses: {
          200: okResponse("Logged in"),
          401: errorResponse(401, "Invalid email or password"),
          403: errorResponse(403, "Device not verified or device mismatch"),
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Log out",
        description: "Clears the auth cookie on the server side.",
        responses: { 200: okResponse("Logged out") },
      },
    },
    "/api/client/profile": {
      get: {
        tags: ["Profile"],
        summary: "Get the current user's profile",
        security: [{ cookieAuth: [] }],
        responses: {
          200: okResponse("Profile"),
          401: errorResponse(401, "Not authenticated"),
        },
      },
    },
    "/api/client/fees/balance": {
      get: {
        tags: ["Fees"],
        summary: "Current fee balance",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "studentId",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Parents only — pick a child by id.",
          },
        ],
        responses: { 200: okResponse("Balance"), 401: errorResponse(401, "Not authenticated") },
      },
    },
    "/api/client/fees/history": {
      get: {
        tags: ["Fees"],
        summary: "Fee transaction history",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "studentId",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Parents only — pick a child by id.",
          },
        ],
        responses: { 200: okResponse("Transactions") },
      },
    },
    "/api/client/fees/deposit": {
      post: {
        tags: ["Fees"],
        summary: "Make a fee deposit",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/DepositRequest" } },
          },
        },
        responses: {
          200: okResponse("Deposit recorded"),
          400: errorResponse(400, "Validation failed"),
        },
      },
    },
    "/api/client/fees/withdraw": {
      post: {
        tags: ["Fees"],
        summary: "Request a refund (withdrawal)",
        description: "Cannot exceed the current available balance.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/WithdrawRequest" } },
          },
        },
        responses: {
          200: okResponse("Refund recorded"),
          400: errorResponse(400, "Insufficient balance or invalid amount"),
        },
      },
    },
    "/api/client/grades": {
      get: {
        tags: ["Academics"],
        summary: "List grades",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "studentId", in: "query", required: false, schema: { type: "string" } },
          { name: "term", in: "query", required: false, schema: { type: "string" } },
          { name: "subject", in: "query", required: false, schema: { type: "string" } },
        ],
        responses: { 200: okResponse("Grades") },
      },
    },
    "/api/client/attendance": {
      get: {
        tags: ["Academics"],
        summary: "List attendance records",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "studentId", in: "query", required: false, schema: { type: "string" } },
          { name: "dateFrom", in: "query", required: false, schema: { type: "string", format: "date" } },
          { name: "dateTo", in: "query", required: false, schema: { type: "string", format: "date" } },
        ],
        responses: { 200: okResponse("Attendance") },
      },
    },
    "/api/client/timetable": {
      get: {
        tags: ["Academics"],
        summary: "Weekly timetable",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "studentId", in: "query", required: false, schema: { type: "string" } },
        ],
        responses: { 200: okResponse("Timetable") },
      },
    },
    "/api/client/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "List notifications for the current user",
        security: [{ cookieAuth: [] }],
        responses: { 200: okResponse("Notifications") },
      },
    },
  },
};
