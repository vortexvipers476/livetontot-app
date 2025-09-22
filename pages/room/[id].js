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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <Head>
          <title>Loading... | Nonton Bareng</title>
        </Head>
        
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-6 text-xl font-medium text-slate-300">Memuat room...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <Head>
          <title>Error | Nonton Bareng</title>
        </Head>
        
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>
        </div>
        
        <div className="relative z-10 card p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-4">
              <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
            <p className="text-slate-300 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="btn btn-primary"
            >
              Kembali ke Halaman Utama
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      <Head>
        <title>{room.namaGroup} | Nonton Bareng</title>
        <meta name="description" content={`Nonton bareng di room ${room.namaGroup}`} />
      </Head>
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="card p-6 mb-8 fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="heading heading-lg text-white">{room.namaGroup}</h1>
            <div className="flex items-center space-x-2">
              <div className="badge badge-primary">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                {room.users ? room.users.length : 0}/{room.maxUsers}
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
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-lg text-slate-300">Menghubungkan ke room...</p>
            </div>
          )}
        </div>
        
        <div className="card p-6 fade-in">
          <h2 className="text-xl font-bold text-white mb-4">Bagikan Link Room</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/room/${id}`}
              readOnly
              className="flex-1 px-4 py-3 rounded-lg"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/room/${id}`);
                alert('Link telah disalin!');
              }}
              className="btn btn-primary whitespace-nowrap"
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
