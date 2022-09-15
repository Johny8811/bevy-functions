import { UpdateTaskResult } from "@onfleet/node-onfleet/Resources/Tasks";

export type OurOnFleetTask = {
  slot: {
    start: number,
    end: number
  } | null,
  order: number | null
} & UpdateTaskResult

// TODO: investigate onFleet types, module "@onfleet/node-onfleet" has bad type coverage of onFleet api
export type OriginOnFleetTask = UpdateTaskResult

export enum TaskMetadata {
  // TODO: rename to "userId". Here and also in whole database
  UserId = "User ID"
}
