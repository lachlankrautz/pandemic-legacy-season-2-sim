import {
  type SerializableGame,
  serializableGameToGame,
  type SerializableInfectionCard,
  type SerializableLocation,
  type SerializablePlayer,
  type SerializablePlayerCard,
} from "../serialization/game-serialization.ts";
import {
  type CityColour,
  type Connection,
  type Deck,
  type Game,
  getEpidemicCardCount,
  links,
  type Location,
  type LocationDisplayName,
  LocationNames,
  TURN_ACTION_COUNT,
  type TurnOrder,
} from "./game.ts";
import { shuffleArray } from "./random.ts";
import { chunkArray } from "../../util/arrays.ts";

type LocationOptions = Partial<Pick<Location, "supplyCubes" | "plagueCubes">>;

const locationEntry = (
  name: LocationDisplayName,
  type: Location["type"],
  colour: CityColour,
  options: LocationOptions = {},
): [LocationDisplayName, SerializableLocation] => [
  name,
  {
    name,
    type,
    colour,
    supplyCubes: 0,
    plagueCubes: 0,
    connections: [],

    // Override defaults with any provided options
    ...options,
  },
];

const makePlayer = (name: string, locationName: LocationDisplayName, turnOrder: TurnOrder): SerializablePlayer => {
  return {
    name,
    locationName,
    turnOrder,
    supplyCubes: 0,
    cards: [],
  };
};

const newCityCard = (locationName: string): SerializablePlayerCard => {
  return {
    type: "city",
    locationName,
    displayName: `City: ${locationName}}`,
  };
};

