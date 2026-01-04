export interface Category {
   id: number;
   count: number;
   name: string;
   sum: number;
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
}

export interface Person {
  name: string;
  personId: number
}

export interface EventPeople {
  eventId: number;
  personId: number;
}