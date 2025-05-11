import React from "react";
import { useMemo } from "react";
import { Fragment } from "react/jsx-runtime";
import { Location } from "../../../../game/location/location.ts";
import { cn } from "../../lib/utils.ts";
import { Anchor } from "lucide-react";
import { ComposableMap, Geographies, Geography, Line, Marker, ZoomableGroup } from "react-simple-maps";
import { PlayerIndicator } from "./player-indicator.tsx";

function getConnectionHash(from: Location, to: Location) {
  const locations = [from.name, to.name].sort();
  return locations.join("-");
}

interface WorldMapProps {
  locations: Location[];
}

export function WorldMap({ locations }: WorldMapProps) {
  const uniqueConnections = useMemo(() => {
    const connections: Map<string, { from: Location; to: Location }> = new Map();

    for (const location of locations) {
      for (const connection of location.connections) {
        const hash = getConnectionHash(location, connection.location);
        if (!connections.has(hash)) {
          connections.set(hash, { from: location, to: connection.location });
        }
      }
    }

    return [...connections.values()];
  }, [locations]);

  return (
    <ComposableMap className="w-screen h-screen" projection="geoEqualEarth">
      <ZoomableGroup center={[0, 10]} zoom={1}>
        <Geographies geography="/features.json">
          {({ geographies }) =>
            geographies.map((geo) => <Geography key={geo.rsmKey} geography={geo} className="fill-neutral-200" />)
          }
        </Geographies>
        {uniqueConnections.map((connection) => (
          <Line
            key={getConnectionHash(connection.from, connection.to)}
            from={[connection.from.coordinates[1], connection.from.coordinates[0]]}
            to={[connection.to.coordinates[1], connection.to.coordinates[0]]}
            strokeWidth={0.5}
            className="stroke-neutral-600"
          />
        ))}
        {locations.map(({ name, coordinates, colour, type, supplyCubes, plagueCubes, players }) => (
          <Fragment key={name}>
            <Marker coordinates={[coordinates[1], coordinates[0]]}>
              <g
                fill="none"
                className={cn({
                  "fill-blue-500 stroke-blue-500": colour === "blue",
                  "fill-yellow-500 stroke-yellow-500": colour === "yellow",
                  "fill-neutral-900 stroke-neutral-900": colour === "black",
                  ["fill-white stroke-neutral-950"]: colour === "none",
                })}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="0" cy="0" r="5" />
                <g transform="translate(-3, -3)">
                  {type === "port" && <Anchor size={6} className="stroke-neutral-50" strokeWidth={3} />}
                </g>
              </g>

              <foreignObject x="-100" y="-16" width="200" height="100">
                <div className="flex flex-col items-center">
                  <h1 className="text-[6px]">{name}</h1>
                  <ul className="text-[6px] mt-4">
                    {new Array(plagueCubes).fill("🦠").join("")}
                    {new Array(supplyCubes).fill("📦").join("")}
                  </ul>
                  <ul className="flex gap-1">
                    {players.values().map((player) => (
                      <PlayerIndicator key={player.name} player={player} />
                    ))}
                  </ul>
                </div>
              </foreignObject>
            </Marker>
          </Fragment>
        ))}
      </ZoomableGroup>
    </ComposableMap>
  );
}
