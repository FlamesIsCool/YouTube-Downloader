#!/bin/bash

# YouTube Downloader Installation Script
# This script sets up the environment and installs all dependencies

set -e

echo "🎥 YouTube Downloader Setup"
echo "=========================="

# Check Python version
echo "📋 Checking Python version..."
python3 --version || {
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
}

# Check if pip is installed
echo "📋 Checking pip..."
pip3 --version || {
    echo "❌ pip3 is not installed. Please install pip3."
    exit 1
}

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Check if FFmpeg is installed
echo "📋 Checking FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg is not installed. Installing FFmpeg..."
    
    # Detect OS and install FFmpeg
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y ffmpeg
        elif command -v yum &> /dev/null; then
            sudo yum install -y ffmpeg
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y ffmpeg
        else
            echo "❌ Could not install FFmpeg automatically. Please install it manually."
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install ffmpeg
        else
            echo "❌ Homebrew not found. Please install FFmpeg manually or install Homebrew first."
            exit 1
        fi
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        echo "❌ Please install FFmpeg manually on Windows from https://ffmpeg.org/download.html"
        exit 1
    else
        echo "❌ Unsupported OS. Please install FFmpeg manually."
        exit 1
    fi
else
    echo "✅ FFmpeg is already installed"
fi

# Update yt-dlp to latest version
echo "🔄 Updating yt-dlp to latest version..."
pip3 install --upgrade yt-dlp

# Test yt-dlp installation
echo "🧪 Testing yt-dlp installation..."
python3 -c "import yt_dlp; print('✅ yt-dlp version:', yt_dlp.__version__)" || {
    echo "❌ yt-dlp installation failed"
    exit 1
}

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# YouTube Downloader Environment Variables
FLASK_ENV=production
PORT=5000
MAX_FILE_SIZE=524288000
TEMP_DIR=/tmp
EOF
    echo "✅ Created .env file with default settings"
fi

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "To run the application:"
echo "  📱 Development: python3 app.py"
echo "  🌐 Production:  gunicorn --bind 0.0.0.0:5000 app:app"
echo ""
echo "The application will be available at:"
echo "  🔗 http://localhost:5000"
echo ""
echo "For deployment instructions, see README.md"