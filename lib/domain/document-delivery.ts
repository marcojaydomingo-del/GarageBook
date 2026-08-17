export function getDocumentDeliveryUrl(documentId:string,inline=false){
  const path=`/documents/${encodeURIComponent(documentId)}`;
  return inline?`${path}?inline=1`:path;
}
