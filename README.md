# WhatsApp API Server

Welcome to the WhatsApp API Server, a lightweight and efficient server application built with Node.js and Express.js. This server provides a simple interface to interact with WhatsApp services through a set of RESTful APIs using the latest whatsapp-web.js library.

## Features

- **Authentication API** for logging into WhatsApp with persistent sessions.
- **Status API** to check the login status of the WhatsApp account.
- **Message Sending API** to send messages with customizable phone numbers and messages.
- **Session Persistence** using LocalAuth strategy for seamless reconnection.
- **Rate Limiting** to prevent API abuse.
- **Input Validation** for secure and reliable message sending.
- **Comprehensive Logging** with Winston for monitoring and debugging.
- **Error Handling** with consistent response formats.
- **Modern UI for Authentication** with Tailwind CSS styling.
- **Fixed Header and Footer** for improved UX.
- **QR Code Availability Checking** to prevent confusion with example QR codes.
- **API Key Authentication** for securing API endpoints with automatic key generation.
- **Proper Phone Number Formatting** with WhatsApp-specific formatting for reliable message delivery.

## Project Structure

```
WhatsApp-APIs/
├── .env                    # Environment variables
├── .gitignore
├── .prettierrc
├── Dockerfile
├── index.html              # Updated authentication page with Tailwind CSS
├── index.js               # Application entry point
├── package.json
├── README.md              # This file
├── status.json            # Authentication status storage
├── .api_key               # API key storage (not tracked in git)
├── Postman/
│   ├── postman.json       # Postman collection
│   └── WhatsApp-APIs.postman_environment.json # Postman environment
├── config/
│   ├── default.js         # Configuration management
│   └── security.js        # Security configuration
├── logs/                  # Log files directory
├── node_modules/          # Dependencies
├── session-data/          # Session storage directory
└── src/
    ├── config/
    │   └── default.js      # Configuration management
    ├── controllers/
    │   ├── authController.js    # Authentication controller (updated)
    │   └── messageController.js # Message controller
    ├── middleware/
    │   ├── auth.js              # Authentication middleware
    │   ├── errorHandler.js      # Error handling middleware
    │   ├── logger.js            # Logging middleware
    │   ├── rateLimiter.js       # Rate limiting middleware
    │   └── validation.js        # Validation middleware
    ├── routes/
    │   └── apiRoutes.js         # API route definitions (updated)
    ├── services/
    │   ├── authService.js       # Authentication service (updated)
    │   └── messageService.js    # Message service
    ├── utils/
    │   ├── errors.js            # Error utility functions
    │   ├── logger.js            # Logging utility
    │   └── utils.js             # General utility functions
    ├── validations/
    │   └── messageValidation.js # Request validation schemas
    └── whatsappClient.js        # WhatsApp client wrapper (updated)
```

## Getting Started

### Prerequisites

