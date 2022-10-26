export type Recipient = {
  name: string;
  phone: string;
  notes: string | undefined;
  skipSMSNotifications: boolean | undefined;
}

export type Address = {
  apartment?: string | undefined;
  state?: string | undefined;
  postalCode?: string | undefined;
  country: string;
  city: string;
  street: string;
  number: string;
}

export type Task = {
  id: string;
  recipients: Recipient[];
  destination: { address: Address };
  completeAfter: number | undefined;
  completeBefore: number | undefined;
  quantity: number | undefined;
  estimatedArrivalTime: number
  order: number | null;
  slot: {
    start: number;
    end: number;
  } | null;
  deliveredAt: number | null
}

export type Tasks = Task[];

export enum TaskMetadata {
  // TODO: rename to "userId". Here and also in whole database
  UserId = "User ID"
}

// TODO: old types, investigate usage, then remove them
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
