import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import supabase from "../../utils/supabase";
import style from "./DailySummary.module.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PersonMet {
  personId: number;
  name: string;
  eventCount: number;
}

interface LocationVisited {
  locationId: number;
  name: string;
  totalSpent: number;
  visitCount: number;
}

interface LocationEvent {
  eventId: number;
  title: string;
  description: string;
  date: string;
  ammount: number;
  measurements: { name: string } | null;
  locations: { name: string } | null;
}

interface CategorySummary {
  id: number;
  name: string;
  eventCount: number;
}

interface DailySpending {
  date: string;
  amount: number;
}

type LocationSortOption = "none" | "spending" | "visits";

export default function DailySummary() {
  const [numberOfEvents, setNumberOfEvents] = useState(0);
  const [peopleMet, setPeopleMet] = useState<PersonMet[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategorySummary | null>(null);
  const [categoryEvents, setCategoryEvents] = useState<LocationEvent[]>([]);
  const [locationsVisited, setLocationsVisited] = useState<LocationVisited[]>([]);
  const [locationSort, setLocationSort] = useState<LocationSortOption>("none");
  const [selectedLocation, setSelectedLocation] = useState<LocationVisited | null>(null);
  const [locationEvents, setLocationEvents] = useState<LocationEvent[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<PersonMet | null>(null);
  const [personEvents, setPersonEvents] = useState<LocationEvent[]>([]);
  const [peopleSearch, setPeopleSearch] = useState("");
  const [peopleSearchFocused, setPeopleSearchFocused] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationSearchFocused, setLocationSearchFocused] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [dailySpending, setDailySpending] = useState<DailySpending[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayEvents, setDayEvents] = useState<LocationEvent[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getSummaryData();
    getNumberOfPeople();
    getCategories();
    getSpending();
    getDailySpending();
    getLocationsVisited();
  }, []);

  async function getSummaryData() {
    const { count, error } = await supabase
      .from("event")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log("Error fetching events: ", error);
    }

    setNumberOfEvents(count ?? 0);
  }

  async function getNumberOfPeople() {
    const { data, error } = await supabase
      .from("event_people")
      .select("*, people!inner(*)");

    if (error) {
      console.log("Error fetching people: ", error);
      return;
    }

    if (data?.length) {
      // Count events per person
      const peopleCount = new Map<number, PersonMet>();
      data.forEach((item: { people: { personId: number; name: string } }) => {
        const existing = peopleCount.get(item.people.personId);
        if (existing) {
          existing.eventCount += 1;
        } else {
          peopleCount.set(item.people.personId, {
            personId: item.people.personId,
            name: item.people.name,
            eventCount: 1,
          });
        }
      });
      // Sort by event count descending
      const sorted = Array.from(peopleCount.values()).sort(
        (a, b) => b.eventCount - a.eventCount
      );
      setPeopleMet(sorted);
    }
  }

  async function getCategories() {
    const { data, error } = await supabase
      .from("event")
      .select("categoryId, categories!inner(id, name, hidden)")
      .eq("categories.hidden", false);

    if (error) {
      console.log("Error fetching categories: ", error);
      return;
    }

    if (data?.length) {
      // Count events per category
      const categoryCount = new Map<number, CategorySummary>();
      data.forEach((item: { categoryId: number; categories: { id: number; name: string; hidden: any }[] }) => {
        if (item.categories && item.categories.length > 0) {
          const category = item.categories[0]; // Access first category or iterate
          const existing = categoryCount.get(category.id);
          if (existing) {
            existing.eventCount += 1;
          } else {
            categoryCount.set(category.id, {
              id: category.id,
              name: category.name,
              eventCount: 1,
            });
          }
        }
      });
      // Sort by event count descending
      const sorted = Array.from(categoryCount.values()).sort(
        (a, b) => b.eventCount - a.eventCount
      );
      setCategories(sorted);
    }
  }

  async function getSpending() {
    const { data, error } = await supabase
      .from("event")
      .select(`*, measurements!left(*)`)
      .eq("measurementId", 1);

    if (error) {
      console.log("Error fetching spending: ", error);
      return;
    }

    let result = 0;
    data?.forEach((event: { ammount: number }) => {
      result += event.ammount ?? 0;
    });
    setTotalSpent(result);
  }

  async function getDailySpending() {
    const { data, error } = await supabase
      .from("event")
      .select("date, ammount")
      .eq("measurementId", 1)
      .order("date", { ascending: true });

    if (error) {
      console.log("Error fetching daily spending: ", error);
      return;
    }

    if (data?.length) {
      // Aggregate spending by day
      const spendingByDay = new Map<string, number>();
      data.forEach((event: { date: string; ammount: number }) => {
        const dateKey = new Date(event.date).toLocaleDateString("en-UK");
        const existing = spendingByDay.get(dateKey) ?? 0;
        spendingByDay.set(dateKey, existing + (event.ammount ?? 0));
      });

      const result: DailySpending[] = Array.from(spendingByDay.entries()).map(
        ([date, amount]) => ({ date, amount })
      );
      setDailySpending(result);
    }
  }

  async function getLocationsVisited() {
    const { data, error } = await supabase
      .from("event")
      .select("locationId, ammount, measurementId, locations!inner(locationId, name)");

    if (error) {
      console.log("Error fetching locations: ", error);
      return;
    }

    if (data?.length) {
      // Aggregate visit count and spending per location
      const locationData = new Map<number, LocationVisited>();
      data.forEach((item: { ammount: number; measurementId: number; locations: { locationId: number; name: string } }) => {
        if (item.locations) {
          const existing = locationData.get(item.locations.locationId);
          const spendingAmount = item.measurementId === 1 ? (item.ammount ?? 0) : 0;

          if (existing) {
            existing.visitCount += 1;
            existing.totalSpent += spendingAmount;
          } else {
            locationData.set(item.locations.locationId, {
              locationId: item.locations.locationId,
              name: item.locations.name,
              totalSpent: spendingAmount,
              visitCount: 1,
            });
          }
        }
      });
      setLocationsVisited(Array.from(locationData.values()));
    }
  }

  const sortedLocations = [...locationsVisited].sort((a, b) => {
    if (locationSort === "spending") return b.totalSpent - a.totalSpent;
    if (locationSort === "visits") return b.visitCount - a.visitCount;
    return 0;
  });

  const filteredPeople = peopleMet.filter((person) =>
    person.name.toLowerCase().includes(peopleSearch.toLowerCase())
  );

  const peopleSuggestions = peopleSearch
    ? peopleMet.filter((person) =>
        person.name.toLowerCase().includes(peopleSearch.toLowerCase())
      ).slice(0, 5)
    : [];

  const filteredLocations = sortedLocations.filter((location) =>
    location.name.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const locationSuggestions = locationSearch
    ? sortedLocations.filter((location) =>
        location.name.toLowerCase().includes(locationSearch.toLowerCase())
      ).slice(0, 5)
    : [];

  const chartData = {
    labels: dailySpending.map((d) => d.date),
    datasets: [
      {
        label: "Amount Spent",
        data: dailySpending.map((d) => Math.round(d.amount * 100) / 100),
        backgroundColor: "rgba(102, 126, 234, 0.6)",
        borderColor: "#667eea",
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_event: unknown, elements: { index: number }[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const clickedDate = dailySpending[index].date;
        handleDayClick(clickedDate);
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
  };

  async function handleDayClick(dateStr: string) {
    setSelectedDay(dateStr);

    // Parse the date string (dd/mm/yyyy) to create date range
    const [day, month, year] = dateStr.split("/").map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, day));
    const endDate = new Date(Date.UTC(year, month - 1, day + 1));

    const { data, error } = await supabase
      .from("event")
      .select("eventId, title, description, date, ammount, measurements!left(name), locations!left(name)")
      .gte("date", startDate.toISOString())
      .lt("date", endDate.toISOString())
      .order("date", { ascending: false });

    if (error) {
      console.log("Error fetching day events: ", error);
      return;
    }

    setDayEvents(data ?? []);
  }

  async function handleLocationClick(location: LocationVisited) {
    if (selectedLocation?.locationId === location.locationId) {
      setSelectedLocation(null);
      setLocationEvents([]);
      return;
    }

    setSelectedLocation(location);

    const { data, error } = await supabase
      .from("event")
      .select("eventId, title, description, date, ammount, measurements!left(name), locations!left(name)")
      .eq("locationId", location.locationId)
      .order("date", { ascending: false });

    if (error) {
      console.log("Error fetching location events: ", error);
      return;
    }

    setLocationEvents(data ?? []);
  }

  async function handlePersonClick(person: PersonMet) {
    if (selectedPerson?.personId === person.personId) {
      setSelectedPerson(null);
      setPersonEvents([]);
      return;
    }

    setSelectedPerson(person);

    const { data, error } = await supabase
      .from("event_people")
      .select("event!inner(eventId, title, description, date, ammount, measurements!left(name), locations!left(name))")
      .eq("personId", person.personId)
      .order("event(date)", { ascending: false });

    if (error) {
      console.log("Error fetching person events: ", error);
      return;
    }

    const events = data?.map((item: { event: LocationEvent }) => item.event) ?? [];
    setPersonEvents(events);
  }

  async function handleCategoryClick(category: CategorySummary) {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
      setCategoryEvents([]);
      return;
    }

    setSelectedCategory(category);

    const { data, error } = await supabase
      .from("event")
      .select("eventId, title, description, date, ammount, measurements!left(name), locations!left(name)")
      .eq("categoryId", category.id)
      .order("date", { ascending: false });

    if (error) {
      console.log("Error fetching category events: ", error);
      return;
    }

    setCategoryEvents(data ?? []);
  }

  return (
    <div className={style.container}>
      <button onClick={() => navigate("/")}>Back to Home</button>
      <h2>All Time Summary</h2>

      <div className={style.stat}>
        <p>You had <strong>{numberOfEvents}</strong> events</p>
        <div className={style.locationsContainer}>
          {categories.length > 0 && (
            <ul className={style.locationsList}>
              {categories.map((category) => (
                <li
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`${style.locationItem} ${selectedCategory?.id === category.id ? style.selected : ""}`}
                >
                  {category.name} - {category.eventCount} events
                </li>
              ))}
            </ul>
          )}
          {selectedCategory && (
            <div className={style.eventsPanel}>
              <h4>Events in {selectedCategory.name}</h4>
              {categoryEvents.length > 0 ? (
                <ul>
                  {categoryEvents.map((event) => (
                    <li key={event.eventId} className={style.eventItem}>
                      <strong>{event.title}</strong>
                      <p>{event.description}</p>
                      <span className={style.eventMeta}>
                        {new Date(event.date).toLocaleDateString("en-UK")}
                        {event.locations?.name ? ` @ ${event.locations.name}` : ""}
                        {event.ammount ? ` - ${event.ammount} ${event.measurements?.name ?? ""}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No events found</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={style.stat}>
        <p>You met <strong>{peopleMet.length}</strong> people</p>
        <div className={style.searchContainer}>
          <input
            type="text"
            placeholder="Search people..."
            value={peopleSearch}
            onChange={(e) => setPeopleSearch(e.target.value)}
            onFocus={() => setPeopleSearchFocused(true)}
            onBlur={() => setTimeout(() => setPeopleSearchFocused(false), 200)}
            className={style.searchInput}
          />
          {peopleSearchFocused && peopleSuggestions.length > 0 && (
            <ul className={style.suggestions}>
              {peopleSuggestions.map((person) => (
                <li
                  key={person.personId}
                  onClick={() => {
                    setPeopleSearch(person.name);
                    handlePersonClick(person);
                  }}
                >
                  {person.name} - {person.eventCount} events
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={style.locationsContainer}>
          {filteredPeople.length > 0 && (
            <ul className={style.locationsList}>
              {filteredPeople.map((person) => (
                <li
                  key={person.personId}
                  onClick={() => handlePersonClick(person)}
                  className={`${style.locationItem} ${selectedPerson?.personId === person.personId ? style.selected : ""}`}
                >
                  {person.name} - {person.eventCount} events
                </li>
              ))}
            </ul>
          )}
          {selectedPerson && (
            <div className={style.eventsPanel}>
              <h4>Events with {selectedPerson.name}</h4>
              {personEvents.length > 0 ? (
                <ul>
                  {personEvents.map((event) => (
                    <li key={event.eventId} className={style.eventItem}>
                      <strong>{event.title}</strong>
                      <p>{event.description}</p>
                      <span className={style.eventMeta}>
                        {new Date(event.date).toLocaleDateString("en-UK")}
                        {event.locations?.name ? ` @ ${event.locations.name}` : ""}
                        {event.ammount ? ` - ${event.ammount} ${event.measurements?.name ?? ""}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No events found</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={style.stat}>
        <p>You spent <strong>{totalSpent.toFixed(2)}</strong> in total</p>
        {dailySpending.length > 0 && (
          <div className={style.chartContainer}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </div>

      <div className={style.stat}>
        <p>You visited <strong>{locationsVisited.length}</strong> locations</p>
        <div className={style.searchContainer}>
          <input
            type="text"
            placeholder="Search locations..."
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            onFocus={() => setLocationSearchFocused(true)}
            onBlur={() => setTimeout(() => setLocationSearchFocused(false), 200)}
            className={style.searchInput}
          />
          {locationSearchFocused && locationSuggestions.length > 0 && (
            <ul className={style.suggestions}>
              {locationSuggestions.map((location) => (
                <li
                  key={location.locationId}
                  onClick={() => {
                    setLocationSearch(location.name);
                    handleLocationClick(location);
                  }}
                >
                  {location.name} - {location.visitCount} visits
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={style.sortOptions}>
          <span>Sort by: </span>
          <button
            onClick={() => setLocationSort("none")}
            className={locationSort === "none" ? style.active : ""}
          >
            None
          </button>
          <button
            onClick={() => setLocationSort("spending")}
            className={locationSort === "spending" ? style.active : ""}
          >
            Spending
          </button>
          <button
            onClick={() => setLocationSort("visits")}
            className={locationSort === "visits" ? style.active : ""}
          >
            Visits
          </button>
        </div>
        <div className={style.locationsContainer}>
          {filteredLocations.length > 0 && (
            <ul className={style.locationsList}>
              {filteredLocations.map((location) => (
                <li
                  key={location.locationId}
                  onClick={() => handleLocationClick(location)}
                  className={`${style.locationItem} ${selectedLocation?.locationId === location.locationId ? style.selected : ""}`}
                >
                  {location.name} - {location.visitCount} visits, {location.totalSpent.toFixed(2)} spent
                </li>
              ))}
            </ul>
          )}
          {selectedLocation && (
            <div className={style.eventsPanel}>
              <h4>Events at {selectedLocation.name}</h4>
              {locationEvents.length > 0 ? (
                <ul>
                  {locationEvents.map((event) => (
                    <li key={event.eventId} className={style.eventItem}>
                      <strong>{event.title}</strong>
                      <p>{event.description}</p>
                      <span className={style.eventMeta}>
                        {new Date(event.date).toLocaleDateString("en-UK")}
                        {event.ammount ? ` - ${event.ammount} ${event.measurements?.name ?? ""}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No events found</p>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedDay && (
        <div className={style.modalOverlay} onClick={() => setSelectedDay(null)}>
          <div className={style.modal} onClick={(e) => e.stopPropagation()}>
            <div className={style.modalHeader}>
              <h3>Events on {selectedDay}</h3>
              <button onClick={() => setSelectedDay(null)}>×</button>
            </div>
            <div className={style.modalContent}>
              {dayEvents.length > 0 ? (
                <ul>
                  {dayEvents.map((event) => (
                    <li key={event.eventId} className={style.eventItem}>
                      <strong>{event.title}</strong>
                      <p>{event.description}</p>
                      <span className={style.eventMeta}>
                        {event.locations?.name ? `@ ${event.locations.name}` : ""}
                        {event.ammount ? ` - ${event.ammount} ${event.measurements?.name ?? ""}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No events found for this day</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
