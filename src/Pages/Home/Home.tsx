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
      .eq("categories.hidden", false)
      .order("date", { ascending: false });
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
            <span className={style.title}>{todo.title}</span>
            <span>{new Date(todo.date).toLocaleDateString("en-UK")}</span>
            <p>{todo.description}</p>
            <p>
              {todo.positive === null
                ? ""
                : todo.positive === true
                ? "Good Experience"
                : "Bad Experience"}
            </p>
          </li>
        );
      })}
    </div>
  );
}

export default Home;
