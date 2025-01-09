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
    
    # Options for long-form videos and shorts
    ydl_opts = {
        'format': 'bestvideo+bestaudio/best',  # Download best video and audio available
        'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),
        'noplaylist': True,  # Ensure only a single video is downloaded, not the entire playlist
        'merge_output_format': 'mp4',  # Ensure the final format is MP4
        'postprocessors': [{
            'key': 'FFmpegVideoConvertor',
            'preferedformat': 'mp4',
        }],
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
    
    try:
        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        messagebox.showinfo("Success", "Downloaded successfully!")
    except Exception as e:
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

# Audio quality option for long-form audio downloads
audio_quality = StringVar(value="192")
Label(root, text="Audio Quality:").grid(row=2, column=0, padx=10, pady=10, sticky='w')
audio_quality_menu = OptionMenu(root, audio_quality, "128", "192", "256", "320")
audio_quality_menu.grid(row=2, column=1, padx=10, pady=10, sticky='w')

# Download button
download_button = Button(root, text="Download", command=download_video)
download_button.grid(row=3, column=0, columnspan=2, pady=20)

root.mainloop()