import { UpdateTaskResult } from "@onfleet/node-onfleet/Resources/Tasks";

// TODO: investigate onFleet types, module "@onfleet/node-onfleet" has bad coverage of onFleet types
export type OurOnFleetTask = {
  slot: {
    start: number,
    end: number
  } | null
} & UpdateTaskResult

export type OriginOnFleetTask = UpdateTaskResult
