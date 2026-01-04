import { Field, Form, Formik } from "formik";
import style from "./CreateCategory.module.scss";
import supabase from "../../utils/supabase";
import type { Category } from "../../utils/interfaces";

export interface CreateCategoryProps {
  categories: Category[];
  setCategories: (value: React.SetStateAction<Category[]>) => void;
}

export default function CreateCategory({
  categories,
  setCategories,
}: CreateCategoryProps) {
  return (
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
  );
}
