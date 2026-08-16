import { AuthCard } from "@/components/auth-card";
import { safeInternalPath } from "@/lib/domain/navigation";
export default async function LoginPage({searchParams}:{searchParams:Promise<{next?:string;error?:string}>}){const query=await searchParams;return <AuthCard mode="login" nextPath={safeInternalPath(query.next)} initialError={query.error==="confirmation"?"That confirmation or recovery link is invalid or expired. Request a new one and try again.":undefined}/>}
