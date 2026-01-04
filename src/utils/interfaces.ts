export interface Category {
   id: number;
   count: number;
   name: string;
   sum: number;
   hidden: number;
}

export interface EventInstance {
  categoryId: number;
  ammount: number;
  date: Date;
  description: string;
  title: string;
  eventId: number;
  withPartner: boolean;
  positive: undefined;
  measurements: Measurement;
  locations: EventLocation;
  event_people: EventPeople[];
}

export interface EventPeople {
  people: Person;
}

export interface Person {
  name: string;
  personId: number
}

export interface EventPeople {
  eventId: number;
  personId: number;
}

export interface EventLocation {
  locationId: number;
  name: string;
  preciseAddress: string;
}

export interface Measurement {
  measurementId: number;
  name: string;
}