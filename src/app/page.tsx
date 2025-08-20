'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Eye, Download, Filter, RefreshCw, Camera, Clock, TrendingUp } from 'lucide-react';

export default function Page() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);

  // Mock data - replace with actual API calls
  const mockEvents = [
    {
      id: 'evt_001',
      timestamp: '2025-08-20T14:30:00Z',
      site: 'Building A',
      camera: 'CAM_001',
      severity: 'critical',
      confidence: 0.95,
      type: 'fire',
      thumbnail: 'https://via.placeholder.com/320x180/ff6b6b/ffffff?text=Fire+Detected',
      videoUrl: null,
      metadata: {
        location: { x: 450, y: 320, width: 120, height: 80 },
        duration: 15.2
      }
    },
    {
      id: 'evt_002',
      timestamp: '2025-08-20T13:15:00Z',
      site: 'Warehouse B',
      camera: 'CAM_003',
      severity: 'medium',
      confidence: 0.78,
      type: 'smoke',
      thumbnail: 'https://via.placeholder.com/320x180/ffa500/ffffff?text=Smoke+Detected',
      videoUrl: null,
      metadata: {
        location: { x: 200, y: 150, width: 90, height: 60 },
        duration: 8.7
      }
    },
    {
      id: 'evt_003',
      timestamp: '2025-08-20T11:45:00Z',
      site: 'Building A',
      camera: 'CAM_002',
      severity: 'low',
      confidence: 0.65,
      type: 'smoke',
      thumbnail: 'https://via.placeholder.com/320x180/ffeb3b/333333?text=Smoke+Suspected',
      videoUrl: null,
      metadata: {
        location: { x: 300, y: 250, width: 70, height: 50 },
        duration: 5.1
      }
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEvents = async () => {
    setLoading(true);
    // Replace with actual API call to your Lambda function
    try {
      // const response = await fetch('/api/events');
      // const data = await response.json();
      // setEvents(data.events);

      // Mock delay
      setTimeout(() => {
        setEvents(mockEvents);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const handleVideoPlay = async (event) => {
    setVideoLoading(true);
    setSelectedEvent(event);

    // Request presigned URL from your Lambda function
    try {
      // const response = await fetch(`/api/video-url/${event.id}`);
      // const data = await response.json();
      // setSelectedEvent({...event, videoUrl: data.presignedUrl});

      // Mock video URL
      setTimeout(() => {
        setSelectedEvent({
          ...event,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        });
        setVideoLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error fetching video URL:', error);
      setVideoLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.severity === filter;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    return <AlertTriangle className={`w-4 h-4 ${severity === 'critical' ? 'text-red-500' : severity === 'medium' ? 'text-orange-500' : 'text-yellow-500'}`} />;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatConfidence = (confidence) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fire Detection Dashboard</h1>
                <p className="text-gray-600">Real-time monitoring and alerts</p>
              </div>
            </div>
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{events.filter(e => e.severity === 'critical').length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Cameras</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <Camera className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last 24h</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filter by severity:</span>
                <div className="flex space-x-2">
                  {['all', 'critical', 'medium', 'low'].map((severity) => (
                    <button
                      key={severity}
                      onClick={() => setFilter(severity)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === severity
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Detection Events</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-600">Loading events...</span>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No events found</p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{formatTimestamp(event.timestamp)}</div>
                          <div className="text-sm text-gray-500">Type: {event.type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{event.site}</div>
                        <div className="text-sm text-gray-500">{event.camera}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                          {getSeverityIcon(event.severity)}
                          <span>{event.severity}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatConfidence(event.confidence)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={event.thumbnail}
                          alt="Event thumbnail"
                          className="w-16 h-12 object-cover rounded border"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleVideoPlay(event)}
                          className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        <button className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
                <p className="text-sm text-gray-500">{formatTimestamp(selectedEvent.timestamp)} - {selectedEvent.site}</p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {videoLoading ? (
                <div className="flex items-center justify-center py-12 bg-gray-100 rounded-lg">
                  <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                  <span className="ml-3 text-gray-600">Loading video...</span>
                </div>
              ) : selectedEvent.videoUrl ? (
                <video
                  controls
                  className="w-full rounded-lg"
                  poster={selectedEvent.thumbnail}
                >
                  <source src={selectedEvent.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <p className="text-gray-500">Video not available</p>
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Confidence:</span>
                  <span className="ml-2 text-gray-900">{formatConfidence(selectedEvent.confidence)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <span className="ml-2 text-gray-900">{selectedEvent.metadata.duration}s</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Detection Area:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedEvent.metadata.location.width} × {selectedEvent.metadata.location.height}px
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="ml-2 text-gray-900 capitalize">{selectedEvent.type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}