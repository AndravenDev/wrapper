import { Field, Form, Formik } from "formik";
import style from "./CreateMeasurement.module.scss";
import supabase from "../../utils/supabase";
import type { Measurement } from "../../utils/interfaces";

export interface CreateMeasurementProps {
  measurements: Measurement[];
  setMeasurements: (value: React.SetStateAction<Measurement[]>) => void;
}

export default function CreateMeasurement({
  measurements,
  setMeasurements,
}: CreateMeasurementProps) {
  return (
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
  );
}
