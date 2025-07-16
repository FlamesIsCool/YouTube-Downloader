const express = require('express');
const path = require('path');
const YouTubeUtils = require('../utils/youtube');

const router = express.Router();
const youtubeUtils = new YouTubeUtils();

// Store active downloads
const activeDownloads = new Map();

// Get video information
router.post('/video-info', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        if (!youtubeUtils.validateYouTubeUrl(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        const videoInfo = await youtubeUtils.getVideoInfo(url);
        res.json(videoInfo);
    } catch (error) {
        console.error('Error getting video info:', error);
        res.status(500).json({ error: error.message || 'Failed to get video information' });
    }
});

// Download video
router.post('/download', async (req, res) => {
    try {
        const { url, format, quality } = req.body;
        
        // Validation
        if (!url || !format || !quality) {
            return res.status(400).json({ error: 'URL, format, and quality are required' });
        }

        if (!youtubeUtils.validateYouTubeUrl(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        if (!['mp4', 'mp3'].includes(format)) {
            return res.status(400).json({ error: 'Format must be mp4 or mp3' });
        }

        const wss = req.app.get('wss');
        
        // Progress callback function
        const progressCallback = (percentage, status) => {
            const message = {
                type: 'progress',
                downloadId: downloadResult.downloadId,
                progress: percentage,
                status
            };
            
            // Broadcast to all connected clients
            wss.clients.forEach(client => {
                if (client.readyState === 1) { // WebSocket.OPEN
                    client.send(JSON.stringify(message));
                }
            });
        };

        // Start download
        let downloadResult;
        try {
            downloadResult = await youtubeUtils.downloadVideo(url, format, quality, progressCallback);
        } catch (downloadError) {
            console.error('Download error:', downloadError);
            
            // Send error via WebSocket
            const errorMessage = {
                type: 'error',
                error: downloadError.message || 'Download failed'
            };
            
            wss.clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(JSON.stringify(errorMessage));
                }
            });
            
            return res.status(500).json({ error: downloadError.message || 'Download failed' });
        }

        // Store download info
        activeDownloads.set(downloadResult.downloadId, {
            filename: downloadResult.filename,
            path: downloadResult.path,
            timestamp: Date.now()
        });

        // Schedule file cleanup
        youtubeUtils.cleanupFile(downloadResult.path);

        // Send completion message via WebSocket
        const completionMessage = {
            type: 'complete',
            downloadId: downloadResult.downloadId,
            downloadUrl: `/api/file/${downloadResult.downloadId}`,
            filename: downloadResult.filename
        };
        
        wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(JSON.stringify(completionMessage));
            }
        });

        res.json({
            downloadId: downloadResult.downloadId,
            downloadUrl: `/api/file/${downloadResult.downloadId}`,
            filename: downloadResult.filename
        });

    } catch (error) {
        console.error('Error in download route:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

// Serve downloaded files
router.get('/file/:downloadId', (req, res) => {
    try {
        const { downloadId } = req.params;
        const download = activeDownloads.get(downloadId);
        
        if (!download) {
            return res.status(404).json({ error: 'File not found or expired' });
        }

        const filePath = download.path;
        const filename = download.filename;

        // Check if file exists
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            activeDownloads.delete(downloadId);
            return res.status(404).json({ error: 'File not found' });
        }

        // Set appropriate headers
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error serving file' });
            }
        });

        fileStream.on('end', () => {
            console.log(`File served: ${filename}`);
        });

    } catch (error) {
        console.error('Error serving file:', error);
        res.status(500).json({ error: 'Error serving file' });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        activeDownloads: activeDownloads.size
    });
});

// Cleanup old downloads periodically
setInterval(() => {
    youtubeUtils.cleanupOldFiles();
    
    // Clean up expired download references
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [downloadId, download] of activeDownloads.entries()) {
        if (now - download.timestamp > maxAge) {
            activeDownloads.delete(downloadId);
        }
    }
}, 60 * 60 * 1000); // Run every hour

module.exports = router;