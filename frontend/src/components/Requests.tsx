import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { SwapRequest } from '../types';

const Requests: React.FC = () => {
  const [incoming, setIncoming] = useState<SwapRequest[]>([]);
  const [outgoing, setOutgoing] = useState<SwapRequest[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [incRes, outRes] = await Promise.all([
        axios.get('/swaps/incoming-requests'),
        axios.get('/swaps/outgoing-requests'),
      ]);
      setIncoming(incRes.data);
      setOutgoing(outRes.data);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to fetch requests');
    }
  };

  const respond = async (requestId: string, accept: boolean) => {
    try {
      await axios.post(`/swaps/swap-response/${requestId}`, { accept });
      fetchRequests(); // Refresh for dynamic update
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to respond');
    }
  };

  return (
    <div>
      <h1>Swap Requests</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <h2>Incoming Requests</h2>
      <ul>
        {incoming.map((req) => (
          <li key={req._id}>
            {req.requesterUserId.name} offers "{req.mySlotId.title}" 
            ({new Date(req.mySlotId.startTime).toLocaleString()}) 
            for your "{req.theirSlotId.title}" 
            ({new Date(req.theirSlotId.startTime).toLocaleString()})
            <br />
            <button onClick={() => respond(req._id, true)}>Accept</button>
            <button onClick={() => respond(req._id, false)}>Reject</button>
          </li>
        ))}
      </ul>
      <h2>Outgoing Requests</h2>
      <ul>
        {outgoing.map((req) => (
          <li key={req._id}>
            Pending: Your "{req.mySlotId.title}" 
            ({new Date(req.mySlotId.startTime).toLocaleString()}) 
            for {req.requesteeUserId.name}'s "{req.theirSlotId.title}"
          </li>
        ))}
      </ul>
      <Link to="/dashboard">Back to Dashboard</Link>
    </div>
  );
};

export default Requests;