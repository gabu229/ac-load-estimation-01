function roundNumber(number) {
  return Math.round((number + Number.EPSILON) * 100) / 100;
}

const room = {
  length: 28.8,
  width: 19.84,
  height: 4.91,
  occupants: 660,
  ac_rating: 1.5,
  air_changes: 1,
  infiltrated_air: 0,
  ac_count: 0,
};

const lighting = {
  count: 29,
  allowance_factor: 1,
  use_factor: 1.25,
};

const infiltrated_air = {
  t1: 35,
  t2: 23,
  w1: 0.00875,
  w2: 0.0159,
};

const doors = {
  big: {
    length: 1.55,
    width: 2.05,
    get area() {
      return roundNumber(this.length * this.width);
    },
    north: 2,
    south: 2,
    east: 0,
    west: 1,
  },
  small: {
    length: 0.84,
    width: 2.01,
    get area() {
      return roundNumber(this.length * this.width);
    },
    north: 0,
    south: 0,
    east: 1,
    west: 2,
  },
};

const windows = {
  upper: {
    length: 3.5,
    width: 1.04,
    get area() {
      return roundNumber(this.length * this.width);
    },
    north: 4,
    south: 4,
    east: 0,
    west: 0,
  },
  lower: {
    length: 1.2,
    width: 1.76,
    get area() {
      return roundNumber(this.length * this.width);
    },
    north: 5,
    south: 5,
    east: 2,
    west: 2,
  },
};

const HEAT_COEFFICIENT = {
  roof: 2.52,
  floor: 4.5,
  walls: {
    north: 3.18,
    south: 3.18,
    east: 3.18,
    west: 3.18,
  },
  doors: {
    north: 1.73,
    south: 1.73,
    east: 1.73,
    west: 1.73,
  },
  windows: {
    north: 5.6,
    south: 5.6,
    east: 5.6,
    west: 5.6,
  },
};

const AREA = {
  roof: 0,
  floor: 0,
  walls: {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  },
  doors: {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  },
  windows: {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  },
};

const EQUIVALENT_TEMPERATURE_DIFF = {
  roof: 15,
  floor: 2.5,
  walls: {
    north: 11,
    south: 27,
    east: 18,
    west: 18,
  },
  doors: {
    north: 11,
    south: 27,
    east: 18,
    west: 18,
  },
  windows: {
    north: 12,
    south: 12,
    east: 12,
    west: 12,
  },
};

const SENSIBLE_HEAT_GAIN = {
  roof: 0,
  floor: 0,
  walls: {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  },
  doors: {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  },
  windows: {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  },
  due_to: {
    occupants: 0,
    infiltrated_air: 0,
    lighting: 0,
  },
  per: {
    occupant: 65,
  },
};

const LATENT_HEAT_GAIN = {
  due_to: {
    occupants: 0,
    infiltrated_air: 0,
    lighting: 0,
  },
  per: {
    occupant: 65,
  },
};

const SOLAR_HEAT_GAIN_FACTOR = {
  windows: {
    north: 0.14,
    south: 0.14,
    east: 0.14,
    west: 0.14,
    total: 0,
  },
};

const SOLAR_COOLING_LOAD_FACTOR = {
  windows: {
    north: 128,
    south: 150,
    east: 50,
    west: 350,
    total: 0,
  },
};

const SOLAR_HEAT_GAIN = {
  windows: {
    north: 128,
    south: 150,
    east: 50,
    west: 350,
    total: 0,
  },
};

$(document).ready(function () {
  updateAllValuesToFields();

  doAllComputations();

  $("input").change(function () {
    doAllComputations();
  });

  $("input").keyup(function () {
    doAllComputations();
  });
});

function doAllComputations() {
  // GET ALL INPUT VALUES & PARAMS
  updateAllValuesFromFields();

  // DO NECESSARY CALCULATIONS STEP BY STEP
  calculateWallsArea();
  calculateRoofAndFloorArea();
  calculateDoorsAndWindowsArea();
  calculateWallsAndDoorsAndWindowsSensibleHeatGain();
  calculateRoofAndFloorSensibleHeatGain();
  calculateOccupantsParams();
  calculateOtherRequiredParams();
  calculateTotalSensibleHeatGain();
  calculateWindowsSolarHeatGain();
  doFinalCalculation();

  // DISPLAY VALUES AND RESULTS ON SCREEN
  updateValuesInDisplay();
}

