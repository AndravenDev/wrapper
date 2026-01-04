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
  locationId: number;
  positive: undefined;
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