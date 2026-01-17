import { useState, useEffect } from "react";
import supabase from "../../utils/supabase";
import { useNavigate } from "react-router";
import style from "./Home.module.scss";
import type { EventInstance } from "../../utils/interfaces";
import EventCard from "../../components/EventCard/EventCard";

function Home() {
  const [events, setEvents] = useState<EventInstance[]>([]);
  let navigate = useNavigate();

  useEffect(() => {
    getEventInstances();
    console.log('Events ', events);
  }, []);

  async function getEventInstances() {
    const { data } = await supabase
      .from("event")
      .select(
        `*, categories!inner(hidden), measurements!left(name), locations!left(name),  
        event_people(
          people(
            name
          )
        )`
      )
      .eq("categories.hidden", false)
      .order("date", { ascending: false });
    console.log(data);
    if (data?.length) {
      setEvents(data);
    }
  }

  function navigateToCreate() {
    navigate("createEvent");
  }

  function navigateToSummary() {
    navigate("summary");
  }

  return (
    <div className={style.homeWrapper}>
      <button onClick={navigateToCreate}>Create Page</button>
      <button onClick={navigateToSummary}>Summary</button>
      {events?.map((event) => (
        <EventCard key={event.eventId} event={event} />
      ))}
    </div>
  );
}

export default Home;
