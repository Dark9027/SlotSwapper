import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Event } from '../types';

const Marketplace: React.FC = () => {
  const [slots, setSlots] = useState<Event[]>([]);
  const [mySlots, setMySlots] = useState<Event[]>([]);
  const [selectedMySlot, setSelectedMySlot] = useState<string>('');
  const [selectedTheirSlot, setSelectedTheirSlot] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSlots();
    fetchMySlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const { data } = await axios.get('/swaps/swappable-slots');
      setSlots(data);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to fetch slots');
    }
  };

  const fetchMySlots = async () => {
    try {
      const { data } = await axios.get('/events');
      setMySlots(data.filter((e: Event) => e.status === 'SWAPPABLE'));
    } catch (err) {
      setError('Failed to fetch your slots');
    }
  };

  const requestSwap = async () => {
    try {
      await axios.post('/swaps/swap-request', { mySlotId: selectedMySlot, theirSlotId: selectedTheirSlot });
      alert('Request sent!');
      setSelectedMySlot('');
      setSelectedTheirSlot('');
      fetchSlots();
      fetchMySlots();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to send request');
    }
  };

  return (
    <div>
      <h1>Swappable Slots Marketplace</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {slots.map((slot) => (
          <li key={slot._id}>
            {slot.title} by {typeof slot.userId === 'object' ? slot.userId.name : 'Unknown'} 
            ({new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()})
            <br />
            <button onClick={() => setSelectedTheirSlot(slot._id)}>Request Swap</button>
            {selectedTheirSlot === slot._id && (
              <div>
                <select value={selectedMySlot} onChange={(e) => setSelectedMySlot(e.target.value)}>
                  <option value="">Choose your swappable slot</option>
                  {mySlots.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.title} ({new Date(s.startTime).toLocaleString()})
                    </option>
                  ))}
                </select>
                <button onClick={requestSwap} disabled={!selectedMySlot}>
                  Send Request
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {slots.length === 0 && <p>No swappable slots available.</p>}
    </div>
  );
};

export default Marketplace;