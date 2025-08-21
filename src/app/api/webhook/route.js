import { NextResponse } from 'next/server';

// In-memory store (use database in production)
let events = [];

export async function POST(request) {
    try {
        const data = await request.json();
        console.log('Received webhook data:', data);

        // Transform your webhook data to match dashboard format
        const transformedEvent = {
            id: data.body?.event_id || `evt_${Date.now()}`,
            timestamp: data.body?.ts ? new Date(data.body.ts * 1000).toISOString() : new Date().toISOString(),
            site: data.body?.site || 'Unknown Site',
            camera: data.body?.camera_id || 'Unknown Camera',
            severity: getSeverityFromConfidence(data.body?.confidence || 0.5),
            confidence: data.body?.confidence || 0.5,
            type: data.body?.event_type || 'fire',
            thumbnail: getThumbnailUrl(data.body?.thumb_key),
            videoUrl: getVideoUrl(data.body?.clip_key),
            metadata: {
                location: { x: 0, y: 0, width: 100, height: 100 },
                duration: 10
            }
        };

        console.log('Transformed event:', transformedEvent);

        // Add to events array (limit to last 100)
        events.unshift(transformedEvent);
        if (events.length > 100) {
            events = events.slice(0, 100);
        }

        console.log(`Total events stored: ${events.length}`);

        return NextResponse.json({
            success: true,
            message: 'Event received and stored',
            eventId: transformedEvent.id
        });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({
            error: 'Invalid request',
            details: error.message
        }, { status: 400 });
    }
}

export async function GET() {
    console.log(`GET request - returning ${events.length} events`);
    return NextResponse.json({
        events,
        total: events.length,
        timestamp: new Date().toISOString()
    });
}

function getSeverityFromConfidence(confidence) {
    if (confidence > 0.8) return 'critical';
    if (confidence > 0.6) return 'medium';
    return 'low';
}

function getThumbnailUrl(thumbKey) {
    // Return placeholder if no thumb key, or construct URL based on your storage setup
    if (!thumbKey) return 'https://images.unsplash.com/photo-1574870111867-089ad2b5618a?w=320&h=180&fit=crop&crop=center';

    // If you have a storage service, construct the URL like:
    // return `https://your-storage-bucket.s3.amazonaws.com/${thumbKey}`;
    // For now, return placeholder:
    return 'https://images.unsplash.com/photo-1574870111867-089ad2b5618a?w=320&h=180&fit=crop&crop=center';
}

function getVideoUrl(clipKey) {
    // Return null if no clip key, or construct URL based on your storage setup
    if (!clipKey) return null;

    // If you have a storage service, construct the URL like:
    // return `https://your-storage-bucket.s3.amazonaws.com/${clipKey}`;
    // For now, return placeholder:
    return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
}