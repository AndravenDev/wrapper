import { Field, Form, Formik } from "formik";
import style from "./CreateLocation.module.scss";
import supabase from "../../utils/supabase";
import type { EventLocation } from "../../utils/interfaces";

export interface CreateLocationProps {
  locations: EventLocation[];
  setLocations: (value: React.SetStateAction<EventLocation[]>) => void;
}

export default function CreateLocation({
  locations,
  setLocations,
}: CreateLocationProps) {
  return (
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
            setLocations([...locations, data[0]]);
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
  );
}
