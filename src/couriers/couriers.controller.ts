import { Body, Controller, Param, Post } from '@nestjs/common';
import { CouriersService } from './couriers.service';
import { Courier } from './courier.entity';


@Controller('couriers')
export class CouriersController {
    constructor(
        private readonly couriersService: CouriersService,
    ) {}

    // Add a courier 
    @Post()
    addCourier(
        @Body()
        body: {
            id: string;
            name: string;
            location: { x: number, y: number };
        },
    ): Courier {
        return this.couriersService.addCourier({
            id: body.id,
            name: body.name,
            location: body.location,
        });
    }

    // Simulate courier movement
    @Post(':id/move')
    moveCourier(
        @Param('id') id: string,
    ): Courier {
        return this.couriersService.moveCourier(id);
    }
}
