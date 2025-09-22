import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { db } from '../../lib/firebase';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import VideoPlayer from '../../components/VideoPlayer';
import CommentSection from '../../components/CommentSection';

// Halaman room untuk nonton bareng
const RoomPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userJoined, setUserJoined] = useState(false);
  const [userIp, setUserIp] = useState('');
  const [error, setError] = useState('');
  
  // Mendapatkan IP user
  useEffect(() => {
    const getUserIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setUserIp(data.ip);
      } catch (error) {
        console.error('Error getting IP:', error);
        setUserIp('unknown');
      }
    };
    
    getUserIp();
  }, []);
  
  // Mengambil data room dari Firestore
  useEffect(() => {
    if (!id) return;
    
    const roomRef = doc(db, 'rooms', id);
    
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const roomData = { id: doc.id, ...doc.data() };
        setRoom(roomData);
        
        // Cek apakah user sudah join
        if (userIp && roomData.users && roomData.users.includes(userIp)) {
          setUserJoined(true);
        }
      } else {
        setError('Room tidak ditemukan');
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching room:', error);
      setError('Gagal memuat data room');
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [id, userIp]);
  
  // Join room
  const joinRoom = async () => {
    if (!userIp || !room) return;
    
    try {
      // Cek apakah room sudah penuh
      if (room.users && room.users.length >= room.maxUsers) {
        setError('Room penuh!');
        return;
      }
      
      // Cek apakah user sudah join
      if (room.users && room.users.includes(userIp)) {
        setUserJoined(true);
        return;
      }
      
      // Update room dengan menambahkan user IP
      const roomRef = doc(db, 'rooms', id);
      await updateDoc(roomRef, {
        users: arrayUnion(userIp)
      });
      
      setUserJoined(true);
      setError('');
    } catch (error) {
      console.error('Error joining room:', error);
      setError('Gagal join room. Silakan coba lagi.');
    }
  };
  
  // Handle join room saat userIp tersedia
  useEffect(() => {
    if (userIp && room && !userJoined && !error) {
      joinRoom();
    }
  }, [userIp, room, userJoined, error]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-6 text-xl font-medium text-gray-700">Memuat room...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Error</h1>
            <p className="text-gray-600 mt-2 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Kembali ke Halaman Utama
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>{room.namaGroup} | Nonton Bareng</title>
        <meta name="description" content={`Nonton bareng di room ${room.namaGroup}`} />
      </Head>
      
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{room.namaGroup}</h1>
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {room.users ? room.users.length : 0}/{room.maxUsers} Peserta
                </div>
              </div>
            </div>
            
            {userJoined ? (
              <div className="space-y-8">
                <VideoPlayer videoUrl={room.videoURL} />
                <CommentSection roomId={id} />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-700">Menghubungkan ke room...</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bagikan Link Room</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/room/${id}`}
              readOnly
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/room/${id}`);
                alert('Link telah disalin!');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 whitespace-nowrap"
            >
              Salin Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
