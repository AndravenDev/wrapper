import { useState, useEffect } from "react";
import supabase from "../../utils/supabase";
import { useNavigate } from "react-router";
import style from "./Home.module.scss";

import "./Home.module.scss";
import type { EventInstance } from "../../utils/interfaces";

function Home() {
  const [events, setEvents] = useState<EventInstance[] | null>([]);
  let navigate = useNavigate();

  useEffect(() => {
    getEventInstances();
  }, []);

  async function getEventInstances() {
    const { data } = await supabase
      .from("event")
      .select(`*, categories!inner(hidden)`)
      .eq("categories.hidden", false);
    console.log(data);
    setEvents(data);
  }

  function navigateToCreate() {
    navigate("createEvent");
  }

  return (
    <div>
      <button onClick={navigateToCreate}>Create Page</button>
      {events?.map((todo) => {
        return (
          <li key={todo.eventId} className={style.question}>
            <p>{todo.title}</p>
            <p>{todo.description}</p>
            <p>
              {todo.positive ? "It was good" : "It was bad"}
            </p>
          </li>
        );
      })}
    </div>
  );
}

export default Home;
