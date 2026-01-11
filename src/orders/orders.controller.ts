import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { DeliveryType, Location } from './order.entity';
import { Order } from './order.entity';
import { LoadFnOutput } from 'module';


@Controller('orders')
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
    ) {}

    // Create a new order
    @Post()
    async createOrder(
        @Body()
        body: {
            pickupLocation: Location;
            dropLocation: Location;
            deliveryType: DeliveryType;
        },
    ): Promise<Order> {
        return this.ordersService.createOrder({
            pickupLocation: body.pickupLocation,
            dropLocation: body.dropLocation,
            deliveryType: body.deliveryType,
        });
    }

    // Get order details by ID
    @Get(':id')
    getOrder(
        @Param('id') id: string,
    ): Order {
        return this.ordersService.getOrderById(id);
    }

    // Cancel an order
    @Post(':id/cancel')
    cancelOrder(
        @Param('id') id: string,
    ): Order {
        return this.ordersService.cancelOrder(id);
    }
}
