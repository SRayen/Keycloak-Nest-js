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
      console.log('send emaillllllllllllllllllllllllll..............');
      await this.sendVerificationEmail(user, token);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create user: ' + error.message);
    }
  }
  async sendVerificationEmail(user: UserRepresentation, token: string) {
    const users = await this.getUserByUserName(user, token);
    const userId: string = users[0].id;
    try {
      const params = new URLSearchParams({
        client_id: this.clientId,
        redirect_uri: this.redirectUrl,
      });
      console.log('token=>', token);
      await firstValueFrom(
        this.httpService.put(
          `${this.keycloakAdminUrl}/users/${userId}/send-verify-email?${params.toString()}`,
          null,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );
    } catch (error) {
      console.error('Error sending verification email', error);
    }
  }
  async getUserByUserName(
    user: UserRepresentation,
    token: string,
  ): Promise<UserRepresentation> {
    const params = new URLSearchParams({
      first: '0',
      max: '1',
      exact: 'true',
      username: user.username,
    });
    console.log('user=>', user);

    const response = await firstValueFrom(
      this.httpService.get(
        `${this.keycloakAdminUrl}/users?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    );
    console.log('response.data=>', response.data);
    return response.data;
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
