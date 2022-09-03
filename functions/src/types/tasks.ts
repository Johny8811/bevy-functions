import { GetTaskResult } from "@onfleet/node-onfleet/Resources/Tasks";

export type OurOnFleetTask = {
  slot: {
    start: number,
    end: number
  } | null
} & GetTaskResult

export type OriginOnFleetTask = GetTaskResult
