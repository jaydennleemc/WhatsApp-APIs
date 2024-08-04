# WhatsApp API Server

Welcome to the WhatsApp API Server, a lightweight and efficient server application built with Node.js and Express.js. This server provides a simple interface to interact with WhatsApp services through a set of RESTful APIs.

## Features

- **Authentication API** for logging into WhatsApp.
- **Status API** to check the login status of the WhatsApp account.
- **Message Sending API** to send messages with customizable phone numbers and messages.

## Getting Started

### Prerequisites

- Node.js (version 14.x or higher)
- npm (comes with Node.js)


## API Documentation

### /auth - Authenticate

**GET** `/auth`
- Authenticates the user with WhatsApp.

**Response:**
- `200 OK` Scan the QR Code to authenticated WhatsApp.

### /status - Check Status

**GET** `/status`
- Checks if the user is logged into WhatsApp.

**Response:**
- `200 OK` with the current login status.

### /send - Send Message

**GET** `/send`
- Sends a message to a specified phone number.

**Request Parameters:**
- `num` (string): The phone number to send the message to.
- `msg` (string): The message content.

**Response:**
- `200 OK` with a success message and the message details.

## Contributing

Contributions are always welcome! Please follow these steps to contribute:
1. Fork the project.
2. Create a new branch for your changes.
3. Make the changes and test them thoroughly.
4. Commit your changes with a descriptive message.
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

Feel free to reach out for any questions or suggestions. Happy coding!