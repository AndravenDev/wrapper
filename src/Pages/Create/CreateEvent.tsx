import { Field, Form, Formik } from "formik";
import style from "./CreateEvent.module.scss";
import supabase from "../../utils/supabase";
import { useEffect, useState } from "react";
import type {
  Category,
  EventLocation,
  EventPeople,
  Measurement,
  Person,
} from "../../utils/interfaces";
import { useNavigate } from "react-router";

export default function CreateEvent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [locations, setLocatioons] = useState<EventLocation[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  let navigate = useNavigate();

  useEffect(() => {
    getCategories();
    getPeople();
    getLocations();
    getMeasurements();
  }, []);

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
      setLocatioons(data);
    }
  }

  async function getMeasurements() {
    var { data } = await supabase.from("measurements").select();

    if (data?.length) {
      setMeasurements(data);
    }
  }

  return (
    <div className={style.test}>
      <button
        onClick={() => {
          navigate("/");
        }}
      >
        Home
      </button>
      <div className={style.createWrapper}>
        <p>Create Category</p>
        <Formik
          initialValues={{
            name: "",
            hidden: false,
          }}
          onSubmit={async (values) => {
            const { data, error } = await supabase
              .from("categories")
              .insert({ name: values.name, hidden: values.hidden })
              .select();

            if (data?.length) {
              setCategories([...categories, data[0]]);
            }

            if (error) {
              console.log(error);
              alert("There has been an issue");
            } else {
              values.name = "";
              values.hidden = false;
            }
          }}
        >
          <Form>
            <div className={style.question}>
              <label htmlFor="name">Category Name</label>
              <Field id="name" name="name" placeholder="Category Name" />
            </div>

            <div className={style.question}>
              <label htmlFor="hidden">Hide this event from this category</label>
              <Field type="checkbox" id="hidden" name="hidden" />
            </div>

            <button type="submit">Submit</button>
          </Form>
        </Formik>
      </div>
      <div className={style.createWrapper}>
        <p>Create Event</p>
        <Formik
          initialValues={{
            date: "",
            title: "",
            description: "",
            categoryId: categories?.length ? categories[0].id : 1,
            ammount: undefined,
            peopleChecked: [],
            withPartner: false,
            positive: undefined,
            measurementId: undefined,
            locationId: undefined,
          }}
          onSubmit={async (values) => {
            console.log(values);
            debugger;
            const { data, error } = await supabase
              .from("event")
              .insert({
                date: values.date ? values.date : new Date(),
                title: values.title,
                description: values.description,
                categoryId: values.categoryId,
                ammount: values.ammount,
                withPartner: values.withPartner,
                locationId: values.locationId,
                measurementId: values.measurementId,
                positive: values.positive
                  ? values.positive === "false"
                    ? false
                    : true
                  : null,
              })
              .select("eventId");
            if (error) {
              console.log(error);
              alert(error.details);
            }
            var eventId = data?.pop()?.eventId;
            var event_people: EventPeople[] = [];

            if (eventId) {
              alert("Success");
              values.title = "";
              values.description = "";
            }

            for (let index = 0; index < values.peopleChecked.length; index++) {
              event_people.push({
                eventId: eventId,
                personId: parseInt(values.peopleChecked[index]),
              });
            }

            const { error: wth } = await supabase
              .from("event_people")
              .insert(event_people);
            if (wth) {
              console.log(wth);
            }
          }}
        >
          {({ setFieldValue, values }) => (
            <Form className={style.formWrapper}>
              <div className={style.question}>
                <label htmlFor="catogories">Categories</label>
                <select
                  name="catogories"
                  onChange={(value) => {
                    setFieldValue("categoryId", parseInt(value.target.value));
                  }}
                >
                  <option disabled selected value={0}>
                    {" "}
                    -- select an option --{" "}
                  </option>
                  {categories?.map((category) => {
                    return (
                      <option
                        value={category.id.toString()}
                        key={category.id.toString()}
                      >
                        {category.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className={style.question}>
                <label htmlFor="location">Locations</label>
                <select
                  name="location"
                  onChange={(value) => {
                    setFieldValue("locationId", parseInt(value.target.value));
                  }}
                >
                  <option disabled selected value={0}>
                    {" "}
                    -- select an option --{" "}
                  </option>
                  {locations?.map((location) => {
                    return (
                      <option
                        value={location.locationId.toString()}
                        key={location.locationId.toString()}
                      >
                        {location.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className={style.question}>
                <label htmlFor="withPartner">I was with my partner</label>
                <Field type="checkbox" id="withPartner" name="withPartner" />
              </div>
              <div className={style.question}>
                <label htmlFor="title">Title</label>
                <Field type="text" id="title" name="title" />
              </div>
              <div className={style.question}>
                <label htmlFor="description">Description</label>
                <Field type="text" id="description" name="description"></Field>
              </div>
              <div className={style.question}>
                <label htmlFor="people">Who was there</label>
                <div role="group" aria-labelledby="checkbox-group">
                  {people?.map((person) => {
                    return (
                      <label key={person.personId}>
                        <Field
                          type="checkbox"
                          name="peopleChecked"
                          value={person.personId.toString()}
                        />
                        {person.name}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className={style.question}>
                <div>Was is a positive experience</div>
                <div role="group">
                  <label>
                    <Field type="radio" name="positive" value="true" />
                    Yes
                  </label>
                  <label>
                    <Field type="radio" name="positive" value="false" />
                    No
                  </label>
                  <div>
                    Picked: {values.positive ? values.positive : "Eh.."}
                  </div>
                </div>
              </div>
              <button type="submit">Submit</button>
              <div className={style.question}>
                <label htmlFor="date">Custom Date?</label>
                <Field type="datetime-local" id="date" name="date" />
              </div>
              <div className={style.question}>
                <label htmlFor="measurement">Measurement</label>
                <select
                  name="measurement"
                  onChange={(value) => {
                    setFieldValue("measurementId", parseInt(value.target.value));
                  }}
                >
                  <option disabled selected value={0}>
                    {" "}
                    -- select an option --{" "}
                  </option>
                  {measurements?.map((measurement) => {
                    return (
                      <option
                        value={measurement.measurementId.toString()}
                        key={measurement.measurementId.toString()}
                      >
                        {measurement.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className={style.question}>
                <label htmlFor="ammount">Ammount</label>
                <Field type="number" id="ammount" name="ammount" />
              </div>
            </Form>
          )}
        </Formik>
      </div>
      <div className={style.createWrapper}>
        <p>Create a person</p>
        <Formik
          initialValues={{
            name: "",
          }}
          onSubmit={async (values) => {
            const { data, error } = await supabase
              .from("people")
              .insert({ name: values.name })
              .select();

            if (data?.length) {
              setPeople([...people, data[0]]);
            }
            if (error) {
              console.log("error", error);
              alert("There has been an issue");
            }
            values.name = "";
          }}
        >
          <Form>
            <label htmlFor="name">Person Name</label>
            <Field id="name" name="name" placeholder="Category Name" />
            <button type="submit">Submit</button>
          </Form>
        </Formik>
      </div>
      <div className={style.createWrapper}>
        <p>Create Location</p>
        <Formik
          initialValues={{
            name: "",
            preciseAddress: "",
          }}
          onSubmit={async (values) => {
            const { data, error } = await supabase
              .from("locations")
              .insert({ ...values })
              .select();

            if (error) {
              console.log(error);
              alert(error.details);
            }
            if (data?.length) {
              alert("Success");
              setLocatioons([...locations, data[0]]);
              values.name = "";
              values.preciseAddress = "";
            }
          }}
        >
          <Form>
            <div className={style.question}>
              <label htmlFor="name">Location Name</label>
              <Field id="name" name="name" placeholder="Location Name" />
            </div>
            <div className={style.question}>
              <label htmlFor="preciseAddress">Precise Address</label>
              <Field
                id="preciseAddress"
                name="preciseAddress"
                placeholder="Location Name"
              />
            </div>

            <button type="submit">Submit</button>
          </Form>
        </Formik>
      </div>
      <div className={style.createWrapper}>
        <p>Create Measurement</p>
        <Formik
          initialValues={{
            name: "",
          }}
          onSubmit={async (values) => {
            const { data, error } = await supabase
              .from("measurements")
              .insert({ ...values })
              .select();

            if (error) {
              console.log(error);
              alert(error.details);
            }
            if (data?.length) {
              alert("Success");
              setMeasurements([...measurements, data[0]]);
              values.name = "";
            }
          }}
        >
          <Form>
            <div className={style.question}>
              <label htmlFor="name">Measurement Name</label>
              <Field id="name" name="name" placeholder="Measurement Name" />
            </div>

            <button type="submit">Submit</button>
          </Form>
        </Formik>
      </div>
    </div>
  );
}
