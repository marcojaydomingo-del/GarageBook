export interface RecoverySessionTokens { accessToken:string;refreshToken:string }

export function parseRecoverySessionFragment(fragment:string):RecoverySessionTokens|null{
  const value=fragment.startsWith("#")?fragment.slice(1):fragment;
  const params=new URLSearchParams(value);
  if(params.get("type")!=="recovery")return null;
  const accessToken=params.get("access_token");
  const refreshToken=params.get("refresh_token");
  return accessToken&&refreshToken?{accessToken,refreshToken}:null;
}
