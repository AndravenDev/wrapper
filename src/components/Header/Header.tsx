import { useNavigate } from "react-router";
import style from "./Header.module.scss";

export default function Header() {
  let navigate = useNavigate();
//   const [spending, setSpending] = useState(0);

//   useEffect(() => {
//     getSpending();
//   }, []);

//   async function getSpending() {
//     const { data } = await supabase
//       .from("event")
//       .select(
//         `ammount`,
//       ).not("ammount", "is", null);

//     console.log('header', data);

//     if (data?.length) {
//     //   setSpending(data);
//     }
//   }

  return (
    <>
      <div className={style.navWrapper}>
        <p className={style.info}></p>
        <div className={style.buttonWrapper}>
          <button className={style.navBtn} onClick={() => navigate("/")}>
            Home
          </button>

          <button className={style.navBtn} onClick={() => navigate("summary")}>
            Summary
          </button>

          <button className={style.navBtn} onClick={() => navigate("dashboard")}>
            Dashboard
          </button>

          <button
            className={`${style.navBtn} ${style.primaryLink}`}
            onClick={() => navigate("createEvent")}
          >
            Create Page
          </button>
        </div>
      </div>
    </>
  );
}
