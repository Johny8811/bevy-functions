import { GetTaskResult } from "@onfleet/node-onfleet/Resources/Tasks";

export type OurOnFleetTask = {
  slot: string
} & GetTaskResult

export type OriginOnFleetTask = GetTaskResult
