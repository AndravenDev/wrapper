import { useState, useEffect } from 'react'
import supabase from '../../utils/supabase';
import { useNavigate } from "react-router";

import './Home.module.scss';
import type { EventInstance } from '../../utils/interfaces';

function Home() {
  const [events, setEvents] = useState<EventInstance[] | null>([]);
  let navigate = useNavigate();

  useEffect(() => {
    getEventInstances();
  }, []);

  async function getEventInstances() {
    const { data } = await supabase.from('event').select('*');
    console.log(data);
    setEvents(data);
  }

  function navigateToCreate() {
    navigate("createEvent");
  }
  
  return (
    <div>
      <button onClick={navigateToCreate}>Create Page</button>
      {events?.map((todo) => (
        <li key={todo.eventId}>{todo.title}</li>
      ))}
    </div>
  )
}

export default Home
