import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Halaman utama untuk membuat room baru
const Home = () => {
  const router = useRouter();
  
  // State untuk form
  const [namaGroup, setNamaGroup] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [maxUsers, setMaxUsers] = useState(10);
  const [selectedFilm, setSelectedFilm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Daftar film default
  const defaultFilms = [
    { title: 'Pilih Film...', url: '' },
    { title: 'The Shawshank Redemption', url: 'https://www.youtube.com/watch?v=6hB3S9bIaco' },
    { title: 'The Godfather', url: 'https://www.youtube.com/watch?v=sY1S34973zA' },
    { title: 'The Dark Knight', url: 'https://www.youtube.com/watch?v=EXeTwQWrcwY' },
    { title: 'Pulp Fiction', url: 'https://www.youtube.com/watch?v=s7EdQ4FqbhY' },
    { title: 'Forrest Gump', url: 'https://www.youtube.com/watch?v=bLvqoHBptjg' }
  ];

  // Handle perubahan pada pilihan film
  const handleFilmChange = (e) => {
    const selectedUrl = e.target.value;
    setSelectedFilm(selectedUrl);
    setVideoUrl(selectedUrl);
  };

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!namaGroup || !videoUrl || maxUsers < 1) {
      alert('Mohon lengkapi semua field dengan benar!');
      return;
    }

    setIsLoading(true);

    try {
      // Kirim data ke API untuk membuat room
      const response = await fetch('/api/createRoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namaGroup,
          videoUrl,
          maxUsers: parseInt(maxUsers)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect ke halaman room
        router.push(`/room/${data.roomId}`);
      } else {
        alert(data.error || 'Gagal membuat room. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Head>
        <title>Nonton Bareng | Buat Room</title>
        <meta name="description" content="Buat room untuk nonton bareng dengan teman-teman" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10 fade-in">
          <h1 className="heading heading-xl gradient-text mb-4">Nonton Bareng</h1>
          <p className="text-lg text-slate-300 max-w-md mx-auto">
            Buat room, bagikan link, dan nonton bareng dengan teman-teman secara real-time
          </p>
        </div>
        
        <div className="card p-8 fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="namaGroup" className="block text-sm font-medium text-slate-300 mb-2">
                Nama Group
              </label>
              <input
                type="text"
                id="namaGroup"
                value={namaGroup}
                onChange={(e) => setNamaGroup(e.target.value)}
                className="w-full px-4 py-3 rounded-lg"
                placeholder="Masukkan nama group"
                required
              />
            </div>
            
            <div>
              <label htmlFor="film" className="block text-sm font-medium text-slate-300 mb-2">
                Pilih Film
              </label>
              <select
                id="film"
                value={selectedFilm}
                onChange={handleFilmChange}
                className="w-full px-4 py-3 rounded-lg"
              >
                {defaultFilms.map((film, index) => (
                  <option key={index} value={film.url}>
                    {film.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-slate-300 mb-2">
                atau Masukkan URL Video Custom
              </label>
              <input
                type="url"
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-lg"
                placeholder="https://example.com/video.mp4"
                required
              />
            </div>
            
            <div>
              <label htmlFor="maxUsers" className="block text-sm font-medium text-slate-300 mb-2">
                Maksimal Jumlah Peserta
              </label>
              <input
                type="number"
                id="maxUsers"
                value={maxUsers}
                onChange={(e) => setMaxUsers(parseInt(e.target.value))}
                min="1"
                max="100"
                className="w-full px-4 py-3 rounded-lg"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`btn btn-primary w-full ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Membuat Room...
                </span>
              ) : 'Create Room'}
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center text-slate-400 text-sm fade-in">
          <p>Buat room, bagikan link, dan nonton bareng dengan teman-teman!</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
