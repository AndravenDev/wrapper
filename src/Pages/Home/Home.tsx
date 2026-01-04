import { useState, useEffect } from "react";
import supabase from "../../utils/supabase";
import { useNavigate } from "react-router";
import style from "./Home.module.scss";

import "./Home.module.scss";
import type { EventInstance } from "../../utils/interfaces";

function Home() {
  const [events, setEvents] = useState<EventInstance[]>([]);
  let navigate = useNavigate();

  useEffect(() => {
    getEventInstances();
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

  return (
    <div>
      <button onClick={navigateToCreate}>Create Page</button>
      {events?.map((todo) => {
        return (
          <li key={todo.eventId} className={style.question}>
            <span className={style.title}>Title: {todo.title}</span>
            <span>On: {new Date(todo.date).toLocaleDateString("en-UK")}</span>
            <p>Details: {todo.description}</p>
            <div>
              {todo.ammount ? (
                <>
                  <span className={style.title}>{todo.ammount}</span>
                  <span>{todo?.measurements?.name}</span>
                </>
              ) : (
                ""
              )}
            </div>
            <p>At: {todo?.locations?.name}</p>
            {todo.event_people.length ? (
              <div>
                <p>With: </p>
                {todo.event_people.map((event_person) => {
                  return (
                    <p key={event_person.people.personId}>
                      {event_person.people.name}
                    </p>
                  );
                })}
              </div>
            ) : (
              <p>{todo.withPartner ? "With Krisi" : "By yourself"}</p>
            )}

            <p>
              {todo.positive === null
                ? ""
                : todo.positive === true
                ? "It Was a Good Experience"
                : "It Was a Bad Experience"}
            </p>
          </li>
        );
      })}
    </div>
  );
}

export default Home;
