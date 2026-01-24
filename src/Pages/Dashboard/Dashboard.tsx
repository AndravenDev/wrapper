import { useEffect, useState } from "react";
import supabase from "../../utils/supabase";
import type { EventDTO } from "../../utils/interfaces";
import EventCard from "../../components/EventCard/EventCard";

interface CategoryStat {
  eventCount: number;
  categoryId: number;
}

export default function Dashboard() {
  const [categories, setCategories] = useState<[string, CategoryStat][]>();
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>();

  useEffect(() => {
    getAllEvents();
  }, []);

  async function getAllEvents() {
    const { data } = await supabase
      .from("event")
      .select(
        "*, location:locations!left(*), category:categories!left(*), measurement:measurements!left(*) ",
      );
    setEvents(data as EventDTO[]);
    setCategories(aggregateCategories(data as EventDTO[]));
  }

  function aggregateCategories(events: EventDTO[]) {
    var result = new Map<string, CategoryStat>();

    events.forEach((event) => {
      var exisintgRecord = result.get(event.category.name);

      if (exisintgRecord) {
        exisintgRecord.eventCount++;
      } else {
        result.set(event.category.name, {
          eventCount: 1,
          categoryId: event.category.id,
        });
      }
    });
    return Array.from(result).sort(
      ([, valA], [, valB]) => valB.eventCount - valA.eventCount,
    );
  }

  return (
    <>
      <div>
        {categories?.map(([name, value]) => {
          return (
            <div
              key={name}
              onClick={() => setSelectedCategory(value.categoryId)}
            >
              You did {name} {value.eventCount} times!
            </div>
          );
        })}
      </div>
      <div>
        {events
          .filter((x) => x.category.id === selectedCategory)
          .map((event) => {
            return (
              <EventCard
                event={{
                  title: event.title,
                  description: event.description,
                  locations: event.location,
                  categoryId: event.category.id,
                  ammount: event.ammount,
                  date: event.date,
                  withPartner: event.withPartner,
                  eventId: event.eventId,
                  positive: undefined,
                  measurements: event.measurement,
                  event_people: []
                }}
              />
            );
          })}
      </div>
    </>
  );
}
