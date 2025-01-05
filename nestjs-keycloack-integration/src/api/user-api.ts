import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { KeycloackService } from 'src/keycloack/keycloack.service';
import { NewUser } from 'src/model/new-user';
import { UpdateUser } from 'src/model/update-user';

@Controller('user')
export class UserApi {
  constructor(private readonly keycloackService: KeycloackService) {}

  @Post()
  async createNewUser(@Body() newUser: NewUser): Promise<void> {
    await this.keycloackService.createUser(newUser);
  }

  @Put('/:id')
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUser: UpdateUser,
  ): Promise<void> {
    await this.keycloackService.updateUser(updateUser, userId);
  }
}
