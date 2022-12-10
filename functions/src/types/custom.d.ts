// "DecodedIdToken" interface is not exported from "firebase-admin" module
type User = {
  // these keys come from "firebaseAdmin.auth().verifyIdToken" but are not in "DecodedIdToken" interface
  // name: string,
  // user_id: string,
  iss: string,
  aud: string,
  auth_time: number,
  sub: string,
  iat: number,
  exp: number,
  email?: string,
  email_verified?: boolean,
  firebase: {
    identities: {
      [key: string]: any;
    },
    sign_in_provider: string
  },
  uid: string
}

type ApiUser = {
  _id: string;
  carrier_id: number;
  name: string;
  firebase_id: string;
  email: string;
  api_key: string;
}

declare namespace Express {
  export interface Request {
    user: User;
    apiUser: ApiUser;
  }
}
