// backend/utils/graphClient.ts
import { Client } from '@microsoft/microsoft-graph-client';
// import { TokenCredentialAuthenticationProvider, ClientSecretCredential } from '@azure/identity';
import { NextApiRequest, NextApiResponse } from 'next';

const clientId = process.env.MICROSOFT_CLIENT_ID!;
const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!;
const tenantId = process.env.MICROSOFT_TENANT_ID!;

export const getGraphClient = (accessToken: string) => {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
};
