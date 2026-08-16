export function formatCurrency(value:number){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(value)}
export function formatMileage(value:number){return new Intl.NumberFormat("en-US").format(value)}
export function formatDate(value:string){return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric"}).format(new Date(value.includes("T")?value:`${value}T12:00:00`))}
