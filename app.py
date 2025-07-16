import os
import tempfile
import logging
from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
from yt_dlp import YoutubeDL
import json
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for global access

# Configuration
TEMP_DIR = tempfile.gettempdir()
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB limit

def get_ydl_opts(format_type="video", audio_quality="192"):
    """Get yt-dlp options with proper headers and error handling"""
    
    base_opts = {
        'outtmpl': os.path.join(TEMP_DIR, '%(title)s.%(ext)s'),
        'noplaylist': True,
        'extract_flat': False,
        'ignoreerrors': False,
        'no_warnings': True,
        'extractaudio': False,
        'audioformat': 'best',
        'embed_subs': False,
        'writesubtitles': False,
        'writeautomaticsub': False,
        'cookiefile': None,
        'nocheckcertificate': True,
        
        # Headers to bypass restrictions
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        },
        
        # Additional options for better compatibility
        'extractor_args': {
            'youtube': {
                'skip': ['dash', 'hls'],
                'player_client': ['android', 'web'],
                'player_skip': ['configs'],
            }
        },
    }
    
    if format_type == "audio":
        base_opts.update({
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': audio_quality,
            }],
        })
    else:
        base_opts.update({
            'format': 'bestvideo[height<=720]+bestaudio/best[height<=720]',
            'merge_output_format': 'mp4',
            'postprocessors': [{
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4',
            }],
        })
    
    return base_opts

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/info', methods=['POST'])
def get_video_info():
    """Get video information without downloading"""
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Basic options for info extraction
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'skip_download': True,
            'nocheckcertificate': True,
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            },
            'extractor_args': {
                'youtube': {
                    'skip': ['dash', 'hls'],
                    'player_client': ['android', 'web'],
                    'player_skip': ['configs'],
                }
            },
        }
        
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            if not info:
                return jsonify({'error': 'Could not extract video information'}), 400
                
            # Return relevant info
            video_info = {
                'title': info.get('title', 'Unknown'),
                'duration': info.get('duration', 0),
                'uploader': info.get('uploader', 'Unknown'),
                'view_count': info.get('view_count', 0),
                'thumbnail': info.get('thumbnail', ''),
                'formats': len(info.get('formats', [])),
                'filesize_approx': info.get('filesize_approx', 0) or info.get('filesize', 0)
            }
            
            return jsonify({'success': True, 'info': video_info})
            
    except Exception as e:
        logger.error(f"Error getting video info: {str(e)}")
        return jsonify({'error': f'Failed to get video info: {str(e)}'}), 500

@app.route('/api/download', methods=['POST'])
def download_video():
    """Download video or audio"""
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        format_type = data.get('format', 'video')
        audio_quality = data.get('audio_quality', '192')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Validate format type
        if format_type not in ['video', 'audio']:
            return jsonify({'error': 'Format must be "video" or "audio"'}), 400
        
        # Get yt-dlp options
        ydl_opts = get_ydl_opts(format_type, audio_quality)
        
        # Download the video/audio
        with YoutubeDL(ydl_opts) as ydl:
            # Extract info first to get the filename
            info = ydl.extract_info(url, download=False)
            if not info:
                return jsonify({'error': 'Could not extract video information'}), 400
            
            # Check file size limit
            filesize = info.get('filesize_approx', 0) or info.get('filesize', 0)
            if filesize and filesize > MAX_FILE_SIZE:
                return jsonify({'error': f'File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB'}), 400
            
            # Download the file
            ydl.download([url])
            
            # Find the downloaded file
            title = info.get('title', 'download')
            safe_title = secure_filename(title)
            
            # Look for the downloaded file
            downloaded_file = None
            for file in os.listdir(TEMP_DIR):
                if safe_title in file or title in file:
                    downloaded_file = os.path.join(TEMP_DIR, file)
                    break
            
            if not downloaded_file or not os.path.exists(downloaded_file):
                # Fallback: look for any recently created file
                files = [(f, os.path.getctime(os.path.join(TEMP_DIR, f))) 
                        for f in os.listdir(TEMP_DIR) 
                        if os.path.isfile(os.path.join(TEMP_DIR, f))]
                if files:
                    files.sort(key=lambda x: x[1], reverse=True)
                    downloaded_file = os.path.join(TEMP_DIR, files[0][0])
            
            if not downloaded_file or not os.path.exists(downloaded_file):
                return jsonify({'error': 'Download completed but file not found'}), 500
            
            # Return the file
            return send_file(
                downloaded_file,
                as_attachment=True,
                download_name=f"{safe_title}.{'mp3' if format_type == 'audio' else 'mp4'}"
            )
            
    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'YouTube Downloader'})

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    
    # Run the app
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)