# CallArchiver - Recording Retrieval System

A secure, searchable repository for managing call recordings with audio upload capabilities.

## Features

- 🎙️ **Audio Recording**: Record audio directly from your browser using the microphone
- ☁️ **Cloud Storage**: Automatic upload to S3/Cloudinary
- 🔍 **Advanced Search**: Filter recordings by date, agent, workgroup, direction, and more
- 📊 **Database Integration**: Powered by Neon PostgreSQL
- 🎵 **Audio Playback**: Built-in audio player for reviewing recordings
- ➕ **Add New Recordings**: Comprehensive form to add new recordings with metadata

## Prerequisites

- Node.js (v16 or higher)
- Neon PostgreSQL database
- AWS S3 account

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
VITE_DATABASE_URL=your_neon_database_connection_string_here

# AWS S3 Configuration (for audio file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
```

See [ENV_EXAMPLE.md](ENV_EXAMPLE.md) for detailed setup instructions.

### 3. Database Setup

Ensure your Neon database has the `archiveindex_temp` table with the following schema:

```sql
CREATE TABLE archiveindex_temp (
    id SERIAL PRIMARY KEY,
    recordingid VARCHAR(255),
    mediatype VARCHAR(50),
    recordingtype VARCHAR(50),
    filepath TEXT NOT NULL,
    recordingdate TIMESTAMP,
    filesize BIGINT,
    direction VARCHAR(50),
    firstparticipant VARCHAR(255),
    otherparticipants TEXT,
    toconnection VARCHAR(255),
    fromconnection VARCHAR(255),
    tags TEXT,
    attributes TEXT,
    dnis VARCHAR(50),
    duration INTEGER,
    workgroup VARCHAR(255),
    ani VARCHAR(50)
);
```

### 4. AWS S3 Setup

1. Create an S3 bucket in AWS Console
2. Configure bucket permissions for public read access
3. Create an IAM user with S3 upload permissions
4. Generate access keys
5. Add credentials to `.env` file

**Detailed instructions**: See [ENV_EXAMPLE.md](ENV_EXAMPLE.md)

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Login

Default credentials:
- Username: `admin`
- Password: `password`

### Adding a New Recording

1. Click the **"Add Recording"** button in the dashboard
2. Record audio using your microphone or upload an existing file
3. Fill in the required fields (at minimum, DNIS is required)
4. Click **"Save Recording"** to upload to S3 and save to database

### Searching Recordings

Use the search filters to find recordings by:
- Interaction ID
- Agent/Participant name
- Date range
- DNIS (To number)
- ANI (From number)
- Workgroup
- Direction (Inbound/Outbound/Intercom)

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Database**: Neon PostgreSQL
- **Storage**: AWS S3
- **Build Tool**: Vite
- **Icons**: Lucide React
- **AWS SDK**: @aws-sdk/client-s3

## Project Structure

```
├── components/
│   ├── AddRecordingForm.tsx    # Form for adding new recordings
│   ├── AudioPlayer.tsx          # Audio playback component
│   ├── AudioRecorder.tsx        # Microphone recording component
│   └── RecordingList.tsx        # Display list of recordings
├── services/
│   ├── db.ts                    # Database connection
│   ├── recordingService.ts      # Recording CRUD operations
│   └── s3Service.ts             # S3/Cloudinary upload service
├── App.tsx                      # Main application component
├── types.ts                     # TypeScript type definitions
└── constants.ts                 # Application constants
```

## Notes

- The audio recorder uses the browser's MediaRecorder API
- Recordings are stored as MP3 format
- File uploads are handled client-side to Cloudinary
- All database operations use parameterized queries for security

## License

MIT
