'use client';

import React, { useEffect, useState, useRef } from 'react';
import Ping from './Ping';

const View = ({ id }: { id: string }) => {
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const hasIncremented = useRef(false);

  // Initial fetch of views
  useEffect(() => {
    const fetchViews = async () => {
      try {
        const res = await fetch(`/api/views?id=${id}`);
        if (!res.ok) {
          console.error('Failed to fetch views:', res.statusText);
          return;
        }

        const data = await res.json();
        setTotalViews(data.views);
      } catch (error) {
        console.error('Error fetching views:', error);
      }
    };

    fetchViews();
  }, [id]);

  // Increment views only once
  useEffect(() => {
    const incrementViews = async () => {
      if (hasIncremented.current) return;
      
      try {
        const res = await fetch(`/api/views?id=${id}`, { method: 'POST' });
        if (!res.ok) {
          console.error('Failed to update views:', res.statusText);
          return;
        }

        const data = await res.json();
        if (data.success) {
          setTotalViews(data.views);
          hasIncremented.current = true;
        }
      } catch (error) {
        console.error('Error updating views:', error);
      }
    };

    incrementViews();
  }, [id]);

  return (
    <div className='view-container'>
      <div className="absolute -top-2 -right-2">
        <Ping />
      </div>
      <p className="view-text">
        <span className="font-black">
          Views: {totalViews !== null ? totalViews : '...'}
        </span>
      </p>
    </div>
  );
};

export default View;
