import { useState, useEffect } from "react";
import supabase from "../../utils/supabase";
import style from "./Summary.module.scss";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LocationStat {
  locationId: number;
  name: string;
  timesVisited: number;
  totalSpent: number;
}

interface PersonStat {
  personId: number;
  name: string;
  timesSeen: number;
}

interface DailySpending {
  date: string;
  amount: number;
}

interface EventData {
  eventId: number;
  title: string;
  description: string;
  date: string;
  ammount: number;
  withPartner: boolean;
  locations: { locationId: number; name: string } | null;
  event_people: { people: { personId: number; name: string } }[];
}

type LocationSortKey = "timesVisited" | "totalSpent";
type PersonSortKey = "timesSeen";

function Summary() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [locations, setLocations] = useState<LocationStat[]>([]);
  const [people, setPeople] = useState<PersonStat[]>([]);
  const [dailySpending, setDailySpending] = useState<DailySpending[]>([]);
  const [locationSort, setLocationSort] = useState<LocationSortKey>("timesVisited");
  const [personSort, setPersonSort] = useState<PersonSortKey>("timesSeen");
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase
      .from("event")
      .select(
        `*, locations!left(locationId, name), event_people(people(personId, name))`
      )
      .order("date", { ascending: true });

    if (data) {
      setEvents(data);
      aggregateLocations(data);
      aggregatePeople(data);
      aggregateDailySpending(data);
    }
  }

  function aggregateLocations(events: any[]) {
    const locationMap = new Map<number, LocationStat>();

    events.forEach((event) => {
      if (event.locations) {
        const loc = event.locations;
        const existing = locationMap.get(loc.locationId);
        if (existing) {
          existing.timesVisited += 1;
          existing.totalSpent += event.ammount || 0;
        } else {
          locationMap.set(loc.locationId, {
            locationId: loc.locationId,
            name: loc.name,
            timesVisited: 1,
            totalSpent: event.ammount || 0,
          });
        }
      }
    });

    setLocations(Array.from(locationMap.values()));
  }

  function aggregatePeople(events: any[]) {
    const personMap = new Map<number, PersonStat>();

    events.forEach((event) => {
      event.event_people?.forEach((ep: any) => {
        const person = ep.people;
        if (person) {
          const existing = personMap.get(person.personId);
          if (existing) {
            existing.timesSeen += 1;
          } else {
            personMap.set(person.personId, {
              personId: person.personId,
              name: person.name,
              timesSeen: 1,
            });
          }
        }
      });
    });

    setPeople(Array.from(personMap.values()));
  }

  function aggregateDailySpending(events: any[]) {
    const spendingMap = new Map<string, number>();

    events.forEach((event) => {
      if (event.ammount) {
        const dateStr = new Date(event.date).toLocaleDateString("en-UK");
        const existing = spendingMap.get(dateStr) || 0;
        spendingMap.set(dateStr, existing + event.ammount);
      }
    });

    const spending = Array.from(spendingMap.entries()).map(([date, amount]) => ({
      date,
      amount,
    }));

    setDailySpending(spending);
  }

  const sortedLocations = [...locations].sort((a, b) => b[locationSort] - a[locationSort]);
  const sortedPeople = [...people].sort((a, b) => b[personSort] - a[personSort]);

  const selectedLocation = locations.find((l) => l.locationId === selectedLocationId);
  const locationEvents = events.filter(
    (e) => e.locations?.locationId === selectedLocationId
  );

  function handleLocationClick(locationId: number) {
    setSelectedLocationId(selectedLocationId === locationId ? null : locationId);
  }

  const selectedPerson = people.find((p) => p.personId === selectedPersonId);
  const personEvents = events.filter((e) =>
    e.event_people?.some((ep) => ep.people?.personId === selectedPersonId)
  );

  function handlePersonClick(personId: number) {
    setSelectedPersonId(selectedPersonId === personId ? null : personId);
  }

  return (
    <div className={style.summaryContainer}>
      <h1>Summary</h1>

      <section className={style.section}>
        <div className={style.sectionHeader}>
          <h2>Locations Visited ({locations.length})</h2>
          <div className={style.sortButtons}>
            <span>Sort by:</span>
            <button
              className={locationSort === "timesVisited" ? style.active : ""}
              onClick={() => setLocationSort("timesVisited")}
            >
              Times Visited
            </button>
            <button
              className={locationSort === "totalSpent" ? style.active : ""}
              onClick={() => setLocationSort("totalSpent")}
            >
              Amount Spent
            </button>
          </div>
        </div>
        <div className={style.locationsLayout}>
          <ul className={style.statList}>
            {sortedLocations.map((loc) => (
              <li
                key={loc.locationId}
                className={`${style.statItem} ${style.clickable} ${selectedLocationId === loc.locationId ? style.selected : ""}`}
                onClick={() => handleLocationClick(loc.locationId)}
              >
                <span className={style.name}>{loc.name}</span>
                <div className={style.stats}>
                  <span>{loc.timesVisited} visits</span>
                  <span>{loc.totalSpent.toFixed(2)} spent</span>
                </div>
              </li>
            ))}
          </ul>

          {selectedLocation && (
            <div className={style.eventsPanel}>
              <div className={style.eventsPanelHeader}>
                <h3>Events at {selectedLocation.name}</h3>
                <button onClick={() => setSelectedLocationId(null)}>Close</button>
              </div>
              <ul className={style.eventsList}>
                {locationEvents.map((event) => (
                  <li key={event.eventId} className={style.eventItem}>
                    <div className={style.eventMain}>
                      <span className={style.eventTitle}>
                        {event.title}
                        {event.withPartner && <span className={style.partnerBadge}>with Krisi</span>}
                      </span>
                      <p className={style.eventDescription}>{event.description}</p>
                    </div>
                    <div className={style.eventMeta}>
                      <span>{new Date(event.date).toLocaleDateString("en-UK")}</span>
                      {event.ammount > 0 && <span>{event.ammount.toFixed(2)}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className={style.section}>
        <div className={style.sectionHeader}>
          <h2>People Met ({people.length})</h2>
          <div className={style.sortButtons}>
            <span>Sort by:</span>
            <button
              className={personSort === "timesSeen" ? style.active : ""}
              onClick={() => setPersonSort("timesSeen")}
            >
              Times Seen
            </button>
          </div>
        </div>
        <div className={style.peopleLayout}>
          <ul className={style.statList}>
            {sortedPeople.map((person) => (
              <li
                key={person.personId}
                className={`${style.statItem} ${style.clickable} ${selectedPersonId === person.personId ? style.selected : ""}`}
                onClick={() => handlePersonClick(person.personId)}
              >
                <span className={style.name}>{person.name}</span>
                <div className={style.stats}>
                  <span>{person.timesSeen} times</span>
                </div>
              </li>
            ))}
          </ul>

          {selectedPerson && (
            <div className={style.eventsPanel}>
              <div className={style.eventsPanelHeader}>
                <h3>Events with {selectedPerson.name}</h3>
                <button onClick={() => setSelectedPersonId(null)}>Close</button>
              </div>
              <ul className={style.eventsList}>
                {personEvents.map((event) => (
                  <li key={event.eventId} className={style.eventItem}>
                    <div className={style.eventMain}>
                      <span className={style.eventTitle}>
                        {event.title}
                        {event.withPartner && <span className={style.partnerBadge}>with Krisi</span>}
                      </span>
                      <p className={style.eventDescription}>{event.description}</p>
                    </div>
                    <div className={style.eventMeta}>
                      <span>{new Date(event.date).toLocaleDateString("en-UK")}</span>
                      {event.ammount > 0 && <span>{event.ammount.toFixed(2)}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className={style.section}>
        <h2>Spending by Day</h2>
        <div className={style.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySpending}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#a0a0a0" fontSize={12} />
              <YAxis stroke="#a0a0a0" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(26, 26, 46, 0.95)",
                  border: "1px solid rgba(102, 126, 234, 0.3)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
                }}
                labelStyle={{ color: "#fff", fontWeight: 600 }}
                itemStyle={{ color: "#4ade80" }}
              />
              <Bar dataKey="amount" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default Summary;
