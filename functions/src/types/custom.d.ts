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

declare namespace Express {
  export interface Request {
    user: User;
  }
}
