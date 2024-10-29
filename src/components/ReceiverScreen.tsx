import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const ReceiverScreen = () => {
  const [socket, setSocket] = useState(null);
  const [incomingRocket, setIncomingRocket] = useState(null);
  const [completedSegments, setCompletedSegments] = useState([]);
  const [SEGMENTS, setSEGMENTS] = useState([1, 2, 3, 4, 5]);

  useEffect(() => {
    console.log('ReceiverScreen: Initializing');
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('ReceiverScreen: Connected to server');
      newSocket.emit('join', 'receiver');
    });

    newSocket.on('disconnect', () => {
      console.log('ReceiverScreen: Disconnected from server');
    });

    let isProcessing = false;

    const handleRocketIncoming = ({ rocketId }) => {
      console.log('ReceiverScreen: Rocket incoming event received:', rocketId);
      
      if (isProcessing) {
        console.log('ReceiverScreen: Ignoring duplicate rocket incoming event');
        return;
      }

      isProcessing = true;
      console.log('ReceiverScreen: Processing rocket incoming event');
      setIncomingRocket(rocketId);

      setTimeout(() => {
        setCompletedSegments(prevSegments => {
          console.log('ReceiverScreen: Current segments:', prevSegments.length);
          if (prevSegments.length < SEGMENTS.length) {
            console.log('ReceiverScreen: Adding new segment');
            return [...prevSegments, SEGMENTS[prevSegments.length]];
          }
          console.log('ReceiverScreen: All segments completed');
          return prevSegments;
        });
        setIncomingRocket(null);
        isProcessing = false;
        console.log('ReceiverScreen: Finished processing rocket incoming event');
      }, 2000);
    };

    const handlePlayerJoined = ({ role }) => {
      console.log('ReceiverScreen: Player joined:', role);
      if (role === "sender") {
        setIncomingRocket(null);
        setCompletedSegments([]);
        console.log('ReceiverScreen: Reset for new sender');
      }
    };

    newSocket.on('rocketIncoming', handleRocketIncoming);
    newSocket.on('playerJoined', handlePlayerJoined);

    return () => {
      console.log('ReceiverScreen: Cleaning up');
      newSocket.off('rocketIncoming', handleRocketIncoming);
      newSocket.off('playerJoined', handlePlayerJoined);
      newSocket.disconnect();
    };
  }, []);

  return (
    <div>
      {/* Render your ReceiverScreen components here */}
    </div>
  );
};

export default ReceiverScreen; 