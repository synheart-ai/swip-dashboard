---
title: "Documentation"
description: "Complete guide to using the SWIP Dashboard"
date: "2025-10-24"
---

# SWIP Dashboard Documentation

Welcome to the SWIP Dashboard documentation. This guide will help you understand and use all the features of our wellness tracking platform.

## Getting Started

### What is SWIP?

SWIP (Smart Wellness Intelligence Platform) is a comprehensive dashboard that helps you track and understand your wellness patterns across multiple platforms and devices.

### Key Features

- **Biometric Intelligence**: Track HRV and heart rate data to understand stress patterns
- **Behavioral Insights**: Analyze your digital behavior across platforms
- **Real-time Monitoring**: 24/7 wellness tracking and analysis
- **Platform Integrations**: Connect Spotify, YouTube, TikTok, Amazon, and more

## Dashboard Overview

### Statistics Panel

The main dashboard displays key metrics:

- **Active Users**: Total number of users actively using the platform
- **Sessions Tracked**: Total wellness sessions recorded
- **Platform Integrations**: Number of connected platforms
- **Wellness Improvement**: Average improvement in SWIP scores
- **Real Time Monitoring**: Always-on wellness tracking

### Navigation

- **Analytics**: View detailed analytics and reports
- **Sessions**: Manage your wellness sessions
- **Leaderboard**: See how you compare with other users
- **Developer**: Access API keys and developer tools
- **Profile**: Manage your account settings

## API Documentation

### Authentication

All API requests require authentication using API keys. You can generate API keys in the Developer section.

### Endpoints

#### Health Check
```
GET /api/health
```

#### Ingest Data
```
POST /api/swip/ingest
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "platform": "spotify",
  "data": {
    "heartRate": 75,
    "stressLevel": "low"
  }
}
```

#### Get Sessions
```
GET /api/public/swipsessions
Authorization: Bearer YOUR_API_KEY
```

## Platform Integrations

### Supported Platforms

1. **Spotify**: Music listening patterns and mood analysis
2. **YouTube**: Video consumption and engagement metrics
3. **TikTok**: Social media usage patterns
4. **Amazon**: Purchase behavior and wellness correlations
5. **Health Devices**: HRV monitors, fitness trackers

### Data Privacy

All data is encrypted and stored securely. We never share personal information with third parties without explicit consent.

## Troubleshooting

### Common Issues

**Q: My data isn't syncing properly**
A: Check your API key permissions and ensure your platform integrations are active.

**Q: How do I reset my API key?**
A: Go to Developer > API Keys and generate a new key. The old key will be deactivated.

**Q: Can I export my data?**
A: Yes, contact support to request a data export.

## Support

For additional help, please contact our support team at support@swipdashboard.com or visit our help center.

---

*Last updated: October 24, 2025*
