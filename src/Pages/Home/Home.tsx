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

  function navigateToCreate(id?: number) {
    navigate(`createEvent/${id ?? ''}`);
  }

  // Group events by date
  const groupedEvents = events.reduce((groups, event) => {
    const dateKey = new Date(event.date).toLocaleDateString("en-UK");
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {} as Record<string, EventInstance[]>);

  return (
    <div className={style.container}>
      <h1>Your Events</h1>
      <div className={style.actions}>
        <button onClick={() => navigateToCreate()}>Create Event</button>
        <button onClick={() => {
          navigate("dailySummary");
        }}>Monthly Summary</button>
      </div>
      <div className={style.eventsList}>
        {Object.entries(groupedEvents).map(([date, dayEvents]) => (
          <div key={date} className={style.dayGroup}>
            <h2 className={style.dateHeader}>{date}</h2>
            <ul className={style.dayEvents}>
              {dayEvents.map((todo) => (
                <li key={todo.eventId} className={style.question}>
                  <div className={style.mainCardContent}>
                    <span className={style.title}>{todo.title}</span>
                    <button onClick={() => { navigateToCreate(todo.eventId); }}>Edit</button>
                    <p>Details: {todo.description}</p>
                    <div className={style.eventPeople}>
                      {todo.event_people.length ? (
                        <div>
                          <span>With: </span>
                          {todo.event_people.map((event_person, index) => (
                            <span
                              className={style.eventPerson}
                              key={event_person.people.personId}
                            >
                              {event_person.people.name}
                              {index === todo.event_people.length - 1 ? "" : ","}
                            </span>
                          ))}
                          <span className={style.metadata}>
                            {todo.withPartner ? " and Krisi" : ""}
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
                            <span> {todo?.measurements?.name}</span>
                          </>
                        ) : (
                          ""
                        )}
                      </div>
                      {todo.positive !== null && (
                        <p className={`${style.rating} ${todo.positive ? style.good : style.bad}`}>
                          {todo.positive ? "Good Experience" : "Bad Experience"}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
