import { NextResponse } from 'next/server';

// In-memory store (use database in production)
let events = [];

export async function POST(request) {
    try {
        const data = await request.json();
        console.log('Received fire detection webhook:', data);

        // Transform fire detection data to dashboard format
        const transformedEvent = {
            id: data.body?.event_id || `evt_${Date.now()}`,
            timestamp: data.body?.ts ? new Date(data.body.ts * 1000).toISOString() : new Date().toISOString(),
            site: data.body?.site || 'School Campus',
            camera: data.body?.camera_id || 'CAM-FIRE-001',
            severity: getSeverityFromFireEvent(data.body),
            confidence: data.body?.confidence || 0.5,
            type: getEventTypeDisplay(data.body?.event_type),
            thumbnail: getThumbnailUrl(data.body?.thumb_key),
            videoUrl: getVideoUrl(data.body?.clip_key),
            metadata: {
                location: { x: 0, y: 0, width: 100, height: 100 },
                duration: Math.floor(Math.random() * 15) + 5,
                // Fire-specific metadata
                detectionType: data.body?.metadata?.detection_type || 'fire',
                alertLevel: data.body?.metadata?.alert_level || 'critical',
                emergencyResponse: data.body?.metadata?.emergency_response || 'required',
                videoTimestamp: data.body?.metadata?.video_timestamp || 0,
                severity: data.body?.metadata?.severity || 'high'
            }
        };

        console.log('Transformed fire detection event:', transformedEvent);

        // Add to events array (limit to last 100)
        events.unshift(transformedEvent);
        if (events.length > 100) {
            events = events.slice(0, 100);
        }

        console.log(`Total fire detection events stored: ${events.length}`);

        return NextResponse.json({
            success: true,
            message: 'Fire detection event received and stored',
            eventId: transformedEvent.id,
            eventType: transformedEvent.type,
            severity: transformedEvent.severity
        });
    } catch (error) {
        console.error('Fire detection webhook error:', error);
        return NextResponse.json({
            error: 'Invalid request',
            details: error.message
        }, { status: 400 });
    }
}

export async function GET() {
    console.log(`GET request - returning ${events.length} fire detection events`);
    return NextResponse.json({
        success: true,
        events,
        total: events.length,
        timestamp: new Date().toISOString(),
        source: 'aws_fire_detection_system'
    });
}

function getSeverityFromFireEvent(eventBody) {
    const eventType = eventBody?.event_type || '';
    const confidence = eventBody?.confidence || 0;
    const detectionType = eventBody?.metadata?.detection_type || '';

    // Fire-specific severity logic
    if (eventType === 'fire_detected' && (detectionType === 'fire' || detectionType === 'flame')) {
        if (confidence > 0.9) return 'critical';
        if (confidence > 0.8) return 'high';
        return 'medium';
    }

    if (eventType === 'fire_detected' && detectionType === 'smoke') {
        if (confidence > 0.85) return 'high';
        if (confidence > 0.7) return 'medium';
        return 'low';
    }

    if (eventType === 'fire_detected' && detectionType === 'explosion') return 'critical';
    if (eventType === 'fire_detected' && detectionType === 'emergency') return 'critical';

    // General confidence-based severity
    if (confidence > 0.85) return 'high';
    if (confidence > 0.7) return 'medium';
    return 'low';
}

function getEventTypeDisplay(eventType) {
    const eventTypeMap = {
        'fire_detected': 'Fire Detected',
        'smoke_detected': 'Smoke Detected',
        'flame_detected': 'Flame Detected',
        'burning_detected': 'Burning Detected',
        'heat_detected': 'Heat Detected',
        'explosion_detected': 'Explosion Detected',
        'emergency_detected': 'Emergency Detected',
        // Legacy mappings for backwards compatibility
        'crowd_detected': 'Crowd Gathering',
        'crowd_detection': 'Crowd Detected',
        'person_tracking': 'Person Detected',
        'running': 'Running Activity',
        'fighting': 'Fighting Detected',
        'violence': 'Violence Alert',
        'weapon_detected': 'Weapon Alert',
        'unauthorized_access': 'Unauthorized Access',
        'vandalism': 'Vandalism',
        'ESF': 'Emergency Situation'
    };

    return eventTypeMap[eventType] || 'Fire Detection Event';
}

function getThumbnailUrl(thumbKey) {
    if (!thumbKey) {
        // Return fire-appropriate placeholder
        return 'https://images.unsplash.com/photo-1574870111867-089ad2b5618a?w=320&h=180&fit=crop&crop=center';
    }

    // If thumbKey is already a full URL (presigned URL), return it directly
    if (thumbKey.includes('amazonaws.com') || thumbKey.includes('https://')) {
        return thumbKey;
    }

    // Construct S3 URL for thumbnail
    return `https://school-video-monitor-thumbnails-001.s3.ap-south-1.amazonaws.com/${thumbKey}`;
}

function getVideoUrl(clipKey) {
    if (!clipKey) return null;

    // If clipKey is already a presigned URL, return it directly
    if (clipKey.includes('amazonaws.com') || clipKey.includes('https://')) {
        return clipKey;
    }

    // Construct S3 URL for video clip
    return `https://school-video-monitor-videos-001.s3.ap-south-1.amazonaws.com/${clipKey}`;
}