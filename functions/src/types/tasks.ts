import { GetTaskResult } from "@onfleet/node-onfleet/Resources/Tasks";

export type OurTaskResult = {
  slot: string
} & GetTaskResult

export type OriginTaskResult = GetTaskResult