function calculateWallsArea() {
  let sections = ["north", "south", "east", "west"];

  sections.forEach((section) => {
    let wallArea;
    let addedHeight =
      section === "east" ? roundNumber((Math.PI * Math.pow(1.674, 2)) / 2) : 0;

    if (section === "east" || section === "west") {
      wallArea = roundNumber(room.height * room.width);
    } else {
      wallArea = roundNumber(room.height * room.length);
    }

    const totalDoorAreaBig = doors.big.area * doors.big[section];
    const totalDoorAreaSmall = doors.small.area * doors.small[section];
    const totalDoorArea = totalDoorAreaBig + totalDoorAreaSmall;

    const totalWindowAreaUpper = windows.upper.area * windows.upper[section];
    const totalWindowAreaLower = windows.lower.area * windows.lower[section];
    const totalWindowArea = totalWindowAreaUpper + totalWindowAreaLower;

    // console.log({
    //   section,
    //   h: room.height,
    //   w: room.width,
    //   l: room.length,
    //   totalDoorAreaBig,
    //   totalDoorAreaSmall,
    //   totalWindowAreaLower,
    //   totalWindowAreaUpper,
    // });

    const calculationString = `${wallArea} + ${addedHeight} - ${totalDoorArea} - ${totalWindowArea}`;

    const result = roundNumber(
      wallArea + addedHeight - totalDoorArea - totalWindowArea
    );

    AREA.walls[section] = result;
  });
}

function calculateDoorsAndWindowsArea() {
  let sections = ["north", "south", "east", "west"];

  sections.forEach((section) => {
    const doorsAreaBig = doors.big.area * doors.big[section];
    const doorsAreaSmall = doors.small.area * doors.small[section];

    const windowsAreaUpper = windows.upper.area * windows.upper[section];
    const windowsAreaLower = windows.lower.area * windows.lower[section];

    AREA.doors[section] = roundNumber(doorsAreaBig + doorsAreaSmall);
    AREA.windows[section] = roundNumber(windowsAreaUpper + windowsAreaLower);
  });
}

function calculateRoofAndFloorArea() {
  let sections = ["roof", "floor"];

  sections.forEach((section) => {
    let calculationString = `${room.length} x ${room.width}`;
    let result = room.length * room.width;

    // AREA[section] = `${calculationString} = ${result}`;
    AREA[section] = roundNumber(result);
  });
}

function calculateWallsAndDoorsAndWindowsSensibleHeatGain() {
  let sections = ["north", "south", "east", "west"];

  sections.forEach((section) => {
    // WALLS
    SENSIBLE_HEAT_GAIN.walls[section] = roundNumber(
      HEAT_COEFFICIENT.walls[section] *
        AREA.walls[section] *
        EQUIVALENT_TEMPERATURE_DIFF.walls[section]
    );

    // DOORS
    SENSIBLE_HEAT_GAIN.doors[section] = roundNumber(
      HEAT_COEFFICIENT.doors[section] *
        AREA.doors[section] *
        EQUIVALENT_TEMPERATURE_DIFF.doors[section]
    );

    // WINDOWS
    SENSIBLE_HEAT_GAIN.windows[section] = roundNumber(
      HEAT_COEFFICIENT.windows[section] *
        AREA.windows[section] *
        EQUIVALENT_TEMPERATURE_DIFF.windows[section]
    );
  });
}

function calculateSensibleHeatGainDueToFactors() {
  // CALCULATE AMOUNT OF INFILTRATED AIR
  room.infiltrated_air =
    (room.length * room.width * room.height * room.air_changes) / 60;
  // DUE TO INFILTRATED AIR
}

function calculateRoofAndFloorSensibleHeatGain() {
  let sections = ["roof", "floor"];

  sections.forEach((section) => {
    SENSIBLE_HEAT_GAIN[section] = roundNumber(
      HEAT_COEFFICIENT[section] *
        AREA[section] *
        EQUIVALENT_TEMPERATURE_DIFF[section]
    );
  });
}

function calculateWindowsSolarHeatGain() {
  let sections = ["north", "south", "east", "west"];

  sections.forEach((section) => {
    SOLAR_HEAT_GAIN.windows[section] =
      (windows.upper.area * windows.upper[section] +
        windows.lower.area * windows.lower[section]) *
      SOLAR_HEAT_GAIN_FACTOR.windows[section];
  });

  SOLAR_HEAT_GAIN.windows.total = sumOfValues(SOLAR_HEAT_GAIN.windows, [
    "total",
  ]);
}

