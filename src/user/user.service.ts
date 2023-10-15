import { Update } from 'nestjs-telegraf';
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Update()
@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
  ) {}

  insertOrIgnorePollChoice(
      userLogin: string,
      pollId: number,
  ): Promise<any> {
    return this.userRepository.insertOrIgnorePollChoice(userLogin, pollId);
  }
}
