import sql from './db';
import { Recording, SearchFilters } from '../types';

export const getRecordings = async (filters?: SearchFilters): Promise<Recording[]> => {
    try {
        let query = 'SELECT * FROM archiveindex_temp WHERE 1=1';
        const params: any[] = [];
        let paramCount = 1;

        // Build dynamic query based on filters
        if (filters) {
            // Filter by ID
            if (filters.ID) {
                query += ` AND id = $${paramCount}`;
                params.push(parseInt(filters.ID));
                paramCount++;
            }

            // Filter by Recording ID
            if (filters.RecordingID) {
                query += ` AND recordingid ILIKE $${paramCount}`;
                params.push(`%${filters.RecordingID}%`);
                paramCount++;
            }

            // Filter by Attributes
            if (filters.Attributes) {
                query += ` AND attributes ILIKE $${paramCount}`;
                params.push(`%${filters.Attributes}%`);
                paramCount++;
            }

            // Filter by Agent/Participant Name
            if (filters.AgentName) {
                query += ` AND (firstparticipant ILIKE $${paramCount} OR otherparticipants ILIKE $${paramCount})`;
                params.push(`%${filters.AgentName}%`);
                paramCount++;
            }

            // Filter by Date From
            if (filters.DateFrom) {
                query += ` AND recordingdate >= $${paramCount}`;
                params.push(filters.DateFrom);
                paramCount++;
            }

            // Filter by Date To
            if (filters.DateTo) {
                query += ` AND recordingdate <= $${paramCount}`;
                params.push(`${filters.DateTo} 23:59:59`); // Include entire day
                paramCount++;
            }

            // Filter by DNIS
            if (filters.DNIS) {
                query += ` AND dnis ILIKE $${paramCount}`;
                params.push(`%${filters.DNIS}%`);
                paramCount++;
            }

            // Filter by ANI
            if (filters.ANI) {
                query += ` AND ani ILIKE $${paramCount}`;
                params.push(`%${filters.ANI}%`);
                paramCount++;
            }

            // Filter by Workgroup
            if (filters.Workgroup) {
                query += ` AND workgroup = $${paramCount}`;
                params.push(filters.Workgroup);
                paramCount++;
            }

            // Filter by Direction
            if (filters.Direction) {
                query += ` AND direction = $${paramCount}`;
                params.push(filters.Direction);
                paramCount++;
            }
            
            // Filter by MediaType
            if (filters.MediaType) {
                query += ` AND mediatype ILIKE $${paramCount}`;
                params.push(`%${filters.MediaType}%`);
                paramCount++;
            }

            // Filter by RecordingType
            if (filters.RecordingType) {
                query += ` AND recordingtype ILIKE $${paramCount}`;
                params.push(`%${filters.RecordingType}%`);
                paramCount++;
            }

            // Filter by Tags
            if (filters.Tags) {
                query += ` AND tags ILIKE $${paramCount}`;
                params.push(`%${filters.Tags}%`);
                paramCount++;
            }

            // Filter by Duration Min
            if (filters.MinDuration) {
                query += ` AND duration >= $${paramCount}`;
                params.push(parseInt(filters.MinDuration));
                paramCount++;
            }

            // Filter by Duration Max
            if (filters.MaxDuration) {
                query += ` AND duration <= $${paramCount}`;
                params.push(parseInt(filters.MaxDuration));
                paramCount++;
            }
        }

        // Order by most recent first
        query += ' ORDER BY recordingdate DESC NULLS LAST';

        const { rows } = await sql.query(query, params);

        // Map database fields to TypeScript interface
        return rows.map((row: any) => ({
            ID: row.id,
            RecordingID: row.recordingid,
            RecordingDate: row.recordingdate ? new Date(row.recordingdate).toISOString() : new Date().toISOString(),
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
            MediaType: row.mediatype,
            RecordingType: row.recordingtype,
            FileSize: row.filesize,
            Tags: row.tags,
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