function calculateOccupantsParams() {
  SENSIBLE_HEAT_GAIN.due_to.occupants =
    SENSIBLE_HEAT_GAIN.per.occupant * room.occupants;
  LATENT_HEAT_GAIN.due_to.occupants =
    LATENT_HEAT_GAIN.per.occupant * room.occupants;
}

function calculateOtherRequiredParams() {
  // CALCULATE SHG DUE TO LIGHTING
  SENSIBLE_HEAT_GAIN.due_to.lighting = roundNumber(
    lighting.count *
      (room.width * room.length) *
      lighting.use_factor *
      lighting.allowance_factor
  );

  // AMOUNT OF INF AIR
  room.infiltrated_air = roundNumber(
    (room.length * room.width * room.height * 1) / 60
  );

  // SHG DUE TO INF AIR
  SENSIBLE_HEAT_GAIN.due_to.infiltrated_air =
    0.02044 * room.infiltrated_air * Math.abs(infiltrated_air.t1 - infiltrated_air.t2);

  // LHG DUE TO INF AIR
  LATENT_HEAT_GAIN.due_to.infiltrated_air =
    50 * room.infiltrated_air * Math.abs(infiltrated_air.w1 - infiltrated_air.w2);
}

function calculateTotalSensibleHeatGain() {
  $("#totalOfTotalSensibleHeatGain").html(
    sumOfValues(SENSIBLE_HEAT_GAIN, ["due_to", "per"])
  );
}

function doFinalCalculation() {
  let x = sumOfValues(SENSIBLE_HEAT_GAIN, ["due_to", "per"]) / 1000;
  let y = sumOfValues(SENSIBLE_HEAT_GAIN.due_to) / 1000;

  let totalSHG = x + y;
  let totalLHG = sumOfValues(LATENT_HEAT_GAIN) / 1000;

  console.warn((x + y) / room.ac_rating);

  room.ac_count = Math.round((totalSHG + totalLHG) / room.ac_rating);
}

// RECURSIVE FUNCTION TO SUM OBJECT VALUES WITH EXCLUSIONS
function sumOfValues(object, exclusions = []) {
  let sum = 0;

  for (const key in object) {
    if (!exclusions.includes(key)) {
      if (typeof object[key] === "object") {
        sum += sumOfValues(object[key], exclusions);
      } else if (typeof object[key] === "number") {
        sum += object[key];
      }
    }
  }

  return roundNumber(sum);
}

