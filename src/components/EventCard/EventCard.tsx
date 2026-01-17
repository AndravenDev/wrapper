import type { EventInstance } from "../../utils/interfaces";
import style from "./EventCard.module.scss";

export interface EventCardProps {
  event: EventInstance;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div
      className={`${style.gradientBorder} ${event.positive === null ? style.midExperience : event.positive === true ? style.goodExperience : style.badExperience}`}
    >
      <li className={style.eventCard}>
        <div className={style.mainCardContent}>
          <span className={style.title}>{event.title}</span>
          <p>Details: {event.description}</p>
          <div className={style.eventPeople}>
            {event.event_people.length ? (
              <div>
                <span>With: </span>
                {event.event_people.map((event_person, index) => {
                  return (
                    <span
                      className={style.eventPerson}
                      key={event_person.people.personId}
                    >
                      {event_person.people.name}
                      {index === event.event_people.length - 1 ? "" : ","}
                    </span>
                  );
                })}
                <span className={style.metadata}>
                  {event.withPartner ? "and Krisi" : ""}
                </span>
              </div>
            ) : (
              <p className={style.metadata}>
                {event.withPartner ? "With Krisi" : "By yourself"}
              </p>
            )}
          </div>
        </div>

        <div className={style.eventMetaData}>
          <div>
            <span>
              On:{" "}
              <span className={style.metadata}>
                {new Date(event.date).toLocaleDateString("en-UK")}
              </span>
            </span>
            <p>
              At:{" "}
              <span className={style.metadata}>{event?.locations?.name}</span>
            </p>
            <div>
              {event.ammount ? (
                <>
                  <span className={`${style.ammount} ${style.metadata}`}>
                    {event.ammount}
                  </span>
                  <span>{event?.measurements?.name}</span>
                </>
              ) : (
                ""
              )}
            </div>
            <p className={`${style.rating} ${style.metadata}`}>
              {event.positive === null
                ? ""
                : event.positive === true
                  ? "Good Experience"
                  : "Bad Experience"}
            </p>
          </div>
        </div>
      </li>
    </div>
  );
}
