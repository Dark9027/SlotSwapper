import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Event } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout } = useContext(AuthContext)!;
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState({ title: '', startTime: '', endTime: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get('/events');
      setEvents(data);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to fetch events');
    }
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/events', { ...newEvent, startTime: new Date(newEvent.startTime), endTime: new Date(newEvent.endTime) });
      setNewEvent({ title: '', startTime: '', endTime: '' });
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to create event');
    }
  };

  const updateStatus = async (id: string, status: 'BUSY' | 'SWAPPABLE') => {
    try {
      await axios.put(`/events/${id}`, { status });
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to update event');
    }
  };

  return (
    <div>
      <h1>{user?.name}'s Dashboard</h1>
      <button onClick={logout}>Logout</button>
      <form onSubmit={createEvent}>
        <input
          placeholder="Title"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          required
        />
        <input
          type="datetime-local"
          value={newEvent.startTime}
          onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
          required
        />
        <input
          type="datetime-local"
          value={newEvent.endTime}
          onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
          required
        />
        <button type="submit">Add Event</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {events.map((event) => (
          <li key={event._id}>
            {event.title} ({new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()})
            - Status: {event.status}
            {event.status === 'BUSY' && (
              <button onClick={() => updateStatus(event._id, 'SWAPPABLE')}>Make Swappable</button>
            )}
            {event.status === 'SWAPPABLE' && (
              <button onClick={() => updateStatus(event._id, 'BUSY')}>Make Busy</button>
            )}
          </li>
        ))}
      </ul>
      <nav>
        <Link to="/marketplace">Marketplace</Link> | <Link to="/requests">Requests</Link>
      </nav>
    </div>
  );
};

export default Dashboard;