# WhatsApp API Server

A modern, lightweight Node.js server that provides a RESTful interface to interact with WhatsApp services through the whatsapp-web.js library. This server enables programmatic authentication, message sending, and status checking with comprehensive security and error handling.

## 🚀 Features

- **RESTful API**: Simple HTTP endpoints for WhatsApp interactions
- **Authentication**: QR code-based WhatsApp Web login with persistent sessions
- **Message Sending**: Send text, image, video, and document messages to contacts
- **API Key Security**: Automatic API key generation with header/token authentication
- **Rate Limiting**: Built-in protection against API abuse
- **Input Validation**: Comprehensive request validation and sanitization
- **Modern UI**: Clean authentication interface with Tailwind CSS styling
- **File Upload Support**: Multipart and base64 media support
- **Comprehensive Logging**: Structured logging with Winston
- **Configurable**: Environment-based configuration system
- **Docker Ready**: Included Dockerfile for containerized deployment

## 📁 Project Structure

```
WhatsApp-APIs/
├── .env                   # Environment variables
├── .env.local             # Local environment (git-ignored)
├── .api_key               # Auto-generated API key (git-ignored)
├── index.html             # Authentication UI
├── index.js               # Application entry point
├── Dockerfile             # Container configuration
├── README.md              # This file
├── status.json            # Authentication status storage
├── config/                # Configuration files
├── logs/                  # Log files directory
├── session-data/          # WhatsApp session storage
├── src/
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Request processing
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   ├── validations/       # Request validation schemas
│   └── whatsappClient.js  # WhatsApp client wrapper
├── node_modules/          # Dependencies
└── package.json
```

## 🛠️ Prerequisites

- Node.js (version 14.x or higher)
- npm (comes with Node.js)
- Chrome/Chromium browser (required by Puppeteer)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd WhatsApp-APIs
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env .env.local  # Create local config file
# Edit .env.local with your custom settings
```

### 4. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000` by default.

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file to override default settings:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `WHATSAPP_CLIENT_NAME` | `whatsapp-api` | Session identifier |
| `WHATSAPP_SESSION_PATH` | `./session-data` | Session storage directory |
| `LOG_LEVEL` | `info` | Logging level (error, warn, info, debug) |
| `LOG_PATH` | `./logs` | Log files directory |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per IP per window |
| `DEFAULT_COUNTRY_CODE` | `1` | Default phone number country code |
| `NODE_ENV` | `development` | Environment mode |

### API Key Authentication

The server automatically generates an API key on first startup and displays it in the console. The key is stored securely in `.api_key` with restricted permissions.

## 🌐 API Endpoints

- `GET /` - Health check
- `GET /config/base-path` - Get base path configuration
- `GET /auth/status` - Check authentication status
- `GET /auth/qrcode` - Get QR code for WhatsApp authentication
- `GET /auth/qrcode/availability` - Check QR code availability
- `POST /message` - Send message (requires API key authentication)

## 🛡️ Security

### API Key Authentication
- API key automatically generated on first run
- Required for sending messages via `X-API-Key` header or `Authorization: Bearer` token
- Key stored with secure file permissions
- Key displayed in console on startup

### Rate Limiting
- Maximum 100 requests per 15 minutes per IP address
- Standard rate limit headers returned
- Customizable via environment variables

### Input Validation
- Comprehensive request validation using express-validator
- Phone number format validation
- Message length limits (4096 characters for text, file size limits for media)
- Sanitization of all inputs

## 🐳 Docker Deployment

### Build and Run Container
```bash
# Build the image
docker build -t whatsapp-api .

# Run the container
docker run -p 3000:3000 -v ./session-data:/app/session-data whatsapp-api
```

### Docker Compose Example
```yaml
version: '3.8'
services:
  whatsapp-api:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./session-data:/app/session-data
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - PORT=3000
```

## 🔧 Development

### Scripts
```bash
npm run dev          # Start development server with hot reload
npm start            # Start production server
npm run format       # Format code with Prettier
```

### Code Standards
- ES6+ JavaScript
- Consistent naming conventions
- Comprehensive JSDoc documentation
- Error handling best practices
- Consistent response formatting

### Testing
```bash
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

## 🔍 Troubleshooting

### WhatsApp Authentication Issues
1. Navigate to `/auth` and scan the QR code with your WhatsApp mobile app
2. Check logs in the `logs/` directory for detailed error messages
3. Verify session data exists in `session-data/` directory

### Session Persistence
- Sessions are stored in the `session-data/` directory
- To reset authentication: delete files in `session-data/`, restart app, and authenticate again

### API Key Issues
- The API key is automatically generated and displayed in the console on startup
- Use the key in requests via `X-API-Key` header or `Authorization: Bearer` token
- Key is stored in `.api_key` file with restricted permissions

## 🤝 Contributing

1. Fork the repository
2. Create a new branch for your feature: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions, issues, or contributions, please file an issue in the GitHub repository.

---

Built with ❤️ using Node.js, Express.js, and whatsapp-web.js