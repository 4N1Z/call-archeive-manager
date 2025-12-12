import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';

// Initialize database connection
const sql = new Pool({
  connectionString: process.env.VITE_DATABASE_URL,
});

// Sample data for generating random records
const directions = ['Inbound', 'Outbound', 'Intercom'];
const workgroups = ['Sales Team', 'Support Team', 'Technical Support', 'Customer Service', 'Billing'];
const firstNames = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'David Brown', 'Emily Davis', 'Chris Wilson', 'Lisa Anderson', 'Tom Martinez', 'Amy Taylor'];
const sampleAudioUrls = [
  'https://res.cloudinary.com/deta3sc5j/video/upload/v1765297025/davesmith_voicemail_hwrbzr.mp3',
  'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
  'https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther30.wav',
];

// Generate random phone number
const generatePhoneNumber = (): string => {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  return `${areaCode}${prefix}${lineNumber}`;
};

// Generate random date within last 30 days
const generateRandomDate = (): Date => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  // Add random hours and minutes
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
};

// Generate random duration (30 seconds to 10 minutes)
const generateDuration = (): number => {
  return Math.floor(Math.random() * 570) + 30; // 30 to 600 seconds
};

// Generate random file size (100KB to 5MB)
const generateFileSize = (): number => {
  return Math.floor(Math.random() * 4900000) + 100000;
};

// Generate test records
const generateTestRecords = (count: number) => {
  const records = [];
  
  for (let i = 0; i < count; i++) {
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const workgroup = workgroups[Math.floor(Math.random() * workgroups.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const audioUrl = sampleAudioUrls[Math.floor(Math.random() * sampleAudioUrls.length)];
    const recordingDate = generateRandomDate();
    const duration = generateDuration();
    
    records.push({
      recordingid: `REC-${Date.now()}-${i + 1}`,
      mediatype: 'audio',
      recordingtype: 'call',
      filepath: audioUrl,
      recordingdate: recordingDate.toISOString(),
      filesize: generateFileSize(),
      direction: direction,
      firstparticipant: firstName,
      otherparticipants: direction === 'Intercom' ? firstNames[Math.floor(Math.random() * firstNames.length)] : null,
      toconnection: `CONN-${Math.floor(Math.random() * 10000)}`,
      fromconnection: `CONN-${Math.floor(Math.random() * 10000)}`,
      tags: ['important', 'follow-up', 'resolved', 'escalated'][Math.floor(Math.random() * 4)],
      attributes: JSON.stringify({
        interaction_id: `INT-${Math.floor(Math.random() * 100000)}`,
        campaign: `Q${Math.floor(Math.random() * 4) + 1}-2024`,
        quality_score: Math.floor(Math.random() * 5) + 1
      }),
      dnis: generatePhoneNumber(),
      duration: duration,
      workgroup: workgroup,
      ani: generatePhoneNumber(),
    });
  }
  
  return records;
};

// Insert records into database
const insertRecords = async () => {
  try {
    console.log('🚀 Starting to populate test data...\n');
    
    const records = generateTestRecords(10);
    
    const query = `
      INSERT INTO archiveindex_temp (
        recordingid, mediatype, recordingtype, filepath, recordingdate,
        filesize, direction, firstparticipant, otherparticipants,
        toconnection, fromconnection, tags, attributes, dnis, duration,
        workgroup, ani
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
    `;
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const values = [
        record.recordingid,
        record.mediatype,
        record.recordingtype,
        record.filepath,
        record.recordingdate,
        record.filesize,
        record.direction,
        record.firstparticipant,
        record.otherparticipants,
        record.toconnection,
        record.fromconnection,
        record.tags,
        record.attributes,
        record.dnis,
        record.duration,
        record.workgroup,
        record.ani,
      ];
      
      await sql.query(query, values);
      
      console.log(`✅ Record ${i + 1}/10 inserted:`);
      console.log(`   - Recording ID: ${record.recordingid}`);
      console.log(`   - Direction: ${record.direction}`);
      console.log(`   - Participant: ${record.firstparticipant}`);
      console.log(`   - Workgroup: ${record.workgroup}`);
      console.log(`   - Duration: ${Math.floor(record.duration / 60)}:${(record.duration % 60).toString().padStart(2, '0')}`);
      console.log(`   - Date: ${new Date(record.recordingdate).toLocaleString()}\n`);
    }
    
    console.log('🎉 Successfully inserted 10 test records!');
    console.log('\n📊 Summary:');
    console.log(`   - Total records: 10`);
    console.log(`   - Directions: ${[...new Set(records.map(r => r.direction))].join(', ')}`);
    console.log(`   - Workgroups: ${[...new Set(records.map(r => r.workgroup))].join(', ')}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting records:', error);
    process.exit(1);
  }
};

// Run the script
insertRecords();

