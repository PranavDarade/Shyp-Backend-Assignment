import { Location } from "src/orders/order.entity";

export class Courier {
    id: string;
    name: string;

    location: Location;

    available: boolean;

    activeOrderId: string | null;

    constructor(params: {
        id: string;
        name: string;
        location: Location;
    }) {
        this.id = params.id;
        this.name = params.name;
        this.location = params.location;

        this.available = true;
        this.activeOrderId = null;
    }

    assignOrder(orderId: string): void {
        if (!this.available) {
            throw new Error(`Courier ${this.id} is already busy`);
        }

        this.available = false;
        this.activeOrderId = orderId;
    }

    release(): void {
        this.available = true;
        this.activeOrderId = null;
    }
}