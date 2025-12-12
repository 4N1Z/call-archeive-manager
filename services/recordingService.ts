import sql from './db';
import { Recording } from '../types';

export const getRecordings = async (): Promise<Recording[]> => {
    try {
        const { rows } = await sql.query('SELECT * FROM archiveindex_temp');

        // Map database fields to our TypeScript interface if they differ slightly, 
        // or return directly if they match. Assuming exact match for now based on types.ts
        // Adjusting casing if DB returns lowercase columns but types are PascalCase.
        // Postgres usually returns lowercase column names unless quoted in creation.
        // Let's assume we might need to map them if the DB has snake_case or lowercase.

        // However, if the user followed the schema strictly, they might have quoted identifiers.
        // For safety, let's map safely.

        return rows.map((row: any) => ({
            RecordingID: row.recordingid,
            RecordingDate: new Date(row.recordingdate).toISOString(), // Ensure ISO string format
            Attributes: row.attributes,
            Direction: row.direction,
            FilePath: row.filepath,
            FirstParticipant: row.firstparticipant,
            OtherParticipants: row.otherparticipants,
            DNIS: row.dnis,
            ANI: row.ani,
            ToConnection: row.toconnection,
            FromConnection: row.fromconnection,
            Workgroup: row.workgroup,
            Duration: row.duration,
        }));
    } catch (error) {
        console.error('Error fetching recordings:', error);
        throw error;
    }
};

export interface NewRecordingData {
    recordingid?: string;
    mediatype?: string;
    recordingtype?: string;
    filepath: string;
    recordingdate?: string;
    filesize?: number;
    direction?: string;
    firstparticipant?: string;
    otherparticipants?: string;
    toconnection?: string;
    fromconnection?: string;
    tags?: string;
    attributes?: string;
    dnis?: string;
    duration?: number;
    workgroup?: string;
    ani?: string;
}

export const addRecording = async (data: NewRecordingData): Promise<void> => {
    try {
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
        
        const values = [
            data.recordingid || null,
            data.mediatype || null,
            data.recordingtype || null,
            data.filepath,
            data.recordingdate || null,
            data.filesize || null,
            data.direction || null,
            data.firstparticipant || null,
            data.otherparticipants || null,
            data.toconnection || null,
            data.fromconnection || null,
            data.tags || null,
            data.attributes || null,
            data.dnis || null,
            data.duration || null,
            data.workgroup || null,
            data.ani || null,
        ];
        
        await sql.query(query, values);
    } catch (error) {
        console.error('Error adding recording:', error);
        throw error;
    }
};
