import { NextResponse } from 'next/server';

// In-memory store (use database in production)
let events = [];

export async function POST(request) {
    try {
        const data = await request.json();
        console.log('Received school monitoring webhook:', data);

        // Transform school monitoring data to dashboard format
        const transformedEvent = {
            id: data.body?.event_id || `evt_${Date.now()}`,
            timestamp: data.body?.ts ? new Date(data.body.ts * 1000).toISOString() : new Date().toISOString(),
            site: data.body?.site || 'School Campus',
            camera: data.body?.camera_id || 'CAM-SCHOOL-001',
            severity: getSeverityFromSchoolEvent(data.body),
            confidence: data.body?.confidence || 0.5,
            type: getEventTypeDisplay(data.body?.event_type),
            thumbnail: getThumbnailUrl(data.body?.thumb_key),
            videoUrl: getVideoUrl(data.body?.clip_key),
            metadata: {
                location: { x: 0, y: 0, width: 100, height: 100 },
                duration: Math.floor(Math.random() * 15) + 5,
                // School-specific metadata
                personCount: data.body?.metadata?.person_count || 0,
                riskLevel: data.body?.metadata?.risk_level || 'low',
                detectionType: data.body?.metadata?.detection_type || 'unknown'
            }
        };

        console.log('Transformed school event:', transformedEvent);

        // Add to events array (limit to last 100)
        events.unshift(transformedEvent);
        if (events.length > 100) {
            events = events.slice(0, 100);
        }

        console.log(`Total school events stored: ${events.length}`);

        return NextResponse.json({
            success: true,
            message: 'School monitoring event received and stored',
            eventId: transformedEvent.id,
            eventType: transformedEvent.type
        });
    } catch (error) {
        console.error('School monitoring webhook error:', error);
        return NextResponse.json({
            error: 'Invalid request',
            details: error.message
        }, { status: 400 });
    }
}

export async function GET() {
    console.log(`GET request - returning ${events.length} school events`);
    return NextResponse.json({
        success: true,
        events,
        total: events.length,
        timestamp: new Date().toISOString(),
        source: 'aws_school_monitoring'
    });
}

function getSeverityFromSchoolEvent(eventBody) {
    const eventType = eventBody?.event_type || '';
    const confidence = eventBody?.confidence || 0;
    const personCount = eventBody?.metadata?.person_count || 0;

    // School-specific severity logic
    if (eventType === 'crowd_detected' && personCount > 15) return 'critical';
    if (eventType === 'fighting' || eventType === 'violence') return 'critical';
    if (eventType === 'weapon_detected') return 'critical';
    if (eventType === 'running' && confidence > 0.8) return 'medium';
    if (eventType === 'crowd_detected' && personCount > 8) return 'medium';
    if (confidence > 0.8) return 'medium';

    return 'low';
}

function getEventTypeDisplay(eventType) {
    const eventTypeMap = {
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

    return eventTypeMap[eventType] || 'School Activity';
}

function getThumbnailUrl(thumbKey) {
    // If you have actual S3 URLs, construct them here
    if (!thumbKey) {
        // Return school-appropriate placeholder
        return 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=320&h=180&fit=crop&crop=center';
    }

    // For actual S3 integration:
    // return `https://school-video-monitor-thumbnails-001.s3.ap-south-1.amazonaws.com/${thumbKey}`;

    // Placeholder for now
    return 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=320&h=180&fit=crop&crop=center';
}

function getVideoUrl(clipKey) {
    if (!clipKey) return null;

    // For actual S3 integration:
    // return `https://school-video-monitor-videos-001.s3.ap-south-1.amazonaws.com/${clipKey}`;

    // Demo video for now
    return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
}