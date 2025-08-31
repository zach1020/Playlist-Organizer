# Capys Playlist Organizer 🎵

A modern Next.js web application that organizes your Spotify playlists by BPM (Beats Per Minute) and Camelot number for seamless DJing. Create perfectly organized playlists that flow naturally from track to track.

## ✨ Features

- **BPM Organization**: Groups tracks by tempo ranges (Downtempo, Hip-Hop, House, Techno, Drum & Bass, etc.)
- **Camelot Wheel Integration**: Secondary organization by musical key using the Camelot notation system
- **Spotify Integration**: Connect your Spotify account and access all your playlists
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **Smart Grouping**: Automatically organizes tracks for optimal DJ transitions
- **New Playlist Creation**: Generates a new organized playlist in your Spotify account

## 🎯 Perfect for DJs

- **Smooth Transitions**: Tracks are organized by compatible keys and BPM ranges
- **Energy Flow**: Build your set from slower to faster tempos
- **Key Compatibility**: Use the Camelot wheel to find tracks that mix harmoniously
- **Professional Organization**: Create sets that sound like they were mixed by a pro

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Spotify account
- Spotify Developer account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Capys_Playlist_Organizer
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Spotify API

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Add `http://localhost:3000` to your Redirect URIs
4. Copy your Client ID and Client Secret

### 4. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Edit `.env.local` with your Spotify credentials:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3000
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎵 How It Works

### 1. **Connect to Spotify**
   - Click "Connect with Spotify" to authorize the application
   - Grant permissions to access your playlists and create new ones

### 2. **Select a Playlist**
   - Browse through your Spotify playlists
   - Use the search function to find specific playlists
   - Click on a playlist to select it

### 3. **Automatic Organization**
   - The app fetches all tracks with their audio features
   - Groups tracks by BPM ranges (60-79, 80-99, 100-119, etc.)
   - Further organizes by Camelot notation (1A, 1B, 2A, 2B, etc.)

### 4. **Create Organized Playlist**
   - Review the organized structure
   - Click "Create Organized Playlist" to generate a new playlist
   - The new playlist appears in your Spotify account

## 🎨 BPM Ranges

- **60-79 BPM**: Downtempo
- **80-99 BPM**: Hip-Hop
- **100-119 BPM**: House
- **120-139 BPM**: Techno
- **140-159 BPM**: Drum & Bass
- **160-179 BPM**: Hardcore
- **180+ BPM**: Extreme

## 🎼 Camelot Notation

The Camelot wheel organizes musical keys for easy mixing:

- **A (Minor)**: 1A, 2A, 3A, 4A, 5A, 6A, 7A, 8A, 9A, 10A, 11A, 12A
- **B (Major)**: 1B, 2B, 3B, 4B, 5B, 6B, 7B, 8B, 9B, 10B, 11B, 12B

Adjacent numbers and same letters mix harmoniously!

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: Spotify Web API
- **Authentication**: OAuth 2.0 with Spotify

## 📁 Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Spotify authentication
│   │   └── playlist-tracks/ # Playlist data fetching
│   ├── components/          # React components
│   │   ├── PlaylistSelector.tsx
│   │   └── TrackList.tsx
│   ├── utils/               # Utility functions
│   │   ├── playlistOrganizer.ts
│   │   └── spotifyApi.ts
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main page
│   └── types.ts             # TypeScript types
├── public/                  # Static assets
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## 🔧 Configuration

### Spotify API Scopes

The application requests the following permissions:
- `playlist-read-private`: Read your private playlists
- `playlist-read-collaborative`: Read collaborative playlists
- `playlist-modify-public`: Create and modify public playlists
- `playlist-modify-private`: Create and modify private playlists
- `user-read-private`: Read your profile information

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SPOTIFY_CLIENT_ID` | Your Spotify app client ID | Yes |
| `SPOTIFY_CLIENT_SECRET` | Your Spotify app client secret | Yes |
| `SPOTIFY_REDIRECT_URI` | OAuth redirect URI | Yes |

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Set environment variables on your hosting platform
4. Update `SPOTIFY_REDIRECT_URI` to your production domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for providing the music data
- [Camelot Wheel](https://mixedinkey.com/harmonic-mixing-guide/) for the musical key organization system
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the beautiful styling system

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include your environment details and error messages

---

**Happy DJing! 🎧🎵**
