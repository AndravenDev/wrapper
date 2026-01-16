import style from "./CreateEvent.module.scss";
import supabase from "../../utils/supabase";
import { useEffect, useState } from "react";
import type {
  Category,
  EventLocation,
  Measurement,
  Person,
} from "../../utils/interfaces";
import { useNavigate, useParams } from "react-router";
import CreateCategory from "../../components/CreateCategory/CreateCategory";
import CreateCustomEvent from "../../components/CreateEvent/CreateCustomEvent";
import CreateLocation from "../../components/CreateLocation/CreateLocation";
import CreateMeasurement from "../../components/CreateMeasurement/CreateMeasurement";
import CreatePerson from "../../components/CreatePerson/CreatePerson";

export default function CreateEvent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [locations, setLocations] = useState<EventLocation[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  // const [] = useState<>();

  const { id } = useParams();



  let navigate = useNavigate();

  useEffect(() => {
    getCategories();
    getPeople();
    getLocations();
    getMeasurements();

    if(id){
      getExistingEvent(parseInt(id));
    }
  }, []);

  async function getExistingEvent(eventId: number){
    var { data } = await supabase.from("event").select().eq("eventId", eventId);
    console.log('Datata ', data);
  }

  async function getCategories() {
    var { data } = await supabase.from("categories").select();

    if (data?.length) {
      setCategories(data);
    }
  }

  async function getPeople() {
    var { data } = await supabase.from("people").select();

    if (data?.length) {
      setPeople(data);
    }
  }

  async function getLocations() {
    var { data } = await supabase.from("locations").select();

    if (data?.length) {
      setLocations(data);
    }
  }

  async function getMeasurements() {
    var { data } = await supabase.from("measurements").select();

    if (data?.length) {
      setMeasurements(data);
    }
  }

  return (
    <div className={style.container}>
      <h1>Create</h1>
      <button
        className={style.backButton}
        onClick={() => {
          navigate("/");
        }}
      >
        Back to Home
      </button>
      <div className={style.sections}>
      <CreateCategory categories={categories} setCategories={setCategories} />
      <CreateCustomEvent
        categories={categories}
        locations={locations}
        people={people}
        measurements={measurements}
      />
      <CreatePerson people={people} setPeople={setPeople} />
      <CreateLocation locations={locations} setLocations={setLocations} />
      <CreateMeasurement
        measurements={measurements}
        setMeasurements={setMeasurements}
      />
      </div>
    </div>
  );
}
