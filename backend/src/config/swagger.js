export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "SMS Elevanda Client API",
    version: "1.0.0"
  },
  servers: [{ url: "http://localhost:5000" }],
  paths: {
    "/api/health": {
      get: { summary: "Health check", responses: { 200: { description: "OK" } } }
    },
    "/api/auth/register": {
      post: { summary: "Register (parent/student) with deviceId", responses: { 201: { description: "Created" } } }
    },
    "/api/auth/login": {
      post: {
        summary: "Login (device must be verified)",
        responses: { 200: { description: "OK" }, 403: { description: "Device not verified" } }
      }
    },
    "/api/auth/logout": {
      post: { summary: "Logout (clears cookie)", responses: { 200: { description: "OK" } } }
    },
    "/api/client/profile": {
      get: { summary: "Client profile", responses: { 200: { description: "OK" } } }
    },
    "/api/client/fees/balance": {
      get: { summary: "Fee balance", responses: { 200: { description: "OK" } } }
    },
    "/api/client/fees/history": {
      get: { summary: "Fee history", responses: { 200: { description: "OK" } } }
    },
    "/api/client/fees/deposit": {
      post: { summary: "Deposit fees", responses: { 200: { description: "OK" } } }
    },
    "/api/client/fees/withdraw": {
      post: { summary: "Withdraw fees", responses: { 200: { description: "OK" } } }
    },
    "/api/client/grades": {
      get: { summary: "Grades", responses: { 200: { description: "OK" } } }
    },
    "/api/client/attendance": {
      get: { summary: "Attendance", responses: { 200: { description: "OK" } } }
    },
    "/api/client/timetable": {
      get: { summary: "Timetable", responses: { 200: { description: "OK" } } }
    },
    "/api/client/notifications": {
      get: { summary: "Notifications", responses: { 200: { description: "OK" } } }
    }
  }
};

