# Online Code Editor with Real-time Collaboration

A modern, feature-rich online code editor built with React and Socket.IO that supports real-time collaboration. Write, edit, and share code in real-time with other developers.

## Features

### Code Editing
- Multi-language support (JavaScript, TypeScript, Python, Java, PHP)
- Syntax highlighting
- Code execution for supported languages
- Dark theme optimized for coding

### Real-time Collaboration
- Create or join coding sessions
- Real-time code synchronization
- See connected users
- Join/leave notifications
- Shareable session IDs
- Cursor position tracking

## Tech Stack

- **Frontend:**
  - React
  - Chakra UI
  - Monaco Editor
  - Socket.IO Client
  - Vite

- **Backend:**
  - Express.js
  - Socket.IO
  - Node.js

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd [your-repo-name]
```

2. Install client dependencies:
```bash
npm install
```

3. Install server dependencies:
```bash
cd server
npm install
```

### Running the Application

1. Start the server:
```bash
cd server
npm run dev
```
The server will start on port 3001.

2. In a new terminal, start the client:
```bash
# From the project root
npm run dev
```
The client will start on port 5173.

## Using Real-time Collaboration

1. **Creating a Session:**
   - Click "Create New Session"
   - Copy the generated session ID
   - Share the ID with collaborators

2. **Joining a Session:**
   - Click "Join"
   - Paste the session ID
   - Start collaborating

3. **Collaboration Features:**
   - Real-time code synchronization
   - See who's connected
   - Notifications when users join/leave
   - Automatic reconnection handling

## Code Execution

1. Select a programming language
2. Write your code
3. Click "Run Code" to see the output

## Supported Languages

- JavaScript (Node.js 18.15.0)
- TypeScript (5.0.3)
- Python (3.10.0)
- Java (15.0.2)
- PHP (8.2.3)

## Acknowledgments

- Monaco Editor for the powerful code editing capabilities
- Socket.IO for real-time communication
- Chakra UI for the modern user interface
