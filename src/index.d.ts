declare type Permissions = {
  routesList: boolean;
  routesMap: boolean;
  routesCreateForDriver: boolean;
  routesCreateDeliveryOrder: fboolean;
  ordersList: boolean;
  orderListHolding: boolean;
  ordersCreate: boolean;
  customersCreate: boolean;
  toursCreate: boolean;
  showMasterData: boolean;
};

declare type User = {
  id: number;
  holding_id: number;
  supplier_id: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  token: string;
  admin: boolean;
  active: boolean;
  permissions: Permissions;
  updated_at: string;
  created_at: string;
};

declare type PublicUser = Omit<User, 'created_at' | 'updated_at' | 'password' | 'admin' | 'token'> & {
  Supplier?: Pick<Supplier, 'name' | 'alias' | 'street' | 'street_number' | 'city' | 'zipcode' | 'country' | 'email' | 'phone'>;
};

declare type AddressAttributes = {
  street: string;
  street_number: string;
  city: string;
  zipcode: string;
  country: string;
};

declare type TransportAgent = {
  id: number;
  name: string;
  alias: string;
} & AddressAttributes;

declare type Holding = {
  id: number;
  number: string;
  secret: string;
  name: string;
  alias: string;
  email: string;
  phone: string;
  active: boolean;
  updated_at: string;
  created_at: string;
} & AddressAttributes;

declare type Supplier = {
  id: number;
  holding_id: number;
  number: string;
  secret: string;
  name: string;
  alias: string;
  email: string;
  phone: string;
  active: boolean;
  updated_at: string;
  created_at: string;
} & AddressAttributes;

declare type Tour = {
  id: number;
  holding_id: number;
  supplier_id: number;
  transport_agent_id: number;
  number: string;
  name: string;
  description: string;
  active: boolean;
  updated_at: string;
  created_at: string;
};

declare type DepositAgreement = 'NONE' | 'BRING_KEY' | 'KEY_BOX';
declare type Customer = {
  id: number;
  holding_id: number;
  supplier_id: number;
  tour_id: number;
  tour_position: number;
  number: string;
  name: string;
  alias: string;
  contact_salutation: string;
  contact_name: string;
  contact_surname: string;
  email: string;
  phone: string;
  sms_notifications: boolean;
  email_notifications: boolean;
  active: boolean;
  updated_at: string;
  created_at: string;
  coordinates: {
    type: 'Point';
    coordinates: [string, string];
  };
  latitude?: string;
  longitude?: string;
  deposit_agreement: DepositAgreement;
  keybox_code: string;
} & AddressAttributes;

declare type Order = {
  id: number;
  holding_id: number;
  supplier_id: number;
  customer_id: number;
  route_id?: number;
  user_id?: number;
  description: string;
  delivered_at: string;
  number: string;
};

declare type CustomerWithOrders = Omit<
  Customer, 'active' | 'created_at' | 'updated_at' | 'sms_notifications' | 'email_notifications' | 'supplier_id'
> & {
  Orders: Order[];
  skipped_at?: string;
};

declare type Route = {
  id: number;
  holding_id: number;
  tour_id: number;
  uuid: string;
  pathway: CustomerWithOrders[];
  start_date: string;
  end_date: string;
  code: string;
  password: string;
  active_driver_jwt: string;
  driver_name: string;
  driver_phone: string;
};

declare type Stop = {
  id: number;
  customer_id: number;
  signature_file: string;
  pictures: string[];
  route_id: number;
  time: string;
  customer_signed: boolean;
  location: any;
  meet_customer: boolean;
  reason: string;
  driver_name: string;
  driver_phone: string;
  goods_back: boolean;
};

declare type RouteNavigation = {
  id: number;
  route_id: number;
  customer_id: number;
  navigation: any;
  created_at: string;
};

declare type FullRoute = Route & {
  Tour: Tour & {
    TransportAgent: TransportAgent;
  };
  Orders: Pick<Order, 'id' | 'delivered_at'>[];
  Stops: Stop[];
  DriversLocations: any[];
  RoutesNavigations: Pick<RouteNavigation, 'customer_id' | 'navigation' | 'created_at'>[];
};

declare type RouteForDriver = Omit<Route, 'pathway'> & {
  Tour: Pick<Tour, 'id', 'name', 'supplier_id', 'description'> & {
    TransportAgent: Pick<TransportAgent, 'id', 'name', 'alias'>;
  };
  pathway: CustomerWithOrders[];
  current_pathway_index: number;
};

declare type ImportKontakte = {
  ID_Kontakte: string; // Customer Number
  Firma: string; // Customer Name & Alias
  PLZ: string; // Customer Zipcode
  Ort: string; // Customer City
  Strasse: string; // Customer Street & House Number
  Hausnummer: string; // this is unfortanetly empty for most or all of the data. We have to filter that out
  Prioritaet: string; // out of the priority for each tour we need to create the order of the stops for the tour
  erstelltAm: string; // created on
  geaendertAm: string; // changed on
};

declare type ImportLieferungen = {
  'tbl_Lieferung.ID_Lieferung': string; // Order Number (not needed by us I think)
  Lieferscheinnummer: string; // Delivery document Number (not needed by us)
  Packstuecke: string; // not needed by us
  FRD_ID_Versender: string; // Sender ID -> need to filter out the order with the wanted ID
  FRD_ID_Kontakte: string; // Customer Number that is the stop
  erstelltAm: string; // created on
};

declare type ImportBody = {
  Lieferanten_ID: string;
  ID_Tour: string;
  Tour_Name: string;
  LieferDatum: string;
  Abfahrt: string; // differentiator for the excution. Each tour can be executed 3 times (morning, midday, evening) This should be used in onecycle to determine X.1, X.2, X.3 for the tour number
  erstelltAm: string;
  Kontakte: ImportKontakte[];
  Versender: {
    ID_Versender: string;
    Name_Versender: string;
  }[];
  Lieferungen: ImportLieferungen[];
};

declare type ImportBodyComplete = {
  supplier_id: string;
  secret: string;
  Tour: {
    id: string;
    name: string;
  };
  Customers: {
    id: string;
    name: string;
    alias: string;
    street: string;
    street_number: string;
    city: string;
    zipcode: string;
    country: string;
    deposit_agreement: DepositAgreement;
    keybox_code: string;
    latitude: string;
    longitude: string;
    contact_name: string;
    contact_surname: string;
    email: string;
    phone: string;
  }[];
  Orders: {
    number: string;
    customer_id: string;
    description: string;
  }[];
};
