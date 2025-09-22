import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Memuat room...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Kembali ke Halaman Utama
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">{room.namaGroup}</h1>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  {room.users ? room.users.length : 0}/{room.maxUsers} Peserta
                </span>
              </div>
            </div>
            
            {userJoined ? (
              <>
                <VideoPlayer videoUrl={room.videoURL} />
                <CommentSection roomId={id} />
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-700 mb-4">Menghubungkan ke room...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Bagikan Link Room</h2>
          <div className="flex">
            <input
              type="text"
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/room/${id}`}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/room/${id}`);
                alert('Link telah disalin!');
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition"
            >
              Salin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
