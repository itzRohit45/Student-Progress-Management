# Student Progress Management System

A comprehensive full-stack web application for tracking and managing students' progress in competitive programming through Codeforces integration. This system helps educators monitor student performance, engagement, and provides automated reminders for inactive students.



## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [API Documentation](#api-documentation)
- [Installation and Setup](#installation-and-setup)
- [Configuration Options](#configuration-options)
- [Usage Guide](#usage-guide)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

### Student Management
- View, add, edit, and delete students
- Track Codeforces handle, current rating, and max rating
- Export student data to CSV format for external analysis
- Filter and search students by various criteria
- Student records include personal details and performance metrics

### Codeforces Integration
- Automatic daily synchronization of Codeforces data
- View contest history and rating changes over time
- Analyze problem-solving patterns by difficulty, tags, and topics
- Track submission activity with interactive heatmap visualization
- Detailed statistics on problem-solving efficiency

### Inactivity Detection & Reminders
- Automatically identify inactive students based on configurable thresholds
- Send personalized reminder emails to encourage participation
- Configurable inactivity threshold and reminder schedule settings
- Email templates for different types of reminders
- Activity tracking and notification history

### User Interface
- Responsive design for mobile, tablet, and desktop devices
- Light and dark mode support for comfortable viewing in any environment
- Interactive charts and visualizations for performance metrics
- User-friendly navigation and intuitive controls
- Real-time data updates and notifications

## Technology Stack

### Backend
- **Node.js** with Express framework for RESTful API
- **MongoDB** database for flexible document storage
- **Mongoose** ORM for data modeling and validation
- **Codeforces API** integration for competitive programming data
- **Nodemailer** for automated email notifications
- **Node-cron** for scheduled tasks and periodic data updates
- **Express-validator** for input validation
- **Helmet** for enhanced API security
- **Compression** for optimized response size

### Frontend
- **React** for component-based UI development
- **React Router** for client-side navigation
- **Recharts & Chart.js** for data visualization components
- **React Calendar Heatmap** for submission activity tracking
- **React-Toastify** for user notifications
- **Axios** for API communication
- **CSS3** with responsive design principles
- **Context API** for state management
- **Light/Dark theme** support for user preference

## System Architecture

The system follows a modern client-server architecture:

```
┌─────────────────┐     ┌────────────────────┐     ┌─────────────────┐
│                 │     │                    │     │                 │
│  React Frontend │◄───►│  Express Backend   │◄───►│  MongoDB        │
│  (Components,   │     │  (API, Services,   │     │  Database       │
│   Pages, State) │     │   Controllers)     │     │                 │
│                 │     │                    │     │                 │
└─────────────────┘     └────────────────────┘     └─────────────────┘
                               │
                         ┌─────▼──────┐
                         │            │
                         │ Codeforces │
                         │    API     │
                         │            │
                         └────────────┘
```

- **Frontend**: React application with component-based architecture
- **Backend**: Express.js RESTful API with MVC pattern
- **Database**: MongoDB for student and performance data storage
- **External API**: Integration with Codeforces for competitive programming data
- **Scheduled Tasks**: Automated jobs for data sync and email reminders

## API Documentation

### Student API Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/students` | GET | Get all students | Query params: `sort`, `filter`, `page`, `limit` |
| `/api/students/:id` | GET | Get student details | Path param: `id` |
| `/api/students` | POST | Create a new student | Body: student object |
| `/api/students/:id` | PUT | Update a student | Path param: `id`, Body: student fields |
| `/api/students/:id` | DELETE | Delete a student | Path param: `id` |
| `/api/students/export-csv` | GET | Export students data to CSV | Query params: optional filters |

### Codeforces API Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/codeforces/student/:id/contests` | GET | Get student contest history | Path param: `id` |
| `/api/codeforces/student/:id/problems` | GET | Get problem solving data | Path param: `id` |
| `/api/codeforces/student/:id/refresh` | POST | Manually refresh CF data | Path param: `id` |

### Configuration API Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/config` | GET | Get all configuration settings | None |
| `/api/config/:name` | GET | Get specific configuration | Path param: `name` |
| `/api/config/:name` | PUT | Update configuration setting | Path param: `name`, Body: `{value: any}` |

## Installation and Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (v4+)
- npm or yarn package manager
- Email account for sending notifications

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the provided `.env.example`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/student-progress-db
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   CODEFORCES_SYNC_SCHEDULE=0 2 * * *
   ```

4. Start the backend server:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

4. Access the application at `http://localhost:3000`

## Configuration Options

The system provides various configuration options that can be changed through the Settings page or directly in the database:

| Setting | Description | Default |
|---------|-------------|---------|
| `INACTIVITY_THRESHOLD_DAYS` | Days of inactivity before flagging a student | 14 |
| `REMINDER_FREQUENCY_DAYS` | Days between reminder emails | 7 |
| `MAX_REMINDERS_BEFORE_ALERT` | Max reminders before alerting admin | 3 |
| `CODEFORCES_SYNC_SCHEDULE` | Cron schedule for CF data sync | `0 2 * * *` (2 AM daily) |
| `EMAIL_ENABLED` | Enable/disable email notifications | `true` |
| `SYSTEM_EMAIL` | Email address used for system notifications | Value from `.env` |

## Usage Guide

### Student Management
1. **View Students**: Navigate to the Students page to see all registered students
2. **Add Student**: 
   - Click "Add Student" button
   - Enter required information including name, email, and Codeforces handle
   - Submit the form to create a new student record
   - The system will automatically fetch initial Codeforces data

3. **View Student Profile**: 
   - Click on a student's name in the table to view their detailed profile
   - See comprehensive statistics including:
     - Codeforces rating history
     - Contest participation
     - Problem solving patterns
     - Submission activity heatmap
     - Inactivity status and reminder history

4. **Edit Student**: 
   - On the student profile page, click "Edit" button
   - Update student information as needed
   - Save changes to update the record

5. **Export Data**:
   - Click "Export CSV" button on the Students page
   - Save the generated CSV file with all student data

### Codeforces Integration
1. **Automatic Updates**:
   - Student Codeforces data is automatically updated daily (at 2 AM by default)
   - Recent activity and statistics are processed and stored

2. **Manual Refresh**:
   - On a student's profile page, click "Refresh Codeforces Data"
   - The system will fetch the latest data from Codeforces API
   - Note: Please use this sparingly to avoid hitting Codeforces API limits

3. **Visualizations**:
   - Contest History: View performance across all participated contests
   - Problem Solving: Analyze patterns by difficulty, tags, and topics
   - Submission Activity: See coding frequency with the activity heatmap

### Settings and Configuration
1. **Access Settings**:
   - Click the gear icon in the navigation bar
   - Modify system-wide configuration

2. **Available Settings**:
   - Inactivity threshold: Days before a student is flagged inactive
   - Reminder frequency: Days between automated reminder emails
   - Email settings: Enable/disable and configure email notifications
   - Codeforces sync schedule: Customize when data is refreshed

### Inactivity Management
1. **Identifying Inactive Students**:
   - Students without Codeforces activity for longer than the threshold are flagged
   - Inactive students are highlighted on the main dashboard

2. **Reminder System**:
   - Automated emails are sent based on configured frequency
   - Reminders include personalized messages and performance statistics
   - System tracks reminder history for each student

## Contributing

We welcome contributions to improve the Student Progress Management System. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and follow the code style guidelines.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
