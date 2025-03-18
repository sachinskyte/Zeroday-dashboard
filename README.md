
# Sentinel - Cybersecurity Monitoring Dashboard

Sentinel is a real-time cybersecurity monitoring dashboard that provides visualization and tracking of security threats and blockchain-verified security events.

## Features

- **Real-time Threat Monitoring**: View and track security threats as they occur
- **Blockchain Verification**: Immutable record of security events stored on blockchain
- **Interactive Visualization**: Maps, charts, and statistics for better threat analysis
- **Customizable Settings**: Configure connections, notifications, and display preferences
- **Graceful Degradation**: Continues to function with partial connectivity or fallback data

## Components

The application is organized into feature-based modules:

- **Alerts**: Real-time notification system for high-severity threats
- **Blockchain**: Immutable ledger of security events with blockchain verification
- **Charts**: Visual representation of threat data and trends
- **Feeds**: Live attack monitoring and event feeds
- **Maps**: Geographic visualization of attack origins
- **Settings**: Connection configuration and application preferences
- **Stats**: Summary statistics of security events and threats

## Connection Settings

The dashboard connects to two primary data sources:
1. **Threat API**: Provides real-time security event data
2. **Blockchain API**: Stores immutable records of security events

You can configure these connections in the settings panel. The system provides detailed connection status information, including:

- Which specific API endpoint is experiencing connectivity issues
- Connection attempts and status
- When data was last updated
- Whether fallback demo data is being used

## Error Handling

Sentinel includes robust error handling to ensure the application continues functioning even when connectivity issues occur:

- Clearly indicates which specific API (Threat or Blockchain) is experiencing connectivity issues
- Automatically attempts to reconnect with exponential backoff
- Uses fallback/demo data when real connections fail
- Provides detailed error messages to help diagnose connection problems

## Getting Started

1. Open the application in your browser
2. Click the settings icon in the top-left corner
3. Configure your connection settings with your API endpoints
4. Connect to begin monitoring security threats in real-time

## Usage Tips

- Enable sound notifications for high-severity threats
- Use the blockchain ledger to verify the authenticity of security events
- Monitor trends over time using the threat charts and statistics
- Check geographic attack patterns on the threat map

## Troubleshooting

If you experience connection issues:
- Check your network connectivity
- Verify API endpoint URLs are correct
- Look at the connection status panel for specific error information
- The dashboard will continue to function with partial connectivity (only one API connected)
