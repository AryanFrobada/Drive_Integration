// backend/utils/tokenUtils.ts
import { UserTokens } from '../models/UserTokens';
import { AppDataSource } from '../dbConfig/dataSource';

export const updateTokens = async (userId: number, tokens: any) => {
  const userTokensRepo = AppDataSource.getRepository(UserTokens);
  let userTokens = await userTokensRepo.findOneBy({ id: userId });

  if (!userTokens) {
    userTokens = new UserTokens();
    userTokens.id = userId;
  }

  userTokens.googleAccessToken = tokens.googleAccessToken || userTokens.googleAccessToken;
  userTokens.googleRefreshToken = tokens.googleRefreshToken || userTokens.googleRefreshToken;
  userTokens.oneDriveAccessToken = tokens.oneDriveAccessToken || userTokens.oneDriveAccessToken;
  userTokens.oneDriveRefreshToken = tokens.oneDriveRefreshToken || userTokens.oneDriveRefreshToken;
  userTokens.dropboxAccessToken = tokens.dropboxAccessToken || userTokens.dropboxAccessToken;
  userTokens.dropboxRefreshToken = tokens.dropboxRefreshToken || userTokens.dropboxRefreshToken;

  await userTokensRepo.save(userTokens);
};
