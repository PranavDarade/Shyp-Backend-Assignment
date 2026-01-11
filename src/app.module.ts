import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { CouriersModule } from './couriers/couriers.module';
import { AssignmentModule } from './assignment/assignment.module';

@Module({
  imports: [
    OrdersModule, 
    CouriersModule, 
    AssignmentModule
  ],
})
export class AppModule {}
