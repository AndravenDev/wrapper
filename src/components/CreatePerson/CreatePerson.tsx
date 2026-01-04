import { Field, Form, Formik } from "formik";
import style from "./CreatePerson.module.scss";
import supabase from "../../utils/supabase";
import type { Person } from "../../utils/interfaces";

export interface CreatePersonProps {
  people: Person[];
  setPeople: (value: React.SetStateAction<Person[]>) => void;
}

export default function CreatePerson({ people, setPeople }: CreatePersonProps) {
  return (
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
          <div className={style.question}>
            <label htmlFor="name">Person Name</label>
            <Field id="name" name="name" placeholder="Category Name" />
          </div>
          <button type="submit">Submit</button>
        </Form>
      </Formik>
    </div>
  );
}
