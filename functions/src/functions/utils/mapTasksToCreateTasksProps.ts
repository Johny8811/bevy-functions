import { CreateTaskProps } from "@onfleet/node-onfleet/Resources/Tasks";
import { OnfleetMetadata } from "@onfleet/node-onfleet/metadata";
import { Tasks } from "../../types/tasks";

export const mapTaskDataToCreateTasksProps = (
    tasks: Tasks,
    metadata: OnfleetMetadata[]
): CreateTaskProps[] => {
  return tasks.map((task) => {
    const {
      recipients,
      address,
      completeAfter,
      completeBefore,
      quantity,
    } = task;
    const {
      number,
      street,
      city,
      postalCode,
      country,
    } = address;
    // we pass address also to task notes, onFleet sometimes incorrectly recognise address
    const taskNotes = `Destination:
      ${number} ${street}
      ${city} ${country} ${postalCode}
    `;

    return {
      recipients,
      destination: { address },
      notes: taskNotes,
      completeAfter,
      completeBefore,
      quantity,
      metadata,
    };
  });
};
