# YouTube Downloader - Bot Detection Bypass

A Python-based YouTube video downloader with advanced bot detection bypass capabilities.

## ⚠️ Problem Solved

YouTube was blocking downloads with this error:
```
ERROR: [youtube] Sign in to confirm you're not a bot. Use --cookies-from-browser or --cookies for the authentication.
```

This downloader now **automatically handles bot detection** and provides multiple fallback strategies.

## 🚀 Features

### 🍪 Cookie Authentication
- **Automatic cookie extraction** from your browser
- **Supported browsers**: Chrome, Firefox, Edge, Safari
- **Auto-detection mode** with intelligent fallback
- **No-cookies option** as final fallback

### 🤖 Bot Detection Bypass
- **Realistic browser headers** and user-agent
- **Request throttling** with sleep intervals
- **Multiple retry attempts** with different methods
- **Enhanced error handling** for bot detection

### 🔄 Intelligent Fallback Strategy
When bot detection occurs, the app automatically tries:
1. Chrome browser cookies
2. Firefox browser cookies  
3. Edge browser cookies
4. Safari browser cookies
5. No cookies (final fallback)

### 🖥️ User-Friendly Interface
- **Simple GUI** with browser selection
- **Built-in help** button with instructions
- **Clear error messages** with troubleshooting steps
- **Video and audio** download options

## 💾 Installation

### Requirements
- Python 3.6+
- yt-dlp
- tkinter (usually included with Python)

### Install Dependencies
```bash
pip install yt-dlp
```

### For Ubuntu/Debian
```bash
sudo apt install python3-tk
```

## 🎯 Usage

1. **Run the application**:
   ```bash
   python3 "YouTube Downloader.py"
   ```

2. **Enter YouTube URL** in the text field

3. **Select browser for cookies** (recommended: "Auto")
   - **Auto**: Try all browsers automatically
   - **Chrome/Firefox/Edge/Safari**: Use specific browser
   - **None**: Download without cookies

4. **Choose format**: Video or Audio

5. **Click Download** and select output directory

## 🛠️ Browser Setup

### For Best Results:
1. **Sign into YouTube** in your chosen browser
2. **Visit the video URL** in your browser first
3. **Use "Auto" mode** for maximum compatibility
4. **Keep your browser** logged in to YouTube

### Troubleshooting:
- If one browser fails, try another
- Make sure you're logged into YouTube
- Clear browser cache if needed
- Try visiting the video in browser first

## 🧪 Technical Details

### Bot Detection Bypass Configuration:
```python
ydl_opts = {
    'cookies_from_browser': 'chrome',  # or firefox, edge, safari
    'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
    'extractor_retries': 3,
    'sleep_interval': 1,
    'max_sleep_interval': 5,
    'http_headers': {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-us,en;q=0.5',
        'Sec-Fetch-Mode': 'navigate',
    }
}
```

### Supported Browsers:
- **Chrome**: Windows, macOS, Linux
- **Firefox**: Windows, macOS, Linux  
- **Edge**: Windows, macOS
- **Safari**: macOS

## 📝 Error Handling

The app automatically detects and handles:
- "Sign in to confirm you're not a bot" errors
- Rate limiting and throttling
- Network connectivity issues
- Invalid URLs or unavailable videos

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is for educational purposes. Respect YouTube's Terms of Service.

---

## 🎉 Success!

Your YouTube downloader now bypasses bot detection automatically! 🚀