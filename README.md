# 🎥 YouTube Downloader

A modern, web-based YouTube video and audio downloader with global deployment capabilities. Download YouTube videos in MP4 format or extract audio in MP3 format with a beautiful, responsive web interface.

## ✨ Features

- 🎬 Download YouTube videos (up to 720p) in MP4 format
- 🎵 Extract audio in MP3 format with quality options (128, 192, 256, 320 kbps)
- 📱 Responsive web interface that works on desktop and mobile
- 🚀 Fast and reliable downloads with proper error handling
- 🔒 Secure with rate limiting and file size restrictions
- 🌍 Deployable to multiple cloud platforms
- 📊 Video information preview before downloading
- 🔄 Automatic yt-dlp updates for compatibility

## 🚀 Quick Start

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/FlamesIsCool/YouTube-Downloader.git
   cd YouTube-Downloader
   ```

2. **Run the installation script:**
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

3. **Start the application:**
   ```bash
   python3 app.py
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:5000
   ```

### Manual Installation

If you prefer manual installation:

1. **Install Python dependencies:**
   ```bash
   pip3 install -r requirements.txt
   ```

2. **Install FFmpeg:**
   - **Ubuntu/Debian:** `sudo apt-get install ffmpeg`
   - **macOS:** `brew install ffmpeg`
   - **Windows:** Download from [FFmpeg.org](https://ffmpeg.org/download.html)

3. **Run the application:**
   ```bash
   python3 app.py
   ```

## 🌐 Global Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Configure environment variables in Vercel dashboard:**
   - `PYTHON_VERSION`: `3.9`

### Netlify Deployment

1. **Connect your GitHub repository to Netlify**

2. **Set build settings:**
   - Build command: `echo 'Build complete'`
   - Publish directory: `.`

3. **Install Netlify CLI for local testing:**
   ```bash
   npm install -g netlify-cli
   netlify dev
   ```

### Railway Deployment

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy:**
   ```bash
   railway login
   railway link
   railway up
   ```

3. **Set environment variables:**
   ```bash
   railway variables set PORT=8080
   ```

### Heroku Deployment

1. **Install Heroku CLI and login:**
   ```bash
   heroku login
   ```

2. **Create and deploy:**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set PYTHON_VERSION=3.9
   ```

### Docker Deployment

1. **Build the image:**
   ```bash
   docker build -t youtube-downloader .
   ```

2. **Run the container:**
   ```bash
   docker run -p 5000:5000 youtube-downloader
   ```

3. **Deploy to any container platform:**
   - Google Cloud Run
   - AWS ECS
   - Azure Container Instances
   - DigitalOcean App Platform

## ⚙️ Configuration

### Environment Variables

Create a `.env` file or set environment variables:

```bash
FLASK_ENV=production          # Flask environment
PORT=5000                     # Port to run the application
MAX_FILE_SIZE=524288000       # Maximum file size (500MB)
TEMP_DIR=/tmp                 # Temporary directory for downloads
```

### yt-dlp Configuration

The application uses optimized yt-dlp settings:

- **User-Agent**: Modern browser user agent
- **Headers**: Accept-Language and other headers to bypass restrictions
- **Format Selection**: Best quality up to 720p for videos
- **Audio Extraction**: High-quality MP3 extraction
- **Error Handling**: Comprehensive error handling and logging

## 📡 API Endpoints

### Get Video Information
```http
POST /api/info
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

### Download Video/Audio
```http
POST /api/download
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "format": "video",
  "audio_quality": "192"
}
```

### Health Check
```http
GET /api/health
```

## 🛠️ Technical Details

### Dependencies

- **Flask**: Web framework
- **yt-dlp**: YouTube downloader library
- **FFmpeg**: Media processing
- **Gunicorn**: WSGI HTTP Server
- **Flask-CORS**: Cross-origin resource sharing

### Security Features

- File size limits to prevent abuse
- Temporary file cleanup
- Input validation and sanitization
- Rate limiting ready
- CORS enabled for global access

### Performance Optimizations

- Async processing for downloads
- Optimized yt-dlp settings
- Efficient temporary file handling
- Production-ready with Gunicorn

## 🔧 Troubleshooting

### Common Issues

1. **yt-dlp errors:**
   ```bash
   pip3 install --upgrade yt-dlp
   ```

2. **FFmpeg not found:**
   - Install FFmpeg using package manager
   - Verify with `ffmpeg -version`

3. **Permission errors:**
   ```bash
   chmod +x install.sh
   sudo chown -R $USER:$USER .
   ```

4. **Port already in use:**
   ```bash
   export PORT=8000
   python3 app.py
   ```

### Platform-Specific Notes

- **Vercel**: Has a 12-second timeout limit for serverless functions
- **Netlify**: Functions have execution time limits
- **Railway**: Best for full application hosting
- **Heroku**: Free tier has sleep mode
- **Docker**: Most flexible for any platform

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🆘 Support

If you encounter any issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Search existing [GitHub issues](https://github.com/FlamesIsCool/YouTube-Downloader/issues)
3. Create a new issue with detailed information

## 📊 Project Status

- ✅ Web interface completed
- ✅ Core download functionality
- ✅ Multiple deployment options
- ✅ Error handling and logging
- ✅ Mobile-responsive design
- ✅ Production-ready configuration

---

**Made with ❤️ for the community**

*This tool is for personal use only. Please respect YouTube's Terms of Service and copyright laws.*