function updateAllValuesFromFields() {
  // Update room values
  room.length = parseFloat($("#roomLength").val()) || 0;
  room.width = parseFloat($("#roomWidth").val()) || 0;
  room.height = parseFloat($("#roomHeight").val()) || 0;
  room.occupants = parseFloat($("#occupantsCount").val()) || 0;
  room.ac_rating = parseFloat($("#roomRating").val()) || 0;

  // Update Lighting
  lighting.count = parseFloat($("#lightingCount").val()) || 0;
  lighting.use_factor = parseFloat($("#lightingUseFactor").val()) || 0;
  lighting.allowance_factor =
    parseFloat($("#lightingAllowanceFactor").val()) || 0;

  // Update Inf Air Params
  infiltrated_air.t1 = parseFloat($("#CLTD1").val()) || 0;
  infiltrated_air.t2 = parseFloat($("#CLTD2").val()) || 0;
  infiltrated_air.w1 = parseFloat($("#infiltratedAirW1").val()) || 0;
  infiltrated_air.w2 = parseFloat($("#infiltratedAirW2").val()) || 0;

  // Update SHG
  SENSIBLE_HEAT_GAIN.per.occupant = parseFloat($("#occupantSHG").val()) || 0;
  LATENT_HEAT_GAIN.per.occupant = parseFloat($("#occupantLHG").val()) || 0;

  // Update door values
  doors.length = parseFloat($("#doorLength").val()) || 0;
  doors.width = parseFloat($("#doorWidth").val()) || 0;

  doors.north = parseInt($("#doorsCountNorth").val()) || 0;
  doors.south = parseInt($("#doorsCountSouth").val()) || 0;
  doors.east = parseInt($("#doorsCountEast").val()) || 0;
  doors.west = parseInt($("#doorsCountWest").val()) || 0;
  doors.area = doors.length * doors.width;

  // Update window values
  windows.length = parseFloat($("#windowsLength").val()) || 0;
  windows.width = parseFloat($("#windowsWidth").val()) || 0;

  windows.north = parseInt($("#windowsCountNorth").val()) || 0;
  windows.south = parseInt($("#windowsCountSouth").val()) || 0;
  windows.east = parseInt($("#windowsCountEast").val()) || 0;
  windows.west = parseInt($("#windowsCountWest").val()) || 0;
  windows.area = windows.length * windows.width;

  // Update Heat coefficient values
  HEAT_COEFFICIENT.walls.north =
    parseFloat($("#heatCoefficientNorthWall").val()) || 0;
  HEAT_COEFFICIENT.walls.south =
    parseFloat($("#heatCoefficientSouthWall").val()) || 0;
  HEAT_COEFFICIENT.walls.east =
    parseFloat($("#heatCoefficientEastWall").val()) || 0;
  HEAT_COEFFICIENT.walls.west =
    parseFloat($("#heatCoefficientWestWall").val()) || 0;
  HEAT_COEFFICIENT.roof = parseFloat($("#heatCoefficientRoof").val()) || 0;
  HEAT_COEFFICIENT.floor = parseFloat($("#heatCoefficientFloor").val()) || 0;
  HEAT_COEFFICIENT.doors.north =
    parseFloat($("#heatCoefficientNorthDoors").val()) || 0;
  HEAT_COEFFICIENT.doors.south =
    parseFloat($("#heatCoefficientSouthDoors").val()) || 0;
  HEAT_COEFFICIENT.doors.east =
    parseFloat($("#heatCoefficientEastDoors").val()) || 0;
  HEAT_COEFFICIENT.doors.west =
    parseFloat($("#heatCoefficientWestDoors").val()) || 0;
  HEAT_COEFFICIENT.windows.north =
    parseFloat($("#heatCoefficientNorthWindows").val()) || 0;
  HEAT_COEFFICIENT.windows.south =
    parseFloat($("#heatCoefficientSouthWindows").val()) || 0;
  HEAT_COEFFICIENT.windows.east =
    parseFloat($("#heatCoefficientEastWindows").val()) || 0;
  HEAT_COEFFICIENT.windows.west =
    parseFloat($("#heatCoefficientWestWindows").val()) || 0;

  // Update temperature coefficient
  EQUIVALENT_TEMPERATURE_DIFF.walls.north =
    parseFloat($("#eqTemperatureDifferenceNorthWall").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.walls.south =
    parseFloat($("#eqTemperatureDifferenceSouthWall").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.walls.east =
    parseFloat($("#eqTemperatureDifferenceEastWall").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.walls.west =
    parseFloat($("#eqTemperatureDifferenceWestWall").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.doors.north =
    parseFloat($("#eqTemperatureDifferenceNorthDoors").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.doors.south =
    parseFloat($("#eqTemperatureDifferenceSouthDoors").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.doors.east =
    parseFloat($("#eqTemperatureDifferenceEastDoors").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.doors.west =
    parseFloat($("#eqTemperatureDifferenceWestDoors").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.windows.north =
    parseFloat($("#eqTemperatureDifferenceNorthWindows").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.windows.south =
    parseFloat($("#eqTemperatureDifferenceSouthWindows").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.windows.east =
    parseFloat($("#eqTemperatureDifferenceEastWindows").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.windows.west =
    parseFloat($("#eqTemperatureDifferenceWestWindows").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.roof =
    parseFloat($("#eqTemperatureDifferenceRoof").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.floor =
    parseFloat($("#eqTemperatureDifferenceFloor").val()) || 0;

  // Log updated values
  //   console.log(room);
  //   console.log(doors);
  //   console.log(windows);
}

function updateAllValuesToFields() {
  // Update room values
  $("#roomLength").val(room.length);
  $("#roomWidth").val(room.width);
  $("#roomHeight").val(room.height);
  $("#roomRating").val(room.ac_rating);
  $("#occupantsCount").val(room.occupants);
  $("#occupantSHG").val(SENSIBLE_HEAT_GAIN.per.occupant);
  $("#occupantLHG").val(LATENT_HEAT_GAIN.per.occupant);

  // Update lighting values
  $("#lightingCount").val(lighting.count);
  $("#lightingAllowanceFactor").val(lighting.allowance_factor);
  $("#lightingUseFactor").val(lighting.use_factor);

  // Update inf air param values
  $("#CLTD1").val(infiltrated_air.t1);
  $("#CLTD2").val(infiltrated_air.t2);
  $("#infiltratedAirW1").val(infiltrated_air.w1);
  $("#infiltratedAirW2").val(infiltrated_air.w2);

  // Update door values
  $("#doorLength").val(doors.length);
  $("#doorWidth").val(doors.width);

  $("#doorsCountNorth").val(doors.north);
  $("#doorsCountSouth").val(doors.south);
  $("#doorsCountEast").val(doors.east);
  $("#doorsCountWest").val(doors.west);
  doors.area = doors.length * doors.width;

  // Update window values
  $("#windowsLength").val(windows.length);
  $("#windowsWidth").val(windows.width);

  $("#windowsCountNorth").val(windows.north);
  $("#windowsCountSouth").val(windows.south);
  $("#windowsCountEast").val(windows.east);
  $("#windowsCountWest").val(windows.west);
  windows.area = windows.length * windows.width;

  // Update Heat coefficient values
  $("#heatCoefficientNorthWall").val(HEAT_COEFFICIENT.walls.north);
  $("#heatCoefficientSouthWall").val(HEAT_COEFFICIENT.walls.south);
  $("#heatCoefficientEastWall").val(HEAT_COEFFICIENT.walls.east);
  $("#heatCoefficientWestWall").val(HEAT_COEFFICIENT.walls.west);
  $("#heatCoefficientRoof").val(HEAT_COEFFICIENT.roof);
  $("#heatCoefficientFloor").val(HEAT_COEFFICIENT.floor);

  $("#heatCoefficientNorthDoors").val(HEAT_COEFFICIENT.doors.north);
  $("#heatCoefficientSouthDoors").val(HEAT_COEFFICIENT.doors.south);
  $("#heatCoefficientEastDoors").val(HEAT_COEFFICIENT.doors.east);
  $("#heatCoefficientWestDoors").val(HEAT_COEFFICIENT.doors.west);
  $("#heatCoefficientNorthWindows").val(HEAT_COEFFICIENT.windows.north);
  $("#heatCoefficientSouthWindows").val(HEAT_COEFFICIENT.windows.south);
  $("#heatCoefficientEastWindows").val(HEAT_COEFFICIENT.windows.east);
  $("#heatCoefficientWestWindows").val(HEAT_COEFFICIENT.windows.west);

  // Update temperature coefficient
  $("#eqTemperatureDifferenceNorthWall").val(
    EQUIVALENT_TEMPERATURE_DIFF.walls.north
  );
  $("#eqTemperatureDifferenceSouthWall").val(
    EQUIVALENT_TEMPERATURE_DIFF.walls.south
  );
  $("#eqTemperatureDifferenceEastWall").val(
    EQUIVALENT_TEMPERATURE_DIFF.walls.east
  );
  $("#eqTemperatureDifferenceWestWall").val(
    EQUIVALENT_TEMPERATURE_DIFF.walls.west
  );
  $("#eqTemperatureDifferenceNorthDoors").val(
    EQUIVALENT_TEMPERATURE_DIFF.doors.north
  );
  $("#eqTemperatureDifferenceSouthDoors").val(
    EQUIVALENT_TEMPERATURE_DIFF.doors.south
  );
  $("#eqTemperatureDifferenceEastDoors").val(
    EQUIVALENT_TEMPERATURE_DIFF.doors.east
  );
  $("#eqTemperatureDifferenceWestDoors").val(
    EQUIVALENT_TEMPERATURE_DIFF.doors.west
  );
  $("#eqTemperatureDifferenceNorthWindows").val(
    EQUIVALENT_TEMPERATURE_DIFF.windows.north
  );
  $("#eqTemperatureDifferenceSouthWindows").val(
    EQUIVALENT_TEMPERATURE_DIFF.windows.south
  );
  $("#eqTemperatureDifferenceEastWindows").val(
    EQUIVALENT_TEMPERATURE_DIFF.windows.east
  );
  $("#eqTemperatureDifferenceWestWindows").val(
    EQUIVALENT_TEMPERATURE_DIFF.windows.west
  );
  $("#eqTemperatureDifferenceRoof").val(EQUIVALENT_TEMPERATURE_DIFF.roof);
  $("#eqTemperatureDifferenceFloor").val(EQUIVALENT_TEMPERATURE_DIFF.floor);

  // Update Solar Heat Gain Factors
  $("#windowsSHGFNorth").val(SOLAR_HEAT_GAIN_FACTOR.windows.north);
  $("#windowsSHGFSouth").val(SOLAR_HEAT_GAIN_FACTOR.windows.south);
  $("#windowsSHGFEast").val(SOLAR_HEAT_GAIN_FACTOR.windows.east);
  $("#windowsSHGFWest").val(SOLAR_HEAT_GAIN_FACTOR.windows.west);

  // Log updated values
  //   console.log(room);
  //   console.log(doors);
  //   console.log(windows);
}

function updateValuesInDisplay() {
  // UPDATE TOP DISPLAY
  $("#ACHPRatingDisplay").html(room.ac_rating);
  $("#requiredConditioningCountDisplay").html(room.ac_count);
  $("#dimensionDisplay").html(
    room.length + " x " + room.width + " x " + room.height
  );

  // UPDATE WALLS DISPLAY
  $("#northWallAreaTotal").html(AREA.walls.north);
  $("#southWallAreaTotal").html(AREA.walls.south);
  $("#eastWallAreaTotal").html(AREA.walls.east);
  $("#westWallAreaTotal").html(AREA.walls.west);
  $("#northWallSensibleHeat").html(SENSIBLE_HEAT_GAIN.walls.north);
  $("#southWallSensibleHeat").html(SENSIBLE_HEAT_GAIN.walls.south);
  $("#eastWallSensibleHeat").html(SENSIBLE_HEAT_GAIN.walls.east);
  $("#westWallSensibleHeat").html(SENSIBLE_HEAT_GAIN.walls.west);

  // UPDATE ROOF & FLOOR
  $("#roofAreaTotal").html(AREA.roof);
  $("#floorAreaTotal").html(AREA.floor);
  $("#roofSensibleHeat").html(SENSIBLE_HEAT_GAIN.roof);
  $("#floorSensibleHeat").html(SENSIBLE_HEAT_GAIN.floor);

  // UPDATE DOORS
  $("#northDoorsAreaTotal").html(AREA.doors.north);
  $("#southDoorsAreaTotal").html(AREA.doors.south);
  $("#eastDoorsAreaTotal").html(AREA.doors.east);
  $("#westDoorsAreaTotal").html(AREA.doors.west);
  $("#northDoorsSensibleHeat").html(SENSIBLE_HEAT_GAIN.doors.north);
  $("#southDoorsSensibleHeat").html(SENSIBLE_HEAT_GAIN.doors.south);
  $("#eastDoorsSensibleHeat").html(SENSIBLE_HEAT_GAIN.doors.east);
  $("#westDoorsSensibleHeat").html(SENSIBLE_HEAT_GAIN.doors.west);

  // UPDATE WINDOWS
  $("#northWindowsAreaTotal").html(AREA.windows.north);
  $("#southWindowsAreaTotal").html(AREA.windows.south);
  $("#eastWindowsAreaTotal").html(AREA.windows.east);
  $("#westWindowsAreaTotal").html(AREA.windows.west);
  $("#northWindowsSensibleHeat").html(SENSIBLE_HEAT_GAIN.windows.north);
  $("#southWindowsSensibleHeat").html(SENSIBLE_HEAT_GAIN.windows.south);
  $("#eastWindowsSensibleHeat").html(SENSIBLE_HEAT_GAIN.windows.east);
  $("#westWindowsSensibleHeat").html(SENSIBLE_HEAT_GAIN.windows.west);

  // UPDATE WINDOWS SOLAR HEAT GAIN
  $("#solarHeatGainNorthGlassWindow").html(SOLAR_HEAT_GAIN.windows.north);
  $("#solarHeatGainSouthGlassWindow").html(SOLAR_HEAT_GAIN.windows.south);
  $("#solarHeatGainEastGlassWindow").html(SOLAR_HEAT_GAIN.windows.east);
  $("#solarHeatGainWestGlassWindow").html(SOLAR_HEAT_GAIN.windows.west);
  $("#totalSolarHeatGain").html(SOLAR_HEAT_GAIN.windows.total);

  // UPDATE OTHER PARAMS
  $("#sensibleHeatGainDueToOccupants").html(
    SENSIBLE_HEAT_GAIN.due_to.occupants
  );
  $("#latentHeatGainDueToOccupants").html(LATENT_HEAT_GAIN.due_to.occupants);
  $("#sensibleHeatGainDueToLighting").html(SENSIBLE_HEAT_GAIN.due_to.lighting);

  $("#sensibleHeatGainDueToInfiltratedAir").html(
    SENSIBLE_HEAT_GAIN.due_to.infiltrated_air
  );
  $("#latentHeatGainDueToInfiltratedAir").html(
    LATENT_HEAT_GAIN.due_to.infiltrated_air
  );
}
