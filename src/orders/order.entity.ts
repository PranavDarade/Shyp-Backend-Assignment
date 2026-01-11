import { OrderState } from "./order.state";

export interface Location {
    x: number;
    y: number;
}

export enum DeliveryType {
    EXPRESS = 'EXPRESS',
    NORMAL = 'NORMAL',
}

export class Order {
    id: string;

    pickupLocation: Location;
    dropLocation: Location;

    deliveryType: DeliveryType;

    state: OrderState;

    assignedCourierId: string | null;

    createdAt: Date;

    constructor(params: {
        id: string;
        pickupLocation: Location;
        dropLocation: Location;
        deliveryType: DeliveryType;
    }) {
        this.id = params.id;
        this.pickupLocation = params.pickupLocation;
        this.dropLocation = params.dropLocation;
        this.deliveryType = params.deliveryType;

        this.state = OrderState.CREATED;
        this.assignedCourierId = null;

        this.createdAt = new Date();
    }
}