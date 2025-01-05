import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NewUser } from 'src/model/new-user';
import { Credential, UserRepresentation } from './dto/user-representation';
import { firstValueFrom } from 'rxjs';
import { UpdateUser } from 'src/model/update-user';

@Injectable()
export class KeycloackService {
  keycloakAdminUrl = this.configService.get<string>('keycloak_admin.baseURL');
  keycloakLoginUrl = this.configService.get<string>('keycloak.login_url');
  clientId = this.configService.get<string>('keycloak_admin.clientId');
  clientSecret = this.configService.get<string>('keycloak_admin.clientSecret');
  lifespan = this.configService.get<string>('keycloak_admin.linkLifeSpan');
  redirectUrl = this.configService.get<string>(
    'keycloak_admin.clientRedirectUrl',
  );

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(newUser: NewUser): Promise<void> {
    try {
      let token = await this.getAdminToken();
      let user: UserRepresentation = new UserRepresentation();
      user.lastName = newUser.lastName;
      user.firstName = newUser.firstName;
      user.username = newUser.username;
      user.email = newUser.username;

      let credential: Credential = new Credential();
      (credential.type = 'password'),
        (credential.temporary = false),
        (credential.value = newUser.password);

      user.credentials = [credential];
      user.enabled = true;
      user.emailVerified = false;
      await firstValueFrom(
        this.httpService.post(`${this.keycloakAdminUrl}/users`, user, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create user: ' + error.message);
    }
  }

  async updateUser(newUser: UpdateUser, userId: string): Promise<void> {
    try {
      let token = await this.getAdminToken();

      await firstValueFrom(
        this.httpService.put(
          `${this.keycloakAdminUrl}/users/${userId}`,
          newUser,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create user: ' + error.message);
    }
  }
  async getAdminToken(): Promise<string> {
    const formData = new URLSearchParams();
    formData.append('client_id', this.clientId);
    formData.append('client_secret', this.clientSecret);
    formData.append('grant_type', 'client_credentials');
    try {
      //rq:firstValueFrom ====> bridges the gap between Observable (RxJS) and Promise (async/await):"unwrap" the first value emitted by the Observable
      const response = await firstValueFrom(
        this.httpService.post(this.keycloakLoginUrl, formData.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      const { access_token } = response.data;
      return access_token;
    } catch (error) {
      throw new Error(`Client login failed: ${error.message}`);
    }
  }
}
