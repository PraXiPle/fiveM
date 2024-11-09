RegisterCommand(
  "cc",
  (source: number, args: string[]) => {
    emitNet("chat:clear", -1);
  },
  false
);
const ox = global.exports["oxmysql"];
function addPlayer(source: number) {
  const player = source;
  const ID = getPlayerIdentifiers(player);
  const discordId = ID.filter((v) => v.includes("discord"));
  const ox = global.exports["oxmysql"];
  ox.execute(
    "SELECT * FROM users WHERE discord = ?",
    [discordId],
    (res: any) => {
      if (res.length === 0) {
        ox.execute(
          "INSERT INTO users (discord) VALUES (?)",
          [discordId],
          (res: any) => {
            if (res.length > 0) {
              console.log("player added TO db");
            }
          }
        );
      } else {
        console.log("player in db");
      }
    }
  );
}

on("playerConnection", () => {
  const source = global.source;
  addPlayer(source);
});
onNet("getUserRole", () => {
  const source = global.source;
  const ID = getPlayerIdentifiers(source);
  const discordId = ID.filter((v) => v.includes("discord"));
  console.log(discordId);
  console.log(ID);
  ox.execute(
    "SELECT * FROM users WHERE discord = ?",
    [discordId],
    (result: any) => {
      if (result.length > 0) {
        const role = result[0].role;
        emitNet("dataRetrieved", source, role);
      } else {
        console.error("no user found with such id ");
      }
    }
  );
});

onNet("saveCarSpawnToDB", (vehicle: string) => {
  const source = global.source;
  const ID = getPlayerIdentifiers(source);
  const discordId = ID.filter((v) => v.includes("discord"));

  ox.execute("INSERT INTO spawns (user_id,car_name) VALUES (?,?)", [
    discordId,
    vehicle.toLowerCase(),
  ]),
    (res: any) => {
      console.log(res);
    };
});

onNet("getUserSpawnedCars", () => {
  const source = global.source;
  const ID = getPlayerIdentifiers(source);
  const discordId = ID.filter((v) => v.includes("discord"));

  ox.execute(
    "SELECT car_name FROM spawns WHERE user_id = ?",
    [discordId],
    (result: any) => {
      if (result.length > 0) {
        const cars = result;
        console.log(cars);

        emitNet("getUserSpawnedCarsDB", source, cars);
      }
    }
  );
});
