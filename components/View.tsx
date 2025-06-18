'use client';

import React, { useEffect, useState } from 'react';
import Ping from './Ping';

const View = ({ id }: { id: string }) => {
  const [totalViews, setTotalViews] = useState<number | null>(null);

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

  return (
    <div className='view-container'>
      <div className="absolute -top-2 -right-2">
        <Ping />
      </div>
      <p className="view-text">
        <span className="font-black">
          {totalViews !== null ? totalViews : '...'}
        </span>
      </p>
    </div>
  );
};

export default View;