- Node.js (version 14.x or higher)
- npm (comes with Node.js)
- Chrome/Chromium browser (required by Puppeteer)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd WhatsApp-APIs
```

2. Install dependencies:
```bash
npm install
```

3. Create and configure environment variables:
```bash
cp .env .env.local
```

4. Start the development server:
```bash
npm run dev
```

5. Or start the production server:
```bash
npm start
```

## Configuration

The application uses environment variables for configuration. The system looks for environment files in this order: `.env.local` then `.env`.

### For Development:
1. Copy the example file: `cp .env .env.local`
2. Update values in `.env.local` with your specific configuration
3. Add `.env.local` to your `.gitignore` (already done)

### Environment Variables:
See `.env` file for all configurable options:

- `PORT`: Server port (default: 3000)
- `WHATSAPP_CLIENT_NAME`: Client session name
- `WHATSAPP_SESSION_PATH`: Directory for session storage
- `LOG_LEVEL`: Logging level (error, warn, info, debug)
- `LOG_PATH`: Directory for log files
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per IP per window
- `DEFAULT_COUNTRY_CODE`: Default country code for phone numbers

### API Key Configuration
- The API key is automatically generated on first startup and stored in `.api_key` file
- Displayed in console on server startup for both new and existing keys
- Required for the `/message` endpoint

## API Documentation

The complete API documentation is available in this README.

### Base URL
```
http://localhost:3000
```

### Available Endpoints

#### GET /
Health check endpoint.
- **Response**: `{"success": true, "message": "WhatsApp API is working"}`

#### GET /config/base-path
Get the current base path configuration.
- **Response**: `{"basePath": "configured_base_path"}`

#### GET /auth/status
Check WhatsApp authentication status.
- **Response**: Authentication status information

#### GET /auth/qrcode
Get QR code for WhatsApp authentication.
- **Response**: QR code string for authentication

#### GET /auth/qrcode/availability
Check if QR code is currently available.
- **Response**: QR code availability status

#### POST /message
Send a message to a WhatsApp number. Requires API key authentication.
- **Headers**: `X-API-Key` or `Authorization: Bearer <api_key>`
- **Request Body**:
  - `phoneNumber` or `num` (required): Phone number in international format (e.g., +1234567890)
  - `message` or `msg` (required): Message content (max 4096 characters)
- **Response**: Message sent confirmation with message ID

## Updated Features

### 1. Modern Authentication UI with Tailwind CSS
- Complete redesign of the authentication page (`index.html`)
- Responsive layout with Tailwind CSS styling
- Animated elements and visual indicators
- Improved user experience with clear instructions
- Fixed header and footer for consistent navigation

### 2. QR Code Availability System
- New endpoint `/auth/qrcode/availability` to check if QR code is ready
- Client-side polling for QR code availability
- Loading state shown while QR code is generating
- Eliminates confusion with example QR codes
- Only displays actual QR code when available from the WhatsApp client

### 3. Fixed Header and Footer
- Header fixed at the top of the page
- Footer fixed at the bottom of the page
- Improved navigation experience
- Better content spacing with padding adjustments
- Consistent UI elements accessible at all times

### 4. Enhanced User Experience
- Initial loading state with spinner animation
- Clear status messages throughout the authentication process
- Better error handling and user feedback
- Improved visual design with WhatsApp-inspired color scheme

### 5. API Key Authentication
- Automatic API key generation on first startup
- API key displayed in console on server startup
- API key stored securely with restricted file permissions
- Support for both `X-API-Key` header and `Authorization: Bearer` token

### 6. WhatsApp Client Improvements
- Fixed client initialization bug that was setting authentication to false
- Proper phone number formatting for reliable message delivery
- Better synchronization between in-memory and file-based authentication status
- Improved error handling with more detailed logging

## Architecture

This project follows modern Node.js and Express.js best practices:

- **Service-Oriented Architecture**: Separation of concerns with controllers, services, and middleware
- **Environment Configuration**: Centralized configuration management
- **Error Handling**: Consistent error response format with centralized error handling
- **Input Validation**: Comprehensive request validation using express-validator
- **Rate Limiting**: Protection against API abuse
- **Logging**: Structured logging with Winston
- **Session Management**: Persistent WhatsApp sessions with LocalAuth
- **Frontend Enhancement**: Modern UI with Tailwind CSS and improved UX
- **Security**: API key authentication with secure storage

## Security Features

- API key authentication with secure storage
- Input validation and sanitization
- Rate limiting per IP address
- Session persistence with secure storage
- Error message sanitization
- Authentication via WhatsApp Web QR code scanning

## Development

### Scripts

- `npm run dev`: Start development server with auto-restart
- `npm start`: Start production server
- `npm run format`: Format code with Prettier

### Code Standards

- ES6+ JavaScript
- Consistent naming conventions
- Comprehensive JSDoc documentation
- Error handling best practices

## Testing

Testing framework setup is planned for future releases.

## Deployment

### Docker

A Dockerfile is included for containerized deployment:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables

Ensure the following environment variables are set in production:

- `NODE_ENV=production`
- Appropriate values for all configuration variables (using `.env` in production, `.env.local` is for development)

## Troubleshooting

### WhatsApp Authentication Issues
If the WhatsApp client is not connecting:
1. Navigate to `/auth` and scan the QR code
2. Check logs in the `logs/` directory
3. Verify session data in `session-data/` directory

### Session Persistence
Sessions are stored in the `session-data/` directory. To reset authentication:
1. Delete files in `session-data/` directory
2. Restart the application
3. Authenticate again via `/auth` endpoint

### API Key Issues
- The API key is automatically generated and displayed in the console on startup
- For existing installations, the key is displayed as well
- Use the key in your requests via the `X-API-Key` header or `Authorization: Bearer` token

## Contributing

Contributions are always welcome! Please follow these steps to contribute:
1. Fork the project.
2. Create a new branch for your changes.
3. Make the changes and test them thoroughly.
4. Commit your changes with a descriptive message.
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## API Specification

## Table of Contents

1. [Overview](#api-overview)
2. [Base URL](#base-url)
3. [Authentication](#api-authentication)
4. [Rate Limiting](#rate-limiting)
5. [Error Handling](#api-error-handling)
6. [API Endpoints](#api-endpoints)
7. [Response Format](#response-format)
8. [Validation Rules](#validation-rules)

### API Overview

This document describes the WhatsApp API Server, a RESTful API built with Node.js and Express.js that provides a simple interface to interact with WhatsApp services through the whatsapp-web.js library.

#### Version
- API Version: 1.0.0
- Library: whatsapp-web.js v1.34.1

#### Contact Information
- Maintainer: jaydennlemc
- Project: WhatsApp API Server

### Base URL

```
http://localhost:3000
```

*Note: Port can be configured via environment variables*

### API Authentication

The API requires authentication for the message endpoint via API keys. The WhatsApp Web client needs to be authenticated via QR code scanning before sending messages.

#### API Key Authentication
- Required for `/message` endpoint
- Can be provided via `X-API-Key` header
- Can be provided via `Authorization: Bearer <api_key>` header
- API key is automatically generated on first startup and displayed in console
- API key is stored securely in `.api_key` file with restricted permissions

#### Session Persistence
- Sessions are persisted locally using `LocalAuth` strategy
- Session data is stored in `./session-data` directory
- Authentication status is checked before sending messages

### API Error Handling

The API follows consistent error response format:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "ISO 8601 timestamp"
}
```

#### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input parameters |
| 401 | Unauthorized - Missing or invalid API key |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### API Endpoints

#### Health Check

##### GET /
Returns API health status.

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp API is working",
  "timestamp": "2025-10-05T14:48:00.000Z"
}
```

#### Configuration

##### GET /config/base-path
Returns the current base path configuration.

**Response:**
```json
{
  "basePath": "configured_base_path"
}
```

#### Check Authentication Status

##### GET /auth/status
Checks if the WhatsApp Web client is authenticated.

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp authenticated",
  "data": {
    "authenticated": true
  },
  "timestamp": "2025-10-05T14:48:00.000Z"
}
```

**Unauthenticated Response:**
```json
{
  "success": true,
  "message": "WhatsApp not authenticated",
  "data": {
    "authenticated": false
  },
  "timestamp": "2025-10-05T14:48:00.000Z"
}
```

#### Get Authentication QR Code

##### GET /auth/qrcode
Returns the QR code string for WhatsApp authentication.

**Response:**
- Returns QR code string
- The QR code can be used to generate a QR image for scanning
- When scanned and authenticated, session is stored and subsequent requests work

**Response Example:**
- HTTP 200 OK
- Content-Type: text/plain
- Returns a QR code string that can be used to generate a QR code image

#### Check QR Code Availability

