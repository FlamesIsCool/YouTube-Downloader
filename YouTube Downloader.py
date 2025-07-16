import os
from yt_dlp import YoutubeDL
from tkinter import Tk, Label, Entry, Button, filedialog, messagebox, Radiobutton, StringVar, OptionMenu

def download_video():
    url = url_entry.get()
    if not url:
        messagebox.showerror("Input Error", "Please enter a YouTube URL")
        return
    
    output_dir = filedialog.askdirectory()
    if not output_dir:
        messagebox.showerror("Directory Error", "Please select an output directory")
        return
    
    # Get selected browser for cookie extraction
    selected_browser = browser_choice.get()
    
    # Enhanced options for bot detection bypass
    ydl_opts = {
        'format': 'bestvideo+bestaudio/best',  # Download best video and audio available
        'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),
        'noplaylist': True,  # Ensure only a single video is downloaded, not the entire playlist
        'merge_output_format': 'mp4',  # Ensure the final format is MP4
        'postprocessors': [{
            'key': 'FFmpegVideoConvertor',
            'preferedformat': 'mp4',
        }],
        # Bot detection bypass features
        'cookies_from_browser': selected_browser if selected_browser != 'none' else None,
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'extractor_retries': 3,
        'sleep_interval': 1,
        'max_sleep_interval': 5,
        'http_headers': {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-us,en;q=0.5',
            'Sec-Fetch-Mode': 'navigate',
        }
    }

    if format_choice.get() == "audio":
        ydl_opts.update({
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'aac',
                'preferredquality': audio_quality.get(),
            }],
            'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s')
        })
    
    # Browser fallback order for cookie extraction
    browser_fallbacks = ['chrome', 'firefox', 'edge', 'safari'] if selected_browser == 'auto' else [selected_browser] if selected_browser != 'none' else []
    
    def try_download_with_browser(browser=None):
        """Attempt download with specified browser cookies or no cookies"""
        current_opts = ydl_opts.copy()
        if browser:
            current_opts['cookies_from_browser'] = browser
        elif 'cookies_from_browser' in current_opts:
            del current_opts['cookies_from_browser']
            
        with YoutubeDL(current_opts) as ydl:
            ydl.download([url])
    
    try:
        # First attempt with selected browser
        if browser_fallbacks:
            try_download_with_browser(browser_fallbacks[0])
        else:
            try_download_with_browser()
        messagebox.showinfo("Success", "Downloaded successfully!")
        
    except Exception as e:
        error_msg = str(e).lower()
        
        # Check for bot detection error
        if "sign in to confirm you're not a bot" in error_msg or "bot" in error_msg:
            # Try fallback browsers
            success = False
            for browser in browser_fallbacks[1:]:  # Skip first browser already tried
                try:
                    try_download_with_browser(browser)
                    messagebox.showinfo("Success", f"Downloaded successfully using {browser} cookies!")
                    success = True
                    break
                except Exception as fallback_error:
                    continue
            
            if not success:
                # Try without cookies as final fallback
                try:
                    try_download_with_browser(None)
                    messagebox.showinfo("Success", "Downloaded successfully without cookies!")
                except Exception as final_error:
                    messagebox.showerror("Bot Detection Error", 
                        "YouTube detected automation. Please:\n\n"
                        "1. Make sure you're signed into YouTube in your browser\n"
                        "2. Try a different browser option\n"
                        "3. Visit the video in your browser first\n\n"
                        f"Technical error: {str(final_error)}")
        else:
            messagebox.showerror("Download Error", f"An error occurred: {str(e)}")

# Setup the GUI
root = Tk()
root.title("YouTube Video/Shorts Downloader")

# Create and place GUI elements
Label(root, text="YouTube URL:").grid(row=0, column=0, padx=10, pady=10)
url_entry = Entry(root, width=50)
url_entry.grid(row=0, column=1, padx=10, pady=10)

# Format choice between video and audio
format_choice = StringVar(value="video")
Radiobutton(root, text="Video", variable=format_choice, value="video").grid(row=1, column=0, padx=10, pady=10, sticky='w')
Radiobutton(root, text="Audio", variable=format_choice, value="audio").grid(row=1, column=1, padx=10, pady=10, sticky='w')

# Browser choice for cookie extraction (bot detection bypass)
browser_choice = StringVar(value="auto")
Label(root, text="Browser Cookies:").grid(row=2, column=0, padx=10, pady=10, sticky='w')
browser_menu = OptionMenu(root, browser_choice, "auto", "chrome", "firefox", "edge", "safari", "none")
browser_menu.grid(row=2, column=1, padx=10, pady=10, sticky='w')

# Audio quality option for long-form audio downloads
audio_quality = StringVar(value="192")
Label(root, text="Audio Quality:").grid(row=3, column=0, padx=10, pady=10, sticky='w')
audio_quality_menu = OptionMenu(root, audio_quality, "128", "192", "256", "320")
audio_quality_menu.grid(row=3, column=1, padx=10, pady=10, sticky='w')

# Download button
download_button = Button(root, text="Download", command=download_video)
download_button.grid(row=4, column=0, columnspan=2, pady=20)

root.mainloop()