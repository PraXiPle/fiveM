import config from "../shared/config";
const Delay = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));
RegisterCommand(
  "openMenu",
  () => {
    SendNUIMessage({
      action: "openPage",
      data: {
        pageName: "App",
      },
    });

    SetNuiFocus(true, true);
  },
  false
);
// RegisterCommand(
//   "closeMenuCommand",
//   () => {
//     SendNUIMessage({
//       action: "closePage",
//       data: {
//         pageName: "Home",
//         prevSpawnedVehicles: [],
//       },
//     });

//     SetNuiFocus(false, false);
//   },
//   false
// );
RegisterNuiCallback("closeMenu", (_: any, cb: any) => {
  SetNuiFocus(false, false);
  SendNUIMessage({
    action: "closePage",
    data: {
      pageName: "Home",
    },
  });

  cb(true);
});
RegisterKeyMapping("openMenu", "open menu to spawn cars", "keyboard", "i");
RegisterNuiCallback("retrieveCarsData", (_: any, cb: any) => {
  emitNet("getUserSpawnedCars");
});
onNet("getUserSpawnedCarsDB", (cars: string) => {
  SendNUIMessage({
    action: "getCars",
    data: {
      cars: cars,
    },
  });
});
onNet("carCouldntSpawn", () => {
  SendNUIMessage({
    action: "didntFindCar",
  });
});

RegisterNuiCallback("retrieveData", (_: any, cb: any) => {
  emitNet("getUserRole");
});
onNet("dataRetrieved", (discordId: string) => {
  const plName = GetPlayerName(PlayerId());
  SendNUIMessage({
    action: "dataRetrieved",
    data: {
      playerName: discordId,
    },
  });
});

RegisterNuiCallback("spawnVehicle", async (vehicle: string) => {
  if (!vehicle) {
    SendNUIMessage({
      action: "errorInSpawning",
      data: { text: "no text has entered" },
    });
    return;
  }
  const hash = GetHashKey(vehicle);

  if (!IsModelInCdimage(vehicle) || !IsModelAVehicle(vehicle)) {
    SendNUIMessage({
      action: "errorInSpawning",
      data: { text: "couldent find the car " },
    });
    return;
  }
  const player = PlayerPedId();
  const coords = GetEntityCoords(player, true);
  const heading = GetEntityHeading(player);
  RequestModel(hash);
  while (!HasModelLoaded(hash)) {
    await Delay(500);
  }
  SendNUIMessage({
    action: "carSpawned",
    data: { carSpawned: true },
  });
  const veh = CreateVehicle(
    hash,
    coords[0],
    coords[1],
    coords[2],
    heading,
    true,
    true
  );
  SetPedIntoVehicle(player, veh, -1);
  SetEntityAsMissionEntity(player, true, true);
  SetVehicleEngineOn(veh, true, true, false);
  SetVehicleOnGroundProperly(veh);
  SetModelAsNoLongerNeeded(hash);
  emitNet("saveCarSpawnToDB", vehicle);

});
