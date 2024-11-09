import * as React from "react";
import { fetchNui } from "../utils/fetchNui";
import { useVisibility } from "../providers/VisibilityProvider";
import "./home.css";

const Home = () => {
  const { setVisible, visible } = useVisibility();
  const [prevSpawnedCars, setPrevSpawnedCars] = React.useState<carName[]>([]);
  const [showText, setShowText] = React.useState(false);
  const [textToShow, setTextToShow] = React.useState("");
  const [vehicleSpawned, setVehicleSpawned] = React.useState(false);

  type carName = {
    car_name: string;
  };

  const startTimer = () => {
    setShowText(true);
    const timer = setTimeout(() => {
      setShowText(false);
    }, 2000);
    return () => clearTimeout(timer);
  };
  React.useEffect(() => {
    if (vehicleSpawned) {
      setVehicleSpawned(false);
      setCarModelInput("");
      close(); // Close the UI
    }
  }, [vehicleSpawned]);

  React.useEffect(() => {
    const handleMessage = (e: any) => {
      const { action, data } = e.data;

      switch (action) {
        case "openPage":
          setVisible(true);
          fetchNui("retrieveCarsData");
          console.log("UI has been called!");
          console.log(data.prevSpawnedVehicles);
          break;

        case "getCars":
          setPrevSpawnedCars(data.cars);
          break;

        case "errorInSpawning":
          setTextToShow(data.text);
          setVehicleSpawned(false);
          startTimer();
          break;

        case "carSpawned":
          setVehicleSpawned(true);
          break;

        case "closePage":
          setVisible(false);
          console.log("UI has been closed!");
          setCarModelInput("");
          break;

        default:
          console.warn(`Unhandled action: ${action}`);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const [carModelInput, setCarModelInput] = React.useState<string>("");

  async function close() {
    await fetchNui("closeMenu");
  }

  function getData2() {
    fetchNui("spawnVehicle", carModelInput);
    // if (!vehicleSpawned) return;
    // setVehicleSpawned(false);
    // setCarModelInput("");
    // close();
  }

  return (
    <div className="screen">
      <div className="box">
        <div onClick={close} className="btnClose">
          X
        </div>
        <div className="title">Spawn a car</div>
        <div className="searchCarBox">
          <input
            className="inputCarName"
            value={carModelInput}
            onChange={(e) => setCarModelInput(e.target.value)}
            type="text"
          />
          <div onClick={getData2} className="btnSearch">
            search a car
          </div>
        </div>
        {showText && <p style={{ color: "red" }}>{textToShow}</p>}

        <div className="spawnRes">
          {prevSpawnedCars.map((v, index) => (
            <div className="carName" key={index}>
              {v.car_name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
