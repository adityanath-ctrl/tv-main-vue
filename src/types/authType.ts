export default interface Auth {
  loggedIn: boolean;
  msalToken: string;
  tokenMode: string;
  devices: Array<Object>;
  isLoading: boolean;
  isUserVerifiedByEmail: boolean;
  isUserRegistered: boolean;
}
