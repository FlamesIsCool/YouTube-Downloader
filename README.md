# YouTube Downloader Web Application

A modern, web-based YouTube downloader that allows users to download YouTube videos in MP4 format or extract audio in MP3 format. Built with Node.js, Express, and a clean, responsive frontend.

![YouTube Downloader Interface](https://github.com/user-attachments/assets/52e69424-42a1-4b85-9e52-ba767cb3c3c8)

## Features

### 🎥 Video Downloads (MP4)
- Multiple quality options: 720p, 480p, 360p, or best available
- Full video with audio merged automatically
- High-quality video downloads

### 🎵 Audio Downloads (MP3)
- Audio extraction with multiple bitrate options: 128kbps, 192kbps, 320kbps
- Pure audio files without video data
- Optimized for music and podcasts

![MP3 Mode Interface](https://github.com/user-attachments/assets/a1a099b7-eee3-4372-af69-86ecdbed6547)

### 🌟 Additional Features
- **Real-time Progress Tracking**: WebSocket-based progress updates
- **Video Information Display**: Shows title, duration, thumbnail, and uploader
- **URL Validation**: Automatic validation of YouTube URLs
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Error Handling**: Comprehensive error messages and validation
- **Automatic Cleanup**: Downloaded files are automatically cleaned up after download
- **Modern UI**: Clean, gradient-based design with smooth animations

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **yt-dlp** for YouTube video processing
- **FFmpeg** for audio/video format conversion
- **WebSocket** for real-time progress updates
- **UUID** for unique download tracking

### Frontend
- **Modern HTML5/CSS3** with responsive design
- **Vanilla JavaScript** (no frameworks - lightweight and fast)
- **CSS Grid & Flexbox** for responsive layouts
- **WebSocket client** for real-time updates
- **CSS animations** for smooth user experience

## Installation

### Prerequisites
- Node.js (v14 or higher)
- Python 3.x (for yt-dlp)
- FFmpeg (for audio conversion)

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd YouTube-Downloader
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Install yt-dlp**
   ```bash
   pip3 install yt-dlp
   ```

4. **Install FFmpeg**
   
   **Ubuntu/Debian:**
   ```bash
   sudo apt update && sudo apt install -y ffmpeg
   ```
   
   **macOS:**
   ```bash
   brew install ffmpeg
   ```
   
   **Windows:**
   Download from [FFmpeg official website](https://ffmpeg.org/download.html)

5. **Start the application**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

1. **Enter YouTube URL**: Paste any valid YouTube video URL
2. **Select Format**: Choose between MP4 (video) or MP3 (audio only)
3. **Choose Quality**: Select your preferred quality/bitrate
4. **Click Download**: The download will start with real-time progress updates
5. **Get Your File**: File will automatically download when complete

### Supported YouTube URL Formats
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://m.youtube.com/watch?v=VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

## API Endpoints

### `POST /api/video-info`
Get information about a YouTube video
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

### `POST /api/download`
Start a download
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "format": "mp4",
  "quality": "720p"
}
```

### `GET /api/file/:downloadId`
Download the processed file

### `GET /api/health`
Health check endpoint

## File Structure

```
/
├── server.js              # Main server file
├── package.json           # Node.js dependencies
├── public/                # Frontend files
│   ├── index.html        # Main HTML page
│   ├── style.css         # Styling and responsive design
│   └── script.js         # Frontend JavaScript
├── routes/               # API routes
│   └── download.js       # Download handling routes
├── utils/                # Utility functions
│   └── youtube.js        # YouTube processing utilities
├── downloads/            # Temporary download directory
└── README.md            # This file
```

## Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)

### Customization Options
- Modify download quality options in `public/index.html`
- Adjust cleanup timers in `utils/youtube.js`
- Customize styling in `public/style.css`

## Security Features

- URL validation to prevent malicious inputs
- File cleanup to prevent disk space issues
- Error handling to prevent crashes
- No direct file system access from frontend

## Performance Features

- **Streaming Downloads**: Files are streamed directly to users
- **Automatic Cleanup**: Temporary files are automatically removed
- **Progress Tracking**: Real-time download progress via WebSockets
- **Responsive Design**: Optimized for all device sizes

## Troubleshooting

### Common Issues

1. **"yt-dlp not found"**
   - Ensure yt-dlp is installed: `pip3 install yt-dlp`
   - Check PATH configuration

2. **"FFmpeg not found"**
   - Install FFmpeg using your system's package manager
   - Ensure FFmpeg is in PATH

3. **Download fails**
   - Check if the YouTube URL is valid and accessible
   - Ensure the video is not private or region-restricted
   - Check your internet connection

4. **Audio conversion fails**
   - Ensure FFmpeg is properly installed
   - Check that the selected bitrate is supported

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Legal Notice

This tool is for educational and personal use only. Please respect YouTube's Terms of Service and copyright laws. Only download videos you have permission to download.

## Support

For issues and support, please open an issue on the GitHub repository.