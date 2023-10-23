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
      userName: string,
      pollId: number,
  ): Promise<any> {
    return this.userRepository.insertOrIgnorePollChoice(userLogin, userName, pollId);
  }

  getPlayers(pollId: number): Promise<any> {
    return this.userRepository.getPlayers(pollId);
  }

  async isUserAlreadyVoted(userLogin: string, pollId: number) {
    return this.userRepository.isUserAlreadyVoted(userLogin, pollId);
  }
}
