import { useNavigate } from "react-router";
import style from "./Summary.module.scss";

function Summary() {
  const navigate = useNavigate();

  function navigateToHome() {
    navigate("/");
  }

  return (
    <div className={style.summaryContainer}>
      <h1>Summary</h1>
      <button onClick={navigateToHome}>Back to Home</button>
    </div>
  );
}

export default Summary;
