import { Body, Controller, Post } from '@nestjs/common';
import { KeycloackService } from 'src/keycloack/keycloack.service';
import { NewUser } from 'src/model/new-user';

@Controller('user')
export class UserApi {
  constructor(private readonly keycloackService: KeycloackService) {}

  @Post()
  async login(@Body() newUSer: NewUser): Promise<void> {
    await this.keycloackService.createUser(newUSer);
  }
}
