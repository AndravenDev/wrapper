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
            <div className={style.mainCardContent}>
              <span className={style.title}>{todo.title}</span>
              <p>Details: {todo.description}</p>
              <div className={style.eventPeople}>
                {todo.event_people.length ? (
                  <div>
                    <span>With: </span>
                    {todo.event_people.map((event_person, index) => {
                      return (
                        <span
                          className={style.eventPerson}
                          key={event_person.people.personId}
                        >
                          {event_person.people.name}
                          {index === todo.event_people.length - 1 ? "" : ","}
                        </span>
                      );
                    })}
                    <span className={style.metadata}>
                      {todo.withPartner ? "and Krisi" : ""}
                    </span>
                  </div>
                ) : (
                  <p className={style.metadata}>
                    {todo.withPartner ? "With Krisi" : "By yourself"}
                  </p>
                )}
              </div>
            </div>

            <div className={style.eventMetaData}>
              <div>
                <span>
                  On:{" "}
                  <span className={style.metadata}>
                    {new Date(todo.date).toLocaleDateString("en-UK")}
                  </span>
                </span>
                <p>
                  At:{" "}
                  <span className={style.metadata}>
                    {todo?.locations?.name}
                  </span>
                </p>
                <div>
                  {todo.ammount ? (
                    <>
                      <span className={`${style.ammount} ${style.metadata}`}>
                        {todo.ammount}
                      </span>
                      <span>{todo?.measurements?.name}</span>
                    </>
                  ) : (
                    ""
                  )}
                </div>
                <p className={`${style.rating} ${style.metadata}`}>
                  {todo.positive === null
                    ? ""
                    : todo.positive === true
                    ? "Good Experience"
                    : "Bad Experience"}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </div>
  );
}

export default Home;
