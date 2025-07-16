const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class YouTubeUtils {
    constructor() {
        this.downloadsDir = path.join(__dirname, '..', 'downloads');
        this.ensureDownloadsDir();
    }

    async ensureDownloadsDir() {
        try {
            await fs.access(this.downloadsDir);
        } catch {
            await fs.mkdir(this.downloadsDir, { recursive: true });
        }
    }

    async getVideoInfo(url) {
        return new Promise((resolve, reject) => {
            const ytDlp = spawn('yt-dlp', [
                '--print-json',
                '--no-download',
                url
            ]);

            let output = '';
            let error = '';

            ytDlp.stdout.on('data', (data) => {
                output += data.toString();
            });

            ytDlp.stderr.on('data', (data) => {
                error += data.toString();
            });

            ytDlp.on('close', (code) => {
                if (code === 0) {
                    try {
                        const info = JSON.parse(output);
                        resolve({
                            title: info.title,
                            duration: info.duration,
                            thumbnail: info.thumbnail,
                            uploader: info.uploader,
                            description: info.description,
                            view_count: info.view_count
                        });
                    } catch (parseError) {
                        reject(new Error('Failed to parse video information'));
                    }
                } else {
                    reject(new Error(`Failed to get video info: ${error}`));
                }
            });

            ytDlp.on('error', (err) => {
                reject(new Error(`yt-dlp error: ${err.message}`));
            });
        });
    }

    async downloadVideo(url, format, quality, progressCallback) {
        const downloadId = uuidv4();
        const outputTemplate = path.join(this.downloadsDir, `${downloadId}.%(ext)s`);
        
        let ytDlpArgs = [
            '--newline',
            '--progress',
            '-o', outputTemplate
        ];

        if (format === 'mp4') {
            if (quality === 'best') {
                ytDlpArgs.push('-f', 'bestvideo+bestaudio/best');
            } else {
                ytDlpArgs.push('-f', `bestvideo[height<=${quality.replace('p', '')}]+bestaudio/best[height<=${quality.replace('p', '')}]`);
            }
            ytDlpArgs.push('--merge-output-format', 'mp4');
        } else if (format === 'mp3') {
            ytDlpArgs.push(
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', quality
            );
        }

        ytDlpArgs.push(url);

        return new Promise((resolve, reject) => {
            const ytDlp = spawn('yt-dlp', ytDlpArgs);
            let filename = '';
            let downloadPath = '';

            ytDlp.stdout.on('data', (data) => {
                const output = data.toString();
                
                // Parse progress information
                const progressMatch = output.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
                if (progressMatch) {
                    const percentage = parseFloat(progressMatch[1]);
                    progressCallback(percentage, `Downloading... ${percentage.toFixed(1)}%`);
                }

                // Extract filename
                const filenameMatch = output.match(/\[download\] Destination: (.+)/);
                if (filenameMatch) {
                    downloadPath = filenameMatch[1];
                    filename = path.basename(downloadPath);
                }

                // Check for completion
                if (output.includes('[download] 100%') || output.includes('has already been downloaded')) {
                    progressCallback(100, 'Download complete!');
                }
            });

            ytDlp.stderr.on('data', (data) => {
                const error = data.toString();
                console.error('yt-dlp stderr:', error);
                
                // Some stderr output is just informational
                if (!error.toLowerCase().includes('error') && !error.toLowerCase().includes('failed')) {
                    return;
                }
                
                progressCallback(0, `Error: ${error}`);
            });

            ytDlp.on('close', (code) => {
                if (code === 0) {
                    resolve({
                        downloadId,
                        filename,
                        path: downloadPath
                    });
                } else {
                    reject(new Error('Download failed'));
                }
            });

            ytDlp.on('error', (err) => {
                reject(new Error(`yt-dlp error: ${err.message}`));
            });
        });
    }

    async cleanupFile(filePath, delay = 300000) { // 5 minutes default
        setTimeout(async () => {
            try {
                await fs.unlink(filePath);
                console.log(`Cleaned up file: ${filePath}`);
            } catch (error) {
                console.error(`Failed to cleanup file ${filePath}:`, error.message);
            }
        }, delay);
    }

    async cleanupOldFiles() {
        try {
            const files = await fs.readdir(this.downloadsDir);
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            for (const file of files) {
                const filePath = path.join(this.downloadsDir, file);
                const stats = await fs.stat(filePath);
                
                if (now - stats.mtime.getTime() > maxAge) {
                    await fs.unlink(filePath);
                    console.log(`Cleaned up old file: ${file}`);
                }
            }
        } catch (error) {
            console.error('Error cleaning up old files:', error);
        }
    }

    validateYouTubeUrl(url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
        return youtubeRegex.test(url);
    }
}

module.exports = YouTubeUtils;