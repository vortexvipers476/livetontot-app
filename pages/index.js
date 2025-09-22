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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Nonton Bareng | Buat Room</title>
        <meta name="description" content="Buat room untuk nonton bareng dengan teman-teman" />
      </Head>
      
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Nonton Bareng</h1>
          <p className="text-lg text-gray-600">Buat room untuk nonton bareng dengan teman-teman</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="namaGroup" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Group
                </label>
                <input
                  type="text"
                  id="namaGroup"
                  value={namaGroup}
                  onChange={(e) => setNamaGroup(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan nama group"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="film" className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Film
                </label>
                <select
                  id="film"
                  value={selectedFilm}
                  onChange={handleFilmChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {defaultFilms.map((film, index) => (
                    <option key={index} value={film.url}>
                      {film.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  atau Masukkan URL Video Custom
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/video.mp4"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="maxUsers" className="block text-sm font-medium text-gray-700 mb-1">
                  Maksimal Jumlah Peserta
                </label>
                <input
                  type="number"
                  id="maxUsers"
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(parseInt(e.target.value))}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition duration-200`}
              >
                {isLoading ? 'Membuat Room...' : 'Create Room'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Buat room, bagikan link, dan nonton bareng dengan teman-teman!</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