export const makeSerializableGame = (): SerializableGame => {
  const locationMap: Map<string, SerializableLocation> = new Map([
    // Havens
    locationEntry(LocationNames.OCEAN_GATE, "haven", "none"),
    locationEntry(LocationNames.GEIDI_PRIME, "haven", "none"),
    locationEntry(LocationNames.HARDHOME, "haven", "none"),
    locationEntry(LocationNames.COLUMBIA, "haven", "none"),

    // Ports
    locationEntry(LocationNames.SAN_FRANCISCO, "port", "blue"),
    locationEntry(LocationNames.WASHINGTON, "port", "blue"),
    locationEntry(LocationNames.NEW_YORK, "port", "blue"),
    locationEntry(LocationNames.JACKSONVILLE, "port", "blue"),
    locationEntry(LocationNames.LONDON, "port", "blue"),
    locationEntry(LocationNames.TRIPOLI, "port", "black"),
    locationEntry(LocationNames.CAIRO, "port", "black"),
    locationEntry(LocationNames.ISTANBUL, "port", "black"),
    locationEntry(LocationNames.LIMA, "port", "yellow"),
    locationEntry(LocationNames.BUENOS_AIRES, "port", "yellow"),
    locationEntry(LocationNames.SAO_PAULO, "port", "yellow"),
    locationEntry(LocationNames.LAGOS, "port", "yellow"),

    // Inland cities
    locationEntry(LocationNames.CHICAGO, "inland", "blue"),
    locationEntry(LocationNames.ATLANTA, "inland", "blue"),
    locationEntry(LocationNames.BOGOTA, "inland", "yellow"),
    locationEntry(LocationNames.SANTIAGO, "inland", "yellow"),
    locationEntry(LocationNames.KINSHASA, "inland", "yellow"),
  ]);

  const getLocation = (locationName: string): SerializableLocation => {
    const serializableLocation = locationMap.get(locationName);
    if (serializableLocation === undefined) {
      throw new Error(`Location not found ${locationName}`);
    }
    return serializableLocation;
  };

  for (const [from, to] of links) {
    const fromLocation = locationMap.get(from);
    const toLocation = locationMap.get(to);

    if (fromLocation === undefined || toLocation === undefined) {
      throw new Error("Invalid link - locations not found", { cause: { from, to } });
    }

    const connectionType: Connection["type"] =
      fromLocation.type === "inland" || toLocation.type === "inland" ? "land" : "sea";

    fromLocation.connections.push({
      locationName: toLocation.name,
      type: connectionType,
    });

    toLocation.connections.push({
      locationName: fromLocation.name,
      type: connectionType,
    });
  }

  const julian = makePlayer("Hammond", LocationNames.OCEAN_GATE, 1);

  const players = [
    julian,
    makePlayer("Denji", LocationNames.GEIDI_PRIME, 2),
    makePlayer("Robin", LocationNames.OCEAN_GATE, 3),
    makePlayer("Joel Smasher", LocationNames.GEIDI_PRIME, 4),
    // makePlayer("Jewel", LocationNames.COLUMBIA, ?),
    // makePlayer("John RedCorn", LocationNames.BUENOS_AIRES, ?),
  ];

  const playerDeck: Deck<SerializablePlayerCard> = {
    drawPile: [],
    discardPile: [],
  };

  // Cities
  playerDeck.drawPile.push(newCityCard(LocationNames.ATLANTA));
  playerDeck.drawPile.push(newCityCard(LocationNames.BOGOTA));
  playerDeck.drawPile.push(newCityCard(LocationNames.BOGOTA));
  playerDeck.drawPile.push(newCityCard(LocationNames.BUENOS_AIRES));
  playerDeck.drawPile.push(newCityCard(LocationNames.BUENOS_AIRES));
  playerDeck.drawPile.push(newCityCard(LocationNames.CAIRO));
  playerDeck.drawPile.push(newCityCard(LocationNames.CAIRO));
  playerDeck.drawPile.push(newCityCard(LocationNames.CAIRO));
  playerDeck.drawPile.push(newCityCard(LocationNames.CAIRO));
  playerDeck.drawPile.push(newCityCard(LocationNames.CHICAGO));
  playerDeck.drawPile.push(newCityCard(LocationNames.CHICAGO));
  playerDeck.drawPile.push(newCityCard(LocationNames.ISTANBUL));
  playerDeck.drawPile.push(newCityCard(LocationNames.ISTANBUL));
  playerDeck.drawPile.push(newCityCard(LocationNames.ISTANBUL));
  playerDeck.drawPile.push(newCityCard(LocationNames.ISTANBUL));
  playerDeck.drawPile.push(newCityCard(LocationNames.JACKSONVILLE));
  playerDeck.drawPile.push(newCityCard(LocationNames.JACKSONVILLE));
  playerDeck.drawPile.push(newCityCard(LocationNames.JACKSONVILLE));
  playerDeck.drawPile.push(newCityCard(LocationNames.JACKSONVILLE));
  playerDeck.drawPile.push(newCityCard(LocationNames.KINSHASA));
  playerDeck.drawPile.push(newCityCard(LocationNames.NEW_YORK));
  playerDeck.drawPile.push(newCityCard(LocationNames.NEW_YORK));
  playerDeck.drawPile.push(newCityCard(LocationNames.NEW_YORK));
  playerDeck.drawPile.push(newCityCard(LocationNames.NEW_YORK));
  playerDeck.drawPile.push(newCityCard(LocationNames.LAGOS));
  playerDeck.drawPile.push(newCityCard(LocationNames.LAGOS));
  playerDeck.drawPile.push(newCityCard(LocationNames.LAGOS));
  playerDeck.drawPile.push(newCityCard(LocationNames.LAGOS));
  playerDeck.drawPile.push(newCityCard(LocationNames.LIMA));
  playerDeck.drawPile.push(newCityCard(LocationNames.LONDON));
  playerDeck.drawPile.push(newCityCard(LocationNames.LONDON));
  playerDeck.drawPile.push(newCityCard(LocationNames.LONDON));
  playerDeck.drawPile.push(newCityCard(LocationNames.LONDON));
  playerDeck.drawPile.push(newCityCard(LocationNames.SAO_PAULO));
  playerDeck.drawPile.push(newCityCard(LocationNames.SAO_PAULO));
  playerDeck.drawPile.push(newCityCard(LocationNames.SAO_PAULO));
  playerDeck.drawPile.push(newCityCard(LocationNames.SAO_PAULO));
  playerDeck.drawPile.push(newCityCard(LocationNames.SANTIAGO));
  playerDeck.drawPile.push(newCityCard(LocationNames.SAN_FRANCISCO));
  playerDeck.drawPile.push(newCityCard(LocationNames.SAN_FRANCISCO));
  playerDeck.drawPile.push(newCityCard(LocationNames.TRIPOLI));
  playerDeck.drawPile.push(newCityCard(LocationNames.TRIPOLI));
  playerDeck.drawPile.push(newCityCard(LocationNames.TRIPOLI));
  playerDeck.drawPile.push(newCityCard(LocationNames.TRIPOLI));
  playerDeck.drawPile.push(newCityCard(LocationNames.WASHINGTON));
  playerDeck.drawPile.push(newCityCard(LocationNames.WASHINGTON));
  playerDeck.drawPile.push(newCityCard(LocationNames.WASHINGTON));
  playerDeck.drawPile.push(newCityCard(LocationNames.WASHINGTON));
  const cityCardCount = playerDeck.drawPile.length;

  // Portable antiviral labs
  Array.from({ length: 3 }).forEach(() =>
    playerDeck.drawPile.push({
      type: "portable_antiviral_lab",
      displayName: "Portable antiviral Lab",
    }),
  );

  // Produce supplies
  Array.from({ length: 7 }).forEach(() =>
    playerDeck.drawPile.push({
      type: "produce_supplies",
      displayName: "Produce Supplies",
    }),
  );

  // Unrationed event
  playerDeck.drawPile.push({ type: "event", name: "Strategic Reserves", displayName: "Strategic Reserves" });
  playerDeck.drawPile.push({
    type: "event",
    name: "Topaz Experimental Vaccine",
    displayName: "Topaz Experimental Vaccine",
  });

  // Random events
  playerDeck.drawPile.push({ type: "event", name: "Extended Forecast", displayName: "Extended Forecast" });
  playerDeck.drawPile.push({ type: "event", name: "Extended Time", displayName: "Extended Time" });
  playerDeck.drawPile.push({ type: "event", name: "One Quiet Night", displayName: "One Quiet Night" });
  playerDeck.drawPile.push({ type: "event", name: "Resilient Population", displayName: "Resilient Population" });
  playerDeck.drawPile.push({ type: "event", name: "Dispersal", displayName: "Dispersal" });
  playerDeck.drawPile.push({ type: "event", name: "Drastic Measures", displayName: "Drastic Measures" });
  playerDeck.drawPile.push({ type: "event", name: "Team Bravo", displayName: "Team Bravo" });
  playerDeck.drawPile.push({ type: "event", name: "Data Transfer", displayName: "Data Transfer" });
  // playerDeck.drawPile.push({ type: "event", name: "It Worked The First Time" });
  // playerDeck.drawPile.push({ type: "event", name: "Airlift" });
  // playerDeck.drawPile.push({ type: "event", name: "Hidden Stockpile" });

  // Initial shuffle
  playerDeck.drawPile = shuffleArray(playerDeck.drawPile);

  // Draw starting hands...
  for (const player of players) {
    Array.from({ length: 2 }).forEach(() => {
      const card = playerDeck.drawPile.pop();
      if (card === undefined) {
        throw new Error("Insufficient player cards to draw opening hands");
      }

      player.cards.push(card);
    });
  }

  // Epidemic
  const epidemicCount = getEpidemicCardCount(cityCardCount);
  playerDeck.drawPile = chunkArray(playerDeck.drawPile, playerDeck.drawPile.length / epidemicCount)
    .map((chunk) => {
      chunk.push({ type: "epidemic", displayName: "Epidemic" });
      return shuffleArray(chunk);
    })
    .flat();

  const infectionDeck: Deck<SerializableInfectionCard> = {
    drawPile: [],
    discardPile: [],
  };

  infectionDeck.drawPile.push({ locationName: LocationNames.BOGOTA });
  infectionDeck.drawPile.push({ locationName: LocationNames.BOGOTA });
  infectionDeck.drawPile.push({ locationName: LocationNames.CAIRO });
  infectionDeck.drawPile.push({ locationName: LocationNames.CAIRO });
  infectionDeck.drawPile.push({ locationName: LocationNames.CAIRO });
  infectionDeck.drawPile.push({ locationName: LocationNames.CHICAGO });
  infectionDeck.drawPile.push({ locationName: LocationNames.ISTANBUL });
  infectionDeck.drawPile.push({ locationName: LocationNames.ISTANBUL });
  infectionDeck.drawPile.push({ locationName: LocationNames.ISTANBUL });
  infectionDeck.drawPile.push({ locationName: LocationNames.JACKSONVILLE });
  infectionDeck.drawPile.push({ locationName: LocationNames.JACKSONVILLE });
  infectionDeck.drawPile.push({ locationName: LocationNames.LIMA });
  infectionDeck.drawPile.push({ locationName: LocationNames.NEW_YORK });
  infectionDeck.drawPile.push({ locationName: LocationNames.NEW_YORK });
  infectionDeck.drawPile.push({ locationName: LocationNames.NEW_YORK });
  infectionDeck.drawPile.push({ locationName: LocationNames.SAN_FRANCISCO });
  infectionDeck.drawPile.push({ locationName: LocationNames.SAN_FRANCISCO });
  infectionDeck.drawPile.push({ locationName: LocationNames.SANTIAGO });
  infectionDeck.drawPile.push({ locationName: LocationNames.SAO_PAULO });
  infectionDeck.drawPile.push({ locationName: LocationNames.TRIPOLI });
  infectionDeck.drawPile.push({ locationName: LocationNames.TRIPOLI });
  infectionDeck.drawPile.push({ locationName: LocationNames.TRIPOLI });
  infectionDeck.drawPile.push({ locationName: LocationNames.WASHINGTON });
  infectionDeck.drawPile.push({ locationName: LocationNames.WASHINGTON });
  infectionDeck.drawPile.push({ locationName: LocationNames.WASHINGTON });

  // Shuffle first
  infectionDeck.drawPile = shuffleArray(infectionDeck.drawPile);

  const monthSupplies = 27;
  const bonusSupplies = 15;

  // Randomly distribute supplies
  const totalSupplies = monthSupplies + bonusSupplies;
  const infectionCities = [...new Set(infectionDeck.drawPile.map((card) => card.locationName))].map(getLocation);
  for (let i = 0; i < totalSupplies; i++) {
    const nameIndex = i % infectionCities.length;
    const city = infectionCities[nameIndex];
    if (city !== undefined) {
      city.supplyCubes++;
    }
  }

  return {
    gameFlow: {
      type: "player_turn:take_4_actions",
      playerName: julian.name,
      remainingActions: TURN_ACTION_COUNT,
    },
    locations: Array.from(locationMap.values()),
    players,
    objectives: [
      {
        name: "create_3_supply_centres",
        isCompleted: false,
        isMandatory: true,
      },
      {
        name: "complete_2_searches",
        isCompleted: false,
        isMandatory: false,
      },
      {
        name: "explore_1_region",
        isCompleted: false,
        isMandatory: false,
      },
    ],
    month: {
      name: "March",
      supplies: monthSupplies,
    },
    bonusSupplies,
    playerDeck,
    infectionDeck,
    infectionRate: {
      position: 2,
      cards: 2,
    },
    incidents: 0,
    state: "not_started",
    stepHistory: [],
    gameLog: [],
  };
};
export const makeGame = (): Game => {
  const serializableGame = makeSerializableGame();
  return serializableGameToGame(serializableGame);
};