##### GET /auth/qrcode/availability
Checks if a QR code is currently available for authentication.

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCodeAvailable": true,
    "qrCode": "QR_CODE_STRING_HERE"
  },
  "timestamp": "2025-10-05T14:48:00.000Z"
}
```

**Not Available Response:**
```json
{
  "success": true,
  "data": {
    "qrCodeAvailable": false,
    "qrCode": null
  },
  "timestamp": "2025-10-05T14:48:00.000Z"
}
```

#### Send Message

##### POST /message
Sends a message to a specified phone number. Requires API key authentication.

**Headers:**
- `X-API-Key: <your-api-key>` OR `Authorization: Bearer <your-api-key>`
- `Content-Type: application/json`

**Request Body:**
- `phoneNumber` or `num` (required): Phone number in international format (e.g., +1234567890)
- `message` or `msg` (required): Message content (max 4096 characters)

**Request Examples:**

Text Message:
```json
POST /message
{
  "phoneNumber": "+1234567890",
  "message": "Hello World"
}
```

Alternative Text Message:
```json
POST /message
{
  "num": "+1234567890",
  "msg": "Hello World"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "true_1234567890@c.us_ABCDEF0123456789",
    "phone": "+1234567890",
    "message": "Hello World"
  },
  "timestamp": "2025-10-05T14:48:00.000Z"
}
```

**Error Response - Invalid Parameters:**
```json
{
  "success": false,
  "message": "Phone number is required, Message content is required",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Phone number is required",
      "path": "num"
    }
  ],
  "timestamp": "2025-10-05T14:48:00.000Z"
}
```

**Error Response - Client Not Ready:**
```json
{
  "success": false,
  "error": "Client is not ready",
  "timestamp": "2025-10-05T14:48:00.000Z"
}
```

**Error Response - Unauthorized:**
```json
{
  "success": false,
  "error": "Unauthorized: Invalid or missing API key",
  "code": "AUTH_001",
  "timestamp": "2025-10-05T14:48:00.000Z"
}
```

### Response Format

All API responses follow a consistent structure:

#### Success Response
```json
{
  "success": true,
  "message": "Descriptive message",
  "data": { /* Optional data */ },
  "timestamp": "ISO 8601 timestamp"
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "ISO 8601 timestamp"
}
```

### Validation Rules

#### Phone Number Validation
- Must be in international format (e.g., +1234567890)
- Must match WhatsApp format internally after processing
- Cannot be empty

#### Message Content Validation
- Cannot be empty
- Maximum length: 4096 characters
- Accepts all standard text characters

#### Rate Limiting
- Maximum 100 requests per 15 minutes per IP address
- Excessive requests return 429 status code

### Common Errors

#### Authentication Required
- **Status Code**: 401
- **Error**: "Unauthorized: Invalid or missing API key"
- **Cause**: Missing or invalid API key in request
- **Resolution**: Provide valid API key in `X-API-Key` header or `Authorization: Bearer` token

#### Authentication Required for WhatsApp
- **Status Code**: 500
- **Error**: "Client is not ready"
- **Cause**: WhatsApp client not authenticated or session expired
- **Resolution**: Navigate to `/auth` endpoint and scan QR code

#### Invalid Parameters
- **Status Code**: 400
- **Error**: Validation error messages
- **Cause**: Missing or invalid parameters in request
- **Resolution**: Check parameter format as per specification

#### Rate Limit Exceeded
- **Status Code**: 429
- **Error**: "Too many requests from this IP, please try again later."
- **Cause**: Exceeded rate limit of 100 requests per 15 minutes
- **Resolution**: Wait for the rate limit window to reset

### Testing Endpoints

#### Example cURL Commands

**Health Check:**
```bash
curl -X GET http://localhost:3000/
```

**Configuration:**
```bash
curl -X GET http://localhost:3000/config/base-path
```

**Check Status:**
```bash
curl -X GET http://localhost:3000/auth/status
```

**Get QR Code:**
```bash
curl -X GET http://localhost:3000/auth/qrcode
```

**Check QR Code Availability:**
```bash
curl -X GET http://localhost:3000/auth/qrcode/availability
```

**Send Message:**
```bash
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -d '{"phoneNumber": "+1234567890", "message": "Hello World"}'
```

**Send Message with Authorization Header:**
```bash
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{"phoneNumber": "+1234567890", "message": "Hello World"}'
```

### Security Considerations

1. **API Key Required**: Message endpoint requires authentication via API key
2. **Secure Storage**: API keys stored with restricted file permissions
3. **Rate Limiting**: API is protected by rate limiting to prevent abuse
4. **Input Validation**: All inputs are validated to prevent injection attacks
5. **Session Management**: WhatsApp sessions are managed securely with the library's built-in session persistence

## Technical Specification

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Directory Structure](#directory-structure)
5. [Core Components](#core-components)
6. [Configuration](#configuration)
7. [Security](#security)
8. [Performance and Optimization](#performance-and-optimization)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Testing Strategy](#testing-strategy)
11. [Deployment](#deployment)
12. [Maintenance](#maintenance)

### Project Overview

#### Purpose
The WhatsApp API Server is designed to provide a simple RESTful interface to interact with WhatsApp services using the whatsapp-web.js library. It allows users to authenticate with WhatsApp, check authentication status, and send messages programmatically.

#### Objective
- Provide a lightweight and efficient server for WhatsApp automation
- Offer a simple REST API interface for external applications
- Ensure reliable session persistence and authentication
- Implement proper error handling and logging
- Follow Node.js and Express.js best practices
- Provide an improved UI/UX with Tailwind CSS and fixed layout
- Implement QR code availability checks to prevent user confusion
- Secure API endpoints with automatic API key generation

### Architecture

#### Architecture Pattern
The application follows a **Service-Oriented Architecture (SOA)** with clear separation of concerns:

- **Controller Layer**: Handles HTTP requests and responses
- **Service Layer**: Contains business logic and application operations
- **Client Layer**: Manages WhatsApp Web client communication
- **Utility Layer**: Provides helper functions and cross-cutting concerns
- **Middleware Layer**: Handles cross-cutting concerns like validation, logging, and error handling

#### Data Flow
```
Client Request → Middleware (Validation/Logging) → Controller → Service → WhatsApp Client → Response
```

#### Component Interaction
- Controllers receive HTTP requests and delegate to services
- Services contain business logic and interact with WhatsApp client
- WhatsApp client manages the connection to WhatsApp Web
- Middleware handles cross-cutting concerns
- Configuration and utilities provide common functionality

### Technology Stack

#### Backend Framework
- **Node.js**: JavaScript runtime environment (v14.x or higher)
- **Express.js**: Web application framework for Node.js

#### Core Dependencies
- **whatsapp-web.js**: v1.34.1 - Library for interacting with WhatsApp Web
- **puppeteer**: Automation engine used by whatsapp-web.js
- **express-rate-limit**: Rate limiting middleware
- **express-validator**: Request validation middleware
- **winston**: Logging library
- **dotenv**: Environment variable management
- **Tailwind CSS**: Frontend styling framework (via CDN)

#### Development Dependencies
- **nodemon**: Development server with auto-restart
- **prettier**: Code formatting tool

#### Infrastructure Components
- **Puppeteer**: Headless Chrome/Chromium automation
- **Session Storage**: Local file-based session persistence
- **File System**: Configuration files and logs

### API Endpoints (Updated)

#### Health Check
- **GET /** - Returns API health status

#### Configuration
- **GET /config/base-path** - Returns current base path configuration

#### Authentication Endpoints
- **GET /auth/status** - Check WhatsApp authentication status
- **GET /auth/qrcode** - Get QR code for WhatsApp authentication
- **GET /auth/qrcode/availability** - Check if QR code is currently available

#### Messaging Endpoints
- **POST /message** - Send a message to a WhatsApp number
  - Requires API key authentication via `X-API-Key` header or `Authorization: Bearer` token
  - Supports both request body parameters: `phoneNumber` or `num` for phone number
  - Supports both request body parameters: `message` or `msg` for message content
  - Improved RESTful design using POST method for creating messages
  - Proper WhatsApp-specific phone number formatting (e.g., +85266433253 becomes 85266433253@c.us)

### Core Components

#### 1. Application Entry Point (index.js)

**Purpose**: Main application bootstrap and server initialization
- Loads environment variables using dotenv
- Configures Express application with middleware
- Sets up routes and error handling
- Initializes WhatsApp client with proper API key display
- Starts HTTP server

**Key Features**:
- Configuration-driven server setup
- Middleware pipeline initialization
- Centralized error handling
- Automatic API key generation and display
- Proper application lifecycle management

#### 2. WhatsApp Client (whatsappClient.js)

**Purpose**: Wrapper around whatsapp-web.js library with enhanced functionality
- Session management with LocalAuth
- Event handling for authentication and messages
- Error handling and retry logic
- Message sending with proper phone number formatting
- Connection state management
- Fixed client initialization bug that was setting authentication to false

**Key Features**:
- Persistent session storage
- Comprehensive event handling
- Robust error handling and logging
- Proper client initialization and state management
- Message acknowledgment tracking
- QR code availability tracking
- WhatsApp-specific phone number formatting

#### 3. Configuration Management (config/default.js)

**Purpose**: Centralized application configuration
- Environment variable parsing
- Default value fallbacks
- Configuration validation
- Environment-specific settings

**Key Features**:
- Centralized configuration access
- Environment-based configuration
- Type validation for configuration values
- Sensible default values

#### 4. Middleware Layer

##### Error Handler (middleware/errorHandler.js)
- Custom error class (AppError)
- Centralized error response formatting
- Operational vs. programmer error distinction
- Development vs. production error handling

##### Rate Limiter (middleware/rateLimiter.js)
- IP-based request limiting
- Configurable limits
- Standard headers for rate limit information
- Prevention of abuse

##### Request Logger (middleware/logger.js)
- Request/response logging
- Performance timing
- Metadata collection
- Integration with Winston logging

##### Authentication (middleware/auth.js)
- API key validation
- Support for both `X-API-Key` header and `Authorization: Bearer` token
- Secure API key storage and retrieval
- Proper error responses for unauthorized requests

##### Validation (middleware/validation.js)
- Express-validator result processing
- Consistent error response format
- Request parameter validation

#### 5. Service Layer

##### Message Service (services/messageService.js)
- Business logic for message operations
- Input validation and sanitization
- Error handling and logging
- Integration with WhatsApp client

##### Authentication Service (services/authService.js)
- Authentication status checking
- QR code retrieval
- QR code availability checking
- Session management abstraction
- Error handling and logging

#### 6. Controllers

##### Authentication Controller (controllers/authController.js)
- HTTP interface for authentication endpoints
- Request/response formatting
- Service integration
- Error propagation to middleware
- New endpoints for QR code availability

##### Message Controller (controllers/messageController.js)
- HTTP interface for message endpoints
- Request/response formatting
- Service integration
- Error propagation to middleware
- Support for multiple parameter names (phoneNumber/num, message/msg)
- API key authentication integration

#### 7. Route Definitions (routes/apiRoutes.js)

**Purpose**: API route configuration and validation
- Route definition and mapping for RESTful endpoints
- Request validation middleware
- Controller method assignment
- Response formatting
- Support for both legacy and new parameter names for backward compatibility
- New routes for QR code availability checks
- API key authentication protection for message endpoint

### Configuration

#### Environment Variables

The application uses environment variables for configuration with the following priority order:
1. `.env.local` (for local development, not tracked in git)
2. `.env` (example file, tracked in git)

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| WHATSAPP_CLIENT_NAME | whatsapp-api | WhatsApp client session identifier |
| WHATSAPP_SESSION_PATH | ./session-data | Directory for session storage |
| LOG_LEVEL | info | Logging level (error, warn, info, debug) |
| LOG_PATH | ./logs | Directory for log files |
| RATE_LIMIT_WINDOW_MS | 900000 | Rate limit window in milliseconds (15 minutes) |
| RATE_LIMIT_MAX_REQUESTS | 100 | Max requests per IP per window |
| DEFAULT_COUNTRY_CODE | 1 | Default country code for phone numbers |

#### Configuration File (config/default.js)

- Centralized configuration object
- Type-safe access to configuration values
- Default value fallbacks
- Environment variable precedence

### Security

#### Authentication
- WhatsApp Web authentication via QR code scanning
- Session persistence with LocalAuth strategy
- API key authentication for message endpoint
- Automatic API key generation on first startup
- API key stored with restricted file permissions

#### Input Validation
- Express-validator for parameter validation
- Phone number format validation
- Message length limits
- Type checking for all inputs

#### Rate Limiting
- IP-based request limiting
- Configurable limits
- Standard rate limit headers
- Prevention of API abuse

#### Security Headers
- Helmet.js integration (future enhancement)
- XSS protection (future enhancement)
- Content security policy (future enhancement)

#### Session Security
- Local session storage with LocalAuth
- Session data isolation
- No session data in transit

#### Data Validation
- Server-side validation of all inputs
- Prevention of injection attacks
- Sanitization of user inputs

### Performance and Optimization

#### Caching
- Session caching with LocalAuth
- Client connection reuse
- Memory optimization for Puppeteer

#### Resource Management
- Proper cleanup of Puppeteer resources
- Efficient session management
- Memory leak prevention

#### Performance Monitoring
- Request timing measurements
- Performance bottlenecks identification
- Resource usage tracking

#### Scalability Considerations
- Single WhatsApp account per instance
- Potential for multiple client instances
- Load balancing possibilities

### Monitoring and Logging

#### Logging Levels
- **Error**: Critical issues and failures
- **Warn**: Warning conditions and potential issues
- **Info**: General operational information
- **Debug**: Detailed debugging information

#### Log File Management
- Separate error and combined log files
- Log rotation with size limits
- Configurable log directory
- Structured JSON logging

#### Log Content
- Timestamps for all events
- Request/response details
- Error stack traces
- Performance metrics
- Session state information

#### Monitoring Features
- Request logging with metadata
- Error tracking and alerting
- Performance timing
- Authentication event logging

### Testing Strategy

#### Unit Testing
- Individual function testing
- Service layer testing
- Utility function testing
- Middleware testing

#### Integration Testing
- API endpoint testing
- End-to-end functionality testing
- WhatsApp client integration
- Database interaction testing (future)

#### Test Frameworks
- Jest (recommended)
- Supertest for API testing
- Puppeteer for browser testing (if needed)

#### Test Coverage
- Core functionality testing
- Error condition testing
- Performance testing
- Security testing

### Deployment

#### Prerequisites
- Node.js (v14.x or higher)
- npm package manager
- Chrome/Chromium browser (for Puppeteer)

#### Deployment Steps
1. Install dependencies: `npm install`
2. Set environment variables
3. Start application: `npm start` or `node index.js`
4. For development: `npm run dev`

#### Docker Deployment
- Dockerfile included in project
- Multi-stage build (future enhancement)
- Environment variable support
- Volume mapping for session data

#### Environment Configuration
- Development: Verbose logging, auto-restart
- Production: Optimized for performance, minimal logging
- Testing: In-memory database, mocked services

### Maintenance

#### Session Management
- Automatic session persistence
- Session cleanup procedures
- Session status monitoring
- Multiple device conflict handling

#### Log Management
- Log rotation and archival
- Log analysis tools
- Performance monitoring
- Error tracking and resolution

#### Updates and Patches
- Semantic versioning
- Dependency update procedures
- Breaking change management
- Backward compatibility considerations

#### Backup and Recovery
- Session data backup
- Log file backup
- Configuration backup
- Recovery procedures

#### Performance Optimization
- Regular performance monitoring
- Memory usage optimization
- Response time improvements
- Database query optimization (future)

### Development Guidelines

#### Code Standards
- ESLint for code linting
- Prettier for code formatting
- Semantic versioning
- Git workflow conventions

#### Documentation Standards
- JSDoc for function documentation
- README updates for new features
- API documentation maintenance
- Architecture decision records

#### Error Handling
- Consistent error response format
- Proper error propagation
- Operational error identification
- User-friendly error messages

#### Testing Requirements
- Unit test coverage for all functions
- Integration test coverage for all endpoints
- Performance testing for critical paths
- Security testing for all inputs

This technical specification serves as a comprehensive reference for the WhatsApp API Server's architecture, components, and operational characteristics. It should be updated when major changes are made to the system architecture or functionality.

---

Feel free to reach out for any questions or suggestions. Happy coding!