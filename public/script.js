class YouTubeDownloader {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.setupWebSocket();
        this.currentDownload = null;
    }

    initializeElements() {
        this.urlInput = document.getElementById('youtube-url');
        this.downloadBtn = document.getElementById('download-btn');
        this.btnText = document.querySelector('.btn-text');
        this.btnLoader = document.querySelector('.btn-loader');
        this.formatOptions = document.querySelectorAll('input[name="format"]');
        this.videoQualityGroup = document.getElementById('video-quality');
        this.audioQualityGroup = document.getElementById('audio-quality');
        this.videoQualitySelect = document.getElementById('video-quality-select');
        this.audioQualitySelect = document.getElementById('audio-quality-select');
        this.videoInfo = document.getElementById('video-info');
        this.progressContainer = document.getElementById('progress-container');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.errorMessage = document.getElementById('error-message');
        this.successMessage = document.getElementById('success-message');
    }

    setupEventListeners() {
        this.downloadBtn.addEventListener('click', () => this.handleDownload());
        this.urlInput.addEventListener('input', () => this.handleUrlChange());
        
        this.formatOptions.forEach(option => {
            option.addEventListener('change', () => this.handleFormatChange());
        });

        // Enter key in URL input
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleDownload();
            }
        });
    }

    setupWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('WebSocket connected');
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                // Try to reconnect after 3 seconds
                setTimeout(() => this.setupWebSocket(), 3000);
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Failed to establish WebSocket connection:', error);
        }
    }

    handleWebSocketMessage(data) {
        if (data.type === 'progress' && data.downloadId === this.currentDownload) {
            this.updateProgress(data.progress, data.status);
        } else if (data.type === 'complete' && data.downloadId === this.currentDownload) {
            this.handleDownloadComplete(data);
        } else if (data.type === 'error' && data.downloadId === this.currentDownload) {
            this.handleDownloadError(data.error);
        }
    }

    handleUrlChange() {
        this.hideMessages();
        this.hideVideoInfo();
        
        const url = this.urlInput.value.trim();
        if (url && this.isValidYouTubeUrl(url)) {
            this.fetchVideoInfo(url);
        }
    }

    handleFormatChange() {
        const selectedFormat = document.querySelector('input[name="format"]:checked').value;
        
        if (selectedFormat === 'mp4') {
            this.videoQualityGroup.style.display = 'block';
            this.audioQualityGroup.style.display = 'none';
        } else {
            this.videoQualityGroup.style.display = 'none';
            this.audioQualityGroup.style.display = 'block';
        }
    }

    isValidYouTubeUrl(url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
        return youtubeRegex.test(url);
    }

    async fetchVideoInfo(url) {
        try {
            const response = await fetch('/api/video-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            if (response.ok) {
                const videoInfo = await response.json();
                this.displayVideoInfo(videoInfo);
            }
        } catch (error) {
            console.error('Error fetching video info:', error);
        }
    }

    displayVideoInfo(info) {
        document.getElementById('video-thumbnail').src = info.thumbnail;
        document.getElementById('video-title').textContent = info.title;
        document.getElementById('video-duration').textContent = `Duration: ${this.formatDuration(info.duration)}`;
        document.getElementById('video-uploader').textContent = `Uploader: ${info.uploader}`;
        
        this.videoInfo.style.display = 'flex';
    }

    formatDuration(seconds) {
        if (!seconds) return 'Unknown';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    async handleDownload() {
        const url = this.urlInput.value.trim();
        
        if (!url) {
            this.showError('Please enter a YouTube URL');
            return;
        }
        
        if (!this.isValidYouTubeUrl(url)) {
            this.showError('Please enter a valid YouTube URL');
            return;
        }

        const format = document.querySelector('input[name="format"]:checked').value;
        const quality = format === 'mp4' ? 
            this.videoQualitySelect.value : 
            this.audioQualitySelect.value;

        this.startDownload();
        
        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url,
                    format,
                    quality
                }),
            });

            const data = await response.json();
            
            if (response.ok) {
                this.currentDownload = data.downloadId;
                this.showProgress();
            } else {
                this.handleDownloadError(data.error || 'Download failed');
            }
        } catch (error) {
            this.handleDownloadError('Network error occurred');
        }
    }

    startDownload() {
        this.downloadBtn.disabled = true;
        this.btnText.textContent = 'Preparing...';
        this.btnLoader.style.display = 'block';
        this.hideMessages();
    }

    showProgress() {
        this.progressContainer.style.display = 'block';
        this.updateProgress(0, 'Initializing download...');
    }

    updateProgress(percentage, status) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = status;
    }

    handleDownloadComplete(data) {
        this.resetDownloadButton();
        this.hideProgress();
        
        if (data.downloadUrl) {
            this.showSuccess(`Download complete! <a href="${data.downloadUrl}" download>Click here to download your file</a>`);
            
            // Automatically trigger download
            const link = document.createElement('a');
            link.href = data.downloadUrl;
            link.download = data.filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            this.showSuccess('Download completed successfully!');
        }
        
        this.currentDownload = null;
    }

    handleDownloadError(error) {
        this.resetDownloadButton();
        this.hideProgress();
        this.showError(error);
        this.currentDownload = null;
    }

    resetDownloadButton() {
        this.downloadBtn.disabled = false;
        this.btnText.textContent = 'Download';
        this.btnLoader.style.display = 'none';
    }

    hideProgress() {
        this.progressContainer.style.display = 'none';
    }

    hideVideoInfo() {
        this.videoInfo.style.display = 'none';
    }

    hideMessages() {
        this.errorMessage.style.display = 'none';
        this.successMessage.style.display = 'none';
    }

    showError(message) {
        this.errorMessage.innerHTML = message;
        this.errorMessage.style.display = 'block';
        this.successMessage.style.display = 'none';
    }

    showSuccess(message) {
        this.successMessage.innerHTML = message;
        this.successMessage.style.display = 'block';
        this.errorMessage.style.display = 'none';
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new YouTubeDownloader();
});